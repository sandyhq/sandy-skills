# sandy-skills Specification

## Purpose
Gives repos where people and AI agents build together one set of standards and the tools that check them.

Kind: system · Part of: none · Carried by: nesyeklaf · Status: active · Code: standards/, README.md, .github/, scripts/, LICENSE, .gitignore, .agents/, .claude/

## Requirements

### Requirement: Contract
The repository SHALL hold the standards, the proven schema, the sandy-skills CLI and the skills, and check each of them in CI.

#### Scenario: Contract
- **GIVEN** the repository
- **WHEN** CI runs on the repository
- **THEN** the standards, schema, checker and skills are present and checked
- **TEST** `test/repo.test.mjs::The repository SHALL hold the standards, the proven schema, the sandy-skills CLI and the skills, and check each of them in CI.`

### Requirement: Sources only
Only standards/sources.md SHALL name the projects listed under its heading Concepts adopted without their tools.

#### Scenario: Sources only
- **GIVEN** a file other than standards/sources.md names an adopted project
- **WHEN** the repository test runs
- **THEN** the repository test fails
- **TEST** `test/repo.test.mjs::Only standards/sources.md SHALL name the projects listed under its heading Concepts adopted without their tools.`

### Requirement: Package
The npm package SHALL contain the CLI, the proven schema, the skills and the standards, and no tests.

#### Scenario: Package
- **GIVEN** the repository
- **WHEN** the package is packed
- **THEN** it holds bin/, src/, skills/, the schema and standards/, and no test files
- **TEST** `test/repo.test.mjs::The npm package SHALL contain the CLI, the proven schema, the skills and the standards, and no tests.`

### Requirement: One owner per file
Each code file that git tracks in this repository SHALL lie under the Code paths of exactly 1 part.

#### Scenario: One owner per file
- **GIVEN** the repository
- **WHEN** the repository test runs
- **THEN** each tracked code file has exactly 1 owner part
- **TEST** `test/repo.test.mjs::Each code file that git tracks in this repository SHALL lie under the Code paths of exactly 1 part.`

### Requirement: Docs wording
README.md, CHANGELOG.md and the Markdown files in docs/, standards/ and skills/ SHALL hold no vague word and, outside standards/glossary.md, no word from a Not line of the glossary.

#### Scenario: Docs wording
- **GIVEN** the docs, standards and skills of this repository
- **WHEN** the repository test runs
- **THEN** it finds no vague word and no word from a Not line
- **TEST** `test/repo.test.mjs::README.md, CHANGELOG.md and the Markdown files in docs/, standards/ and skills/ SHALL hold no vague word and, outside standards/glossary.md, no word from a Not line of the glossary.`
