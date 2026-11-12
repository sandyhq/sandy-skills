# sandy-skills Specification

## Purpose
Gives repos where people and AI agents build together one set of standards and the tools that check them.

Kind: system · Part of: none · Carried by: nesyeklaf · Status: active · Code: standards/, README.md, .github/

## Requirements

### Requirement: Contract
The repository SHALL hold the standards, the proven schema, the specproof checker and the skills, and check each of them in CI.

#### Scenario: Contract
- **WHEN** CI runs on the repository
- **THEN** the standards, schema, checker and skills are present and checked
- **TEST** `tests/repo.test.mjs::The repository SHALL hold the standards, the proven schema, the specproof checker and the skills, and check each of them in CI.`
