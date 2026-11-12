# skills Specification

## Purpose
Teaches agents to work spec first, propose changes and get human confirmations in the proven format.

Kind: component · Part of: sandy-skills · Carried by: nesyeklaf · Status: active · Code: skills/

## Requirements

### Requirement: Contract
Each skill SHALL have a SKILL.md whose name matches its folder and whose description says when to use it.

#### Scenario: Contract
- **WHEN** the skills are listed
- **THEN** each has a matching name and a description
- **TEST** `tests/repo.test.mjs::Each skill SHALL have a SKILL.md whose name matches its folder and whose description says when to use it.`

### Requirement: Seam to specproof
The skills SHALL call only the specproof commands check, hash and confirm. Read-only.

#### Scenario: Seam to specproof
- **WHEN** a skill names a specproof command
- **THEN** it is check, hash or confirm
- **TEST** `tests/repo.test.mjs::The skills SHALL call only the specproof commands check, hash and confirm. Read-only.`
