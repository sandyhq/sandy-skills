## 1. Claims as tests

- [x] 1.1 Prove `test/init.test.mjs::When init or update runs, it SHALL add .learn/ to the repo's .gitignore once and keep the file's other lines.`
- [x] 1.2 Prove `test/cli.test.mjs::confirm SHALL print an I confirmation only when the person passed the exam on the part's current contract within the last 90 days.`
- [x] 1.3 Prove `test/repo.test.mjs::The EXAMINED line that examine-part writes SHALL be the line confirm reads.`

## 2. Build

- [x] 2.1 src/exam.mjs: parse EXAMINED lines and decide; confirm uses it for I
- [x] 2.2 install adds .learn/ to .gitignore
- [x] 2.3 skills/learn-part and skills/examine-part with references; confirm-part requires the exam for I
- [x] 2.4 README, usage, AGENTS; run the tests, `openspec validate --all --strict` and `sandy-skills check`
