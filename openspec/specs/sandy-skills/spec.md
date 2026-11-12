# sandy-skills Specification

## Purpose
Gives repos where people and AI agents build together one set of standards and the tools that check them.

Kind: system · Part of: none · Carried by: nesyeklaf · Status: active · Code: standards/, README.md, .github/

## Requirements

### Requirement: Contract
The repository SHALL hold the standards, the proven schema, the sandy-skills CLI and the skills, and check each of them in CI.

#### Scenario: Contract
- **WHEN** CI runs on the repository
- **THEN** the standards, schema, checker and skills are present and checked
- **TEST** `test/repo.test.mjs::The repository SHALL hold the standards, the proven schema, the sandy-skills CLI and the skills, and check each of them in CI.`

### Requirement: Sources only
Only standards/sources.md SHALL name the projects listed under its heading Concepts adopted without their tools.

#### Scenario: Sources only
- **WHEN** a file other than standards/sources.md names an adopted project
- **THEN** the repository test fails
- **TEST** `test/repo.test.mjs::Only standards/sources.md SHALL name the projects listed under its heading Concepts adopted without their tools.`

### Requirement: Package
The npm package SHALL contain the CLI, the proven schema, the skills and the standards, and no tests.

#### Scenario: Package
- **WHEN** the package is packed
- **THEN** it holds bin/, src/, skills/, the schema and standards/, and no test files
- **TEST** `test/repo.test.mjs::The npm package SHALL contain the CLI, the proven schema, the skills and the standards, and no tests.`
