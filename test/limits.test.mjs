// Proves the size and wording limits for open changes (cli spec): thresholds, word count, config, vague words.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { check } from '../src/check.mjs';
import { countWords, DEFAULT_VAGUE_WORDS, readLimits } from '../src/limits.mjs';
import { openspecCommand } from '../src/openspec.mjs';
import { spec, TODAY } from './helpers.mjs';

const BIN = new URL('../bin/sandy-skills.mjs', import.meta.url).pathname;
const words = (n) => Array.from({ length: n }, (_, i) => 'w' + i).join(' ');
const change = (files, id = 'a') => ({ id, dir: 'openspec/changes/' + id, files: Object.entries(files).map(([path, text]) => ({ path, text })) });
const run = (changes, limits = readLimits('')) => check([], [], { today: TODAY, changes, limits });
const found = (r) => r.findings.filter((f) => f.severity !== 'info').map(({ kind, severity, file, measured, threshold, line, word }) => ({ kind, severity, file, ...(measured !== undefined ? { measured, threshold } : { line, word }) }));
const requirements = (n) => Array.from({ length: n }, (_, i) => '### Requirement: R' + i + '\nThe a SHALL do ' + i + '.\n').join('\n');
const DEFAULTS = {
  total: { warn: 500, error: 750 }, proposal: { warn: 150, error: 225 }, design: { warn: 125, error: 190 },
  tasks: { warn: 75, error: 115 }, specs: { warn: 150, error: 225 }, requirements: { warn: 5, error: 7 },
};

/** A repo in a temp dir from files by path, then check --format json there. */
function repo(files) {
  const root = mkdtempSync(join(tmpdir(), 'sandy-skills-limits-'));
  for (const [path, text] of Object.entries(files)) { mkdirSync(dirname(join(root, path)), { recursive: true }); writeFileSync(join(root, path), text); }
  const specsFile = join(root, 'specs.json');
  writeFileSync(specsFile, JSON.stringify([spec('a')]));
  const r = spawnSync(process.execPath, [BIN, 'check', '--root', root, '--specs', specsFile, '--today', TODAY, '--format', 'json'], { encoding: 'utf8' });
  assert.equal(r.stderr, '');
  return { root, result: JSON.parse(r.stdout) };
}

test('If openspec/config.yaml sets no sandy-skills.limits, then the checker SHALL use the default warn and error thresholds.', () => {
  for (const text of ['', 'schema: proven\n', 'schema: proven\nsandy-skills:\n  other: 1\n']) {
    assert.deepEqual(readLimits(text), { ...DEFAULTS, vagueWords: DEFAULT_VAGUE_WORDS });
  }
  assert.deepEqual(found(run([change({ 'proposal.md': words(150), 'design.md': words(125), 'tasks.md': words(75), 'specs/a/spec.md': requirements(5) })])), []);
});

test('When a measure of an open change is above its warn threshold and at most its error threshold, the checker SHALL report long-change as a warning.', () => {
  const r = run([change({ 'proposal.md': words(151), 'design.md': words(190), 'specs/a/spec.md': requirements(6) })]);
  assert.deepEqual(found(r), [
    { kind: 'long-change', severity: 'warning', file: 'openspec/changes/a/proposal.md', measured: 151, threshold: 150 },
    { kind: 'long-change', severity: 'warning', file: 'openspec/changes/a/design.md', measured: 190, threshold: 125 },
    { kind: 'long-change', severity: 'warning', file: 'openspec/changes/a/specs/', measured: 6, threshold: 5 },
  ]);
  assert.equal(r.summary.releasable, true);
  assert.equal(r.summary.warnings, 3);
});

test('When a measure of an open change is above its error threshold, the checker SHALL report over-limit as an error with the file, the count and the threshold.', () => {
  const specWords = 400 + 8 * 7;
  const r = run([change({ 'proposal.md': words(226), 'tasks.md': words(116), 'specs/a/spec.md': requirements(8), 'specs/b/spec.md': words(400) })]);
  assert.deepEqual(found(r), [
    { kind: 'over-limit', severity: 'error', file: 'openspec/changes/a/', measured: 226 + 116 + specWords, threshold: 750 },
    { kind: 'over-limit', severity: 'error', file: 'openspec/changes/a/proposal.md', measured: 226, threshold: 225 },
    { kind: 'over-limit', severity: 'error', file: 'openspec/changes/a/tasks.md', measured: 116, threshold: 115 },
    { kind: 'over-limit', severity: 'error', file: 'openspec/changes/a/specs/', measured: specWords, threshold: 225 },
    { kind: 'over-limit', severity: 'error', file: 'openspec/changes/a/specs/', measured: 8, threshold: 7 },
  ]);
  assert.equal(r.summary.releasable, false);
  assert.match(r.findings[1].detail, /openspec\/changes\/a\/proposal\.md: 226 words, more than proposal error 225/);
});

test('The checker SHALL apply the thresholds only to open changes, never to archived changes or to openspec/specs.', () => {
  const { result } = repo({
    'openspec/changes/archive/2026-01-01-old/proposal.md': words(900) + ' should',
    'openspec/specs/a/spec.md': words(900) + ' should',
    'openspec/changes/new/proposal.md': words(151),
  });
  assert.deepEqual(found(result), [{ kind: 'long-change', severity: 'warning', file: 'openspec/changes/new/proposal.md', measured: 151, threshold: 150 }]);
});

test('The checker SHALL count as words only tokens with a letter or digit, outside fenced code, HTML comments, TEST lines and Prove claim texts.', () => {
  const text = [
    '## 2. Proof', '',
    '- [ ] 2.1 Prove ' + '\x60test/a.test.mjs::When the relay times out, the service SHALL retry once.\x60',
    '\x60\x60\x60sh', 'node --test four words here', '\x60\x60\x60',
    '<!-- a comment', 'over two lines -->',
    '- **TEST** \x60test/a.test.mjs::The a SHALL hold.\x60',
    'A b | c → 3.1',
  ].join('\n');
  // "2." "Proof" "2.1" "Prove" and the path, then "A" "b" "c" "3.1"
  assert.equal(countWords(text, { tasks: true }), 9);
  assert.equal(countWords(text), 9 + 9, 'outside tasks.md the claim text counts');
});

test('Where openspec/config.yaml sets sandy-skills.limits, the checker SHALL use those thresholds, and openspec validate SHALL still accept the file.', () => {
  const config = [
    'schema: spec-driven', 'sandy-skills:', '  limits:',
    ...Object.keys(DEFAULTS).map((k) => '    ' + k + ': { warn: 10, error: 20 }'),
    '    vagueWords: [hurry]', '',
  ].join('\n');
  const own = Object.fromEntries(Object.keys(DEFAULTS).map((k) => [k, { warn: 10, error: 20 }]));
  assert.deepEqual(readLimits(config), { ...own, vagueWords: ['hurry'] });
  const { root, result } = repo({
    'openspec/config.yaml': config,
    'openspec/changes/new/proposal.md': '## Why\n\n' + words(8) + ' longer than fifty characters in all.\n\n## What Changes\n\n- **a** b\n',
    'openspec/changes/new/specs/a/spec.md': '## ADDED Requirements\n\n### Requirement: A\nThe a SHALL hold.\n\n#### Scenario: A\n- **WHEN** x\n- **THEN** y\n',
  });
  assert.deepEqual(found(result).map((f) => [f.kind, f.file, f.threshold]), [
    ['over-limit', 'openspec/changes/new/', 20],
    ['long-change', 'openspec/changes/new/proposal.md', 10],
    ['long-change', 'openspec/changes/new/specs/', 10],
  ]);
  const [cmd, ...pre] = openspecCommand(root);
  const v = spawnSync(cmd, [...pre, 'validate', '--all', '--strict', '--no-interactive'], { cwd: root, encoding: 'utf8' });
  assert.equal(v.status, 0, v.stdout + v.stderr);
});

test('The checker SHALL read openspec/config.yaml with CRLF line endings the same as with LF line endings.', () => {
  const lf = 'schema: spec-driven\nsandy-skills:\n  limits:\n    total: {warn: 600, error: 900}\n    vagueWords:\n      - hurry\n';
  assert.deepEqual(readLimits(lf.replace(/\n/g, '\r\n')), readLimits(lf));
  assert.deepEqual(readLimits(lf.replace(/\n/g, '\r\n')).total, { warn: 600, error: 900 });
  const { result } = repo({ 'openspec/config.yaml': lf.replace(/\n/g, '\r\n'), 'openspec/changes/new/proposal.md': words(10) });
  assert.deepEqual(found(result), []);
});

test('The checker SHALL read thresholds only from the limits key directly under sandy-skills, never from a limits key nested deeper.', () => {
  const both = 'sandy-skills:\n  reports:\n    limits:\n      total: {warn: 1, error: 2}\n  limits:\n    total: {warn: 600, error: 900}\n';
  assert.deepEqual(readLimits(both).total, { warn: 600, error: 900 });
  assert.deepEqual(readLimits('sandy-skills:\n  reports:\n    limits:\n      total: {warn: 1, error: 2}\n'), { ...DEFAULTS, vagueWords: DEFAULT_VAGUE_WORDS });
  assert.deepEqual(readLimits('sandy-skills:\n    limits:\n        total: {warn: 600, error: 900}\n').total, { warn: 600, error: 900 }, '4-space indent');
});

test('The checker SHALL read quoted config values with commas and # as one value, and stop with a message naming the line for config syntax it does not read.', () => {
  const head = 'schema: spec-driven # c\nsandy-skills:\n  limits:\n';
  const flow = readLimits(head + '    vagueWords: ["maybe, later", \'right # away\', \'it\'\'s\', hurry]  # owner\n');
  assert.deepEqual(flow.vagueWords, ['maybe, later', 'right # away', "it's", 'hurry']);
  assert.deepEqual(readLimits(head + "    vagueWords: [don't, x]\n").vagueWords, ["don't", 'x']);
  const block = readLimits(head + '    vagueWords:\n      - "right # away"  # owner\n      - \'a, b\'\n    total: { warn: "600", error: 900 } # c\n');
  assert.deepEqual([block.vagueWords, block.total], [['right # away', 'a, b'], { warn: 600, error: 900 }]);
  const r = run([change({ 'proposal.md': 'We defer\nmaybe, later.\n' })], flow);
  assert.deepEqual(found(r).map((f) => [f.line, f.word]), [[2, 'maybe, later']]);
  for (const [text, message] of [
    ['    vagueWords: [a,\n      b]\n', /line 4: .*\] on the same line/],
    ['    vagueWords: ["a]\n', /line 4: .*quote " does not close/],
    ['    vagueWords: ["a\\"b"]\n', /line 4: .*backslash/],
    ['    vagueWords: [&x a]\n', /line 4: .*cannot read "&x a"/],
    ['    vagueWords: |\n      a\n', /line 4: .*cannot read "\|"/],
    ['    total: {warn: 1, error: {a: 2}}\n', /line 4: /],
  ]) assert.throws(() => readLimits(head + text), message, text);
  assert.throws(() => readLimits('sandy-skills: {limits: {total: {warn: 1}}}\n'), /line 1: write sandy-skills: as a block/);
  assert.throws(() => readLimits('sandy-skills:\n  limits: {total: {warn: 1}}\n'), /line 2: write limits: as a block/);
  assert.deepEqual(readLimits('sandy-skills:\n  other: "a \\" b"\n'), { ...DEFAULTS, vagueWords: DEFAULT_VAGUE_WORDS }, 'other keys stay unread');
});

test('If sandy-skills.limits sets only part of the thresholds, then the checker SHALL take each missing key and field from the defaults.', () => {
  const flow = readLimits('sandy-skills:\n  limits:\n    proposal: { warn: 100 }\n');
  assert.deepEqual(flow, { ...DEFAULTS, proposal: { warn: 100, error: 225 }, vagueWords: DEFAULT_VAGUE_WORDS });
  const nested = readLimits('sandy-skills:\n  limits:\n    tasks:\n      error: 90  # owner\n    total: {error: 800}\n');
  assert.deepEqual(nested, { ...DEFAULTS, tasks: { warn: 75, error: 90 }, total: { warn: 500, error: 800 }, vagueWords: DEFAULT_VAGUE_WORDS });
  assert.throws(() => readLimits('sandy-skills:\n  limits:\n    propsal: { warn: 1 }\n'), /propsal is no limit/);
  assert.throws(() => readLimits('sandy-skills:\n  limits:\n    design: { warn: 200 }\n'), /warn 200 is above error 190/);
});

test('When a file of an open change uses a word of the default vague-word list, the checker SHALL report vague-word as an error with the file, line and word.', () => {
  const r = run([change({ 'proposal.md': '## Why\n\nWe should ship it soon, etc.\nAdd tests as\nneeded and/or docs.\nShouldering is fine.\n' })]);
  assert.deepEqual(found(r), [
    { kind: 'vague-word', severity: 'error', file: 'openspec/changes/a/proposal.md', line: 3, word: 'should' },
    { kind: 'vague-word', severity: 'error', file: 'openspec/changes/a/proposal.md', line: 3, word: 'etc' },
    { kind: 'vague-word', severity: 'error', file: 'openspec/changes/a/proposal.md', line: 3, word: 'soon' },
    { kind: 'vague-word', severity: 'error', file: 'openspec/changes/a/proposal.md', line: 5, word: 'and/or' },
  ]);
  assert.equal(r.summary.releasable, false);
});

test('Where openspec/config.yaml sets sandy-skills.limits.vagueWords, the checker SHALL use that list instead of the default list.', () => {
  const limits = readLimits('sandy-skills:\n  limits:\n    vagueWords:\n      - hurry\n      - "right away"\n');
  assert.deepEqual(limits.vagueWords, ['hurry', 'right away']);
  const r = run([change({ 'design.md': 'We should hurry.\nDo it Right  Away.\n' })], limits);
  assert.deepEqual(found(r).map((f) => [f.line, f.word]), [[1, 'hurry'], [2, 'right away']]);
});

test('The checker SHALL skip fenced code, HTML comments, backticks and the keywords SHALL, WHEN, THEN, AND and GIVEN when it looks for vague words.', () => {
  const text = ['\x60\x60\x60', 'you should run it', '\x60\x60\x60', '<!-- maybe', 'later -->', 'Run \x60npm run fast\x60 once.', 'The a SHALL hold.', '- **WHEN** x', '- **AND** y', '- **GIVEN** z', '- **THEN** w'].join('\n');
  assert.deepEqual(found(run([change({ 'specs/a/spec.md': text })])), []);
  const own = { ...readLimits(''), vagueWords: ['shall', 'when', 'then', 'and', 'given'] };
  assert.deepEqual(found(run([change({ 'specs/a/spec.md': text })], own)), []);
  assert.deepEqual(found(run([change({ 'specs/a/spec.md': 'Then and when.' })], own)).map((f) => f.word), ['when', 'then', 'and']);
});
