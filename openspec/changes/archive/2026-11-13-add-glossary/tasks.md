## 1. Your steps

- [x] 1.1 None

## 2. Proof

- [x] 2.1 Prove `test/glossary.test.mjs::The glossary SHALL give each thing of the standard exactly 1 word, and check SHALL block the other words for it.`
- [x] 2.2 Prove `test/glossary.test.mjs::check SHALL read each glossary entry as a level 2 heading with the word, 1 definition and an optional line Not: with the words that name the same thing.`
- [x] 2.3 Prove `test/glossary.test.mjs::check SHALL report wrong-term as an error with file, line, word and glossary word when a spec or an open change uses a word from a Not line outside code and backticks, and outside headings for a word marked except headings.`

## 3. Build

- [x] 3.1 `standards/glossary.md` and `src/glossary.mjs`; run `test/glossary.test.mjs`
- [x] 3.2 wrong-term in check, own specs and standards reworded; run the tests and `sandy-skills validate --all --strict`
