// Proves the diagram part (openspec/specs/diagram) on the neutral parts in test/fixtures/diagram.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { loadSpecs } from '../src/openspec.mjs';
import { parsePart } from '../src/parts.mjs';
import { renderDiagram } from '../src/diagram.mjs';
import { TODAY } from './helpers.mjs';

const BIN = new URL('../bin/sandy-skills.mjs', import.meta.url).pathname;
const FIXTURE = new URL('./fixtures/diagram', import.meta.url).pathname;
const specs = loadSpecs(FIXTURE);
const parts = specs.map(parsePart);
const specsFile = join(mkdtempSync(join(tmpdir(), 'sandy-skills-diagram-specs-')), 'specs.json');
writeFileSync(specsFile, JSON.stringify(specs));

const ALL = `flowchart LR
  subgraph p_shop["Corner shop"]
    subgraph p_kitchen["Kitchen"]
      p_orders["Order book"]
      p_oven["Oven"]
    end
    p_ledger["Ledger"]
    p_storefront["Storefront"]
  end
  p_supplier["Flour supplier"]
  p_orders -->|exclusive| p_ledger
  p_oven -.->|read-only| p_orders
  p_storefront --> p_orders
  p_supplier --> p_kitchen
  classDef proposed stroke-dasharray: 5 5
  class p_storefront proposed
  classDef retired fill:#eee,stroke:#999,color:#999
  class p_ledger retired
`;
const block = (id, body) => `<!-- sandy-skills diagram: ${id} -->\n\`\`\`mermaid\n${body}\`\`\`\n<!-- /sandy-skills diagram -->\n`;
const STALE = 'flowchart LR\n  p_shop["Corner shop"]\n';

/** A copy of the fixture repo with extra files {path: text}. */
function repo(files = {}) {
  const root = mkdtempSync(join(tmpdir(), 'sandy-skills-diagram-'));
  cpSync(FIXTURE, root, { recursive: true });
  for (const [path, text] of Object.entries(files)) { mkdirSync(dirname(join(root, path)), { recursive: true }); writeFileSync(join(root, path), text); }
  return root;
}
const run = (root, ...args) => spawnSync(process.execPath, [BIN, ...args, '--root', root], { encoding: 'utf8' });
const check = (root) => {
  const r = run(root, 'check', '--specs', specsFile, '--today', TODAY, '--format', 'json');
  return { status: r.status, findings: JSON.parse(r.stdout).findings.filter((f) => f.file) };
};

test('The diagram command SHALL generate a Mermaid flowchart of the parts and their seams from the specs, and check SHALL report every marked diagram block that differs from it.', () => {
  const root = repo({ 'docs/design/parts.md': '# Parts\n\n' + block('all', STALE) });
  const printed = run(root, 'diagram');
  assert.equal(printed.status, 0, printed.stderr);
  assert.equal(printed.stdout, ALL);
  const checked = run(root, 'check', '--today', TODAY);
  assert.equal(checked.status, 1);
  assert.match(checked.stdout, /\| error \| all \| stale-diagram \|/);
});

test('The diagram SHALL draw a part that has parts below it as a subgraph nested by Part of, and every other part as a node labelled with its spec title.', () => {
  const lines = renderDiagram(parts).split('\n');
  assert.equal(lines[0], 'flowchart LR');
  assert.deepEqual(lines.slice(1, 10), ['  subgraph p_shop["Corner shop"]', '    subgraph p_kitchen["Kitchen"]', '      p_orders["Order book"]', '      p_oven["Oven"]', '    end', '    p_ledger["Ledger"]', '    p_storefront["Storefront"]', '  end', '  p_supplier["Flour supplier"]']);
});

test('The diagram SHALL draw each seam as an edge to its target: solid and labelled exclusive for an exclusive seam, dotted and labelled read-only for a read-only seam, plain otherwise.', () => {
  const lines = renderDiagram(parts).split('\n');
  for (const edge of ['  p_orders -->|exclusive| p_ledger', '  p_oven -.->|read-only| p_orders', '  p_storefront --> p_orders', '  p_supplier --> p_kitchen']) assert.ok(lines.includes(edge), edge);
  assert.equal(lines.filter((l) => /-->|-\.->/.test(l)).length, 4);
});

test('The diagram SHALL draw proposed parts with a dashed stroke and retired parts in grey.', () => {
  const lines = renderDiagram(parts).split('\n');
  for (const l of ['  classDef proposed stroke-dasharray: 5 5', '  class p_storefront proposed', '  classDef retired fill:#eee,stroke:#999,color:#999', '  class p_ledger retired']) assert.ok(lines.includes(l), l);
});

test('When given a part id, diagram SHALL show that part, every part below it and every neighbour their seams touch, the neighbours as plain nodes.', () => {
  assert.equal(renderDiagram(parts, 'kitchen'), `flowchart LR
  subgraph p_kitchen["Kitchen"]
    p_orders["Order book"]
    p_oven["Oven"]
  end
  p_ledger["Ledger"]
  p_storefront["Storefront"]
  p_supplier["Flour supplier"]
  p_orders -->|exclusive| p_ledger
  p_oven -.->|read-only| p_orders
  p_storefront --> p_orders
  p_supplier --> p_kitchen
  classDef proposed stroke-dasharray: 5 5
  class p_storefront proposed
  classDef retired fill:#eee,stroke:#999,color:#999
  class p_ledger retired
`);
  assert.equal(renderDiagram(parts, 'oven'), 'flowchart LR\n  p_oven["Oven"]\n  p_orders["Order book"]\n  p_oven -.->|read-only| p_orders\n');
  assert.throws(() => renderDiagram(parts, 'bakery'), /no spec "bakery"/);
});

test('When run on the same specs, diagram SHALL print the same diagram.', () => {
  assert.equal(renderDiagram([...parts].reverse()), renderDiagram(parts));
  assert.equal(renderDiagram([...parts].reverse(), 'kitchen'), renderDiagram(parts, 'kitchen'));
  const root = repo();
  assert.equal(run(root, 'diagram', '--specs', specsFile).stdout, run(root, 'diagram', '--specs', specsFile).stdout);
});

test('diagram --write SHALL rewrite every marked block to what diagram generates, leave the rest of each file byte-identical and list the files it changed.', () => {
  const head = '# Design\r\n\nText before, with trailing spaces.  \n\n';
  const middle = '\nBetween the blocks.\n\n';
  const tail = '\nAfter.\n\n\n';
  const fresh = renderDiagram(parts, 'oven');
  const root = repo({
    'docs/design/parts.md': head + block('all', STALE) + middle + block('kitchen', '') + tail,
    'docs/fresh.md': '# Fresh\n' + block('oven', fresh),
    'README.md': '# Shop\n\nNo blocks here.\n',
  });
  const before = { fresh: readFileSync(join(root, 'docs/fresh.md'), 'utf8'), readme: readFileSync(join(root, 'README.md'), 'utf8') };
  const w = run(root, 'diagram', '--write', '--specs', specsFile);
  assert.equal(w.status, 0, w.stderr);
  assert.equal(w.stdout, 'docs/design/parts.md\n');
  assert.equal(readFileSync(join(root, 'docs/design/parts.md'), 'utf8'), head + block('all', ALL) + middle + block('kitchen', renderDiagram(parts, 'kitchen')) + tail);
  assert.equal(readFileSync(join(root, 'docs/fresh.md'), 'utf8'), before.fresh);
  assert.equal(readFileSync(join(root, 'README.md'), 'utf8'), before.readme);
  assert.deepEqual(check(root), { status: 0, findings: [] });
  assert.equal(run(root, 'diagram', '--write', '--specs', specsFile).stdout, '', 'a second run changes nothing');
});

test('When a marked diagram block differs from what diagram generates, check SHALL report stale-diagram as an error with the file and line of the block.', () => {
  const root = repo({ 'docs/design/parts.md': '# Parts\n\n' + block('all', STALE), 'docs/open.md': '<!-- sandy-skills diagram: oven -->\n' });
  const { status, findings } = check(root);
  assert.equal(status, 1);
  assert.deepEqual(findings.map((f) => [f.kind, f.severity, f.file, f.line]), [['stale-diagram', 'error', 'docs/design/parts.md', 3], ['unclosed-diagram', 'error', 'docs/open.md', 1]]);
  assert.match(findings[0].detail, /^docs\/design\/parts\.md:3: .*run sandy-skills diagram --write$/);
});

test('If a marked diagram block names an id that has no spec, then check SHALL report unknown-part as an error.', () => {
  const root = repo({ 'docs/parts.md': block('bakery', STALE) });
  const { status, findings } = check(root);
  assert.equal(status, 1);
  assert.deepEqual(findings.map((f) => [f.kind, f.severity, f.part, f.file, f.line]), [['unknown-part', 'error', 'bakery', 'docs/parts.md', 1]]);
  const w = run(root, 'diagram', '--write', '--specs', specsFile);
  assert.equal(w.status, 1);
  assert.match(w.stderr, /docs\/parts\.md:1: "bakery" is no spec/);
});

test('The checker SHALL read diagram blocks only from marker lines outside code fences in Markdown files outside .git, node_modules and openspec/changes/archive.', () => {
  const root = repo({
    'docs/howto.md': '# How\n\n\`\`\`\`markdown\n' + block('all', STALE) + '\`\`\`\`\n\n~~~\n' + block('bakery', '') + '~~~\n\nInline: \`<!-- sandy-skills diagram: <id> -->\`\n',
    '.git/notes.md': block('all', STALE),
    'node_modules/pkg/README.md': block('all', STALE),
    'pkg/node_modules/dep/README.md': block('all', STALE),
    'openspec/changes/archive/2026-01-01-old/notes.md': block('all', STALE),
    'docs/notes.txt': block('all', STALE),
  });
  assert.deepEqual(check(root), { status: 0, findings: [] });
  assert.equal(run(root, 'diagram', '--write', '--specs', specsFile).stdout, '');
});
