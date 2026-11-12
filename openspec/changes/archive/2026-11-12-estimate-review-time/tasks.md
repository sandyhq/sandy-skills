## 1. Your steps

- [x] 1.1 None

## 2. Proof

- [x] 2.1 Prove `test/review.test.mjs::review-time SHALL print the review minutes of the diff against --base: change words / 170 + code lines / 8 + 5 per part + 8 per seam + 2 per claim, rounded up.`
- [x] 2.2 Prove `test/review.test.mjs::review-time SHALL count as code lines the changed lines outside tests, Markdown, openspec/, lock files and linguist-generated files.`
- [x] 2.3 Prove `test/review.test.mjs::review-time SHALL count a part for each changed file under its Code paths, deepest match first, and for each delta spec; a seam for each Seam to requirement and a claim for each other requirement.`

## 3. Build

- [x] 3.1 src/review.mjs and the review-time command; run `test/review.test.mjs`
- [x] 3.2 Help and docs/usage.md name review-time; run `test/cli.test.mjs`
- [x] 3.3 Run the tests and `sandy-skills validate --all --strict`
