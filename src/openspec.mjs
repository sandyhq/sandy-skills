// The only I/O against OpenSpec: its own CLI parses the Markdown, so sandy-skills never does, except for the
// spec's `# ` heading, which OpenSpec's JSON does not carry.
import { execFileSync, spawn } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { constants } from 'node:os';
import { dirname, join } from 'node:path';

/** The package directory of @fission-ai/openspec as resolved from `from`, or null. */
function openspecPackage(from) {
  try {
    let dir = dirname(createRequire(from).resolve('@fission-ai/openspec'));
    for (; dir !== dirname(dir); dir = dirname(dir)) {
      const pkg = join(dir, 'package.json');
      if (existsSync(pkg) && JSON.parse(readFileSync(pkg, 'utf8')).name === '@fission-ai/openspec') return dir;
    }
  } catch {}
  return null;
}

/**
 * How to run OpenSpec: OPENSPEC_BIN if set, else the repo's own install, else the one this package
 * depends on, else `openspec` on PATH. Returns [command, ...leading args].
 */
export function openspecCommand(root) {
  if (process.env.OPENSPEC_BIN) return process.env.OPENSPEC_BIN.split(/\s+/).filter(Boolean);
  for (const from of [join(root, 'package.json'), import.meta.url]) {
    const dir = openspecPackage(from);
    if (dir) return [process.execPath, join(dir, 'bin', 'openspec.js')];
  }
  return ['openspec'];
}

/** Runs OpenSpec in root. With inherit, the user sees its output and answers its prompts. */
export function runOpenspec(root, args, { inherit = false } = {}) {
  const [cmd, ...pre] = openspecCommand(root);
  return execFileSync(cmd, [...pre, ...args], { cwd: root, encoding: 'utf8', stdio: inherit ? 'inherit' : ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024 });
}

const FORWARDED = ['SIGINT', 'SIGTERM', 'SIGHUP'];

/**
 * Runs OpenSpec in root with the caller's stdin, stdout and stderr and resolves to its exit code. While it runs,
 * SIGINT, SIGTERM and SIGHUP go on to it; if a signal ends it, this process ends itself by the same signal.
 */
export function passOpenspec(root, args) {
  const [cmd, ...pre] = openspecCommand(root);
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, [...pre, ...args], { cwd: root, stdio: 'inherit' });
    const forward = (signal) => child.kill(signal);
    for (const s of FORWARDED) process.on(s, forward);
    const stopForwarding = () => { for (const s of FORWARDED) process.off(s, forward); };
    child.on('error', (e) => { stopForwarding(); reject(new Error(`cannot run OpenSpec (${cmd}): ${e.message}`)); });
    child.on('exit', (code, signal) => {
      stopForwarding();
      if (!signal) return resolve(code);
      process.kill(process.pid, signal);
      resolve(128 + (constants.signals[signal] ?? 0));
    });
  });
}

const json = (root, args) => { const out = runOpenspec(root, args); return JSON.parse(out.slice(out.indexOf('{'))); };

/** Every spec as `openspec show <id> --type spec --json` returns it, sorted by id. */
export function loadSpecs(root) {
  const ids = json(root, ['list', '--specs', '--json']).specs.map((s) => s.id).sort();
  return ids.map((id) => loadSpec(root, id));
}

export function loadSpec(root, id) {
  return { ...json(root, ['show', id, '--type', 'spec', '--json', '--no-interactive']), heading: specHeading(root, id) };
}

/** The text of the first `# ` line of the spec file, the human title OpenSpec's JSON leaves out; null without one. */
function specHeading(root, id) {
  const file = join(root, 'openspec', 'specs', id, 'spec.md');
  if (!existsSync(file)) return null;
  const line = readFileSync(file, 'utf8').split('\n').find((l) => /^#\s/.test(l));
  return line ? line.replace(/^#\s+/, '').trim() : null;
}

/** The text of openspec/config.yaml, or '' without one. */
export function readConfig(root) {
  const file = join(root, 'openspec', 'config.yaml');
  return existsSync(file) ? readFileSync(file, 'utf8') : '';
}

/** Every file of every open change (archive/ left out), sorted: [{id, dir, files: [{path, text}]}]. */
export function readOpenChanges(root) {
  const base = join(root, 'openspec', 'changes');
  if (!existsSync(base)) return [];
  const walk = (dir, rel) => readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1)).flatMap((d) =>
    d.isDirectory() ? walk(join(dir, d.name), rel + d.name + '/') : d.isFile() ? [{ path: rel + d.name, text: readFileSync(join(dir, d.name), 'utf8') }] : []);
  return readdirSync(base, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== 'archive')
    .map((d) => d.name)
    .sort()
    .map((id) => ({ id, dir: `openspec/changes/${id}`, files: walk(join(base, id), '') }));
}

/** The tasks.md text of every open change: a todo test listed there is planned work, not drift. */
export function readOpenTasks(root) {
  const dir = join(root, 'openspec', 'changes');
  if (!existsSync(dir)) return '';
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== 'archive')
    .map((d) => join(dir, d.name, 'tasks.md'))
    .filter((f) => existsSync(f))
    .sort()
    .map((f) => readFileSync(f, 'utf8'))
    .join('\n');
}
