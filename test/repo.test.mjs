// Proves the repository-level parts: sandy-skills, proven-schema and skills (see openspec/specs/).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';

const root = new URL('..', import.meta.url).pathname;
const read = (p) => readFileSync(root + p, 'utf8');
const skills = readdirSync(root + 'skills', { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();
const [cmd, ...pre] = (process.env.OPENSPEC_BIN || 'openspec').split(/\s+/);
const openspec = (...args) => spawnSync(cmd, [...pre, ...args], { cwd: root, encoding: 'utf8' });
const git = (...args) => spawnSync('git', args, { cwd: root, encoding: 'utf8' }).stdout;
const hasOpenspec = openspec('--version').status === 0;

test("The repository SHALL hold the standards, the proven schema, the sandy-skills CLI and the skills, and check each of them in CI.", () => {
  for (const p of ['standards/README.md', 'standards/sources.md', 'openspec/schemas/proven/schema.yaml', 'bin/sandy-skills.mjs', 'package.json']) assert.ok(existsSync(root + p), p);
  assert.deepEqual(skills, ['confirm-part', 'propose-change', 'spec-first']);
  const ci = read('.github/workflows/ci.yml');
  for (const step of ['validate --all --strict', '--test-reporter=junit', 'sandy-skills.mjs check']) assert.ok(ci.includes(step), step);
});

test("The proven schema SHALL pass OpenSpec schema validation and tell agents to write each part with a metadata line, a Contract and TEST lines.", { skip: hasOpenspec ? false : 'openspec not installed' }, () => {
  const r = openspec('schema', 'validate', 'proven');
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const schema = read('openspec/schemas/proven/schema.yaml');
  for (const s of ['Kind: <context|system|container|component|operation>', '### Requirement: Contract', '- **TEST** `<path>::<test name>`']) assert.ok(schema.includes(s), s);
});

test("Each skill SHALL have a SKILL.md whose name matches its folder and whose description says when to use it.", () => {
  for (const name of skills) {
    const m = /^---\nname: (.+)\ndescription: (.+)\n---\n/.exec(read(`skills/${name}/SKILL.md`));
    assert.ok(m, `${name}: frontmatter`);
    assert.equal(m[1], name);
    assert.match(m[2], /\bUse (when|for)\b/, `${name}: description says when to use it`);
  }
});

test("The skills SHALL call only the sandy-skills commands check, hash and confirm. Read-only.", () => {
  const used = skills.flatMap((name) => [...read(`skills/${name}/SKILL.md`).matchAll(/`sandy-skills (\w+)/g)].map((m) => m[1]));
  assert.ok(used.length > 0);
  assert.deepEqual([...new Set(used)].filter((c) => !['check', 'hash', 'confirm'].includes(c)), []);
});

test("Only standards/sources.md SHALL name the projects listed under its heading Concepts adopted without their tools.", () => {
  const sources = read('standards/sources.md');
  const section = /^## Concepts adopted without their tools\n([\s\S]*?)(?=^## )/m.exec(sources);
  assert.ok(section, 'sources.md has the heading');
  const names = [...section[1].matchAll(/^- \[([^\]]+)\]/gm)].map((m) => m[1]);
  assert.ok(names.length > 0, 'the heading lists projects');
  const files = git('ls-files', '--cached', '--others', '--exclude-standard').split('\n').filter(Boolean)
    .filter((p) => p !== 'standards/sources.md' && !p.startsWith('openspec/changes/') && existsSync(root + p) && statSync(root + p).isFile());
  const hits = files.flatMap((p) => names.filter((n) => new RegExp(`\\b${n}`, 'i').test(read(p))).map((n) => `${p}: ${n}`));
  assert.deepEqual(hits, []);
});

test("The npm package SHALL contain the CLI, the proven schema, the skills and the standards, and no tests.", () => {
  const r = spawnSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], { cwd: root, encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  const files = JSON.parse(r.stdout)[0].files.map((f) => f.path);
  for (const p of ['bin/sandy-skills.mjs', 'src/install.mjs', 'openspec/schemas/proven/schema.yaml', 'standards/spec-format.md', 'README.md', 'LICENSE', ...skills.map((s) => `skills/${s}/SKILL.md`)]) assert.ok(files.includes(p), p);
  assert.deepEqual(files.filter((p) => /(^|\/)test\//.test(p) || p.startsWith('openspec/specs/') || p.startsWith('.')), []);
});
