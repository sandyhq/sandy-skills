## ADDED Requirements

### Requirement: One owner per file
Each code file that git tracks in this repository SHALL lie under the Code paths of exactly 1 part.

#### Scenario: One owner per file
- **GIVEN** the repository
- **WHEN** the repository test runs
- **THEN** each tracked code file has exactly 1 owner part
- **TEST** `test/repo.test.mjs::Each code file that git tracks in this repository SHALL lie under the Code paths of exactly 1 part.`
