# review-time Specification

## Purpose
Estimates the minutes one review of a merge request takes, so that one change fits one review.

Kind: component · Part of: cli · Carried by: nesyeklaf · Status: active · Code: src/review.mjs

## Requirements

### Requirement: Contract
review-time SHALL print the review minutes of the diff against --base: change words / 170 + code lines / 8 + 5 per part + 8 per seam + 2 per claim, rounded up.

#### Scenario: Contract
- **GIVEN** 340 change words, 10 code lines, 2 parts, 3 seams and 2 claims
- **WHEN** review-time runs
- **THEN** it prints 42 minutes
- **TEST** `test/review.test.mjs::review-time SHALL print the review minutes of the diff against --base: change words / 170 + code lines / 8 + 5 per part + 8 per seam + 2 per claim, rounded up.`

### Requirement: Code lines
review-time SHALL count as code lines the changed lines outside tests, Markdown, openspec/, lock files and linguist-generated files.

#### Scenario: Code lines
- **GIVEN** 30 changed lines in src/a.mjs, 50 in test/a.test.mjs and 20 in pnpm-lock.yaml
- **WHEN** review-time runs
- **THEN** it counts 30 code lines
- **TEST** `test/review.test.mjs::review-time SHALL count as code lines the changed lines outside tests, Markdown, openspec/, lock files and linguist-generated files.`

### Requirement: Deepest part
review-time SHALL count a part for each changed file under its Code paths, deepest match first, and for each delta spec; a seam for each Seam to heading and a claim for each other heading at level 3.

#### Scenario: Deepest part
- **GIVEN** cli owns src/, diagram owns src/diagram.mjs, and the diff changes src/diagram.mjs
- **WHEN** review-time runs
- **THEN** it counts the part diagram only
- **TEST** `test/review.test.mjs::review-time SHALL count a part for each changed file under its Code paths, deepest match first, and for each delta spec; a seam for each Seam to heading and a claim for each other heading at level 3.`

### Requirement: Time bands
review-time SHALL warn above 30 minutes and exit 1 above 60 minutes.

#### Scenario: Time bands
- **GIVEN** a diff of 61 minutes
- **WHEN** review-time runs
- **THEN** it exits 1
- **TEST** `test/review.test.mjs::review-time SHALL warn above 30 minutes and exit 1 above 60 minutes.`

### Requirement: Line backstop
review-time SHALL warn above 200 code lines and exit 1 above 400 code lines, whatever the minutes.

#### Scenario: Line backstop
- **GIVEN** 401 code lines in 1 part, 55 minutes
- **WHEN** review-time runs
- **THEN** it exits 1
- **TEST** `test/review.test.mjs::review-time SHALL warn above 200 code lines and exit 1 above 400 code lines, whatever the minutes.`

### Requirement: Owned files
review-time SHALL exit 1 when a changed code file lies under the Code paths of no part.

#### Scenario: Owned files
- **GIVEN** lib/x.mjs changed, under no Code path
- **WHEN** review-time runs
- **THEN** it exits 1 and names lib/x.mjs
- **TEST** `test/review.test.mjs::review-time SHALL exit 1 when a changed code file lies under the Code paths of no part.`

### Requirement: One change
review-time SHALL exit 1 when the diff holds 0 changes or 2 or more changes, or changes code in a part without a delta spec in its change.

#### Scenario: One change
- **GIVEN** a change with a delta spec for diagram, and src/install.mjs changed
- **WHEN** review-time runs
- **THEN** it exits 1 and names init
- **TEST** `test/review.test.mjs::review-time SHALL exit 1 when the diff holds 0 changes or 2 or more changes, or changes code in a part without a delta spec in its change.`

### Requirement: Configured weights
review-time SHALL read weights, minute thresholds and line thresholds from sandy-skills.review in openspec/config.yaml and keep the default for each missing key.

#### Scenario: Heavier seams
- **GIVEN** config.yaml sets sandy-skills.review.weights.seam to 12
- **WHEN** review-time runs on a diff with 1 changed seam
- **THEN** the seam share is 12 minutes and every other weight is its default
- **TEST** `test/review.test.mjs::review-time SHALL read weights, minute thresholds and line thresholds from sandy-skills.review in openspec/config.yaml and keep the default for each missing key.`

### Requirement: Estimate before code
check SHALL estimate the review minutes of each open change from its words, parts, seams and claims, warn above the minute warn threshold and fail above the error threshold.

#### Scenario: Change with many seams
- **GIVEN** an open change with 6 delta specs and 5 seams
- **WHEN** check runs
- **THEN** check fails with long-review
- **TEST** `test/review.test.mjs::check SHALL estimate the review minutes of each open change from its words, parts, seams and claims, warn above the minute warn threshold and fail above the error threshold.`

### Requirement: Nested spec
review-time SHALL read its parts from the spec files check reads: each spec under openspec/specs at any depth, as the part whose id is its folder path below openspec/specs, such as domain/service.

#### Scenario: Nested spec
- **GIVEN** openspec/specs/domain/service/spec.md owns src/, and a change with a delta spec for domain/service changes src/a.mjs
- **WHEN** check lists its spec files and review-time runs
- **THEN** both name the part domain/service, and review-time counts 1 part and reports no unowned-file
- **TEST** `test/review.test.mjs::review-time SHALL read its parts from the spec files check reads: each spec under openspec/specs at any depth, as the part whose id is its folder path below openspec/specs, such as domain/service.`

### Requirement: Go and Python tests
review-time SHALL count Go files ending in _test.go and Python files named test_*.py or *_test.py as tests, never as code lines.

#### Scenario: Go and Python tests
- **GIVEN** a change with a delta spec for service changes src/a.go (3 lines), src/contest.py (2 lines), src/a_test.go (400 lines), src/test_a.py (50 lines) and src/a_test.py (60 lines)
- **WHEN** review-time runs
- **THEN** it counts 5 code lines
- **TEST** `test/review.test.mjs::review-time SHALL count Go files ending in _test.go and Python files named test_*.py or *_test.py as tests, never as code lines.`

### Requirement: Enforce
review-time SHALL report each finding as a warning and exit 0 for it unless openspec/config.yaml sets sandy-skills.enforce: error, which keeps each severity and exits 1 for an error.

#### Scenario: Enforce
- **GIVEN** a diff with 500 code lines, a file no part owns and 2 changes, and a diff with 0 changes
- **WHEN** review-time runs without the key and with `enforce: error`
- **THEN** it reports warnings and exits 0, then errors and exits 1
- **TEST** `test/review.test.mjs::review-time SHALL report each finding as a warning and exit 0 for it unless openspec/config.yaml sets sandy-skills.enforce: error, which keeps each severity and exits 1 for an error.`
