#!/usr/bin/env node
// sandy-skills: installs the proven schema and skills per repo, computes lights, drift and a releasability
// report from OpenSpec specs plus JUnit reports, and passes every other command to OpenSpec.
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { parsePart } from '../src/parts.mjs';
import { parseJUnit } from '../src/junit.mjs';
import { check } from '../src/check.mjs';
import { renderMarkdown } from '../src/report.mjs';
import { loadSpec, loadSpecs, passOpenspec, readConfig, readOpenChanges, readOpenTasks, runOpenspec } from '../src/openspec.mjs';
import { readLimits } from '../src/limits.mjs';
import { readSpecFiles } from '../src/scenarios.mjs';
import { install, PACKAGE } from '../src/install.mjs';
import { parseExamined, examAllows } from '../src/exam.mjs';
import { ALL, findBlocks, refreshBlocks, renderDiagram, repoBlocks, markdownFiles } from '../src/diagram.mjs';

const USAGE = `Usage:
  sandy-skills init [--tools LIST] [--skills-dir DIR]... [--root DIR]
  sandy-skills update [--skills-dir DIR]... [--root DIR]
  sandy-skills check [--root DIR] [--junit FILE|DIR]... [--today YYYY-MM-DD] [--format md|json] [--out FILE] [--strict] [--specs FILE]
  sandy-skills validate [<openspec validate args>] [--junit FILE|DIR]... [--out FILE] [--strict]
  sandy-skills diagram [<spec-id>] [--write] [--root DIR]
  sandy-skills hash <spec-id> [--root DIR]
  sandy-skills confirm <spec-id> <I|We|They> <who> [--days N] [--today YYYY-MM-DD] [--root DIR]
  sandy-skills openspec <args>
  sandy-skills --version

Every other command goes to OpenSpec unchanged (sandy-skills list --specs is openspec list --specs).
sandy-skills openspec <args> reaches OpenSpec's own init, update and help (sandy-skills openspec --help).

init sets up OpenSpec if the repo has none (--tools goes to openspec init), then installs the proven
schema as default and the skills next to OpenSpec's. update installs them again from this version.
check exits 1 when the result is not releasable (any error; with --strict also any warning), and reports
diagram blocks that differ from the specs, open changes that are long, over the limit or vague
(sandy-skills.limits in openspec/config.yaml), and scenarios that are not GIVEN, WHEN, THEN, TEST. validate runs openspec validate with its arguments, then check
with --junit, --out and --strict (--strict goes to both), and exits non-zero when either fails.
diagram prints a Mermaid flowchart of every part, or of one part, what is below it and its neighbours;
--write refreshes every <!-- sandy-skills diagram: <id|all> --> block in the repo's Markdown and lists
the files it changed.
confirm for the I side needs a passed exam on the current contract in .learn/<who>/exams/<spec-id>.md.`;

function args(argv) {
  const opts = { junit: [], 'skills-dir': [], positional: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--strict') opts.strict = true;
    else if (a === '--write') opts.write = true;
    else if (a === '-h' || a === '--help') opts.help = true;
    else if (a === '-v' || a === '--version') opts.version = true;
    else if (a.startsWith('--')) {
      if (i + 1 >= argv.length) throw new Error(`${a} needs a value`);
      const key = a.slice(2);
      if (key === 'junit' || key === 'skills-dir') opts[key].push(argv[++i]);
      else opts[key] = argv[++i];
    } else opts.positional.push(a);
  }
  return opts;
}

function xmlFiles(path) {
  if (!statSync(path).isDirectory()) return [path];
  return readdirSync(path).filter((f) => f.endsWith('.xml')).sort().map((f) => join(path, f));
}

const todayUtc = () => new Date().toISOString().slice(0, 10);
const addDays = (d, n) => new Date(Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10) + n)).toISOString().slice(0, 10);

/** Lights, drift and the report; returns 0 when releasable, else 1. */
function runCheck(root, opts, today) {
  const specs = opts.specs ? JSON.parse(readFileSync(opts.specs, 'utf8')) : loadSpecs(root);
  const tests = opts.junit.flatMap(xmlFiles).flatMap((f) => parseJUnit(readFileSync(f, 'utf8')));
  const changes = readOpenChanges(root);
  const result = check(specs.map(parsePart), tests, { today, openTasks: readOpenTasks(root), diagrams: repoBlocks(root), changes, limits: readLimits(readConfig(root)), specFiles: readSpecFiles(root, changes) });
  if (opts.strict && result.summary.warnings > 0) result.summary.releasable = false;
  const text = (opts.format ?? 'md') === 'json' ? JSON.stringify(result, null, 2) + '\n' : renderMarkdown(result) + '\n';
  if (opts.out) { mkdirSync(dirname(resolve(opts.out)), { recursive: true }); writeFileSync(opts.out, text); }
  else process.stdout.write(text);
  if (opts.out) console.error(`${result.summary.releasable ? 'releasable' : 'not releasable'}: ${result.summary.errors} errors, ${result.summary.warnings} warnings -> ${opts.out}`);
  return result.summary.releasable ? 0 : 1;
}

/** openspec validate with every argument but --junit and --out, then check; --strict goes to both. */
async function validate(argv) {
  const toOpenspec = [];
  const opts = { junit: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--junit' || a === '--out') {
      if (i + 1 >= argv.length) throw new Error(`${a} needs a value`);
      if (a === '--junit') opts.junit.push(argv[++i]); else opts.out = argv[++i];
    } else {
      if (a === '--strict') opts.strict = true;
      toOpenspec.push(a);
    }
  }
  const root = process.cwd();
  const validated = await passOpenspec(root, ['validate', ...toOpenspec]);
  let checked;
  try { checked = runCheck(root, opts, todayUtc()); }
  catch (e) { console.error(`sandy-skills check: ${e.message}`); checked = 2; }
  return validated || checked;
}

const OWN = new Set(['init', 'update', 'check', 'validate', 'diagram', 'hash', 'confirm']);

async function main(argv) {
  const [first, ...after] = argv;
  if (first === 'openspec') return passOpenspec(process.cwd(), after);
  if (first === 'validate') return validate(after);
  if (first !== undefined && !first.startsWith('-') && !OWN.has(first)) return passOpenspec(process.cwd(), argv);
  const opts = args(argv);
  const [command, ...rest] = opts.positional;
  if (opts.version) { console.log(JSON.parse(readFileSync(PACKAGE + 'package.json', 'utf8')).version); return 0; }
  if (opts.help || !command) { console.log(USAGE); return opts.help ? 0 : 2; }
  const root = resolve(opts.root ?? '.');
  const today = opts.today ?? todayUtc();

  if (command === 'init' || command === 'update') {
    const has = existsSync(resolve(root, 'openspec'));
    if (command === 'update' && !has) { console.error('no openspec/ here: run sandy-skills init first'); return 1; }
    if (command === 'init' && !has) runOpenspec(root, ['init', ...(opts.tools ? ['--tools', opts.tools] : []), '.'], { inherit: true });
    for (const line of install(root, { dirs: opts['skills-dir'] })) console.log(line);
    if (command === 'init') console.log('\nNext: describe each part as the spec format says, then run sandy-skills check in CI.\nhttps://github.com/sandyhq/sandy-skills/blob/main/docs/usage.md');
    return 0;
  }
  if (command === 'check') return runCheck(root, opts, today);
  if (command === 'diagram') {
    const parts = (opts.specs ? JSON.parse(readFileSync(opts.specs, 'utf8')) : loadSpecs(root)).map(parsePart);
    if (!opts.write) { process.stdout.write(renderDiagram(parts, rest[0] ?? ALL)); return 0; }
    const ids = new Set([ALL, ...parts.map((p) => p.id)]);
    let failed = 0;
    for (const file of markdownFiles(root)) {
      const path = join(root, file);
      const text = readFileSync(path, 'utf8');
      for (const b of findBlocks(text).filter((x) => !ids.has(x.id) || !x.closed)) {
        console.error(`${file}:${b.line}: ${ids.has(b.id) ? 'no closing <!-- /sandy-skills diagram --> line' : `"${b.id}" is no spec`}`);
        failed++;
      }
      const next = refreshBlocks(text, (id) => (ids.has(id) ? renderDiagram(parts, id) : null));
      if (next !== text) { writeFileSync(path, next); console.log(file); }
    }
    return failed ? 1 : 0;
  }
  if (command === 'hash' || command === 'confirm') {
    const part = parsePart(loadSpec(root, rest[0]));
    if (!part.contract) { console.error(`${rest[0]} has no "Requirement: Contract"`); return 1; }
    if (command === 'hash') { console.log(part.contract.hash); return 0; }
    const [, side, who] = rest;
    if (!['I', 'We', 'They'].includes(side) || !who) { console.error(USAGE); return 2; }
    const days = Number(opts.days ?? 90);
    if (!(days >= 1 && days <= 90)) { console.error('--days must be 1 to 90'); return 2; }
    if (side === 'I') {
      const file = join(root, '.learn', who, 'exams', `${rest[0]}.md`);
      const verdict = examAllows(existsSync(file) ? parseExamined(readFileSync(file, 'utf8')) : [], { who, hash: part.contract.hash, today });
      if (!verdict.ok) { console.error(`no I confirmation: ${verdict.reason} (${file.slice(root.length + 1)}). Pass the exam first: the examine-part skill.`); return 1; }
    }
    console.log(`- **CONFIRMED** ${side} by ${who} on ${today}, expires ${addDays(today, days)}, contract ${part.contract.hash}`);
    return 0;
  }
  console.error(USAGE);
  return 2;
}

main(process.argv.slice(2)).then(
  (code) => { process.exitCode = code; },
  (e) => { console.error(`sandy-skills: ${e.message}`); process.exitCode = 2; },
);
