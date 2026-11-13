// Proves the glossary part: 1 word for each thing, and wrong-term for the other words.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseGlossary } from '../src/glossary.mjs';
import { check } from '../src/check.mjs';
import { TODAY } from './helpers.mjs';

const STANDARD = readFileSync(new URL('../standards/glossary.md', import.meta.url), 'utf8');
const wrong = (r) => r.findings.filter((f) => f.kind === 'wrong-term').map(({ severity, file, line, word, glossaryWord }) => ({ severity, file, line, word, glossaryWord }));
const change = (files) => [{ id: 'c', dir: 'openspec/changes/c', files: Object.entries(files).map(([path, text]) => ({ path, text })) }];

test("The glossary SHALL give each thing of the standard exactly 1 word, and check SHALL block the other words for it.", () => {
  const { entries } = parseGlossary(STANDARD);
  const words = entries.map((e) => e.word.toLowerCase());
  const nots = entries.flatMap((e) => e.not.map((n) => n.term.toLowerCase()));
  assert.equal(new Set(words).size, words.length, 'each word names 1 entry');
  assert.equal(new Set(nots).size, nots.length, 'each Not word belongs to 1 entry');
  assert.deepEqual(nots.filter((n) => words.includes(n)), [], 'no Not word is the word of an entry');
  const terms = entries.flatMap((e) => e.not.map((n) => n.term));
  const text = '## Purpose\n' + terms.map((n) => `Line with ${n}.`).join('\n') + '\n';
  const r = check([], [], { today: TODAY, specFiles: [{ part: 'a', file: 'openspec/specs/a/spec.md', text }] });
  assert.deepEqual(wrong(r).map((f) => [f.line, f.word]), terms.map((n, i) => [i + 2, n]));
  assert.equal(r.summary.releasable, false);
});

test("check SHALL read each glossary entry as a level 2 heading with the word, 1 definition and an optional line Not: with the words that name the same thing.", () => {
  const g = parseGlossary('# Glossary\n\nIntro.\n\n## seam\nThe connection from one part to one other part.\nNot: contract between parts\n\n## upstream\nThe part the other part follows.\n');
  assert.deepEqual(g.entries, [
    { word: 'seam', definition: 'The connection from one part to one other part.', not: [{ term: 'contract between parts', exceptHeadings: false }] },
    { word: 'upstream', definition: 'The part the other part follows.', not: [] },
  ]);
  const std = parseGlossary(STANDARD);
  assert.equal(std.entries.length, 14);
  assert.deepEqual(std.entries.find((e) => e.word === 'claim').not, [{ term: 'assertion', exceptHeadings: false }, { term: 'requirement', exceptHeadings: true }]);
  assert.deepEqual(std.relations, ['partnership', 'shared-kernel', 'customer-supplier', 'conformist', 'anticorruption-layer', 'open-host-service', 'published-language']);
});

test("check SHALL report wrong-term as an error with file, line, word and glossary word when a spec or an open change uses a word from a Not line outside code and backticks, and outside headings for a word marked except headings.", () => {
  const proposal = ['## Why', 'A reader guesses.', '', 'The contract between parts and 2 PRs, `a PR`.', '```', 'module in code', '```', '## Requirement headings', 'Each requirement and 2 stories in node_modules.', ''].join('\n');
  const r = check([], [], { today: TODAY, changes: change({ 'proposal.md': proposal }) });
  const file = 'openspec/changes/c/proposal.md';
  assert.deepEqual(wrong(r), [
    { severity: 'error', file, line: 4, word: 'contract between parts', glossaryWord: 'seam' },
    { severity: 'error', file, line: 4, word: 'PR', glossaryWord: 'merge request' },
    { severity: 'error', file, line: 9, word: 'requirement', glossaryWord: 'claim' },
    { severity: 'error', file, line: 9, word: 'story', glossaryWord: 'change' },
  ]);
  assert.match(r.findings.find((f) => f.kind === 'wrong-term').detail, /^openspec\/changes\/c\/proposal\.md:4: "contract between parts" is not a glossary word; write "seam"$/);
  assert.equal(r.summary.releasable, false);
  const spec = check([], [], { today: TODAY, specFiles: [{ part: 'a', file: 'openspec/specs/a/spec.md', text: '## Purpose\nA feature.\n' }] });
  assert.deepEqual(wrong(spec).map((f) => [f.file, f.line, f.word]), [['openspec/specs/a/spec.md', 2, 'feature']]);
});
