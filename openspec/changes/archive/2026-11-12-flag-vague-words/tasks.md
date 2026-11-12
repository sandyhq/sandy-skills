## 1. Your steps

- [x] 1.1 None

## 2. Proof

- [x] 2.1 Prove `test/limits.test.mjs::When a file of an open change uses a word of the default vague-word list, the checker SHALL report vague-word as an error with the file, line and word.`
- [x] 2.2 Prove `test/limits.test.mjs::Where openspec/config.yaml sets sandy-skills.limits.vagueWords, the checker SHALL use that list instead of the default list.`
- [x] 2.3 Prove `test/limits.test.mjs::The checker SHALL skip fenced code, HTML comments, backticks and the keywords SHALL, WHEN, THEN, AND and GIVEN when it looks for vague words.`

## 3. Build

- [x] 3.1 Vague-word search in check; run `test/limits.test.mjs`
- [x] 3.2 Run the tests and `sandy-skills validate --all --strict`
