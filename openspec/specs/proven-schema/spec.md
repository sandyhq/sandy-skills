# proven-schema Specification

## Purpose
Lets every OpenSpec change in an adopting repo be written as claims with named tests, so sandy-skills check can check it.

Kind: component · Part of: sandy-skills · Carried by: nesyeklaf · Status: active · Code: openspec/schemas/proven/

## Requirements

### Requirement: Contract
The proven schema SHALL pass OpenSpec schema validation and tell agents to write each part with a metadata line, a Contract and TEST lines.

#### Scenario: Contract
- **WHEN** OpenSpec validates the schema
- **THEN** it is valid and states the part format
- **TEST** `test/repo.test.mjs::The proven schema SHALL pass OpenSpec schema validation and tell agents to write each part with a metadata line, a Contract and TEST lines.`

### Requirement: File shapes
The proven schema SHALL give proposal, design and tasks fixed sections with the owner's part first, and link each artifact to standards/changes.md.

#### Scenario: File shapes
- **WHEN** an agent reads the templates and the instructions
- **THEN** the headings come in the fixed order and each artifact links the standard
- **TEST** `test/repo.test.mjs::The proven schema SHALL give proposal, design and tasks fixed sections with the owner's part first, and link each artifact to standards/changes.md.`
