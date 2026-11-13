// The glossary: 1 word for each thing. check reports a word from a Not line as wrong-term in the specs and in open
// changes. The standard's words ship in standards/glossary.md; each repo writes its own words in docs/glossary.md.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { blankCodeSpans, proseLines } from './limits.mjs';

const PACKAGE_GLOSSARY = new URL('../standards/glossary.md', import.meta.url);
const EXCEPT_HEADINGS = /\s*\(except headings\)\s*$/;

/**
 * The entries of a glossary text: each level 2 heading is a word, the lines below it up to a Not: line are its
 * definition, and the Not: line lists the words that name the same thing, a word marked (except headings) is
 * allowed in headings. relations: the bold values listed in the entry relation.
 * @returns {entries: [{word, definition, not: [{term, exceptHeadings}]}], relations: [value]}
 */
export function parseGlossary(text) {
  const entries = [];
  const relations = [];
  let entry = null;
  for (const line of proseLines(String(text ?? '').replace(/\r\n?/g, '\n'))) {
    const h = /^##\s+(.+?)\s*$/.exec(line);
    if (h) { entry = { word: h[1], definition: '', not: [] }; entries.push(entry); continue; }
    if (/^#\s/.test(line)) { entry = null; continue; }
    if (!entry || line.trim() === '') continue;
    const n = /^Not:\s*(.*)$/.exec(line.trim());
    if (n) {
      entry.not.push(...n[1].split(/\s*,\s*/).filter(Boolean).map((t) => ({ term: t.replace(EXCEPT_HEADINGS, ''), exceptHeadings: EXCEPT_HEADINGS.test(t) })));
      continue;
    }
    const v = /^-\s+\*\*([a-z-]+)\*\*:/.exec(line.trim());
    if (v && entry.word === 'relation') { relations.push(v[1]); continue; }
    if (!entry.not.length && !v) entry.definition = (entry.definition + ' ' + line.trim()).trim();
  }
  return { entries, relations };
}

/**
 * The glossary check uses: the standard's entries and the repo's entries. A word the repo glossary defines as a
 * heading is never a Not term. nots keep the order of the entries: the standard first, then the repo.
 */
export function mergeGlossaries(standardText, repoText = '') {
  const std = parseGlossary(standardText);
  const repo = parseGlossary(repoText);
  const defined = new Set(repo.entries.map((e) => e.word.toLowerCase()));
  const nots = [...std.entries, ...repo.entries].flatMap((e) => e.not.map((n) => ({ ...n, word: e.word })))
    .filter((n) => !defined.has(n.term.toLowerCase()));
  return { words: [...std.entries, ...repo.entries].map((e) => e.word), nots, relations: std.relations };
}

/** standards/glossary.md of the installed package and docs/glossary.md of the repo at root, merged. */
export function readGlossary(root) {
  const repo = root && existsSync(join(root, 'docs', 'glossary.md')) ? readFileSync(join(root, 'docs', 'glossary.md'), 'utf8') : '';
  return mergeGlossaries(readFileSync(PACKAGE_GLOSSARY, 'utf8'), repo);
}

let standard = null;
/** The package glossary alone, read once: the default of check. */
export const standardGlossary = () => (standard ??= mergeGlossaries(readFileSync(PACKAGE_GLOSSARY, 'utf8')));

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
/** The term as a whole word in any case; a plural with s, es or y → ies counts too; _ is part of a word. */
const termRe = (term) => {
  const words = term.trim().split(/\s+/).map(escape);
  const last = words.pop();
  const forms = [`${last}(?:s|es)?`, ...(/y$/i.test(last) ? [`${last.slice(0, -1)}ies`] : [])];
  return new RegExp(`(?<![\\p{L}\\p{N}_])${[...words, `(?:${forms.join('|')})`].join('\\s+')}(?![\\p{L}\\p{N}_])`, 'iu');
};

/**
 * Errors wrong-term for the specs and the Markdown files of open changes: each Not term outside fenced code, HTML
 * comments and backticks, and outside headings for a term marked except headings.
 * @param files [{part, file, text}]
 */
export function wrongTermFindings(files, glossary = standardGlossary()) {
  const res = glossary.nots.map((n) => ({ ...n, re: termRe(n.term) }));
  const findings = [];
  for (const { part, file, text } of files) {
    blankCodeSpans(proseLines(text).join('\n')).split('\n').forEach((line, i) => {
      const heading = /^\s{0,3}#{1,6}\s/.test(line);
      for (const n of res) {
        if ((heading && n.exceptHeadings) || !n.re.test(line)) continue;
        findings.push({ part, kind: 'wrong-term', severity: 'error', file, line: i + 1, word: n.term, glossaryWord: n.word, detail: `${file}:${i + 1}: "${n.term}" is not a glossary word; write "${n.word}"` });
      }
    });
  }
  return findings;
}
