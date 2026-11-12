import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseJUnit } from '../src/junit.mjs';
import { parsePart, contractHash } from '../src/parts.mjs';
import { spec } from './helpers.mjs';

test('The checker SHALL read test results from JUnit XML, including attribute values that contain angle brackets.', () => {
  const results = parseJUnit(readFileSync(new URL('./fixtures/node-junit.xml', import.meta.url), 'utf8'));
  assert.deepEqual(results.map((r) => [r.name, r.status]), [
    ['If the relay times out, then the service SHALL retry once.', 'passed'],
    ['fails', 'failed'],
    ['todo one', 'todo'],
    ['skip one', 'skipped'],
  ]);
  assert.equal(results[1].message, 'boom <x>');
});

test('The contract hash SHALL ignore whitespace in the contract sentence.', () => {
  assert.equal(contractHash('The a SHALL\n  hold.'), contractHash(' The a SHALL hold. '));
  assert.notEqual(contractHash('The a SHALL hold.'), contractHash('The a SHALL fold.'));
});

test('If a TEST, CONFIRMED or metadata line is malformed, then the checker SHALL report it as an error.', () => {
  const part = parsePart(spec('a', { extra: ['- **TEST** `no-separator`', '- **CONFIRMED** I by ana yesterday'] }));
  assert.deepEqual(part.problems.map((p) => p.kind), ['malformed-line', 'malformed-line']);
  const meta = parsePart({ id: 'b', overview: 'Why.\n\nKind: system · Owner: ana', requirements: [] });
  assert.deepEqual(meta.problems.map((p) => p.kind), ['malformed-metadata']);
  assert.equal(meta.kind, 'system');
});
