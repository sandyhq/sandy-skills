## ADDED Requirements

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
