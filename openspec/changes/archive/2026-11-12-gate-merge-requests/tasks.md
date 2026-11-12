## 1. Your steps

- [x] 1.1 None

## 2. Proof

- [x] 2.1 Prove `test/review.test.mjs::review-time SHALL warn above 30 minutes and exit 1 above 60 minutes.`
- [x] 2.2 Prove `test/review.test.mjs::review-time SHALL warn above 200 code lines and exit 1 above 400 code lines, whatever the minutes.`
- [x] 2.3 Prove `test/review.test.mjs::review-time SHALL exit 1 when a changed code file lies under the Code paths of no part.`
- [x] 2.4 Prove `test/review.test.mjs::review-time SHALL exit 1 when the diff holds 0 changes or 2 or more changes, or changes code in a part without a delta spec in its change.`

## 3. Build

- [x] 3.1 Bands, line backstop, owned files and one change in review-time; run `test/review.test.mjs`
- [x] 3.2 Run the tests and `sandy-skills validate --all --strict`
