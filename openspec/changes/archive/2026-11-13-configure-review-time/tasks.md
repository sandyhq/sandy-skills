## 1. Your steps

- [ ] 1.1 Calibrate the weights on 5 to 10 past merge requests, after the release

## 2. Proof

- [x] 2.1 Prove `test/review.test.mjs::review-time SHALL read weights, minute thresholds and line thresholds from sandy-skills.review in openspec/config.yaml and keep the default for each missing key.`
- [x] 2.2 Prove `test/review.test.mjs::check SHALL estimate the review minutes of each open change from its words, parts, seams and claims, warn above the minute warn threshold and fail above the error threshold.`

## 3. Build

- [x] 3.1 `sandy-skills.review` in the limits reader; run `test/review.test.mjs`
- [x] 3.2 check estimates open changes; run `test/review.test.mjs`
- [x] 3.3 Version 0.6.0, help, docs/usage.md; run the tests, `sandy-skills validate --all --strict` and `scripts/smoke-install.sh`
