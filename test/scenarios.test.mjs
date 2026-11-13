// Proves the scenario shape (cli spec): GIVEN, WHEN, THEN, TEST in this order, AND after GIVEN, WHEN or THEN.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { check } from '../src/check.mjs';
import { spec, TODAY } from './helpers.mjs';

const BIN = new URL('../bin/sandy-skills.mjs', import.meta.url).pathname;
const step = (k) => '- **' + k + '** x';
const scenario = (...keys) => ['#### Scenario: S', ...keys.map(step)].join('\n');
/** A spec file with one requirement and the given scenarios, the first scenario heading on line 5. */
const specText = (...scenarios) => ['## Requirements', '', '### Requirement: R', 'The a SHALL hold.', ...scenarios.flatMap((s) => [s, ''])].join('\n');
const shapes = (files) => check([], [], { today: TODAY, specFiles: files.map(([file, text]) => ({ part: 'a', file, text })) })
  .findings.filter((f) => f.kind === 'scenario-shape').map(({ severity, file, line }) => ({ severity, file, line }));
const FILE = 'openspec/specs/a/spec.md';

test("If a scenario misses a GIVEN, WHEN, THEN or TEST line, then the checker SHALL report the error scenario-shape with file and line.", () => {
  for (const missing of ['GIVEN', 'WHEN', 'THEN', 'TEST']) {
    const keys = ['GIVEN', 'WHEN', 'THEN', 'TEST'].filter((k) => k !== missing);
    assert.deepEqual(shapes([[FILE, specText(scenario('GIVEN', 'WHEN', 'THEN', 'TEST'), scenario(...keys))]]), [{ severity: 'error', file: FILE, line: 11 }], missing);
  }
  assert.deepEqual(shapes([[FILE, specText('#### Scenario: S')]]), [{ severity: 'error', file: FILE, line: 5 }], 'no steps');
  const r = check([], [], { today: TODAY, specFiles: [{ part: 'a', file: FILE, text: specText(scenario('WHEN', 'THEN', 'TEST')) }] });
  assert.equal(r.summary.releasable, false);
  assert.match(r.findings.find((f) => f.kind === 'scenario-shape').detail, /openspec\/specs\/a\/spec\.md:5: scenario "S" has WHEN, THEN, TEST; write GIVEN, WHEN, THEN, TEST/);
});

test("When the lines of a scenario are out of order, the checker SHALL report the error scenario-shape with file and line.", () => {
  for (const keys of [['WHEN', 'GIVEN', 'THEN', 'TEST'], ['GIVEN', 'THEN', 'WHEN', 'TEST'], ['GIVEN', 'WHEN', 'TEST', 'THEN'], ['GIVEN', 'GIVEN', 'WHEN', 'THEN', 'TEST'], ['GIVEN', 'WHEN', 'THEN', 'TEST', 'TEST']]) {
    assert.deepEqual(shapes([[FILE, specText(scenario(...keys))]]), [{ severity: 'error', file: FILE, line: 5 }], keys.join(' '));
  }
});

test("The checker SHALL accept AND lines after GIVEN, WHEN or THEN.", () => {
  assert.deepEqual(shapes([[FILE, specText(scenario('GIVEN', 'AND', 'AND', 'WHEN', 'AND', 'THEN', 'AND', 'TEST'), scenario('GIVEN', 'WHEN', 'THEN', 'TEST'))]]), []);
  assert.deepEqual(shapes([[FILE, specText(scenario('GIVEN', 'WHEN', 'THEN', 'TEST', 'AND'))]]).length, 1, 'no AND after TEST');
  assert.deepEqual(shapes([[FILE, specText(scenario('AND', 'GIVEN', 'WHEN', 'THEN', 'TEST'))]]).length, 1, 'no AND first');
  const fenced = specText(scenario('GIVEN', 'WHEN', 'THEN', 'TEST') + '\n- **CONFIRMED** I by a on 2026-01-01, expires 2026-03-01, contract abc\n\x60\x60\x60\n- **WHEN** y\n\x60\x60\x60\n<!-- - **THEN** z -->');
  assert.deepEqual(shapes([[FILE, fenced]]), [], 'CONFIRMED, fenced and commented lines are no steps');
});

test("The checker SHALL check scenarios in openspec/specs and open changes, never in archived changes.", () => {
  const bad = specText(scenario('WHEN', 'THEN', 'TEST'));
  const root = mkdtempSync(join(tmpdir(), 'sandy-skills-scenarios-'));
  for (const [path, text] of Object.entries({
    'openspec/specs/a/spec.md': bad,
    'openspec/changes/new/specs/a/spec.md': bad,
    'openspec/changes/archive/2026-01-01-old/specs/a/spec.md': bad,
    'openspec/changes/new/proposal.md': 'A b.\n',
  })) { mkdirSync(dirname(join(root, path)), { recursive: true }); writeFileSync(join(root, path), text); }
  writeFileSync(join(root, 'specs.json'), JSON.stringify([spec('a')]));
  const r = spawnSync(process.execPath, [BIN, 'check', '--root', root, '--specs', join(root, 'specs.json'), '--today', TODAY, '--format', 'json'], { encoding: 'utf8' });
  assert.equal(r.stderr, '');
  const found = JSON.parse(r.stdout).findings.filter((f) => f.kind === 'scenario-shape').map((f) => [f.file, f.line]);
  assert.deepEqual(found, [['openspec/specs/a/spec.md', 5], ['openspec/changes/new/specs/a/spec.md', 5]]);
});

test("check SHALL read the scenarios and the words of each spec below openspec/specs at any depth, with its folder path as the id, as OpenSpec lists it.", () => {
  const root = mkdtempSync(join(tmpdir(), 'sandy-skills-nested-'));
  const path = 'openspec/specs/parent/a/spec.md';
  mkdirSync(dirname(join(root, path)), { recursive: true });
  writeFileSync(join(root, path), specText(scenario('WHEN', 'THEN', 'TEST')) + 'A feature.\n');
  writeFileSync(join(root, 'specs.json'), JSON.stringify([spec('parent/a')]));
  const r = spawnSync(process.execPath, [BIN, 'check', '--root', root, '--specs', join(root, 'specs.json'), '--today', TODAY, '--format', 'json'], { encoding: 'utf8' });
  assert.equal(r.stderr, '');
  const found = JSON.parse(r.stdout).findings.filter((f) => f.file).map((f) => [f.kind, f.part, f.file, f.line]);
  assert.deepEqual(found, [['scenario-shape', 'parent/a', path, 5], ['wrong-term', 'parent/a', path, 9]]);
});
