import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parsePart, contractHash } from '../src/parts.mjs';
import { check } from '../src/check.mjs';
import { renderMarkdown } from '../src/report.mjs';
import { wrongTermFindings } from '../src/glossary.mjs';
import { spec, passed, withStatus, TODAY } from './helpers.mjs';

const run = (specs, tests = [], openTasks = '') => check(specs.map(parsePart), tests, { today: TODAY, openTasks });
const kinds = (r) => r.findings.filter((f) => f.severity !== 'info').map((f) => f.kind);
const T = 'test/a.test.mjs::t';

test('When a referenced test passed, the checker SHALL light the claim hard.', () => {
  const r = run([spec('a', { tests: [T] })], [passed('t')]);
  assert.equal(r.parts[0].requirements[0].tests[0].light, 'hard');
  assert.equal(r.parts[0].sides.It, 'hard');
  assert.deepEqual(kinds(r), []);
});

test('When a referenced test failed, the checker SHALL report a break and light the claim refuted.', () => {
  const r = run([spec('a', { tests: [T] })], [withStatus('failed', 't')]);
  assert.equal(r.parts[0].sides.It, 'refuted');
  assert.deepEqual(kinds(r), ['break']);
  assert.equal(r.summary.releasable, false);
});

test('If a TEST line names a test that the report does not contain, then the checker SHALL report missing-test as an error.', () => {
  const r = run([spec('a', { tests: [T, 'test/other.test.mjs::t'] })], [passed('t')]);
  assert.deepEqual(r.findings.filter((f) => f.kind === 'missing-test').map((f) => f.detail), ['test/other.test.mjs::t is not in the test report']);
});

test('When a test name is a sentence that differs from its claim, the checker SHALL report claim-mismatch.', () => {
  const ok = run([spec('a', { contract: 'The a SHALL hold.', tests: ['test/a.test.mjs::the a  SHALL hold'] })], [passed('the a  SHALL hold')]);
  assert.deepEqual(kinds(ok), []);
  const bad = run([spec('a', { contract: 'The a SHALL hold.', tests: ['test/a.test.mjs::The a SHALL fold.'] })], [passed('The a SHALL fold.')]);
  assert.deepEqual(kinds(bad), ['claim-mismatch']);
});

test('When a todo test is listed in no open change, the checker SHALL report todo-outside-change as a warning.', () => {
  const tests = [withStatus('todo', 't')];
  assert.deepEqual(kinds(run([spec('a', { tests: [T] })], tests)), ['todo-outside-change']);
  assert.deepEqual(kinds(run([spec('a', { tests: [T] })], tests, `- [ ] 1.1 \`${T}\``)), []);
});

const confirmed = (side, by, on, expires, contract = 'The a SHALL keep its promise.') => `- **CONFIRMED** ${side} by ${by} on ${on}, expires ${expires}, contract ${contractHash(contract)}`;

test('When a person who does not carry the part confirms its current contract, the checker SHALL light that side soft.', () => {
  const r = run([spec('a', { extra: [confirmed('We', 'bo', '2026-11-01', '2027-01-30')] })]);
  assert.equal(r.parts[0].sides.We, 'soft');
});

test("When the part's carrier confirms its own contract, the checker SHALL light that side claimed.", () => {
  const r = run([spec('a', { extra: [confirmed('I', 'ana', '2026-11-01', '2027-01-30')] })]);
  assert.equal(r.parts[0].sides.I, 'claimed');
});

test('If the contract changes after a confirmation, then the checker SHALL light that side expired.', () => {
  const r = run([spec('a', { extra: [confirmed('They', 'bo', '2026-11-01', '2027-01-30', 'The a SHALL keep an older promise.')] })]);
  assert.equal(r.parts[0].sides.They, 'expired');
  assert.deepEqual(kinds(r), ['expired']);
  const late = run([spec('a', { extra: [confirmed('They', 'bo', '2026-08-01', '2026-10-30')] })]);
  assert.equal(late.parts[0].sides.They, 'expired');
});

test('If a confirmation is valid for more than 90 days, then the checker SHALL report confirmation-too-long.', () => {
  const r = run([spec('a', { extra: [confirmed('I', 'bo', '2026-11-01', '2027-03-01')] })]);
  assert.deepEqual(kinds(r), ['confirmation-too-long']);
  const refuted = run([spec('a', { extra: [`- **REFUTED** I by bo on 2026-11-02, expires 2027-01-30, contract ${contractHash('x')}`] })]);
  assert.equal(refuted.parts[0].sides.I, 'refuted');
});

test('The checker SHALL light a part as its weakest side, and drift when the part has a finding of its own.', () => {
  const r = run([spec('a', { tests: [T], extra: [confirmed('I', 'bo', '2026-11-01', '2027-01-30'), confirmed('We', 'ana', '2026-11-01', '2027-01-30'), confirmed('They', 'bo', '2026-11-01', '2027-01-30')] })], [passed('t')]);
  assert.equal(r.parts[0].light, 'claimed');
  const drift = run([spec('a', { why: '', tests: [T] })], [passed('t')]);
  assert.equal(drift.parts[0].light, 'drift');
  assert.deepEqual(drift.parts[0].drift, ['orphan-above']);
});

test('If Part of names no spec or leads back to the part, then the checker SHALL report unknown-parent or cycle.', () => {
  assert.deepEqual(kinds(run([spec('a', { partOf: 'ghost' })])), ['unknown-parent']);
  const r = run([spec('a', { partOf: 'b' }), spec('b', { partOf: 'a' })]);
  assert.deepEqual(kinds(r).sort(), ['cycle', 'cycle']);
});

test('When a part has an exclusive seam to a target that a part outside it writes to, the checker SHALL report a contradiction.', () => {
  const seam = (to, flag) => [`Seam to ${to}`, `It SHALL write to ${to}.${flag ? ' ' + flag : ''}\nRelation: conformist · Upstream: ${to}`];
  const parts = (otherFlag, otherPartOf = 'none') => [
    spec('db'),
    spec('a', { requirements: [seam('db', 'Exclusive.')] }),
    spec('b', { partOf: otherPartOf, requirements: [seam('db', otherFlag)] }),
  ];
  assert.deepEqual(run(parts('')).findings.filter((f) => f.kind === 'contradiction').map((f) => f.part), ['a']);
  assert.deepEqual(kinds(run(parts('Read-only.'))), []);
  assert.deepEqual(kinds(run(parts('', 'a'))), []);
});

test('When a part has more than 7 children, the checker SHALL warn that a level may be missing.', () => {
  const children = (n) => Array.from({ length: n }, (_, i) => spec(`c${i}`, { partOf: 'root' }));
  assert.deepEqual(kinds(run([spec('root'), ...children(7)])), []);
  assert.deepEqual(kinds(run([spec('root'), ...children(8)])), ['too-many-children']);
});

test("When a spec has no metadata line, Contract, seam, TEST or CONFIRMED line, the checker SHALL report it as not-adopted with a warning instead of errors.", () => {
  const plain = { id: 'p', overview: 'Does a thing for the people who need it.', requirements: [{ name: 'Thing', text: 'The system SHALL do the thing.', scenarios: [{ name: 'ok', rawText: '- **WHEN** x\n- **THEN** y' }] }] };
  const r = run([plain]);
  assert.deepEqual(kinds(r), ['not-adopted']);
  assert.equal(r.findings.find((f) => f.kind === 'not-adopted').severity, 'warning');
  assert.equal(r.summary.releasable, true);
  const started = { ...plain, requirements: [...plain.requirements, { name: 'Contract', text: 'The p SHALL work.', scenarios: [] }] };
  assert.ok(kinds(run([started])).includes('missing-metadata'), 'a spec that uses the format partly still gets errors');
});

const relation = (line) => [spec('init'), spec('diagram'), spec('cli', { requirements: [['Seam to init', `The cli SHALL install the schema with init.${line === null ? '' : '\n' + line}`]] })];
const relationFindings = (r) => r.findings.filter((f) => /relation/.test(f.kind)).map(({ part, kind, severity, requirement, detail }) => ({ part, kind, severity, requirement, detail }));

test("check SHALL report bad-relation as an error when a Relation line names a value outside the 7 values of the glossary or an upstream that is neither part of its seam.", () => {
  assert.deepEqual(relationFindings(run(relation('Relation: conformist · Upstream: init'))), []);
  assert.deepEqual(relationFindings(run(relation('Relation: conformist · Upstream: cli'))), []);
  const upstream = run(relation('Relation: conformist · Upstream: diagram'));
  assert.deepEqual(relationFindings(upstream), [{ part: 'cli', kind: 'bad-relation', severity: 'error', requirement: 'Seam to init', detail: 'Upstream: diagram is neither cli nor init' }]);
  assert.equal(upstream.summary.releasable, false);
  assert.deepEqual(relationFindings(run(relation('Relation: friendship · Upstream: init'))).map((f) => f.detail), ['Relation: friendship is not 1 of the 7 values of the glossary: partnership, shared-kernel, customer-supplier, conformist, anticorruption-layer, open-host-service, published-language']);
  assert.deepEqual(relationFindings(run(relation('Relation: conformist'))).map((f) => f.detail), ['the Relation line is not "Relation: <value> · Upstream: <id>"']);
  assert.equal(parsePart(relation('Relation: conformist · Upstream: init')[2]).seams[0].text, 'The cli SHALL install the schema with init.', 'the Relation line stays out of the claim sentence');
});

test("check SHALL report missing-relation as an error for a seam without a Relation line.", () => {
  const r = run(relation(null));
  assert.deepEqual(relationFindings(r), [{ part: 'cli', kind: 'missing-relation', severity: 'error', requirement: 'Seam to init', detail: 'seam to "init" has no line "Relation: <value> · Upstream: <id>"' }]);
  assert.equal(r.summary.releasable, false);
});

test("check SHALL word each finding and the report with glossary words, never with a word from a Not line.", () => {
  const claims = Array.from({ length: 8 }, (_, i) => `### Requirement: R${i}\nThe a SHALL do ${i}.\n`).join('\n');
  const specs = [spec('a', { tests: ['test/a.test.mjs::The a SHALL keep another promise.'], requirements: [['Seam to b', 'The a SHALL read b.']] }), spec('b', { contract: null, requirements: [['R', 'The b SHALL do it.', ['- **TEST** `x`']]] })];
  const r = check(specs.map(parsePart), [passed('The a SHALL keep another promise.')], { today: TODAY, changes: [{ id: 'c', dir: 'openspec/changes/c', files: [{ path: 'specs/a/spec.md', text: '## ADDED Requirements\n\n' + claims }] }] });
  assert.ok(['claim-mismatch', 'no-contract', 'missing-relation', 'over-limit', 'malformed-line'].every((k) => r.findings.some((f) => f.kind === k)), r.findings.map((f) => f.kind).join());
  assert.match(r.findings.find((f) => f.kind === 'claim-mismatch').detail, /does not state the claim "The a SHALL keep its promise\."/);
  assert.match(r.findings.find((f) => f.kind === 'over-limit' && f.measured === 8).detail, /: 8 claims, more than claims error 7;/);
  const words = (file, text) => wrongTermFindings([{ part: '-', file, text }]).map((f) => `${f.line}: ${f.word}`);
  assert.deepEqual(words('report.md', renderMarkdown(r)), []);
  assert.deepEqual(r.findings.flatMap((f) => words(f.kind, f.detail)), []);
});
