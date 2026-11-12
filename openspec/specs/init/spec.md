# init Specification

## Purpose
Puts the standard into a repo from the npm package alone, next to what OpenSpec installed, so adopting needs no clone of this repo.

Kind: component · Part of: cli · Carried by: nesyeklaf · Status: active · Code: src/install.mjs

## Requirements

### Requirement: Contract
init SHALL set up OpenSpec when the repo has none, make proven its default schema and install the skills where OpenSpec installed its own.

#### Scenario: Contract
- **WHEN** init runs in a repo without OpenSpec
- **THEN** OpenSpec is set up, proven is the default schema and the skills sit next to OpenSpec's
- **TEST** `test/init.test.mjs::init SHALL set up OpenSpec when the repo has none, make proven its default schema and install the skills where OpenSpec installed its own.`

### Requirement: Links like OpenSpec
When OpenSpec linked an agent's skills to another directory, init SHALL link the skills the same way.

#### Scenario: Links like OpenSpec
- **WHEN** OpenSpec's skills in an agent directory are links
- **THEN** the skills there are links to the same directory
- **TEST** `test/init.test.mjs::When OpenSpec linked an agent's skills to another directory, init SHALL link the skills the same way.`

### Requirement: Update
update SHALL replace the schema and the skills with this version's and keep the rest of openspec/config.yaml.

#### Scenario: Update
- **WHEN** the schema or a skill was changed locally and update runs
- **THEN** both are this version's again and config.yaml keeps its other lines
- **TEST** `test/init.test.mjs::update SHALL replace the schema and the skills with this version's and keep the rest of openspec/config.yaml.`

### Requirement: Update needs OpenSpec
If the repo has no openspec directory, then update SHALL fail and change nothing.

#### Scenario: Update needs OpenSpec
- **WHEN** update runs in a repo without openspec/
- **THEN** it exits non-zero and writes nothing
- **TEST** `test/init.test.mjs::If the repo has no openspec directory, then update SHALL fail and change nothing.`
