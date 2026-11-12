## 1. Your steps

- [x] 1.1 None

## 2. Proof

- [x] 2.1 Prove `test/limits.test.mjs::Where openspec/config.yaml sets sandy-skills.limits, the checker SHALL use those thresholds, and openspec validate SHALL still accept the file.`
- [x] 2.2 Prove `test/limits.test.mjs::If sandy-skills.limits sets only part of the thresholds, then the checker SHALL take each missing key and field from the defaults.`

## 3. Build

- [x] 3.1 Reading `sandy-skills.limits` in check; run `test/limits.test.mjs`
- [x] 3.2 Run the tests and `sandy-skills validate --all --strict`
