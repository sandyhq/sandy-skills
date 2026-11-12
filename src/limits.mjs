// Size and wording limits for open changes: words per file, requirements per change, vague words. Pure: no I/O.
// Owner decision (0.5.0): a change is read in about 3 minutes (500 words); over 750 words it is split, never trimmed.

/** Per measure: more than warn is long-change (warning), more than error is over-limit (error). */
export const DEFAULT_LIMITS = {
  total: { warn: 500, error: 750 },
  proposal: { warn: 150, error: 225 },
  design: { warn: 125, error: 190 },
  tasks: { warn: 75, error: 115 },
  specs: { warn: 150, error: 225 },
  requirements: { warn: 5, error: 7 },
};
export const DEFAULT_VAGUE_WORDS = ['should', 'may', 'might', 'could', 'just', 'simply', 'probably', 'maybe', 'etc', 'various', 'appropriate', 'appropriately', 'as needed', 'if needed', 'and/or', 'tbd', 'some', 'several', 'soon', 'fast', 'quickly'];
const MEASURES = Object.keys(DEFAULT_LIMITS);
/** Scenario keywords and SHALL are the spec's grammar, never a vague word, even when an override list names them. */
const KEYWORDS = /\*\*(WHEN|THEN|AND|GIVEN|TEST)\*\*|\bSHALL\b/g;

const indent = (line) => /^\s*/.exec(line)[0].length;
const blank = (line) => /^\s*(#.*)?$/.test(line);
function scalar(raw) {
  const v = raw.trim();
  const q = /^(["'])(.*)\1\s*(#.*)?$/.exec(v);
  return q ? q[2] : v.replace(/\s+#.*$/, '').trim();
}
/** The lines indented below the key line at `at`. */
function block(lines, at) {
  const own = indent(lines[at]);
  const body = [];
  for (let i = at + 1; i < lines.length && (blank(lines[i]) || indent(lines[i]) > own || (/^\s*- /.test(lines[i]) && indent(lines[i]) === own)); i++) body.push(lines[i]);
  return body;
}

/** `{ warn: 1, error: 2 }` on the key's line, or `warn: 1` and `error: 2` on the lines below it. */
function thresholds(raw, below, where) {
  const pairs = raw.startsWith('{')
    ? (raw.endsWith('}') ? raw.slice(1, -1).split(',').filter((p) => p.trim()) : null)
    : raw === '' ? below.filter((l) => !blank(l)) : null;
  if (!pairs) throw new Error(`${where} must be { warn: <words>, error: <words> }`);
  const out = {};
  for (const p of pairs) {
    const m = /^\s*(warn|error)\s*:\s*(.*)$/.exec(p);
    const value = m && scalar(m[2]);
    if (!m || !/^\d+$/.test(value)) throw new Error(`${where}: "${p.trim()}" is not warn: <number> or error: <number>`);
    out[m[1]] = Number(value);
  }
  return out;
}

/**
 * The limits from the text of openspec/config.yaml: `sandy-skills.limits`; each missing key or field at its default.
 * Reads only that block: per measure `{ warn: N, error: N }`, and `vagueWords` as `[a, b]` or `- a` lines.
 */
export function readLimits(configText) {
  const limits = Object.fromEntries(MEASURES.map((k) => [k, { ...DEFAULT_LIMITS[k] }]));
  limits.vagueWords = [...DEFAULT_VAGUE_WORDS];
  const lines = String(configText ?? '').split('\n');
  const top = lines.findIndex((l) => /^sandy-skills:\s*(#.*)?$/.test(l));
  if (top < 0) return limits;
  const inner = block(lines, top);
  const at = inner.findIndex((l) => /^\s+limits:\s*(#.*)?$/.test(l));
  if (at < 0) return limits;
  const body = block(inner, at);
  const keyIndent = body.find((l) => !blank(l)) ? indent(body.find((l) => !blank(l))) : 0;
  for (let i = 0; i < body.length; i++) {
    if (blank(body[i])) continue;
    const m = /^\s*([A-Za-z]+):\s*(.*)$/.exec(body[i]);
    if (!m || indent(body[i]) !== keyIndent) throw new Error(`openspec/config.yaml: cannot read "${body[i].trim()}" under sandy-skills.limits`);
    const [, key, raw] = m;
    const where = `openspec/config.yaml: sandy-skills.limits.${key}`;
    const value = scalar(raw);
    let j = i;
    while (j + 1 < body.length && (blank(body[j + 1]) || indent(body[j + 1]) > keyIndent || (key === 'vagueWords' && /^\s*- /.test(body[j + 1])))) j++;
    const below = body.slice(i + 1, j + 1);
    i = j;
    if (MEASURES.includes(key)) {
      Object.assign(limits[key], thresholds(value, below, where));
      if (limits[key].warn > limits[key].error) throw new Error(`${where}: warn ${limits[key].warn} is above error ${limits[key].error}`);
    } else if (key === 'vagueWords') {
      if (value.startsWith('[')) {
        if (!value.endsWith(']')) throw new Error(`${where}: the list must close with ] on the same line`);
        limits.vagueWords = value.slice(1, -1).split(',').map(scalar).filter(Boolean);
      } else if (value === '') {
        limits.vagueWords = below.filter((l) => !blank(l)).map((l) => {
          if (!/^\s*- /.test(l)) throw new Error(`${where}: "${l.trim()}" is no list item`);
          return scalar(l.replace(/^\s*- /, ''));
        });
      } else throw new Error(`${where} must be a list`);
    } else throw new Error(`${where} is no limit; known: ${[...MEASURES, 'vagueWords'].join(', ')}`);
  }
  return limits;
}

/** The lines of a Markdown file with fenced code blocks and HTML comments blanked; line numbers stay. */
function proseLines(text) {
  const out = [];
  let fence = null;
  for (const line of String(text).split('\n')) {
    const m = /^\s*(`{3,}|~{3,})/.exec(line);
    if (fence) { if (m && m[1][0] === fence[0] && m[1].length >= fence.length) fence = null; out.push(''); continue; }
    if (m) { fence = m[1]; out.push(''); continue; }
    out.push(line);
  }
  return out.join('\n').replace(/<!--[\s\S]*?-->/g, (c) => c.replace(/[^\n]/g, ' ')).split('\n');
}

const TEST_LINE = /^\s*-\s+\*\*TEST\*\*/;
const WORD = /[\p{L}\p{N}]/u;

/**
 * Words in a change file: whitespace-separated tokens with a letter or digit, without fenced code, HTML comments
 * and TEST lines. In tasks.md a task `Prove \`<path>::<claim>\`` counts as "Prove" and the path.
 */
export function countWords(text, { tasks = false } = {}) {
  return proseLines(text)
    .filter((l) => !TEST_LINE.test(l))
    .map((l) => (tasks ? l.replace(/\bProve\s+`([^`]*?)::[^`]*`/g, 'Prove $1') : l))
    .flatMap((l) => l.split(/\s+/))
    .filter((t) => WORD.test(t)).length;
}

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const wordRe = (w) => new RegExp(`(?<![\\p{L}\\p{N}_])${w.trim().split(/\s+/).map(escape).join('\\s+')}(?![\\p{L}\\p{N}_])`, 'iu');

/** Every [line number, word] where a listed word stands outside code, comments, backticks and spec keywords. */
export function vagueWords(text, words) {
  const res = words.map((w) => [w, wordRe(w)]);
  const hits = [];
  proseLines(text).forEach((line, i) => {
    const plain = line.replace(/(`+)[\s\S]*?\1/g, ' ').replace(KEYWORDS, ' ');
    for (const [w, re] of res) if (re.test(plain)) hits.push([i + 1, w]);
  });
  return hits;
}

const REQUIREMENT = /^###\s+Requirement:/gm;

/**
 * Findings long-change (warning), over-limit (error) and vague-word (error) for open changes.
 * @param changes [{id, dir: 'openspec/changes/<id>', files: [{path: relative to dir, text}]}]
 * @param limits result of readLimits
 */
export function changeFindings(changes, limits = readLimits('')) {
  const findings = [];
  for (const change of changes) {
    const md = change.files.filter((f) => f.path.endsWith('.md'));
    const specs = md.filter((f) => f.path.startsWith('specs/'));
    const words = (f) => countWords(f.text, { tasks: f.path === 'tasks.md' });
    const own = (name) => md.filter((f) => f.path === name).reduce((n, f) => n + words(f), 0);
    const measured = {
      total: [`${change.dir}/`, md.reduce((n, f) => n + words(f), 0), 'words'],
      proposal: [`${change.dir}/proposal.md`, own('proposal.md'), 'words'],
      design: [`${change.dir}/design.md`, own('design.md'), 'words'],
      tasks: [`${change.dir}/tasks.md`, own('tasks.md'), 'words'],
      specs: [`${change.dir}/specs/`, specs.reduce((n, f) => n + words(f), 0), 'words'],
      requirements: [`${change.dir}/specs/`, specs.reduce((n, f) => n + (f.text.match(REQUIREMENT) ?? []).length, 0), 'requirements'],
    };
    for (const key of MEASURES) {
      const [file, count, unit] = measured[key];
      const { warn, error } = limits[key];
      if (count > error) findings.push({ part: change.id, kind: 'over-limit', severity: 'error', file, measured: count, threshold: error, detail: `${file}: ${count} ${unit}, more than ${key} error ${error}; split the change` });
      else if (count > warn) findings.push({ part: change.id, kind: 'long-change', severity: 'warning', file, measured: count, threshold: warn, detail: `${file}: ${count} ${unit}, more than ${key} warn ${warn}; split the change before it reaches ${error}` });
    }
    for (const f of md) {
      const file = `${change.dir}/${f.path}`;
      for (const [line, word] of vagueWords(f.text, limits.vagueWords)) {
        findings.push({ part: change.id, kind: 'vague-word', severity: 'error', file, line, word, detail: `${file}:${line}: "${word}" is vague; name who does what, with a number and unit` });
      }
    }
  }
  return findings;
}
