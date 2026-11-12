## ADDED Requirements

### Requirement: Requirements in prose
The checker SHALL count only requirement headings outside fenced code and HTML comments.

#### Scenario: Requirements in prose
- **WHEN** a delta spec has 1 requirement and 8 requirement headings in a code fence and a comment
- **THEN** check counts 1 requirement
- **TEST** `test/limits.test.mjs::The checker SHALL count only requirement headings outside fenced code and HTML comments.`
