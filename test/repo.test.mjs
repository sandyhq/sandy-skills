// Proves the repository-level parts: sandy-skills, proven-schema and skills (see openspec/specs/).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadSpecs, openspecCommand } from '../src/openspec.mjs';
import { parsePart } from '../src/parts.mjs';
import { check } from '../src/check.mjs';
import { DEFAULT_VAGUE_WORDS, vagueWords } from '../src/limits.mjs';
import { wrongTermFindings } from '../src/glossary.mjs';
import { isCode, owners } from '../src/review.mjs';

const root = new URL('..', import.meta.url).pathname;
const read = (p) => readFileSync(root + p, 'utf8');
const skills = readdirSync(root + 'skills', { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();
const [cmd, ...pre] = openspecCommand(root);
const openspec = (...args) => spawnSync(cmd, [...pre, ...args], { cwd: root, encoding: 'utf8' });
const git = (...args) => spawnSync('git', args, { cwd: root, encoding: 'utf8' }).stdout;
const hasOpenspec = openspec('--version').status === 0;

test("The repository SHALL hold the standards, the proven schema, the sandy-skills CLI and the skills, and check each of them in CI.", () => {
  for (const p of ['standards/README.md', 'standards/sources.md', 'openspec/schemas/proven/schema.yaml', 'bin/sandy-skills.mjs', 'package.json']) assert.ok(existsSync(root + p), p);
  assert.deepEqual(skills, ['confirm-part', 'examine-part', 'learn-part', 'propose-change', 'spec-first']);
  const ci = read('.github/workflows/ci.yml');
  for (const step of ['validate --all --strict', '--test-reporter=junit', 'sandy-skills.mjs check']) assert.ok(ci.includes(step), step);
});

test("The proven schema SHALL pass OpenSpec schema validation and tell agents to write each part with a metadata line, a Contract and TEST lines.", () => {
  assert.ok(hasOpenspec, 'OpenSpec runs');
  const r = openspec('schema', 'validate', 'proven');
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const schema = read('openspec/schemas/proven/schema.yaml');
  for (const s of ['Kind: <context|system|container|component|operation>', '### Requirement: Contract', '- **TEST** `<path>::<test name>`']) assert.ok(schema.includes(s), s);
});

test("The proven schema SHALL give proposal, design and tasks fixed sections with the owner's part first, and link each artifact to standards/changes.md.", () => {
  const headings = (file) => read(`openspec/schemas/proven/templates/${file}`).split('\n').filter((l) => l.startsWith('## '));
  assert.deepEqual(headings('proposal.md'), ['## Why', '## Your decisions', '## What Changes', '## Not in this change']);
  assert.deepEqual(headings('design.md'), ['## Owner decisions', '## Agent decisions', '## Risks']);
  assert.deepEqual(headings('tasks.md'), ['## 1. Your steps', '## 2. Proof', '## 3. Build']);
  const url = 'https://github.com/sandyhq/sandy-skills/blob/main/standards/changes.md';
  const schema = read('openspec/schemas/proven/schema.yaml');
  const instructions = schema.split(/\n  - id: /).slice(1);
  assert.deepEqual(instructions.map((a) => a.split('\n')[0]), ['proposal', 'specs', 'design', 'tasks']);
  for (const a of instructions) assert.ok(a.includes(url), `${a.split('\n')[0]} instruction links the standard`);
  for (const f of ['proposal.md', 'design.md', 'tasks.md', 'spec.md']) assert.ok(read(`openspec/schemas/proven/templates/${f}`).includes(url), f);
  assert.ok(read('skills/propose-change/SKILL.md').includes(url), 'propose-change links the standard');
  assert.match(read('standards/spec-format.md'), /\]\(changes\.md\)/);
  for (const h of ['## Files', '## Wording', '## Limits']) assert.ok(read('standards/changes.md').includes(h), h);
});

test("Each skill SHALL have a SKILL.md whose name matches its folder and whose description says when to use it.", () => {
  for (const name of skills) {
    const m = /^---\nname: (.+)\ndescription: (.+)\n---\n/.exec(read(`skills/${name}/SKILL.md`));
    assert.ok(m, `${name}: frontmatter`);
    assert.equal(m[1], name);
    assert.match(m[2], /\bUse (when|for)\b/, `${name}: description says when to use it`);
  }
});

test("The skills SHALL call only the sandy-skills commands check, hash, confirm, diagram, review-time and validate. Read-only.", () => {
  const used = skills.flatMap((name) => [...read(`skills/${name}/SKILL.md`).matchAll(/`sandy-skills ([\w-]+)/g)].map((m) => m[1]));
  assert.ok(used.length > 0);
  assert.deepEqual([...new Set(used)].filter((c) => !['check', 'hash', 'confirm', 'diagram', 'review-time', 'validate'].includes(c)), []);
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

test("The npm package SHALL contain the CLI, the proven schema, the skills, the standards and CHANGELOG.md, and no tests.", () => {
  const r = spawnSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], { cwd: root, encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  const files = JSON.parse(r.stdout)[0].files.map((f) => f.path);
  for (const p of ['bin/sandy-skills.mjs', 'src/install.mjs', 'openspec/schemas/proven/schema.yaml', 'standards/spec-format.md', 'README.md', 'CHANGELOG.md', 'LICENSE', ...skills.map((s) => `skills/${s}/SKILL.md`)]) assert.ok(files.includes(p), p);
  assert.deepEqual(files.filter((p) => /(^|\/)test\//.test(p) || p.startsWith('openspec/specs/') || p.startsWith('.')), []);
});

test("The EXAMINED line that examine-part writes SHALL be the line confirm reads.", async () => {
  const { parseExamined } = await import('../src/exam.mjs');
  const template = read('skills/examine-part/SKILL.md').split('\n').map((l) => l.trim()).find((l) => l.startsWith('- **EXAMINED**'));
  assert.ok(template, 'examine-part shows the line');
  const filled = template.replace('<who>', 'bo').replace('<date>', '2026-11-12').replace('<passed|failed>', 'passed').replace('<contract hash>', 'ab12cd34').replace('<key hash>', '0123abcd');
  assert.deepEqual(parseExamined(filled), [{ who: 'bo', on: '2026-11-12', result: 'passed', contract: 'ab12cd34', key: '0123abcd' }]);
});

test("Each code file that git tracks in this repository SHALL lie under the Code paths of exactly 1 part.", () => {
  const parts = readdirSync(root + 'openspec/specs').filter((id) => existsSync(root + `openspec/specs/${id}/spec.md`)).map((id) => {
    const meta = read(`openspec/specs/${id}/spec.md`).split('\n').find((l) => /^Kind:/.test(l)) ?? '';
    const code = meta.split(/\s+·\s+/).find((s) => /^Code:/.test(s)) ?? 'Code:';
    return { id, code: code.replace(/^Code:\s*/, '').split(/\s*,\s*/).filter(Boolean) };
  });
  const files = git('ls-files').trim().split('\n').filter((f) => isCode(f));
  assert.ok(files.includes('bin/sandy-skills.mjs') && files.includes('package.json'));
  assert.deepEqual(files.map((f) => [f, owners(f, parts)]).filter(([, o]) => o.length !== 1), []);
});

test("A part written from the spec template SHALL pass check without missing-relation or bad-relation.", () => {
  const filled = read('openspec/schemas/proven/templates/spec.md').split('\n').map((line) => line
    .replace(/^(### Requirement: Seam to )<!--[^>]*-->/, '$1b')
    .replace(/^Relation: <!--[\s\S]*?--> · Upstream: <!--[\s\S]*?-->/, 'Relation: conformist · Upstream: b')
    .replace(/<!--[\s\S]*?-->/g, 'x')).join('\n').replace('## ADDED Requirements', '## Requirements');
  assert.match(filled, /^### Requirement: Seam to b\n.*\nRelation: conformist · Upstream: b$/m, 'the template has a seam with a Relation line');
  const dir = mkdtempSync(join(tmpdir(), 'sandy-skills-template-'));
  for (const [id, text] of [['a', '# a Specification\n\n' + filled], ['b', '# b Specification\n\n' + filled.replace(/Seam to b/g, 'Seam to a').replace(/Upstream: b/, 'Upstream: a')]]) {
    mkdirSync(join(dir, 'openspec', 'specs', id), { recursive: true });
    writeFileSync(join(dir, 'openspec', 'specs', id, 'spec.md'), text);
  }
  const parts = loadSpecs(dir).map(parsePart);
  assert.deepEqual(parts.map((p) => p.seams.map((s) => [s.to, s.relation?.value])), [[['b', 'conformist']], [['a', 'conformist']]]);
  assert.deepEqual(check(parts, [], { today: '2026-11-13' }).findings.filter((f) => /relation/.test(f.kind)), []);
});

test("README.md, CHANGELOG.md and the Markdown files in docs/, standards/ and skills/ SHALL hold no vague word and, outside standards/glossary.md, no word from a Not line of the glossary.", () => {
  const files = git('ls-files', '-co', '--exclude-standard', 'README.md', 'CHANGELOG.md', 'docs', 'standards', 'skills').split('\n').filter((f) => f.endsWith('.md'));
  assert.ok(files.includes('CHANGELOG.md') && files.includes('docs/usage.md') && files.includes('skills/spec-first/SKILL.md'), 'the docs are found');
  const found = files.flatMap((file) => {
    const text = read(file);
    const vague = vagueWords(text, DEFAULT_VAGUE_WORDS).map(([line, word]) => `${file}:${line} vague ${word}`);
    const wrong = file === 'standards/glossary.md' ? [] : wrongTermFindings([{ part: '-', file, text }]).map((w) => `${file}:${w.line} wrong ${w.word}`);
    return [...vague, ...wrong];
  });
  assert.deepEqual(found, []);
});
