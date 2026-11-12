// Mermaid pictures of parts and seams, generated from the specs, and the marked blocks in Markdown that hold them.
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

export const ALL = 'all';
const START_RE = /^<!--\s*sandy-skills diagram:\s*(\S+)\s*-->\s*$/;
const END_RE = /^<!--\s*\/sandy-skills diagram\s*-->\s*$/;
// CommonMark: a fence is indented by at most three spaces; a backtick fence's info string has no backtick.
const OPEN_FENCE_RE = /^ {0,3}(`{3,}(?!.*`)|~{3,})/;
const CLOSE_FENCE_RE = /^ {0,3}(`{3,}|~{3,})[ \t]*$/;
const SKIP_DIRS = ['.git', 'node_modules', 'openspec/changes/archive'];

/**
 * A Mermaid id for a part id: every character outside [a-z0-9], '_' included, becomes _<hex code>_, so two ids
 * never share a Mermaid id; the p_ prefix keeps clear of keywords like end.
 */
export function mermaidId(id) {
  return 'p_' + String(id).replace(/[^a-z0-9]/gu, (c) => `_${c.codePointAt(0).toString(16)}_`);
}

/** A quoted label Mermaid shows as written: '#' first, since Mermaid reads #name; and #35; as entities, then quote and tags. */
export const label = (text) => '"' + String(text).replace(/#/g, '#35;').replace(/"/g, '#quot;').replace(/</g, '#lt;').replace(/>/g, '#gt;') + '"';
const byId = (a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

/**
 * The flowchart of the parts (results of parsePart) as text ending in a newline. Without id (or with
 * "all"): every part. With an id: that part, the parts below it, and every part a seam connects to them,
 * in either direction, as a plain node. Throws when the id names no part.
 */
export function renderDiagram(parts, id = ALL) {
  const known = new Map(parts.map((p) => [p.id, p]));
  const children = new Map();
  const isRoot = (p) => !p.partOf || !known.has(p.partOf);
  for (const p of [...parts].sort(byId)) {
    if (isRoot(p)) continue;
    if (!children.has(p.partOf)) children.set(p.partOf, []);
    children.get(p.partOf).push(p);
  }
  let roots;
  if (id === ALL) roots = [...parts].filter(isRoot).sort(byId);
  else if (known.has(id)) roots = [known.get(id)];
  else throw new Error(`no spec "${id}"`);

  const lines = ['flowchart LR'];
  const inside = new Set();
  const draw = (part, depth) => {
    if (inside.has(part.id)) return;
    inside.add(part.id);
    const pad = '  '.repeat(depth);
    const below = (children.get(part.id) ?? []).filter((c) => !inside.has(c.id));
    if (below.length === 0) { lines.push(`${pad}${mermaidId(part.id)}[${label(part.title ?? part.id)}]`); return; }
    lines.push(`${pad}subgraph ${mermaidId(part.id)}[${label(part.title ?? part.id)}]`);
    for (const c of below) draw(c, depth + 1);
    lines.push(`${pad}end`);
  };
  for (const r of roots) draw(r, 1);
  // Parts in a Part of cycle have no root above them.
  if (id === ALL) for (const p of [...parts].sort(byId)) draw(p, 1);

  const edges = [];
  for (const p of parts) {
    for (const s of p.seams) {
      if (!inside.has(p.id) && !inside.has(s.to)) continue;
      edges.push({ from: p.id, to: s.to, arrow: s.exclusive ? '-->|exclusive|' : s.readOnly ? '-.->|read-only|' : '-->' });
    }
  }
  edges.sort((a, b) => (a.from + '\0' + a.to < b.from + '\0' + b.to ? -1 : a.from + '\0' + a.to > b.from + '\0' + b.to ? 1 : 0));
  const outside = [...new Set(edges.flatMap((e) => [e.from, e.to]).filter((x) => !inside.has(x)))].sort();
  for (const x of outside) lines.push(`  ${mermaidId(x)}[${label(known.get(x)?.title ?? x)}]`);
  for (const e of edges) lines.push(`  ${mermaidId(e.from)} ${e.arrow} ${mermaidId(e.to)}`);

  const shown = [...inside, ...outside].sort();
  const classes = { proposed: 'stroke-dasharray: 5 5', retired: 'fill:#eee,stroke:#999,color:#999' };
  for (const [status, style] of Object.entries(classes)) {
    const ids = shown.filter((x) => known.get(x)?.status === status);
    if (ids.length === 0) continue;
    lines.push(`  classDef ${status} ${style}`, `  class ${ids.map(mermaidId).join(',')} ${status}`);
  }
  return lines.join('\n') + '\n';
}

/** The content a block holds: the generated diagram as a mermaid code fence. */
export const blockContent = (diagram) => '```mermaid\n' + diagram + '```\n';

/**
 * The marked blocks of one Markdown text: {id, line (1-based, of the start marker), start, end (char offsets
 * of the content between the marker lines), content, closed}. Marker lines inside a code fence do not count.
 */
export function findBlocks(text) {
  const blocks = [];
  let offset = 0;
  let fence = null;
  let open = null;
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.replace(/\r$/, '');
    const next = offset + raw.length + 1;
    if (open) {
      if (END_RE.test(line)) { blocks.push({ ...open, end: offset, content: text.slice(open.start, offset), closed: true }); open = null; }
    } else if (fence) {
      const m = CLOSE_FENCE_RE.exec(line);
      if (m && m[1][0] === fence[0] && m[1].length >= fence.length) fence = null;
    } else {
      const m = OPEN_FENCE_RE.exec(line);
      const s = START_RE.exec(line);
      if (m) fence = m[1];
      else if (s) open = { id: s[1], line: i + 1, start: Math.min(next, text.length), eol: raw.endsWith('\r') ? '\r\n' : '\n' };
    }
    offset = next;
  }
  if (open) blocks.push({ ...open, end: text.length, content: text.slice(open.start), closed: false });
  return blocks;
}

/** What a block should hold, with the line ending of its marker. */
export const expectedContent = (block, diagram) => (block.eol === '\r\n' ? blockContent(diagram).replace(/\n/g, '\r\n') : blockContent(diagram));

/** The text with every closed block whose id renders replaced; render(id) returns the diagram or null. */
export function refreshBlocks(text, render) {
  let out = '';
  let at = 0;
  for (const b of findBlocks(text)) {
    const diagram = b.closed ? render(b.id) : null;
    if (diagram === null) continue;
    out += text.slice(at, b.start) + expectedContent(b, diagram);
    at = b.end;
  }
  return out + text.slice(at);
}

/** Every Markdown file under root, relative with '/', sorted; skips .git, node_modules and openspec/changes/archive, and does not follow links. */
export function markdownFiles(root) {
  const files = [];
  const walk = (dir) => {
    for (const d of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, d.name);
      const rel = relative(root, path).split(sep).join('/');
      if (d.isDirectory()) { if (!SKIP_DIRS.includes(rel) && d.name !== 'node_modules' && d.name !== '.git') walk(path); }
      else if (d.isFile() && d.name.endsWith('.md')) files.push(rel);
    }
  };
  walk(root);
  return files.sort();
}

/** Every marked block in the repo's Markdown, with its file. */
export function repoBlocks(root) {
  return markdownFiles(root).flatMap((file) => findBlocks(readFileSync(join(root, file), 'utf8')).map((b) => ({ file, ...b })));
}

/** Findings for blocks (from repoBlocks) against the parts: unknown-part, stale-diagram, unclosed-diagram. Pure. */
export function diagramFindings(parts, blocks) {
  const ids = new Set(parts.map((p) => p.id));
  const findings = [];
  const add = (b, kind, detail) => findings.push({ part: b.id, kind, severity: 'error', detail: `${b.file}:${b.line}: ${detail}`, file: b.file, line: b.line });
  for (const b of blocks) {
    if (b.id !== ALL && !ids.has(b.id)) add(b, 'unknown-part', `diagram block names "${b.id}", which is no spec`);
    else if (!b.closed) add(b, 'unclosed-diagram', 'diagram block has no closing <!-- /sandy-skills diagram --> line');
    else if (b.content !== expectedContent(b, renderDiagram(parts, b.id))) add(b, 'stale-diagram', 'diagram block differs from the specs; run sandy-skills diagram --write');
  }
  return findings;
}
