## ADDED Requirements

### Requirement: Enforce
review-time SHALL report each finding as a warning and exit 0 for it unless openspec/config.yaml sets sandy-skills.enforce: error, which keeps each severity and exits 1 for an error.

#### Scenario: Enforce
- **GIVEN** a diff with 500 code lines, a file no part owns and 2 changes, and a diff with 0 changes
- **WHEN** review-time runs without the key and with `enforce: error`
- **THEN** it reports warnings and exits 0, then errors and exits 1
- **TEST** `test/review.test.mjs::review-time SHALL report each finding as a warning and exit 0 for it unless openspec/config.yaml sets sandy-skills.enforce: error, which keeps each severity and exits 1 for an error.`
