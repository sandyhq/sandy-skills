// Proves the review-time part: the estimated review minutes of a diff, its shares and its gates.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { countWords } from '../src/limits.mjs';
import { estimate, owners } from '../src/review.mjs';

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
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /^  code lines +30 \/ 8 = 3\.8 min$/m);
});

test("review-time SHALL count a part for each changed file under its Code paths, deepest match first, and for each delta spec; a seam for each Seam to requirement and a claim for each other requirement.", () => {
  const root = repo({ ...part('cli', 'src/'), ...part('diagram', 'src/diagram.mjs'), 'src/diagram.mjs': 'a\n' }, { 'src/diagram.mjs': 'b\n' });
  const r = reviewTime(root);
  assert.equal(r.status, 0, r.stderr);
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
