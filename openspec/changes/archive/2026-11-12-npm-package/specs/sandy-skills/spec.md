## ADDED Requirements

### Requirement: Package
The npm package SHALL contain the CLI, the proven schema, the skills and the standards, and no tests.

#### Scenario: Package
- **WHEN** the package is packed
- **THEN** it holds bin/, src/, skills/, the schema and standards/, and no test files
- **TEST** `test/repo.test.mjs::The npm package SHALL contain the CLI, the proven schema, the skills and the standards, and no tests.`
