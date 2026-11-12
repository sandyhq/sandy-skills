// init and update: put the proven schema and the skills into a repo, next to what OpenSpec installed.
import { cpSync, existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, readlinkSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const PACKAGE = fileURLToPath(new URL('..', import.meta.url));
export const SCHEMA = 'proven';
export const SKILLS = readdirSync(join(PACKAGE, 'skills'), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();

/**
 * Skill directories OpenSpec wrote to: `<dot dir>/skills` holding an openspec-* skill. Each is
 * { dir, link } where link is the directory its openspec-* entries link to, or null for copies.
 */
export function skillDirs(root) {
  const found = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory() || !entry.name.startsWith('.') || entry.name === '.git') continue;
    const dir = join(root, entry.name, 'skills');
    if (!existsSync(dir)) continue;
    const sample = readdirSync(dir).sort().find((n) => n.startsWith('openspec-'));
    if (!sample) continue;
    const at = join(dir, sample);
    found.push({ dir, link: lstatSync(at).isSymbolicLink() ? dirname(readlinkSync(at)) : null });
  }
  return found;
}

function replace(path, write) {
  rmSync(path, { recursive: true, force: true });
  mkdirSync(dirname(path), { recursive: true });
  write();
}

/** Sets `schema: proven` in openspec/config.yaml and keeps the rest of the file. */
export function setDefaultSchema(root) {
  const path = join(root, 'openspec', 'config.yaml');
  const text = existsSync(path) ? readFileSync(path, 'utf8') : '';
  const next = /^schema:.*$/m.test(text) ? text.replace(/^schema:.*$/m, `schema: ${SCHEMA}`) : `schema: ${SCHEMA}\n${text}`;
  writeFileSync(path, next);
}

/**
 * Copies the schema, sets it as default and installs the skills. Returns what it did, one line each.
 * dirs: skill directories to use instead of the ones OpenSpec wrote to.
 */
export function install(root, { dirs = [] } = {}) {
  const done = [];
  const schemaDir = join(root, 'openspec', 'schemas', SCHEMA);
  replace(schemaDir, () => cpSync(join(PACKAGE, 'openspec', 'schemas', SCHEMA), schemaDir, { recursive: true }));
  done.push(`schema   openspec/schemas/${SCHEMA}/`);
  setDefaultSchema(root);
  done.push(`config   openspec/config.yaml: schema: ${SCHEMA}`);

  let targets = dirs.length ? dirs.map((d) => ({ dir: resolve(root, d), link: null })) : skillDirs(root);
  if (targets.length === 0) targets = [{ dir: join(root, '.agents', 'skills'), link: null }];
  const copies = new Set(targets.filter((t) => !t.link).map((t) => t.dir));
  for (const t of targets.filter((t) => t.link)) copies.add(resolve(t.dir, t.link));
  const rel = (p) => p.slice(root.length + 1) || '.';
  for (const dir of [...copies].sort()) {
    for (const name of SKILLS) replace(join(dir, name), () => cpSync(join(PACKAGE, 'skills', name), join(dir, name), { recursive: true }));
    done.push(`skills   ${rel(dir)}/: ${SKILLS.join(', ')}`);
  }
  for (const t of targets.filter((t) => t.link && !copies.has(t.dir)).sort((a, b) => a.dir.localeCompare(b.dir))) {
    for (const name of SKILLS) replace(join(t.dir, name), () => symlinkSync(join(t.link, name), join(t.dir, name)));
    done.push(`links    ${rel(t.dir)}/ -> ${t.link}/`);
  }
  return done;
}
