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
// The tests below expect the 0.7.0 errors; the enforce tests build their own repos.
mkdirSync(join(dir, 'openspec'), { recursive: true });
writeFileSync(join(dir, 'openspec', 'config.yaml'), 'schema: proven\nsandy-skills:\n  enforce: error\n');
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

// A repo with one finding of each kind check reports from specs, the test report and an open change.
const KINDS = ['missing-test', 'break', 'claim-mismatch', 'bad-kind', 'bad-status', 'unknown-parent', 'no-contract', 'unknown-seam-target', 'missing-relation', 'malformed-line', 'over-limit', 'vague-word', 'wrong-term', 'scenario-shape'];
function everyKind(config) {
  const root = mkdtempSync(join(tmpdir(), 'sandy-skills-enforce-'));
  const put = (p, text) => { mkdirSync(join(root, p, '..'), { recursive: true }); writeFileSync(join(root, p), text); };
  put('specs.json', JSON.stringify([
    spec('a', { tests: ['test/a.test.mjs::t'] }),
    spec('b', { tests: ['test/a.test.mjs::f'] }),
    spec('c', { tests: ['test/a.test.mjs::other claim'] }),
    spec('d', { kind: 'widget', status: 'gone', partOf: 'ghost' }),
    spec('e', { contract: null }),
    spec('f', { extra: ['- **TEST** bad'], requirements: [['Seam to ghost', 'The f SHALL call ghost.']] }),
  ]));
  put('junit.xml', `<testsuites><testsuite name="s"><testcase name="f" classname="s" file="${root}/test/a.test.mjs"><failure message="no"/></testcase><testcase name="other claim" classname="s" file="${root}/test/a.test.mjs"/></testsuite></testsuites>`);
  put('openspec/changes/x/proposal.md', '## Why\nThe feature should hold.\n\n' + Array.from({ length: 900 }, (_, i) => `w${i}`).join(' ') + '\n');
  put('openspec/changes/x/specs/a/spec.md', '## ADDED Requirements\n\n### Requirement: X\nThe a SHALL hold.\n\n#### Scenario: X\n- **WHEN** x\n- **THEN** y\n');
  if (config) put('openspec/config.yaml', config);
  const run = (...args) => spawnSync(process.execPath, [BIN, 'check', '--root', root, '--specs', join(root, 'specs.json'), '--today', TODAY, '--junit', join(root, 'junit.xml'), ...args], { encoding: 'utf8' });
  const validate = (...args) => spawnSync(process.execPath, [BIN, 'validate', '--junit', join(root, 'junit.xml'), ...args], { cwd: root, encoding: 'utf8', env: { ...process.env, OPENSPEC_BIN: `${process.execPath} ${fake}`, FAKE_SPECS: join(root, 'specs.json'), FAKE_EXIT: '0' } });
  return { run, validate };
}
const shown = (r) => JSON.parse(r.stdout).findings.filter((f) => f.severity !== 'info');

test("check and validate SHALL report each finding of check as a warning and exit 0 for it, also with --strict, unless openspec/config.yaml sets sandy-skills.enforce: error.", () => {
  for (const config of [null, 'schema: proven\nsandy-skills:\n  enforce: warn\n']) {
    const { run, validate } = everyKind(config);
    const r = run('--format', 'json');
    assert.equal(r.status, 0, r.stderr);
    const found = shown(r);
    for (const kind of KINDS) assert.ok(found.some((f) => f.kind === kind), `${kind} is reported`);
    assert.deepEqual([...new Set(found.map((f) => f.severity))], ['warning']);
    assert.equal(JSON.parse(r.stdout).summary.errors, 0);
    const md = run('--strict');
    assert.equal(md.status, 0, md.stderr);
    assert.match(md.stdout, /^\*\*Releasable\*\* · .* · 0 errors · \d+ warnings$/m);
    assert.match(md.stdout, /^\| warning \| a \| missing-test \|/m);
    const v = validate('--all', '--strict');
    assert.equal(v.status, 0, v.stderr);
    assert.match(v.stdout, /^openspec ran\n[\s\S]*\*\*Releasable\*\*/);
    const openspecFails = validate('--all');
    assert.equal(openspecFails.status, 0);
  }
  assert.equal(spawnSync(process.execPath, [BIN, 'validate'], { cwd: dir, encoding: 'utf8', env: { ...process.env, OPENSPEC_BIN: `${process.execPath} ${fake}`, FAKE_EXIT: '4' } }).status, 4, "OpenSpec's own exit code stays");
});

test("Where openspec/config.yaml sets sandy-skills.enforce: error, check and validate SHALL keep the severity of each finding and exit 1 for an error, as 0.7.0 did.", () => {
  const { run, validate } = everyKind('schema: proven\nsandy-skills:\n  enforce: error # 0.7.0\n');
  const r = run('--format', 'json');
  assert.equal(r.status, 1);
  const found = shown(r);
  for (const kind of KINDS) assert.ok(found.some((f) => f.kind === kind && f.severity === 'error'), `${kind} is an error`);
  const md = run();
  assert.equal(md.status, 1);
  assert.match(md.stdout, /^\*\*Not releasable\*\*/m);
  assert.match(md.stdout, /^\| error \| a \| missing-test \|/m);
  assert.equal(validate('--all', '--strict').status, 1);
  const bad = everyKind('sandy-skills:\n  enforce: block\n').run();
  assert.equal(bad.status, 2);
  assert.match(bad.stderr, /line 2: sandy-skills\.enforce: "block" is neither warn nor error/);
});
