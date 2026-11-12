import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parsePart, contractHash } from '../src/parts.mjs';
import { check } from '../src/check.mjs';
import { spec, passed, withStatus, TODAY } from './helpers.mjs';

const run = (specs, tests = [], openTasks = '') => check(specs.map(parsePart), tests, { today: TODAY, openTasks });
const kinds = (r) => r.findings.filter((f) => f.severity !== 'info').map((f) => f.kind);
const T = 'test/a.test.mjs::t';

test('When a referenced test passed, the checker SHALL light the requirement hard.', () => {
  const r = run([spec('a', { tests: [T] })], [passed('t')]);
  assert.equal(r.parts[0].requirements[0].tests[0].light, 'hard');
  assert.equal(r.parts[0].sides.It, 'hard');
  assert.deepEqual(kinds(r), []);
});

test('When a referenced test failed, the checker SHALL report a break and light the requirement refuted.', () => {
  const r = run([spec('a', { tests: [T] })], [withStatus('failed', 't')]);
  assert.equal(r.parts[0].sides.It, 'refuted');
  assert.deepEqual(kinds(r), ['break']);
  assert.equal(r.summary.releasable, false);
});

test('If a TEST line names a test that the report does not contain, then the checker SHALL report missing-test as an error.', () => {
  const r = run([spec('a', { tests: [T, 'test/other.test.mjs::t'] })], [passed('t')]);
  assert.deepEqual(r.findings.filter((f) => f.kind === 'missing-test').map((f) => f.detail), ['test/other.test.mjs::t is not in the test report']);
});

test('When a test name is a sentence that differs from its requirement, the checker SHALL report claim-mismatch.', () => {
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
  const seam = (to, flag) => [`Seam to ${to}`, `It SHALL write to ${to}.${flag ? ' ' + flag : ''}`];
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
