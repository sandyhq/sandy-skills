// review-time: the estimated minutes one review of a merge request takes, so that one change fits one review.
// Minutes = change words / wordsPerMinute + code lines / linesPerMinute + part, seam and claim weights, rounded up.
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { countWords, proseLines } from './limits.mjs';

export const DEFAULT_WEIGHTS = { wordsPerMinute: 170, linesPerMinute: 8, part: 5, seam: 8, claim: 2 };

/** The shares in minutes and their sum rounded up to whole minutes. */
export function estimate({ words = 0, lines = 0, parts = 0, seams = 0, claims = 0 }, w = DEFAULT_WEIGHTS) {
  const shares = { words: words / w.wordsPerMinute, lines: lines / w.linesPerMinute, parts: parts * w.part, seams: seams * w.seam, claims: claims * w.claim };
  const exact = Object.values(shares).reduce((a, b) => a + b, 0);
  return { minutes: Math.ceil(Math.round(exact * 1e6) / 1e6), shares };
}

const TEST = /(^|\/)(test|tests|__tests__)\/|\.(test|spec)\.[^/]+$/;
const LOCK = /(^|\/)[^/]*-lock\.[^/]+$|\.lockb?$|(^|\/)go\.sum$/;
const MARKDOWN = /\.(md|markdown|mdx)$/i;

/** A code file: not a test, Markdown, openspec/, a lock file or a linguist-generated file. */
export function isCode(path, generated = new Set()) {
  return !TEST.test(path) && !MARKDOWN.test(path) && !path.startsWith('openspec/') && !LOCK.test(path) && !generated.has(path);
}

const depth = (codePath) => codePath.replace(/\/+$/, '').split('/').length;
const under = (file, codePath) => {
  const p = codePath.replace(/\/+$/, '');
  return file === p || file.startsWith(p + '/');
};

/** The ids of the parts whose Code path holds the file, deepest match only; every part tied at that depth. */
export function owners(file, parts) {
  let best = 0;
  let ids = [];
  for (const p of parts) for (const c of p.code) {
    if (!under(file, c)) continue;
    const d = depth(c);
    if (d > best) { best = d; ids = [p.id]; } else if (d === best && !ids.includes(p.id)) ids.push(p.id);
  }
  return ids.sort();
}

/** The Code paths of the Kind line in a spec's prose, or null without one. */
function codePaths(text) {
  const line = proseLines(text).find((l) => /^Kind:/.test(l.trim()));
  if (!line) return null;
  const seg = line.trim().split(/\s+·\s+/).find((s) => /^Code:/i.test(s));
  return seg ? seg.replace(/^Code:\s*/i, '').split(/\s*,\s*/).filter(Boolean) : [];
}

const walk = (dir, rel = '') => readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1)).flatMap((d) =>
  d.isDirectory() ? walk(join(dir, d.name), rel + d.name + '/') : d.isFile() ? [rel + d.name] : []);
const REQUIREMENT = /^###\s+Requirement:\s*(.*)$/;

/** The change of a path under openspec/changes/: {id, dir}; an archived change keeps the id without its date. */
function changeOf(path) {
  const m = /^openspec\/changes\/(?:archive\/)?([^/]+)\//.exec(path);
  if (!m) return null;
  const archived = path.startsWith('openspec/changes/archive/');
  return { id: archived ? m[1].replace(/^\d{4}-\d{2}-\d{2}-/, '') : m[1], dir: path.slice(0, m[0].length - 1) };
}

/**
 * The measures of the diff of the working tree against the merge base of base and HEAD.
 * @returns {base, words, lines, parts: [id], seams, claims, changes: [id], code: [{path, lines, owners: [id]}]}
 */
export function measureDiff(root, base) {
  const run = (...a) => execFileSync('git', a, { cwd: root, encoding: 'utf8', maxBuffer: 1 << 28 });
  const mergeBase = run('merge-base', base, 'HEAD').trim();
  const numstat = run('diff', '--numstat', '--no-renames', '-z', mergeBase).split('\0').filter(Boolean)
    .map((r) => { const [a, d, ...p] = r.split('\t'); return { path: p.join('\t'), lines: (Number(a) || 0) + (Number(d) || 0) }; });
  const paths = numstat.map((f) => f.path);
  const generated = new Set();
  if (paths.length) {
    const attrs = execFileSync('git', ['check-attr', '-z', '--stdin', 'linguist-generated'], { cwd: root, input: paths.join('\0') + '\0', encoding: 'utf8' }).split('\0');
    for (let i = 0; i + 2 < attrs.length; i += 3) if (attrs[i + 2] === 'set' || attrs[i + 2] === 'true') generated.add(attrs[i]);
  }
  const changes = new Map();
  for (const p of paths) { const c = changeOf(p); if (c && (!changes.has(c.id) || existsSync(join(root, c.dir)))) changes.set(c.id, c.dir); }
  let words = 0;
  const deltas = [];
  for (const dir of changes.values()) {
    if (!existsSync(join(root, dir))) continue;
    for (const f of walk(join(root, dir)).filter((x) => MARKDOWN.test(x))) {
      const text = readFileSync(join(root, dir, f), 'utf8');
      words += countWords(text, { tasks: f === 'tasks.md' });
      const m = /^specs\/(.+)\/spec\.md$/.exec(f);
      if (m) deltas.push({ id: m[1], text });
    }
  }
  const parts = [];
  const specs = join(root, 'openspec', 'specs');
  if (existsSync(specs)) for (const id of readdirSync(specs).sort()) {
    const file = join(specs, id, 'spec.md');
    if (existsSync(file)) parts.push({ id, code: codePaths(readFileSync(file, 'utf8')) ?? [] });
  }
  for (const d of deltas) { const code = codePaths(d.text); if (code && !parts.some((p) => p.id === d.id)) parts.push({ id: d.id, code }); }
  const code = numstat.filter((f) => isCode(f.path, generated)).map((f) => ({ ...f, owners: owners(f.path, parts) }));
  const touched = new Set([...code.flatMap((f) => f.owners), ...deltas.map((d) => d.id)]);
  const requirements = deltas.flatMap((d) => proseLines(d.text).map((l) => REQUIREMENT.exec(l)).filter(Boolean).map((m) => m[1].trim()));
  const seams = requirements.filter((n) => /^Seam to /.test(n)).length;
  return { base, words, lines: code.reduce((n, f) => n + f.lines, 0), parts: [...touched].sort(), seams, claims: requirements.length - seams, changes: [...changes.keys()].sort(), code, deltas: deltas.map((d) => d.id) };
}

const num = (x) => String(Math.round(x * 10) / 10);

/** The report: total minutes, then one line per share. */
export function renderReview(m, w = DEFAULT_WEIGHTS) {
  const { minutes, shares } = estimate({ ...m, parts: m.parts.length }, w);
  const row = (name, calc, value, extra = '') => `  ${name.padEnd(12)} ${calc} = ${num(value)} min${extra}`;
  return [
    `review-time: ${minutes} minutes against ${m.base}`,
    row('change words', `${m.words} / ${w.wordsPerMinute}`, shares.words),
    row('code lines', `${m.lines} / ${w.linesPerMinute}`, shares.lines),
    row('parts', `${m.parts.length} × ${w.part}`, shares.parts, m.parts.length ? ` (${m.parts.join(', ')})` : ''),
    row('seams', `${m.seams} × ${w.seam}`, shares.seams),
    row('claims', `${m.claims} × ${w.claim}`, shares.claims),
    `changes: ${m.changes.length ? m.changes.join(', ') : 'none'}`,
  ].join('\n') + '\n';
}
