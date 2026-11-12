// Proves the review-time part: the estimated review minutes of a diff, its shares and its gates.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { countWords } from '../src/limits.mjs';
import { estimate, gate, owners } from '../src/review.mjs';

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

test("review-time SHALL count a part for each changed file under its Code paths, deepest match first, and for each delta spec; a seam for each Seam to requirement and a claim for each other requirement.", () => {
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
