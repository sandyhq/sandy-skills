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
/** Owner (0.6.0): target 20 minutes (printed only), warn above 30, fail above 60; code lines warn above 200, fail above 400. */
export const DEFAULT_WEIGHTS = { wordsPerMinute: 170, linesPerMinute: 8, part: 5, seam: 8, claim: 2 };
export const DEFAULT_REVIEW = { target: 20, minutes: { warn: 30, error: 60 }, lines: { warn: 200, error: 400 }, weights: DEFAULT_WEIGHTS };
/** Scenario keywords and SHALL are the spec's grammar, never a vague word, even when an override list names them. */
const KEYWORDS = /\*\*(WHEN|THEN|AND|GIVEN|TEST)\*\*|\bSHALL\b/g;

const CONFIG = 'openspec/config.yaml';
const indent = (line) => /^\s*/.exec(line.t)[0].length;
const blank = (line) => line.t.trim() === '';
const fail = (line, message) => new Error(`${CONFIG} line ${line.n}: ${message}`);

/** The line's text without its comment: a # after a space or at the start, outside quotes. Quotes open at a value's start. */
function uncomment(line) {
  const t = line.t;
  let quote = null;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (quote) {
      if (c === '\\' && quote === '"') throw fail(line, 'backslash escapes are not read; use single quotes');
      if (c === quote) { if (quote === "'" && t[i + 1] === "'") i++; else quote = null; }
    } else if ((c === '"' || c === "'") && (i === 0 || /[\s[{,:]/.test(t[i - 1]))) quote = c;
    else if (c === '#' && (i === 0 || /\s/.test(t[i - 1]))) return { ...line, t: t.slice(0, i).trimEnd() };
  }
  if (quote) throw fail(line, `the quote ${quote} does not close on this line`);
  return { ...line, t: t.trimEnd() };
}

/** The items of a flow list or map body, split at commas outside quotes. */
function splitFlow(body) {
  const items = [];
  let quote = null, from = 0;
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (quote) { if (c === quote) { if (quote === "'" && body[i + 1] === "'") i++; else quote = null; } }
    else if ((c === '"' || c === "'") && (i === 0 || /[\s,:]/.test(body[i - 1]))) quote = c;
    else if (c === ',') { items.push(body.slice(from, i)); from = i + 1; }
  }
  items.push(body.slice(from));
  return items.map((x) => x.trim()).filter(Boolean);
}

/** One value: quoted, or plain without YAML syntax that this reader does not read. */
function scalar(raw, line) {
  const v = raw.trim();
  let m;
  if ((m = /^"([^"]*)"$/.exec(v))) return m[1];
  if ((m = /^'((?:[^']|'')*)'$/.exec(v))) return m[1].replace(/''/g, "'");
  if (/^[[\]{}&*!|>%@`"']|[[\]{}]|:(\s|$)/.test(v)) throw fail(line, `cannot read "${v}"; write a number, a word or a quoted text`);
  return v;
}

/** The lines indented below the key line at `at`, and a list item at the key's own indent. */
function block(lines, at) {
  const own = indent(lines[at]);
  const body = [];
  for (let i = at + 1; i < lines.length && (blank(lines[i]) || indent(lines[i]) > own || (/^\s*- /.test(lines[i].t) && indent(lines[i]) === own)); i++) body.push(lines[i]);
  return body;
}

/** `{ warn: 1, error: 2 }` on the key's line, or `warn: 1` and `error: 2` on the lines below it. */
function thresholds(raw, below, line, where) {
  return fields(raw, below, line, where, /^(warn|error)$/, /^\d+$/, 'warn: <number> or error: <number>');
}

/** The name: value fields of a one-line {…} map or of the lines below the key; names match known, values match number. */
function fields(raw, below, line, where, known, number, shape) {
  let pairs;
  if (raw.startsWith('{')) {
    if (!raw.endsWith('}')) throw fail(line, `${where} must be { ${shape} } on one line`);
    pairs = splitFlow(raw.slice(1, -1)).map((t) => [t, line]);
  } else if (raw === '') pairs = below.filter((l) => !blank(l)).map((l) => [l.t, l]);
  else throw fail(line, `${where} must be { ${shape} }`);
  const out = {};
  for (const [t, l] of pairs) {
    const m = /^\s*([A-Za-z]+)\s*:\s*(.*)$/.exec(t);
    const value = m && known.test(m[1]) && scalar(m[2], l);
    if (!m || !value || !number.test(value)) throw fail(l, `${where}: "${t.trim()}" is not ${shape}`);
    out[m[1]] = Number(value);
  }
  return out;
}

/**
 * The limits from the text of openspec/config.yaml: `sandy-skills.limits`; each missing key or field at its default.
 * A small hand-written reader of that block only (owner: no YAML library): per measure `{ warn: N, error: N }` or
 * `warn:`/`error:` lines, and `vagueWords` as a one-line `[a, "b, c"]` or `- a` lines. Any other YAML in it stops check
 * with the line number instead of being misread.
 */
/** The block of the key name directly under sandy-skills: its lines without comments and their key indent; null without one. */
function section(configText, name) {
  const lines = String(configText ?? '').replace(/\r\n?/g, '\n').split('\n').map((t, i) => ({ t, n: i + 1 }));
  const top = lines.findIndex((l) => /^sandy-skills:/.test(l.t));
  if (top < 0) return null;
  if (!/^sandy-skills:\s*(#.*)?$/.test(lines[top].t)) throw fail(lines[top], 'write sandy-skills: as a block, one key per line');
  const inner = block(lines, top);
  const first = inner.find((l) => !blank(l) && !/^\s*#/.test(l.t));
  if (!first) return null;
  const child = indent(first);
  const at = inner.findIndex((l) => indent(l) === child && new RegExp(`^\\s+${name}:`).test(l.t));
  if (at < 0) return null;
  if (!new RegExp(`^\\s+${name}:\\s*(#.*)?$`).test(inner[at].t)) throw fail(inner[at], `write ${name}: as a block, one key per line`);
  const body = block(inner, at).map(uncomment);
  const keyLine = body.find((l) => !blank(l));
  return { body, keyIndent: keyLine ? indent(keyLine) : 0 };
}

export function readLimits(configText) {
  const limits = Object.fromEntries(MEASURES.map((k) => [k, { ...DEFAULT_LIMITS[k] }]));
  limits.vagueWords = [...DEFAULT_VAGUE_WORDS];
  const sec = section(configText, 'limits');
  if (!sec) return limits;
  const { body, keyIndent } = sec;
  for (let i = 0; i < body.length; i++) {
    if (blank(body[i])) continue;
    const m = /^\s*([A-Za-z]+):(?:\s+(.*))?$/.exec(body[i].t);
    if (!m || indent(body[i]) !== keyIndent) throw fail(body[i], `cannot read "${body[i].t.trim()}" under sandy-skills.limits`);
    const [, key, raw = ''] = m;
    const line = body[i];
    const where = `sandy-skills.limits.${key}`;
    let j = i;
    while (j + 1 < body.length && (blank(body[j + 1]) || indent(body[j + 1]) > keyIndent || (key === 'vagueWords' && /^\s*- /.test(body[j + 1].t)))) j++;
    const below = body.slice(i + 1, j + 1);
    i = j;
    if (MEASURES.includes(key)) {
      Object.assign(limits[key], thresholds(raw.trim(), below, line, where));
      if (limits[key].warn > limits[key].error) throw fail(line, `${where}: warn ${limits[key].warn} is above error ${limits[key].error}`);
    } else if (key === 'vagueWords') {
      const value = raw.trim();
      if (value.startsWith('[')) {
        if (!value.endsWith(']')) throw fail(line, `${where}: the list must close with ] on the same line`);
        limits.vagueWords = splitFlow(value.slice(1, -1)).map((v) => scalar(v, line));
      } else if (value === '') {
        limits.vagueWords = below.filter((l) => !blank(l)).map((l) => {
          if (!/^\s*- /.test(l.t)) throw fail(l, `${where}: "${l.t.trim()}" is no list item`);
          return scalar(l.t.replace(/^\s*- /, ''), l);
        });
      } else throw fail(line, `${where}: cannot read "${value}"; write a list`);
    } else throw fail(line, `${where} is no limit; known: ${[...MEASURES, 'vagueWords'].join(', ')}`);
  }
  return limits;
}

/** The lines of a Markdown file with fenced code and HTML comments blanked, read in document order; line numbers stay. */
export function proseLines(text) {
  const out = [];
  let fence = null;
  let comment = false;
  for (const line of String(text).split('\n')) {
    const m = /^\s*(`{3,}|~{3,})/.exec(line);
    if (fence) { if (m && m[1][0] === fence[0] && m[1].length >= fence.length) fence = null; out.push(''); continue; }
    if (m && !comment) { fence = m[1]; out.push(''); continue; }
    let kept = '';
    let rest = line;
    while (rest) {
      const at = rest.indexOf(comment ? '-->' : '<!--');
      if (at < 0) { kept += comment ? ' '.repeat(rest.length) : rest; break; }
      const end = at + (comment ? 3 : 4);
      kept += comment ? ' '.repeat(end) : rest.slice(0, at) + '    ';
      rest = rest.slice(end);
      comment = !comment;
    }
    out.push(kept);
  }
  return out;
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

/** The text with each code span blanked, line ends kept: n backticks up to the next run of exactly n in the same paragraph. */
export function blankCodeSpans(text) {
  let out = '';
  let i = 0;
  while (i < text.length) {
    if (text[i] !== '`') { out += text[i++]; continue; }
    let n = 0;
    while (text[i + n] === '`') n++;
    let j = i + n;
    let close = -1;
    while (j < text.length && close < 0) {
      if (text[j] === '\n' && /^\n[ \t]*\n/.test(text.slice(j, j + 200))) break;
      if (text[j] !== '`') { j++; continue; }
      let m = 0;
      while (text[j + m] === '`') m++;
      if (m === n) close = j; else j += m;
    }
    if (close < 0) { out += text.slice(i, i + n); i += n; continue; }
    out += text.slice(i, close + n).replace(/[^\n]/g, ' ');
    i = close + n;
  }
  return out;
}

/** Every [line number, word] where a listed word stands outside code, comments, backticks and spec keywords. */
export function vagueWords(text, words) {
  const res = words.map((w) => [w, wordRe(w)]);
  const hits = [];
  blankCodeSpans(proseLines(text).join('\n')).split('\n').forEach((line, i) => {
    const plain = line.replace(KEYWORDS, ' ');
    for (const [w, re] of res) if (re.test(plain)) hits.push([i + 1, w]);
  });
  return hits;
}

const REQUIREMENT = /^###\s+Requirement:/;
const requirementCount = (text) => proseLines(text).filter((l) => REQUIREMENT.test(l)).length;

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
      requirements: [`${change.dir}/specs/`, specs.reduce((n, f) => n + requirementCount(f.text), 0), 'requirements'],
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

/**
 * The review settings from the text of openspec/config.yaml: `sandy-skills.review` with minutes and lines as
 * { warn, error } and weights as { wordsPerMinute, linesPerMinute, part, seam, claim }; each missing key or field at
 * its default. Same reader and rules as readLimits.
 */
export function readReview(configText) {
  const review = { target: DEFAULT_REVIEW.target, minutes: { ...DEFAULT_REVIEW.minutes }, lines: { ...DEFAULT_REVIEW.lines }, weights: { ...DEFAULT_WEIGHTS } };
  const sec = section(configText, 'review');
  if (!sec) return review;
  const { body, keyIndent } = sec;
  for (let i = 0; i < body.length; i++) {
    if (blank(body[i])) continue;
    const m = /^\s*([A-Za-z]+):(?:\s+(.*))?$/.exec(body[i].t);
    if (!m || indent(body[i]) !== keyIndent) throw fail(body[i], `cannot read "${body[i].t.trim()}" under sandy-skills.review`);
    const [, key, raw = ''] = m;
    const line = body[i];
    const where = `sandy-skills.review.${key}`;
    let j = i;
    while (j + 1 < body.length && (blank(body[j + 1]) || indent(body[j + 1]) > keyIndent)) j++;
    const below = body.slice(i + 1, j + 1);
    i = j;
    if (key === 'minutes' || key === 'lines') {
      Object.assign(review[key], thresholds(raw.trim(), below, line, where));
      if (review[key].warn > review[key].error) throw fail(line, `${where}: warn ${review[key].warn} is above error ${review[key].error}`);
    } else if (key === 'weights') {
      const names = Object.keys(DEFAULT_WEIGHTS);
      const got = fields(raw.trim(), below, line, where, new RegExp(`^(${names.join('|')})$`), /^\d+(\.\d+)?$/, `<${names.join('|')}>: <number>`);
      for (const k of ['wordsPerMinute', 'linesPerMinute']) if (got[k] === 0) throw fail(line, `${where}.${k} must be above 0`);
      Object.assign(review.weights, got);
    } else throw fail(line, `${where} is no review setting; known: minutes, lines, weights`);
  }
  return review;
}
