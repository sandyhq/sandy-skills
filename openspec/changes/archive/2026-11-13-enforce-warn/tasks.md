## 1. Your steps

- [x] 1.1 None

## 2. Proof

- [x] 2.1 Prove `test/cli.test.mjs::check and validate SHALL report each finding of check as a warning and exit 0 for it, also with --strict, unless openspec/config.yaml sets sandy-skills.enforce: error.`
- [x] 2.2 Prove `test/cli.test.mjs::Where openspec/config.yaml sets sandy-skills.enforce: error, check and validate SHALL keep the severity of each finding and exit 1 for an error, as 0.7.0 did.`
- [x] 2.3 Prove `test/review.test.mjs::review-time SHALL report each finding as a warning and exit 0 for it unless openspec/config.yaml sets sandy-skills.enforce: error, which keeps each severity and exits 1 for an error.`

## 3. Build

- [x] 3.1 readEnforce in src/limits.mjs, used by check, validate and review-time
- [x] 3.2 `enforce: error` in this repo's config and in the test fixtures that expect errors
- [x] 3.3 Docs, CHANGELOG.md, version 0.7.1
