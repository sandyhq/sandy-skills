# init Specification

## Purpose
Puts the standard into a repo from the npm package alone, next to what OpenSpec installed, so adopting needs no clone of this repo.

Kind: component · Part of: cli · Carried by: nesyeklaf · Status: active · Code: src/install.mjs

## Requirements

### Requirement: Contract
init SHALL set up OpenSpec when the repo has none, make proven its default schema and install the skills where OpenSpec installed its own.

#### Scenario: Contract
- **GIVEN** a repo without OpenSpec
- **WHEN** init runs
- **THEN** OpenSpec is set up, proven is the default schema and the skills sit next to OpenSpec's
- **TEST** `test/init.test.mjs::init SHALL set up OpenSpec when the repo has none, make proven its default schema and install the skills where OpenSpec installed its own.`

### Requirement: Links like OpenSpec
When OpenSpec linked an agent's skills to another directory, init SHALL link the skills the same way.

#### Scenario: Links like OpenSpec
- **GIVEN** OpenSpec's skills in an agent directory are links
- **WHEN** init runs
- **THEN** the skills there are links to the same directory
- **TEST** `test/init.test.mjs::When OpenSpec linked an agent's skills to another directory, init SHALL link the skills the same way.`

### Requirement: Update
update SHALL replace the schema and the skills with this version's and keep the rest of openspec/config.yaml.

#### Scenario: Update
- **GIVEN** the schema or a skill was changed locally
- **WHEN** update runs
- **THEN** both are this version's again and config.yaml keeps its other lines
- **TEST** `test/init.test.mjs::update SHALL replace the schema and the skills with this version's and keep the rest of openspec/config.yaml.`

### Requirement: Update needs OpenSpec
If the repo has no openspec directory, then update SHALL fail and change nothing.

#### Scenario: Update needs OpenSpec
- **GIVEN** a repo without openspec/
- **WHEN** update runs
- **THEN** it exits non-zero and writes nothing
- **TEST** `test/init.test.mjs::If the repo has no openspec directory, then update SHALL fail and change nothing.`

### Requirement: Learning records stay local
When init or update runs, it SHALL add .learn/ to the repo's .gitignore once and keep the file's other lines.

#### Scenario: Learning records stay local
- **GIVEN** a repo with or without a .gitignore
- **WHEN** init or update runs
- **THEN** it lists .learn/ exactly once and keeps its other lines
- **TEST** `test/init.test.mjs::When init or update runs, it SHALL add .learn/ to the repo's .gitignore once and keep the file's other lines.`
