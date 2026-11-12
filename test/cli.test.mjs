import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
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
