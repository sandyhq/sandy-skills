// Proves the diagram part (openspec/specs/diagram) on the neutral parts in test/fixtures/diagram.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { loadSpecs } from '../src/openspec.mjs';
import { parsePart } from '../src/parts.mjs';
import { label, renderDiagram } from '../src/diagram.mjs';
import { spec, TODAY } from './helpers.mjs';

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
  p_orders -->|customer-supplier, exclusive| p_ledger
  p_oven -.->|conformist, read-only| p_orders
  p_storefront -->|customer-supplier| p_orders
  p_supplier -->|customer-supplier| p_kitchen
  classDef proposed stroke-dasharray: 5 5
  class p_storefront proposed
  classDef retired fill:#eee,stroke:#999,color:#999
  class p_ledger retired
`;
const block = (id, body) => `<!-- sandy-skills diagram: ${id} -->\n\`\`\`mermaid\n${body}\`\`\`\n<!-- /sandy-skills diagram -->\n`;
const STALE = 'flowchart LR\n  p_shop["Corner shop"]\n';

/** A copy of the fixture repo with extra files {path: text}. */
const ENFORCE = 'schema: proven\nsandy-skills:\n  enforce: error\n'; // the fixtures expect the 0.7.0 errors
function repo(files = {}) {
  const root = mkdtempSync(join(tmpdir(), 'sandy-skills-diagram-'));
  cpSync(FIXTURE, root, { recursive: true });
  for (const [path, text] of Object.entries({ 'openspec/config.yaml': ENFORCE, ...files })) { mkdirSync(dirname(join(root, path)), { recursive: true }); writeFileSync(join(root, path), text); }
  return root;
}
const run = (root, ...args) => spawnSync(process.execPath, [BIN, ...args, '--root', root], { encoding: 'utf8' });
const bare = (id, title = id) => ({ id, title, partOf: null, status: 'active', seams: [] });
const check = (root) => {
  const r = run(root, 'check', '--specs', specsFile, '--junit', join(FIXTURE, 'junit.xml'), '--today', TODAY, '--format', 'json');
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
  const lines = renderDiagram(parts.map((p) => ({ ...p, seams: p.seams.map((s) => ({ ...s, relation: null })) }))).split('\n');
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
  p_orders -->|customer-supplier, exclusive| p_ledger
  p_oven -.->|conformist, read-only| p_orders
  p_storefront -->|customer-supplier| p_orders
  p_supplier -->|customer-supplier| p_kitchen
  classDef proposed stroke-dasharray: 5 5
  class p_storefront proposed
  classDef retired fill:#eee,stroke:#999,color:#999
  class p_ledger retired
`);
  assert.equal(renderDiagram(parts, 'oven'), 'flowchart LR\n  p_oven["Oven"]\n  p_orders["Order book"]\n  p_oven -.->|conformist, read-only| p_orders\n');
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

test('The diagram SHALL give parts with different ids different Mermaid ids.', () => {
  const ids = ['a.1', 'a-46-1', 'a_46_1', 'a-2e-1', 'a/b', 'a-b', 'a_b', 'end', 'Up'];
  const lines = renderDiagram(ids.map((id) => bare(id))).split('\n').slice(1, -1);
  assert.equal(lines.length, ids.length);
  assert.equal(new Set(lines.map((l) => l.trim().split('[')[0])).size, ids.length);
  for (const l of lines) assert.match(l, /^  p_[a-z0-9_]+\[/);
});

test('The checker SHALL treat a line indented by up to three spaces as a code fence when CommonMark does, both to open and to close it.', () => {
  const example = (open, close) => `${open}\n${block('all', STALE)}${close}\n\n`;
  const hidden = '# Examples\n\n' + example('   ```md', '```') + example(' ~~~', '   ~~~~') + example('  ````', '```\n````') + example('~~~', '```\n  ~~~');
  const root = repo({ 'docs/examples.md': hidden });
  assert.deepEqual(check(root), { status: 0, findings: [] }, 'opened by an indented fence: not a block');
  assert.equal(run(root, 'diagram', '--write', '--specs', specsFile).stdout, '');
  assert.equal(readFileSync(join(root, 'docs/examples.md'), 'utf8'), hidden);

  const after = '# Doc\n\n~~~~markdown\nexample\n   ~~~~\n\n```md\nx\n  ```\n\n' + block('all', STALE);
  const root2 = repo({ 'docs/doc.md': after, 'docs/four.md': '    ```\n' + block('all', STALE) });
  const { status, findings } = check(root2);
  assert.equal(status, 1);
  assert.deepEqual(findings.map((f) => [f.kind, f.file, f.line]), [['stale-diagram', 'docs/doc.md', 11], ['stale-diagram', 'docs/four.md', 2]], 'closed by an indented fence: the next block counts; four spaces open no fence');
  assert.equal(run(root2, 'diagram', '--write', '--specs', specsFile).stdout, 'docs/doc.md\ndocs/four.md\n');
  assert.deepEqual(check(root2), { status: 0, findings: [] });
});

test('The diagram SHALL write each title so that Mermaid shows it exactly as the spec writes it.', () => {
  assert.equal(label('A #35; B'), '"A #35;35; B"');
  assert.equal(label('A #quot; B'), '"A #35;quot; B"');
  assert.equal(label('say "hi" #1'), '"say #quot;hi#quot; #35;1"');
  assert.equal(label('A <b>bold</b> B'), '"A #lt;b#gt;bold#lt;/b#gt; B"');
  assert.equal(renderDiagram([bare('a', 'A #35; B')]), 'flowchart LR\n  p_a["A #35;35; B"]\n');
});

test("The diagram SHALL write the relation of each seam on its arrow.", () => {
  const cli = (flag) => [spec('init'), spec('cli', { requirements: [['Seam to init', `The cli SHALL install the schema with init.${flag}\nRelation: conformist · Upstream: init`]] })].map(parsePart);
  assert.ok(renderDiagram(cli('')).split('\n').includes('  p_cli -->|conformist| p_init'));
  assert.ok(renderDiagram(cli(' Read-only.')).split('\n').includes('  p_cli -.->|conformist, read-only| p_init'));
  assert.ok(renderDiagram(cli(' Exclusive.')).split('\n').includes('  p_cli -->|conformist, exclusive| p_init'));
  for (const edge of ['  p_orders -->|customer-supplier, exclusive| p_ledger', '  p_oven -.->|conformist, read-only| p_orders', '  p_storefront -->|customer-supplier| p_orders', '  p_supplier -->|customer-supplier| p_kitchen']) assert.ok(renderDiagram(parts).split('\n').includes(edge), edge);
});
