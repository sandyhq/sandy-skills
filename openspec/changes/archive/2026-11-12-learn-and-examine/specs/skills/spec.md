## ADDED Requirements

### Requirement: Exam line
The EXAMINED line that examine-part writes SHALL be the line confirm reads.

#### Scenario: Exam line
- **WHEN** the EXAMINED line in examine-part is filled in
- **THEN** confirm parses it
- **TEST** `test/repo.test.mjs::The EXAMINED line that examine-part writes SHALL be the line confirm reads.`
