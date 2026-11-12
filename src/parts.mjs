// A part is one OpenSpec capability read as a part of the system: why, metadata, contract, seams, claims, human proofs.
import { createHash } from 'node:crypto';

export const KINDS = ['context', 'system', 'container', 'component', 'operation'];
export const STATUSES = ['proposed', 'active', 'retired'];
export const SIDES = ['I', 'We', 'They'];

const ID = '[a-z0-9]+(?:-[a-z0-9]+)*(?:/[a-z0-9]+(?:-[a-z0-9]+)*)*';
const META_KEYS = { 'kind': 'kind', 'part of': 'partOf', 'carried by': 'carriedBy', 'status': 'status', 'code': 'code' };
const SEAM_RE = new RegExp(`^Seam to (${ID})$`);
const TEST_RE = /^-\s+\*\*TEST\*\*\s+`([^`]+)`\s*$/;
const HUMAN_RE = /^-\s+\*\*(CONFIRMED|REFUTED)\*\*\s+(.*)$/;
const HUMAN_BODY_RE = /^(I|We|They)\s+by\s+(\S+)\s+on\s+(\d{4}-\d{2}-\d{2}),\s*expires\s+(\d{4}-\d{2}-\d{2}),\s*contract\s+([0-9a-f]{8})$/;

/** Whitespace is not part of a contract: rewrapping a sentence must not void its proofs. */
export function normalize(text) {
  return String(text ?? '').trim().replace(/\s+/g, ' ');
}

/** First 8 hex digits of the SHA-256 of the normalized contract sentence. */
export function contractHash(text) {
  return createHash('sha256').update(normalize(text), 'utf8').digest('hex').slice(0, 8);
}

function parseMeta(line, problems) {
  const meta = { kind: null, partOf: null, carriedBy: [], status: null, code: [] };
  for (const segment of line.split(/\s+·\s+/)) {
    const m = /^([^:]+):\s*(.*)$/.exec(segment.trim());
    const key = m && META_KEYS[m[1].trim().toLowerCase()];
    if (!key) { problems.push({ kind: 'malformed-metadata', severity: 'error', detail: `unknown metadata segment "${segment.trim()}"` }); continue; }
    const value = m[2].trim();
    if (key === 'carriedBy' || key === 'code') meta[key] = value ? value.split(/\s*,\s*/).filter(Boolean) : [];
    else if (key === 'partOf') meta.partOf = ['', 'none', '-', '—'].includes(value) ? null : value;
    else meta[key] = value;
  }
  return meta;
}

function parseLines(requirement, problems) {
  const refs = [];
  const human = [];
  for (const scenario of requirement.scenarios ?? []) {
    for (const raw of String(scenario.rawText ?? '').split('\n')) {
      const line = raw.trim();
      if (/^-\s+\*\*TEST\*\*/.test(line)) {
        const m = TEST_RE.exec(line);
        const at = m ? m[1].indexOf('::') : -1;
        if (at <= 0 || at === m[1].length - 2) {
          problems.push({ kind: 'malformed-line', severity: 'error', requirement: requirement.name, detail: `TEST line must be \`path::test\`: ${line}` });
          continue;
        }
        refs.push({ ref: m[1], path: m[1].slice(0, at), name: m[1].slice(at + 2), scenario: scenario.name });
        continue;
      }
      const h = HUMAN_RE.exec(line);
      if (!h) continue;
      const b = HUMAN_BODY_RE.exec(h[2].trim());
      if (!b) {
        problems.push({ kind: 'malformed-line', severity: 'error', requirement: requirement.name, detail: `${h[1]} line must be "<I|We|They> by <who> on <date>, expires <date>, contract <hash>": ${line}` });
        continue;
      }
      human.push({ result: h[1] === 'CONFIRMED' ? 'confirmed' : 'refuted', side: b[1], by: b[2], on: b[3], expires: b[4], hash: b[5], requirement: requirement.name });
    }
  }
  return { refs, human };
}

/** Reads the JSON of `openspec show <id> --type spec --json` as a part. */
export function parsePart(spec) {
  const problems = [];
  const lines = String(spec.overview ?? '').split('\n');
  const metaAt = lines.findIndex((l) => /^\s*Kind\s*:/i.test(l));
  let meta = { kind: null, partOf: null, carriedBy: [], status: null, code: [] };
  if (metaAt < 0) problems.push({ kind: 'missing-metadata', severity: 'error', detail: 'Purpose has no "Kind: … · Part of: … · Status: …" line' });
  else meta = parseMeta(lines[metaAt], problems);
  const why = normalize((metaAt < 0 ? lines : lines.slice(0, metaAt)).join(' '));

  const heading = String(spec.heading ?? '').replace(/\s+Specification$/, '').trim();
  const part = { id: spec.id, title: heading || spec.id, why, ...meta, contract: null, seams: [], claims: [], human: [], problems };
  for (const requirement of spec.requirements ?? []) {
    const { refs, human } = parseLines(requirement, problems);
    part.human.push(...human);
    const text = normalize(requirement.text);
    const seam = SEAM_RE.exec(requirement.name.trim());
    if (requirement.name.trim() === 'Contract') {
      part.contract = { name: 'Contract', text, hash: contractHash(text), refs };
    } else if (seam) {
      part.seams.push({ name: requirement.name, to: seam[1], text, readOnly: /\bRead-only\./.test(text), exclusive: /\bExclusive\./.test(text), refs });
    } else {
      part.claims.push({ name: requirement.name, text, refs });
    }
  }
  return part;
}
