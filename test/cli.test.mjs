import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawn, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
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
  writeFileSync(join(root, 'openspec', 'specs', 'a', 'spec.md'), '# a Specification\n\n## Purpose\nDoes the a work so that the whole above can count on it.\n\nKind: container · Part of: none · Carried by: ana · Status: active · Code: src/a/\n\n## Requirements\n\n### Requirement: Contract\nThe a SHALL keep its promise.\n\n#### Scenario: Contract\n- **GIVEN** any repo\n- **WHEN** it runs\n- **THEN** it holds\n- **TEST** `t.mjs::Contract`\n');
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

// A stand-in for the OpenSpec CLI: logs its arguments to stderr, serves the specs in FAKE_SPECS, echoes stdin
// for `cat`, and exits with FAKE_EXIT.
const fake = join(dir, 'fake-openspec.mjs');
writeFileSync(fake, `import { readFileSync } from 'node:fs';
const args = process.argv.slice(2);
process.stderr.write('openspec ' + JSON.stringify(args) + '\\n');
const specs = process.env.FAKE_SPECS ? JSON.parse(readFileSync(process.env.FAKE_SPECS, 'utf8')) : [];
if (args[0] === 'list') console.log(JSON.stringify({ specs: specs.map((s) => ({ id: s.id })) }));
else if (args[0] === 'show') console.log(JSON.stringify(specs.find((s) => s.id === args[1])));
else if (args[0] === 'cat') process.stdout.write(readFileSync(0));
else console.log('openspec ran');
if (args[0] !== 'list' && args[0] !== 'show') process.exitCode = Number(process.env.FAKE_EXIT ?? 0);
`);
const withFake = (args, env = {}, input) => spawnSync(process.execPath, [BIN, ...args], { cwd: dir, encoding: 'utf8', input, env: { ...process.env, OPENSPEC_BIN: `${process.execPath} ${fake}`, ...env } });
const passed = (r) => [...r.stderr.matchAll(/^openspec (.*)$/gm)].map((m) => JSON.parse(m[1]));

test("Every command that sandy-skills does not own SHALL run the OpenSpec CLI with the same arguments, input and output, and exit with its exit code.", () => {
  for (const code of [0, 3, 7]) {
    const r = withFake(['archive', 'c', '--yes', '--no-such-option'], { FAKE_EXIT: String(code) });
    assert.equal(r.status, code, r.stderr);
    assert.deepEqual(passed(r), [['archive', 'c', '--yes', '--no-such-option']]);
    assert.equal(r.stdout, 'openspec ran\n');
  }
  const cat = withFake(['cat'], { FAKE_EXIT: '5' }, 'from stdin\n');
  assert.equal(cat.status, 5);
  assert.equal(cat.stdout, 'from stdin\n');
  const real = spawnSync(process.execPath, [BIN, 'no-such-command'], { cwd: dir, encoding: 'utf8' });
  assert.notEqual(real.status, 0, 'the real OpenSpec refuses an unknown command');
  assert.match(real.stderr, /unknown command 'no-such-command'/);
});

test("sandy-skills openspec SHALL pass the rest of its arguments to the OpenSpec CLI, so that OpenSpec's own init, update and help stay reachable.", () => {
  for (const args of [['init', '--tools', 'none'], ['update'], ['--help'], ['check', '--strict']]) {
    const r = withFake(['openspec', ...args]);
    assert.equal(r.status, 0, r.stderr);
    assert.deepEqual(passed(r), [args]);
    assert.equal(r.stdout, 'openspec ran\n');
  }
  const help = spawnSync(process.execPath, [BIN, 'openspec', '--help'], { cwd: dir, encoding: 'utf8' });
  assert.equal(help.status, 0, help.stderr);
  assert.match(help.stdout, /Usage: openspec/);
});

test("The help SHALL list the sandy-skills commands and say that every other command goes to OpenSpec.", () => {
  const r = spawnSync(process.execPath, [BIN, '--help'], { encoding: 'utf8' });
  assert.equal(r.status, 0);
  for (const c of ['init', 'update', 'check', 'validate', 'diagram', 'hash', 'confirm', 'openspec']) assert.match(r.stdout, new RegExp(`^  sandy-skills ${c}\\b`, 'm'), c);
  assert.match(r.stdout, /Every other command goes to OpenSpec unchanged/);
});

test("validate SHALL run openspec validate with its arguments and then check with --junit, --out and --strict, print both outputs, and exit non-zero when either fails.", () => {
  const specs = join(dir, 'validate-specs.json');
  writeFileSync(specs, JSON.stringify([spec('a', { tests: ['test/a.test.mjs::t'] })]));
  const env = (code) => ({ FAKE_SPECS: specs, FAKE_EXIT: String(code) });
  const ok = withFake(['validate', '--all', '--strict', '--junit', junit('passed'), '--no-color'], env(0));
  assert.equal(ok.status, 0, ok.stderr);
  assert.deepEqual(passed(ok)[0], ['validate', '--all', '--strict', '--no-color']);
  assert.match(ok.stdout, /^openspec ran\n/);
  assert.match(ok.stdout, /\*\*Releasable\*\*/);
  const openspecFails = withFake(['validate', '--all', '--junit', junit('passed')], env(4));
  assert.equal(openspecFails.status, 4);
  assert.match(openspecFails.stdout, /\*\*Releasable\*\*/, 'check runs even when OpenSpec fails');
  const checkFails = withFake(['validate', '--all', '--junit', junit('failed')], env(0));
  assert.equal(checkFails.status, 1);
  assert.match(checkFails.stdout, /openspec ran[\s\S]*\| error \| a \| break \|/);
  const strictFails = withFake(['validate', '--strict'], env(0));
  assert.equal(strictFails.status, 1, 'check gets --strict: a missing test fails');
  const out = join(dir, 'reports', 'releasability.md');
  const toFile = withFake(['validate', '--junit', junit('passed'), '--out', out], env(0));
  assert.equal(toFile.status, 0, toFile.stderr);
  assert.deepEqual(passed(toFile)[0], ['validate']);
  assert.match(readFileSync(out, 'utf8'), /\*\*Releasable\*\*/);
});

// A stand-in OpenSpec that keeps running: prints its pid, and with FAKE_HANDLE exits with that code on a signal.
const waiting = join(dir, 'waiting-openspec.mjs');
writeFileSync(waiting, `if (process.argv[2] === 'list') { console.log('{"specs":[]}'); process.exit(0); }
if (process.env.FAKE_HANDLE) for (const s of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.on(s, () => process.exit(Number(process.env.FAKE_HANDLE)));
console.log('pid=' + process.pid);
setInterval(() => {}, 1000);
`);
const alive = (pid) => { try { process.kill(pid, 0); return true; } catch { return false; } };

/** Runs sandy-skills with the waiting OpenSpec, signals only sandy-skills, and returns how both ended. */
async function signalWrapper(args, signal, env = {}) {
  const wrapper = spawn(process.execPath, [BIN, ...args], { cwd: dir, detached: true, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, OPENSPEC_BIN: `${process.execPath} ${waiting}`, ...env } });
  const ended = new Promise((resolve) => wrapper.on('exit', (code, sig) => resolve({ code, signal: sig })));
  let out = '';
  const child = await new Promise((resolve) => wrapper.stdout.on('data', (b) => { out += b; const m = /pid=(\d+)/.exec(out); if (m) resolve(Number(m[1])); }));
  wrapper.kill(signal);
  const timeout = new Promise((resolve) => setTimeout(() => resolve('timeout'), 5000).unref());
  const result = await Promise.race([ended, timeout]);
  const childAlive = alive(child);
  if (childAlive) process.kill(child, 'SIGKILL');
  if (result === 'timeout') wrapper.kill('SIGKILL');
  return { ...(result === 'timeout' ? { timeout: true } : result), childAlive };
}

test("If sandy-skills gets SIGINT, SIGTERM or SIGHUP while OpenSpec runs, then it SHALL pass the signal to OpenSpec, wait until OpenSpec ends and exit with its exit code or signal.", async () => {
  for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
    assert.deepEqual(await signalWrapper(['watch'], signal, { FAKE_HANDLE: '3' }), { code: 3, signal: null, childAlive: false }, `${signal}, handled by OpenSpec`);
    assert.deepEqual(await signalWrapper(['watch'], signal), { code: null, signal, childAlive: false }, `${signal}, not handled`);
  }
  assert.deepEqual(await signalWrapper(['openspec', 'init'], 'SIGTERM'), { code: null, signal: 'SIGTERM', childAlive: false }, 'sandy-skills openspec');
  assert.deepEqual(await signalWrapper(['validate', '--all'], 'SIGTERM'), { code: null, signal: 'SIGTERM', childAlive: false }, 'validate');
});
