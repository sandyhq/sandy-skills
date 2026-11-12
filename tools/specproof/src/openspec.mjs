// The only I/O against OpenSpec: its own CLI parses the Markdown, so specproof never does.
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

function openspec(root, args) {
  const [cmd, ...pre] = (process.env.OPENSPEC_BIN || 'openspec').split(/\s+/).filter(Boolean);
  const out = execFileSync(cmd, [...pre, ...args], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024 });
  return JSON.parse(out.slice(out.indexOf('{')));
}

/** Every spec as `openspec show <id> --type spec --json` returns it, sorted by id. */
export function loadSpecs(root) {
  const ids = openspec(root, ['list', '--specs', '--json']).specs.map((s) => s.id).sort();
  return ids.map((id) => openspec(root, ['show', id, '--type', 'spec', '--json', '--no-interactive']));
}

export function loadSpec(root, id) {
  return openspec(root, ['show', id, '--type', 'spec', '--json', '--no-interactive']);
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
