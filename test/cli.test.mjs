import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spec, TODAY } from './helpers.mjs';

const BIN = new URL('../bin/sandy-skills.mjs', import.meta.url).pathname;
const dir = mkdtempSync(join(tmpdir(), 'sandy-skills-'));
const specsFile = join(dir, 'specs.json');
writeFileSync(specsFile, JSON.stringify([spec('a', { tests: ['test/a.test.mjs::t'] })]));
const junit = (status) => {
  const f = join(dir, `${status}.xml`);
  const body = status === 'failed' ? '<failure message="no"/>' : '';
  writeFileSync(f, `<testsuites><testsuite name="s"><testcase name="t" classname="s" file="${dir}/test/a.test.mjs">${body}</testcase></testsuite></testsuites>`);
  return f;
};
const cli = (...args) => spawnSync(process.execPath, [BIN, 'check', '--root', dir, '--specs', specsFile, '--today', TODAY, ...args], { encoding: 'utf8' });

test('The checker SHALL compute lights, drift and a releasability report from OpenSpec specs and JUnit reports, and exit non-zero when the result is not releasable.', () => {
  const ok = cli('--junit', junit('passed'));
  assert.equal(ok.status, 0, ok.stderr);
  assert.match(ok.stdout, /\*\*Releasable\*\*/);
  const bad = cli('--junit', junit('failed'));
  assert.equal(bad.status, 1);
  assert.match(bad.stdout, /\| error \| a \| break \|/);
  const strict = cli('--strict');
  assert.equal(strict.status, 1, 'a missing test is an error even without a report');
});

test('When run on the same specs, report and date, the checker SHALL print the same report.', () => {
  const a = cli('--junit', junit('passed'), '--format', 'json').stdout;
  const b = execFileSync(process.execPath, [BIN, 'check', '--root', dir, '--specs', specsFile, '--today', TODAY, '--junit', junit('passed'), '--format', 'json'], { encoding: 'utf8' });
  assert.equal(a, b);
  assert.equal(JSON.parse(a).summary.releasable, true);
});

test("confirm SHALL print an I confirmation only when the person passed the exam on the part's current contract within the last 90 days.", () => {
  const root = mkdtempSync(join(tmpdir(), 'sandy-skills-confirm-'));
  mkdirSync(join(root, 'openspec', 'specs', 'a'), { recursive: true });
  writeFileSync(join(root, 'openspec', 'specs', 'a', 'spec.md'), '# a Specification\n\n## Purpose\nDoes the a work so that the whole above can count on it.\n\nKind: container · Part of: none · Carried by: ana · Status: active · Code: src/a/\n\n## Requirements\n\n### Requirement: Contract\nThe a SHALL keep its promise.\n\n#### Scenario: Contract\n- **WHEN** it runs\n- **THEN** it holds\n');
  const sk = (...args) => spawnSync(process.execPath, [BIN, ...args, '--root', root, '--today', TODAY], { encoding: 'utf8' });
  const hash = sk('hash', 'a').stdout.trim();
  assert.match(hash, /^[0-9a-f]{8,}$/);
  const exams = (...lines) => { mkdirSync(join(root, '.learn', 'bo', 'exams'), { recursive: true }); writeFileSync(join(root, '.learn', 'bo', 'exams', 'a.md'), lines.join('\n') + '\n'); };
  const line = (on, result, contract = hash) => `- **EXAMINED** bo on ${on}, ${result}, contract ${contract}, key 0123abcd`;
  const refused = (why) => { const r = sk('confirm', 'a', 'I', 'bo'); assert.notEqual(r.status, 0, why); assert.equal(r.stdout, '', why); assert.match(r.stderr, /exam/, why); };

  refused('no exam at all');
  exams(line('2026-11-01', 'passed', 'ffff0000'));
  refused('passed on an older contract');
  exams(line('2026-08-01', 'passed'));
  refused('older than 90 days');
  exams(line('2026-11-01', 'passed'), line('2026-11-05', 'failed'));
  refused('the latest exam failed');
  exams(line('2026-11-01', 'failed'), line('2026-11-05', 'passed'));
  const ok = sk('confirm', 'a', 'I', 'bo');
  assert.equal(ok.status, 0, ok.stderr);
  assert.match(ok.stdout, new RegExp(`^- \\*\\*CONFIRMED\\*\\* I by bo on ${TODAY}, expires \\S+, contract ${hash}`));
  assert.equal(sk('confirm', 'a', 'We', 'cy').status, 0, 'We needs no exam');
});
