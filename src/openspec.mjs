// The only I/O against OpenSpec: its own CLI parses the Markdown, so sandy-skills never does, except for the
// spec's `# ` heading, which OpenSpec's JSON does not carry.
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
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

/** Runs OpenSpec in root with the caller's stdin, stdout and stderr; returns its exit code (1 if a signal ended it). */
export function passOpenspec(root, args) {
  const [cmd, ...pre] = openspecCommand(root);
  const r = spawnSync(cmd, [...pre, ...args], { cwd: root, stdio: 'inherit' });
  if (r.error) throw new Error(`cannot run OpenSpec (${cmd}): ${r.error.message}`);
  return r.status ?? 1;
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
