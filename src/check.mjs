// Lights and drift for a set of parts, from test results and human confirmations. Pure: no I/O, no clock.
import { normalize, SIDES } from './parts.mjs';
import { diagramFindings } from './diagram.mjs';
import { changeFindings, DEFAULT_REVIEW, readLimits, enforced } from './limits.mjs';
import { changeReview } from './review.mjs';
import { standardGlossary, wrongTermFindings } from './glossary.mjs';
import { scenarioFindings } from './scenarios.mjs';

/** From weakest to strongest. A part is as proven as its weakest side. */
export const LIGHTS = ['refuted', 'expired', 'open', 'claimed', 'soft', 'hard'];
export const MAX_HUMAN_DAYS = 90;
export const MAX_CHILDREN = 7;

export function weakest(lights) {
  if (lights.length === 0) return 'open';
  return lights.reduce((a, b) => (LIGHTS.indexOf(a) <= LIGHTS.indexOf(b) ? a : b));
}

function days(from, to) {
  const ms = (d) => Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10));
  return Math.round((ms(to) - ms(from)) / 86400000);
}

function samePath(test, path) {
  const p = path.replace(/\\/g, '/').replace(/^\.\//, '');
  if (test.file) {
    const f = test.file.replace(/\\/g, '/');
    return f === p || f.endsWith('/' + p);
  }
  if (!test.classname) return true;
  const c = test.classname;
  const dotted = p.replace(/\.[^/.]+$/, '').replace(/\//g, '.');
  const dir = p.includes('/') ? p.slice(0, p.lastIndexOf('/')) : '';
  return c === p || c === dotted || dotted.endsWith('.' + c) || (dir !== '' && (c === dir || c.endsWith('/' + dir)));
}

function sameName(test, name) {
  return test.name === name || test.name.endsWith(' > ' + name);
}

const STATUS_RANK = { failed: 0, skipped: 1, todo: 2, passed: 3 };

/** The worst result among all runs of the referenced test, or null when the report has none. */
export function findTest(ref, tests) {
  const runs = tests.filter((t) => sameName(t, ref.name) && samePath(t, ref.path));
  if (runs.length === 0) return null;
  return runs.reduce((a, b) => (STATUS_RANK[a.status] <= STATUS_RANK[b.status] ? a : b));
}

function lightOf(test) {
  if (!test) return 'open';
  return { passed: 'hard', failed: 'refuted', skipped: 'open', todo: 'open' }[test.status];
}

/**
 * @param parts results of parsePart
 * @param tests results of parseJUnit
 * @param opts {today: 'yyyy-mm-dd', openTasks: text of tasks.md of every open change, diagrams: marked blocks from repoBlocks,
 *   changes: open changes from readOpenChanges, limits: from readLimits, review: from readReview, specFiles: from readSpecFiles,
 *   glossary: from readGlossary, default the package's standards/glossary.md alone}
 */
/** missing-relation or bad-relation for a seam: 1 of the glossary's values, and an upstream that is 1 of its 2 parts. */
function relationFinding(part, seam, values, add) {
  const r = seam.relation;
  if (!r) return add(part.id, 'missing-relation', 'error', `seam to "${seam.to}" has no line "Relation: <value> · Upstream: <id>"`, seam.name);
  if (r.count > 1) return add(part.id, 'bad-relation', 'error', `the seam has ${r.count} Relation lines; write 1 "Relation: <value> · Upstream: <id>"`, seam.name);
  if (r.malformed) return add(part.id, 'bad-relation', 'error', 'the Relation line is not "Relation: <value> · Upstream: <id>"', seam.name);
  if (!values.includes(r.value)) add(part.id, 'bad-relation', 'error', `Relation: ${r.value} is not 1 of the ${values.length} values of the glossary: ${values.join(', ')}`, seam.name);
  if (r.upstream !== part.id && r.upstream !== seam.to) add(part.id, 'bad-relation', 'error', `Upstream: ${r.upstream} is neither ${part.id} nor ${seam.to}`, seam.name);
}

/** A spec written before adopting the format: no metadata line, Contract, seam, TEST or CONFIRMED line. */
const isPlain = (part) => part.kind === null && !part.contract && part.seams.length === 0 && part.human.length === 0 && part.claims.every((c) => c.refs.length === 0);

export function check(parts, tests, { today, openTasks = '', diagrams = [], changes = [], limits = readLimits(''), review = DEFAULT_REVIEW, specFiles = [], glossary = standardGlossary(), enforce = 'error' }) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(today ?? '')) throw new Error('today must be yyyy-mm-dd');
  const findings = [];
  const add = (part, kind, severity, detail, requirement) =>
    findings.push({ part, kind, severity, detail, ...(requirement ? { requirement } : {}) });
  const byId = new Map(parts.map((p) => [p.id, p]));

  const proveRequirement = (part, requirement, checkClaim) => {
    if (requirement.refs.length === 0) add(part.id, 'untested', 'info', 'no TEST line', requirement.name);
    return requirement.refs.map((ref) => {
      const test = findTest(ref, tests);
      const light = lightOf(test);
      if (!test) add(part.id, 'missing-test', 'error', `${ref.ref} is not in the test report`, requirement.name);
      else if (test.status === 'failed') add(part.id, 'break', 'error', `${ref.ref} failed${test.message ? ': ' + test.message.split('\n')[0] : ''}`, requirement.name);
      else if (test.status === 'skipped') add(part.id, 'skipped-test', 'warning', `${ref.ref} is skipped`, requirement.name);
      else if (test.status === 'todo' && !openTasks.includes(ref.ref)) add(part.id, 'todo-outside-change', 'warning', `${ref.ref} is a todo test that no open change lists`, requirement.name);
      if (test && checkClaim) {
        const name = test.name.includes(' > ') ? test.name.slice(test.name.lastIndexOf(' > ') + 3) : test.name;
        const claim = (s) => normalize(s).replace(/\.$/, '').toLowerCase();
        if (/\s/.test(name.trim()) && claim(name) !== claim(requirement.text)) {
          add(part.id, 'claim-mismatch', 'error', `test "${name}" does not state the claim "${requirement.text}"`, requirement.name);
        }
      }
      return { ref: ref.ref, light, status: test ? test.status : 'missing' };
    });
  };

  const humanLight = (part, side) => {
    const entries = part.human.filter((h) => h.side === side);
    if (entries.length === 0) return { light: 'open' };
    const latest = entries.reduce((a, b) => (b.on > a.on || (b.on === a.on && b.result === 'refuted') ? b : a));
    const who = `${side} by ${latest.by} on ${latest.on}`;
    if (latest.result === 'refuted') { add(part.id, 'break', 'error', `${who} refuted the contract`); return { light: 'refuted', ...latest }; }
    if (days(latest.on, latest.expires) > MAX_HUMAN_DAYS) { add(part.id, 'confirmation-too-long', 'error', `${who} expires after more than ${MAX_HUMAN_DAYS} days`); return { light: 'expired', ...latest }; }
    if (today >= latest.expires) { add(part.id, 'expired', 'warning', `${who} expired on ${latest.expires}`); return { light: 'expired', ...latest }; }
    if (!part.contract || latest.hash !== part.contract.hash) { add(part.id, 'expired', 'warning', `${who} confirmed contract ${latest.hash}; it is now ${part.contract?.hash ?? 'missing'}`); return { light: 'expired', ...latest }; }
    return { light: part.carriedBy.includes(latest.by) ? 'claimed' : 'soft', ...latest };
  };

  const isWithin = (id, ancestor) => {
    const seen = new Set();
    for (let cur = id; cur && !seen.has(cur); cur = byId.get(cur)?.partOf) {
      if (cur === ancestor) return true;
      seen.add(cur);
    }
    return false;
  };

  const results = parts.map((part) => {
    const plain = isPlain(part);
    if (plain) add(part.id, 'not-adopted', 'warning', 'plain OpenSpec spec: add the metadata line and a Contract to check it');
    for (const p of part.problems) if (!(plain && p.kind === 'missing-metadata')) add(part.id, p.kind, p.severity, p.detail, p.requirement);
    if (part.kind !== null && !['context', 'system', 'container', 'component', 'operation'].includes(part.kind)) add(part.id, 'bad-kind', 'error', `kind "${part.kind}" is not context, system, container, component or operation`);
    if (part.status !== null && !['proposed', 'active', 'retired'].includes(part.status)) add(part.id, 'bad-status', 'error', `status "${part.status}" is not proposed, active or retired`);
    if (part.partOf && !byId.has(part.partOf)) add(part.id, 'unknown-parent', 'error', `Part of "${part.partOf}" is no spec`);
    if (!part.why) add(part.id, 'orphan-above', 'warning', 'Purpose states no why');
    if (part.status === 'proposed') add(part.id, 'orphan-below', 'warning', 'Status is proposed: nothing fulfils it yet');
    if (!part.contract && !plain) add(part.id, 'no-contract', 'error', 'no `### Requirement: Contract` heading');

    const requirements = [];
    const itLights = [];
    if (part.contract) {
      const t = proveRequirement(part, part.contract, true);
      requirements.push({ name: 'Contract', role: 'contract', text: part.contract.text, tests: t });
      itLights.push(...t.map((x) => x.light));
    }
    for (const claim of part.claims) {
      const t = proveRequirement(part, claim, true);
      requirements.push({ name: claim.name, role: 'claim', text: claim.text, tests: t });
      itLights.push(...t.map((x) => x.light));
    }
    const seams = part.seams.map((seam) => {
      if (!byId.has(seam.to)) add(part.id, 'unknown-seam-target', 'error', `seam to "${seam.to}" names no spec`, seam.name);
      relationFinding(part, seam, glossary.relations, add);
      const t = proveRequirement(part, seam, true);
      requirements.push({ name: seam.name, role: 'seam', text: seam.text, tests: t });
      return { to: seam.to, relation: seam.relation?.value ?? null, upstream: seam.relation?.upstream ?? null, readOnly: seam.readOnly, exclusive: seam.exclusive, light: weakest(t.map((x) => x.light)) };
    });
    const sides = { I: 'open', It: weakest(itLights), We: 'open', They: 'open' };
    const confirmations = [];
    for (const side of SIDES) {
      const h = humanLight(part, side);
      sides[side] = h.light;
      if (h.by) confirmations.push({ side, by: h.by, on: h.on, expires: h.expires, result: h.result, light: h.light });
    }
    return { id: part.id, kind: part.kind, partOf: part.partOf, status: part.status, why: part.why, carriedBy: part.carriedBy, code: part.code, contractHash: part.contract?.hash ?? null, sides, seams, requirements, confirmations };
  });

  for (const part of parts) {
    const children = parts.filter((p) => p.partOf === part.id).length;
    if (children > MAX_CHILDREN) add(part.id, 'too-many-children', 'warning', `${children} children: a level may be missing in between`);
    const seen = new Set([part.id]);
    for (let cur = part.partOf; cur; cur = byId.get(cur)?.partOf) {
      if (cur === part.id) { add(part.id, 'cycle', 'error', 'Part of leads back to itself'); break; }
      if (seen.has(cur) || !byId.has(cur)) break;
      seen.add(cur);
    }
    for (const seam of part.seams.filter((s) => s.exclusive)) {
      for (const other of parts) {
        if (other.id === part.id || isWithin(other.id, part.id)) continue;
        if (other.seams.some((s) => s.to === seam.to && !s.readOnly)) {
          add(part.id, 'contradiction', 'error', `exclusive seam to "${seam.to}", but "${other.id}" also writes to it`, seam.name);
        }
      }
    }
  }

  // A stale picture is a finding of the doc that holds it, not drift of the part it shows.
  findings.push(...diagramFindings(parts, diagrams));
  // Size and wording of open changes: findings of the change's files, never drift of a part.
  findings.push(...changeFindings(changes, limits));
  // Estimated review minutes of open changes, before any code: long-review of the change, never drift of a part.
  findings.push(...changeReview(changes, review));
  // Scenario shape of specs and open changes: findings of the spec file, never drift of a part.
  findings.push(...scenarioFindings(specFiles));
  // Glossary words in the specs and in every Markdown file of an open change: findings of the file, never drift.
  const glossaryFiles = [...specFiles.filter((f) => f.file.startsWith('openspec/specs/')), ...changes.flatMap((c) => c.files.filter((f) => f.path.endsWith('.md')).map((f) => ({ part: c.id, file: `${c.dir}/${f.path}`, text: f.text })))];
  findings.push(...wrongTermFindings(glossaryFiles, glossary));

  for (const r of results) {
    const own = findings.filter((f) => f.part === r.id && f.severity !== 'info' && !f.file);
    r.drift = own.map((f) => f.kind);
    for (const s of r.seams) if (s.light === 'refuted' && !r.drift.includes('break')) r.drift.push('break');
    r.light = r.drift.length ? 'drift' : weakest(Object.values(r.sides));
  }

  // enforce 'warn' (the CLI's default) reports each error as a warning; 'error' keeps each severity.
  const shown = enforced(findings, enforce);
  const errors = shown.filter((f) => f.severity === 'error').length;
  const warnings = shown.filter((f) => f.severity === 'warning').length;
  return { today, summary: { parts: results.length, errors, warnings, releasable: errors === 0 }, parts: results, findings: shown };
}
