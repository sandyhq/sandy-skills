## ADDED Requirements

### Requirement: Exam before I
confirm SHALL print an I confirmation only when the person passed the exam on the part's current contract within the last 90 days.

#### Scenario: Exam before I
- **WHEN** confirm is asked for the I side
- **THEN** it prints the line only with a passed, current exam on the current contract, and otherwise exits non-zero and says why
- **TEST** `test/cli.test.mjs::confirm SHALL print an I confirmation only when the person passed the exam on the part's current contract within the last 90 days.`
