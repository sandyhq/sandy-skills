## ADDED Requirements

### Requirement: Sources only
Only standards/sources.md SHALL name the projects listed under its heading Concepts adopted without their tools.

#### Scenario: Sources only
- **WHEN** a file other than standards/sources.md names an adopted project
- **THEN** the repository test fails
- **TEST** `tests/repo.test.mjs::Only standards/sources.md SHALL name the projects listed under its heading Concepts adopted without their tools.`
