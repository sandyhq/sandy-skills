# skills Specification

## Purpose
Teaches agents to work spec first, propose changes and get human confirmations in the proven format, and teaches and examines the people who own the repo until they can explain what was built.

Kind: component · Part of: sandy-skills · Carried by: nesyeklaf · Status: active · Code: skills/

## Requirements

### Requirement: Contract
Each skill SHALL have a SKILL.md whose name matches its folder and whose description says when to use it.

#### Scenario: Contract
- **WHEN** the skills are listed
- **THEN** each has a matching name and a description
- **TEST** `test/repo.test.mjs::Each skill SHALL have a SKILL.md whose name matches its folder and whose description says when to use it.`

### Requirement: Seam to cli
The skills SHALL call only the sandy-skills commands check, hash and confirm. Read-only.

#### Scenario: Seam to cli
- **WHEN** a skill names a sandy-skills command
- **THEN** it is check, hash or confirm
- **TEST** `test/repo.test.mjs::The skills SHALL call only the sandy-skills commands check, hash and confirm. Read-only.`

### Requirement: Exam line
The EXAMINED line that examine-part writes SHALL be the line confirm reads.

#### Scenario: Exam line
- **WHEN** the EXAMINED line in examine-part is filled in
- **THEN** confirm parses it
- **TEST** `test/repo.test.mjs::The EXAMINED line that examine-part writes SHALL be the line confirm reads.`
