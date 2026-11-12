## 1. Your steps

- [x] 1.1 None

## 2. Proof

- [x] 2.1 Prove `test/limits.test.mjs::If openspec/config.yaml sets no sandy-skills.limits, then the checker SHALL use the default warn and error thresholds.`
- [x] 2.2 Prove `test/limits.test.mjs::When a measure of an open change is above its warn threshold and at most its error threshold, the checker SHALL report long-change as a warning.`
- [x] 2.3 Prove `test/limits.test.mjs::When a measure of an open change is above its error threshold, the checker SHALL report over-limit as an error with the file, the count and the threshold.`

## 3. Build

- [x] 3.1 Thresholds and findings in check; run `test/limits.test.mjs`
- [x] 3.2 Run the tests and `sandy-skills validate --all --strict`
