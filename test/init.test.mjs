// Proves the init part (openspec/specs/init): installing the standard into a repo.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, lstatSync, mkdtempSync, readFileSync, readlinkSync, writeFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BIN = new URL('../bin/sandy-skills.mjs', import.meta.url).pathname;
const SKILLS = ['confirm-part', 'examine-part', 'learn-part', 'propose-change', 'spec-first'];
const run = (cwd, ...args) => spawnSync(process.execPath, [BIN, ...args], { cwd, encoding: 'utf8' });
const repo = () => mkdtempSync(join(tmpdir(), 'sandy-skills-init-'));
const read = (p) => readFileSync(p, 'utf8');

test("init SHALL set up OpenSpec when the repo has none, make proven its default schema and install the skills where OpenSpec installed its own.", () => {
  const dir = repo();
  const r = run(dir, 'init', '--tools', 'none');
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.ok(existsSync(join(dir, 'openspec', 'specs')), 'OpenSpec is set up');
  assert.match(read(join(dir, 'openspec', 'config.yaml')), /^schema: proven$/m);
  assert.ok(existsSync(join(dir, 'openspec', 'schemas', 'proven', 'schema.yaml')));
  for (const s of SKILLS) assert.ok(existsSync(join(dir, '.agents', 'skills', s, 'SKILL.md')), s);
});

test("When OpenSpec linked an agent's skills to another directory, init SHALL link the skills the same way.", () => {
  const dir = repo();
  const r = run(dir, 'init', '--tools', 'pi,claude');
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const openspecLink = readdirSync(join(dir, '.claude', 'skills')).find((n) => n.startsWith('openspec-'));
  assert.ok(lstatSync(join(dir, '.claude', 'skills', openspecLink)).isSymbolicLink(), 'precondition: OpenSpec links .claude/skills');
  for (const s of SKILLS) {
    const at = join(dir, '.claude', 'skills', s);
    assert.ok(lstatSync(at).isSymbolicLink(), s);
    assert.equal(readlinkSync(at), join('..', '..', '.agents', 'skills', s));
    assert.ok(existsSync(join(at, 'SKILL.md')), `${s} resolves`);
  }
});

test("update SHALL replace the schema and the skills with this version's and keep the rest of openspec/config.yaml.", () => {
  const dir = repo();
  assert.equal(run(dir, 'init', '--tools', 'none').status, 0);
  const config = join(dir, 'openspec', 'config.yaml');
  writeFileSync(config, read(config).replace('schema: proven', 'schema: spec-driven') + 'context: |\n  Keep me\n');
  const schema = join(dir, 'openspec', 'schemas', 'proven', 'schema.yaml');
  const original = read(schema);
  writeFileSync(schema, 'local edit\n');
  writeFileSync(join(dir, '.agents', 'skills', 'spec-first', 'SKILL.md'), 'local edit\n');
  const r = run(dir, 'update');
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.equal(read(schema), original);
  assert.match(read(join(dir, '.agents', 'skills', 'spec-first', 'SKILL.md')), /^---\nname: spec-first/);
  assert.match(read(config), /^schema: proven$/m);
  assert.match(read(config), /context: \|\n {2}Keep me/);
});

test("If the repo has no openspec directory, then update SHALL fail and change nothing.", () => {
  const dir = repo();
  const r = run(dir, 'update');
  assert.notEqual(r.status, 0);
  assert.deepEqual(readdirSync(dir), []);
});

test("When init or update runs, it SHALL add .learn/ to the repo's .gitignore once and keep the file's other lines.", () => {
  const ignored = (dir) => read(join(dir, '.gitignore')).split('\n').filter((l) => l.trim() === '.learn/').length;
  const bare = repo();
  assert.equal(run(bare, 'init', '--tools', 'none').status, 0);
  assert.equal(ignored(bare), 1, 'created when missing');
  const dir = repo();
  writeFileSync(join(dir, '.gitignore'), 'node_modules/\n*.log');
  assert.equal(run(dir, 'init', '--tools', 'none').status, 0);
  assert.equal(run(dir, 'update').status, 0);
  assert.equal(ignored(dir), 1, 'once, after init and update');
  assert.match(read(join(dir, '.gitignore')), /^node_modules\/\n\*\.log\n/);
});
