#!/usr/bin/env node
// specproof: lights, drift and a releasability report from OpenSpec specs plus JUnit reports.
import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { parsePart } from '../src/parts.mjs';
import { parseJUnit } from '../src/junit.mjs';
import { check } from '../src/check.mjs';
import { renderMarkdown } from '../src/report.mjs';
import { loadSpec, loadSpecs, readOpenTasks } from '../src/openspec.mjs';

const USAGE = `Usage:
  specproof check [--root DIR] [--junit FILE|DIR]... [--today YYYY-MM-DD] [--format md|json] [--out FILE] [--strict] [--specs FILE]
  specproof hash <spec-id> [--root DIR]
  specproof confirm <spec-id> <I|We|They> <who> [--days N] [--today YYYY-MM-DD] [--root DIR]

check exits 1 when the result is not releasable (any error; with --strict also any warning).`;

function args(argv) {
  const opts = { junit: [], positional: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--strict') opts.strict = true;
    else if (a === '-h' || a === '--help') opts.help = true;
    else if (a.startsWith('--')) {
      if (i + 1 >= argv.length) throw new Error(`${a} needs a value`);
      const key = a.slice(2);
      if (key === 'junit') opts.junit.push(argv[++i]);
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

function main(argv) {
  const opts = args(argv);
  const [command, ...rest] = opts.positional;
  if (opts.help || !command) { console.log(USAGE); return opts.help ? 0 : 2; }
  const root = resolve(opts.root ?? '.');
  const today = opts.today ?? todayUtc();

  if (command === 'check') {
    const specs = opts.specs ? JSON.parse(readFileSync(opts.specs, 'utf8')) : loadSpecs(root);
    const tests = opts.junit.flatMap(xmlFiles).flatMap((f) => parseJUnit(readFileSync(f, 'utf8')));
    const result = check(specs.map(parsePart), tests, { today, openTasks: readOpenTasks(root) });
    if (opts.strict && result.summary.warnings > 0) result.summary.releasable = false;
    const text = (opts.format ?? 'md') === 'json' ? JSON.stringify(result, null, 2) + '\n' : renderMarkdown(result) + '\n';
    if (opts.out) { mkdirSync(dirname(resolve(opts.out)), { recursive: true }); writeFileSync(opts.out, text); }
    else process.stdout.write(text);
    if (opts.out) console.error(`${result.summary.releasable ? 'releasable' : 'not releasable'}: ${result.summary.errors} errors, ${result.summary.warnings} warnings -> ${opts.out}`);
    return result.summary.releasable ? 0 : 1;
  }
  if (command === 'hash' || command === 'confirm') {
    const part = parsePart(loadSpec(root, rest[0]));
    if (!part.contract) { console.error(`${rest[0]} has no "Requirement: Contract"`); return 1; }
    if (command === 'hash') { console.log(part.contract.hash); return 0; }
    const [, side, who] = rest;
    if (!['I', 'We', 'They'].includes(side) || !who) { console.error(USAGE); return 2; }
    const days = Number(opts.days ?? 90);
    if (!(days >= 1 && days <= 90)) { console.error('--days must be 1 to 90'); return 2; }
    console.log(`- **CONFIRMED** ${side} by ${who} on ${today}, expires ${addDays(today, days)}, contract ${part.contract.hash}`);
    return 0;
  }
  console.error(USAGE);
  return 2;
}

try { process.exitCode = main(process.argv.slice(2)); }
catch (e) { console.error(`specproof: ${e.message}`); process.exitCode = 2; }
