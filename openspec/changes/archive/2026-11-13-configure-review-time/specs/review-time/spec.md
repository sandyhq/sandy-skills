## ADDED Requirements

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
- **GIVEN** an open change with 6 delta specs and 5 Seam to requirements
- **WHEN** check runs
- **THEN** check fails with long-review
- **TEST** `test/review.test.mjs::check SHALL estimate the review minutes of each open change from its words, parts, seams and claims, warn above the minute warn threshold and fail above the error threshold.`
