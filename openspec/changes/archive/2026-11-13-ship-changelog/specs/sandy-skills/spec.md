## MODIFIED Requirements

### Requirement: Package
The npm package SHALL contain the CLI, the proven schema, the skills, the standards and CHANGELOG.md, and no tests.

#### Scenario: Package
- **GIVEN** the repository
- **WHEN** the package is packed
- **THEN** it holds bin/, src/, skills/, the schema, standards/ and CHANGELOG.md, and no test files
- **TEST** `test/repo.test.mjs::The npm package SHALL contain the CLI, the proven schema, the skills, the standards and CHANGELOG.md, and no tests.`
