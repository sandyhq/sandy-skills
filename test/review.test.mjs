// Proves the review-time part: the estimated review minutes of a diff, its shares and its gates.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { countWords } from '../src/limits.mjs';
import { DEFAULT_REVIEW, estimate, gate, isCode, owners, readReview } from '../src/review.mjs';
import { check } from '../src/check.mjs';
import { TODAY } from './helpers.mjs';

const BIN = new URL('../bin/sandy-skills.mjs', import.meta.url).pathname;
const git = (root, ...a) => execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', ...a], { cwd: root, encoding: 'utf8' });
const put = (root, files) => { for (const [p, text] of Object.entries(files)) { mkdirSync(dirname(join(root, p)), { recursive: true }); writeFileSync(join(root, p), text); } };
/** A git repo whose first commit holds base and whose working tree adds head; returns the root. */
function repo(base, head) {
  const root = mkdtempSync(join(tmpdir(), 'sandy-skills-review-'));
  git(root, 'init', '-q', '-b', 'main');
  put(root, { 'README.md': 'r\n', ...base });
  git(root, 'add', '-A'); git(root, 'commit', '-q', '-m', 'base');
  put(root, head);
  git(root, 'add', '-A');
  return root;
}
const reviewTime = (root, ...a) => spawnSync(process.execPath, [BIN, 'review-time', '--base', 'main', '--root', root, ...a], { encoding: 'utf8' });
const lines = (n, prefix = 'x') => Array.from({ length: n }, (_, i) => `${prefix}${i}`).join('\n') + '\n';
const words = (n) => Array.from({ length: n }, (_, i) => `w${i}`).join(' ');
/** openspec/specs/<id>/spec.md with a Purpose line owning code. */
const part = (id, code) => ({ [`openspec/specs/${id}/spec.md`]: `# ${id}\n\n## Purpose\nWhy.\n\nKind: component · Part of: none · Carried by: a · Status: active · Code: ${code}\n\n## Requirements\n` });
const delta = (...names) => '## ADDED Requirements\n\n' + names.map((n) => `### Requirement: ${n}\nThe a SHALL hold.\n\n#### Scenario: S\n- **GIVEN** any repo\n- **WHEN** x\n- **THEN** y\n- **TEST** \`t.mjs::x\`\n`).join('\n');
const share = (out, name) => { const m = new RegExp(`^  ${name} .*= ([0-9.]+) min`, 'm').exec(out); return m && Number(m[1]); };

test("review-time SHALL print the review minutes of the diff against --base: change words / 170 + code lines / 8 + 5 per part + 8 per seam + 2 per claim, rounded up.", () => {
  assert.equal(estimate({ words: 340, lines: 10, parts: 2, seams: 3, claims: 2 }).minutes, 42);
  const specs = { 'openspec/changes/c/specs/a/spec.md': delta('Seam to b', 'Seam to c', 'X'), 'openspec/changes/c/specs/b/spec.md': delta('Seam to a', 'Y') };
  const used = Object.values(specs).reduce((n, s) => n + countWords(s), 0);
  const root = repo({ ...part('a', 'src/'), ...part('b', 'lib/') }, { ...specs, 'openspec/changes/c/proposal.md': words(340 - used) + '\n', 'src/a.mjs': lines(10) });
  const r = reviewTime(root);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /^review-time: 42 minutes against main$/m);
  assert.deepEqual(['change words', 'code lines', 'parts', 'seams', 'claims'].map((s) => share(r.stdout, s)), [2, 1.3, 10, 24, 4]);
});

test("review-time SHALL count as code lines the changed lines outside tests, Markdown, openspec/, lock files and linguist-generated files.", () => {
  const root = repo({ ...part('a', 'src/, gen.js'), '.gitattributes': 'gen.js linguist-generated\n' },
    { 'src/a.mjs': lines(30), 'test/a.test.mjs': lines(50), 'pnpm-lock.yaml': lines(20), 'src/a.spec.js': lines(4), 'gen.js': lines(7), 'docs/a.md': lines(9), 'openspec/config.yaml': lines(3) });
  const r = reviewTime(root);
  assert.equal(r.stderr, '');
  assert.match(r.stdout, /^  code lines +30 \/ 8 = 3\.8 min$/m);
});

test("review-time SHALL count a part for each changed file under its Code paths, deepest match first, and for each delta spec; a seam for each Seam to heading and a claim for each other heading at level 3.", () => {
  const root = repo({ ...part('cli', 'src/'), ...part('diagram', 'src/diagram.mjs'), 'src/diagram.mjs': 'a\n' }, { 'src/diagram.mjs': 'b\n' });
  const r = reviewTime(root);
  assert.equal(r.stderr, '');
  assert.match(r.stdout, /^  parts +1 × 5 = 5 min \(diagram\)$/m);
  const parts = [{ id: 'cli', code: ['bin/', 'src/'] }, { id: 'diagram', code: ['src/diagram.mjs', 'bin/'] }];
  assert.deepEqual(owners('bin/x.mjs', parts), ['cli', 'diagram'], 'a tie counts both');
  assert.deepEqual(owners('src/diagram.mjs/', parts), ['diagram']);
  assert.deepEqual(owners('srcx/a.mjs', parts), []);
  const specs = repo(part('cli', 'src/'), { 'openspec/changes/c/specs/review-time/spec.md': '## Purpose\nWhy.\n\nKind: component · Part of: cli · Carried by: a · Status: proposed · Code: src/review.mjs\n\n' + delta('Contract', 'Seam to cli'), 'src/review.mjs': 'a\n' });
  const s = reviewTime(specs).stdout;
  assert.match(s, /^  parts +1 × 5 = 5 min \(review-time\)$/m, 'a delta spec owns code before it is archived');
  assert.match(s, /^  seams +1 × 8 = 8 min$/m);
  assert.match(s, /^  claims +1 × 2 = 2 min$/m);
});

const errors = (out) => [...out.matchAll(/^error (\S+): (.*)$/mg)].map((m) => [m[1], m[2]]);
const warnings = (out) => [...out.matchAll(/^warning (\S+): (.*)$/mg)].map((m) => m[1]);
const measures = (o) => ({ base: 'main', words: 0, lines: 0, parts: ['a'], seams: 0, claims: 0, changes: ['c'], code: [], deltas: ['a'], ...o });
const kinds = (findings) => findings.map((f) => [f.severity, f.kind]);
/** One change c with a delta spec for part a holding the given requirements. */
const seamChange = (n) => ({ 'openspec/changes/c/specs/a/spec.md': delta(...Array.from({ length: n }, (_, i) => `Seam to s${i}`)) });

test("review-time SHALL warn above 30 minutes and exit 1 above 60 minutes.", () => {
  assert.deepEqual(kinds(gate(measures({}), 61)), [['error', 'long-review']]);
  assert.deepEqual(kinds(gate(measures({}), 31)), [['warning', 'long-review']]);
  assert.deepEqual(kinds(gate(measures({}), 30)), []);
  const long = reviewTime(repo(part('a', 'src/'), seamChange(7)));
  assert.ok(Number(/^review-time: (\d+) minutes/m.exec(long.stdout)[1]) > 60, long.stdout);
  assert.equal(long.status, 1);
  assert.deepEqual(errors(long.stdout).map(([k]) => k), ['long-review']);
  assert.match(long.stdout, /^target 20 minutes, warn above 30, error above 60$/m);
  const mid = reviewTime(repo(part('a', 'src/'), seamChange(4)));
  assert.equal(mid.status, 0, mid.stdout);
  assert.deepEqual(warnings(mid.stdout), ['long-review']);
});

test("review-time SHALL warn above 200 code lines and exit 1 above 400 code lines, whatever the minutes.", () => {
  assert.deepEqual(kinds(gate(measures({ lines: 401 }), 55)), [['warning', 'long-review'], ['error', 'many-lines']]);
  assert.deepEqual(kinds(gate(measures({ lines: 201 }), 20)), [['warning', 'many-lines']]);
  assert.deepEqual(kinds(gate(measures({ lines: 200 }), 20)), []);
  const r = reviewTime(repo(part('a', 'src/'), { ...seamChange(0), 'src/a.mjs': lines(401) }));
  assert.match(r.stdout, /^review-time: 56 minutes/m, '401 lines / 8 + 5 for 1 part');
  assert.equal(r.status, 1);
  assert.deepEqual(errors(r.stdout).map(([k]) => k), ['many-lines']);
});

test("review-time SHALL exit 1 when a changed code file lies under the Code paths of no part.", () => {
  const r = reviewTime(repo(part('a', 'src/'), { ...seamChange(0), 'lib/x.mjs': 'a\n', 'src/a.mjs': 'a\n', 'test/x.test.mjs': 'a\n' }));
  assert.equal(r.status, 1);
  assert.deepEqual(errors(r.stdout), [['unowned-file', 'lib/x.mjs is under the Code paths of no part']]);
});

test("review-time SHALL exit 1 when the diff holds 0 changes or 2 or more changes, or changes code in a part without a delta spec in its change.", () => {
  const parts = { ...part('diagram', 'src/diagram.mjs'), ...part('init', 'src/install.mjs') };
  const r = reviewTime(repo(parts, { 'openspec/changes/c/specs/diagram/spec.md': delta('X'), 'src/install.mjs': 'a\n', 'src/diagram.mjs': 'a\n' }));
  assert.equal(r.status, 1);
  assert.deepEqual(errors(r.stdout), [['no-delta-spec', 'init changes code, but no change in the diff has a delta spec for init']]);
  const two = reviewTime(repo(parts, { 'openspec/changes/c/specs/diagram/spec.md': delta('X'), 'openspec/changes/archive/2026-01-01-d/specs/diagram/spec.md': delta('Y') }));
  assert.equal(two.status, 1);
  assert.deepEqual(errors(two.stdout), [['many-changes', '2 changes in one diff (c, d); one change is one merge request']]);
  const none = reviewTime(repo(parts, { 'src/install.mjs': 'a\n' }));
  assert.equal(none.status, 1, none.stdout);
  assert.deepEqual(errors(none.stdout), [['no-change', 'the diff holds no change; one merge request is one change']]);
  const archived = reviewTime(repo({ ...parts, 'openspec/changes/c/proposal.md': 'a\n' }, { 'openspec/changes/archive/2026-01-01-c/proposal.md': 'a\n', 'openspec/changes/archive/2026-01-01-c/specs/init/spec.md': delta('X'), 'src/install.mjs': 'a\n' }));
  assert.equal(archived.status, 0, archived.stdout);
  assert.match(archived.stdout, /^changes: c$/m, 'an archived change is the same change as the open one');
});

test("review-time SHALL read weights, minute thresholds and line thresholds from sandy-skills.review in openspec/config.yaml and keep the default for each missing key.", () => {
  const config = 'schema: proven\nsandy-skills:\n  limits:\n    total: { warn: 600, error: 900 }\n  review:\n    weights:\n      seam: 12\n';
  assert.deepEqual(readReview(config), { ...DEFAULT_REVIEW, weights: { ...DEFAULT_REVIEW.weights, seam: 12 } });
  assert.deepEqual(readReview('sandy-skills:\n  review:\n    minutes: { error: 90 }\n    lines: { warn: 100, error: 150 }\n    weights: { wordsPerMinute: 200, part: 4.5 }\n'),
    { target: 20, minutes: { warn: 30, error: 90 }, lines: { warn: 100, error: 150 }, weights: { wordsPerMinute: 200, linesPerMinute: 8, part: 4.5, seam: 8, claim: 2 } });
  assert.deepEqual(readReview(''), DEFAULT_REVIEW);
  assert.throws(() => readReview('sandy-skills:\n  review:\n    seconds: { warn: 1 }\n'), /openspec\/config\.yaml line 3: sandy-skills\.review\.seconds is no review setting/);
  assert.throws(() => readReview('sandy-skills:\n  review:\n    weights: { seam: fast }\n'), /line 3: .*seam: fast/);
  assert.throws(() => readReview('sandy-skills:\n  review:\n    weights: { linesPerMinute: 0 }\n'), /line 3: .*above 0/);
  const root = repo({ ...part('a', 'src/'), 'openspec/config.yaml': config }, { 'openspec/changes/c/specs/a/spec.md': delta('Seam to b') });
  const r = reviewTime(root);
  assert.equal(r.stderr, '');
  assert.match(r.stdout, /^  seams +1 × 12 = 12 min$/m);
  assert.match(r.stdout, /^  change words +\d+ \/ 170 = /m);
  assert.match(r.stdout, /^  code lines +0 \/ 8 = 0 min$/m);
  assert.match(r.stdout, /^  parts +1 × 5 = 5 min \(a\)$/m);
  assert.match(r.stdout, /^  claims +0 × 2 = 0 min$/m);
  const tight = repo({ ...part('a', 'src/'), 'openspec/config.yaml': 'sandy-skills:\n  review:\n    minutes: { warn: 3, error: 4 }\n    lines: { warn: 1, error: 2 }\n' }, { ...seamChange(0), 'src/a.mjs': lines(3) });
  const s = reviewTime(tight);
  assert.match(s.stdout, /^target 20 minutes, warn above 3, error above 4$/m);
  assert.deepEqual(errors(s.stdout).map(([k]) => k), ['long-review', 'many-lines']);
});

test("check SHALL estimate the review minutes of each open change from its words, parts, seams and claims, warn above the minute warn threshold and fail above the error threshold.", () => {
  const change = (...specs) => [{ id: 'c', dir: 'openspec/changes/c', files: specs.map((reqs, i) => ({ path: `specs/p${i}/spec.md`, text: delta(...reqs) })) }];
  const review = (changes, r = DEFAULT_REVIEW) => check([], [], { today: TODAY, changes, review: r });
  const long = review(change(['Seam to a'], ['Seam to b'], ['Seam to c'], ['Seam to d'], ['Seam to e'], ['X']));
  const f = long.findings.find((x) => x.kind === 'long-review');
  assert.deepEqual([f.severity, f.file, f.threshold], ['error', 'openspec/changes/c/', 60]);
  assert.ok(f.measured > 60 && /^openspec\/changes\/c\/: \d+ review minutes, more than error 60/.test(f.detail), f.detail);
  assert.equal(long.summary.releasable, false);
  const mid = review(change(['Seam to a', 'Seam to b', 'Seam to c', 'Seam to d'])).findings.filter((x) => x.kind === 'long-review');
  assert.deepEqual(mid.map((x) => [x.severity, x.threshold]), [['warning', 30]]);
  assert.deepEqual(review(change(['X'])).findings.filter((x) => x.kind === 'long-review'), []);
  const own = review(change(['X']), { ...DEFAULT_REVIEW, minutes: { warn: 1, error: 3 } }).findings.filter((x) => x.kind === 'long-review');
  assert.deepEqual(own.map((x) => [x.severity, x.threshold]), [['error', 3]], 'the configured thresholds');
  const root = repo(part('a', 'src/'), { 'openspec/config.yaml': 'sandy-skills:\n  review:\n    minutes: { warn: 1, error: 2 }\n', 'openspec/changes/c/specs/a/spec.md': delta('X') });
  writeFileSync(join(root, 'specs.json'), '[]');
  const r = spawnSync(process.execPath, [BIN, 'check', '--root', root, '--specs', join(root, 'specs.json'), '--today', TODAY, '--format', 'json'], { encoding: 'utf8' });
  assert.equal(r.status, 1, r.stderr);
  assert.deepEqual(JSON.parse(r.stdout).findings.filter((x) => x.kind === 'long-review').map((x) => [x.severity, x.threshold]), [['error', 2]]);
});

test("review-time SHALL read each spec under openspec/specs at any depth as the part whose id is its folder path below openspec/specs, such as domain/service.", () => {
  const r = reviewTime(repo(part('domain/service', 'src/'), { 'openspec/changes/c/specs/domain/service/spec.md': delta('X'), 'src/a.mjs': 'a\n' }));
  assert.equal(r.status, 0, r.stdout);
  assert.match(r.stdout, /^  parts +1 × 5 = 5 min \(domain\/service\)$/m);
  assert.deepEqual(errors(r.stdout), []);
});

test("review-time SHALL count Go files ending in _test.go and Python files named test_*.py or *_test.py as tests, never as code lines.", () => {
  for (const p of ['src/a_test.go', 'src/test_a.py', 'src/a_test.py', 'test_b.py']) assert.equal(isCode(p), false, p);
  for (const p of ['src/a.go', 'src/contest.py', 'src/latest.go', 'src/test.go']) assert.equal(isCode(p), true, p);
  const r = reviewTime(repo(part('service', 'src/'), { 'openspec/changes/c/specs/service/spec.md': delta('X'), 'src/a.go': lines(3), 'src/contest.py': lines(2), 'src/a_test.go': lines(400), 'src/test_a.py': lines(50), 'src/a_test.py': lines(60) }));
  assert.match(r.stdout, /^  code lines +5 \/ 8 = /m, r.stdout);
  assert.equal(r.status, 0, r.stdout);
});
