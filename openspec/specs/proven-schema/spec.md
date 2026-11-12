# proven-schema Specification

## Purpose
Lets every OpenSpec change in an adopting repo be written as claims with named tests, so specproof can check it.

Kind: component · Part of: sandy-skills · Carried by: nesyeklaf · Status: active · Code: openspec/schemas/proven/

## Requirements

### Requirement: Contract
The proven schema SHALL pass OpenSpec schema validation and tell agents to write each part with a metadata line, a Contract and TEST lines.

#### Scenario: Contract
- **WHEN** OpenSpec validates the schema
- **THEN** it is valid and states the part format
- **TEST** `tests/repo.test.mjs::The proven schema SHALL pass OpenSpec schema validation and tell agents to write each part with a metadata line, a Contract and TEST lines.`
