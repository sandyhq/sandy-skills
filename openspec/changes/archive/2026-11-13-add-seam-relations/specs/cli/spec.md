## ADDED Requirements

### Requirement: Bad relation
check SHALL report bad-relation as an error when a Relation line names a value outside the 7 values of the glossary or an upstream that is neither part of its seam.

#### Scenario: Bad relation
- **GIVEN** the seam from cli to init with Relation: conformist · Upstream: diagram
- **WHEN** check runs
- **THEN** it reports bad-relation and names diagram
- **TEST** `test/check.test.mjs::check SHALL report bad-relation as an error when a Relation line names a value outside the 7 values of the glossary or an upstream that is neither part of its seam.`

### Requirement: Missing relation
check SHALL report missing-relation as an error for a seam without a Relation line.

#### Scenario: Missing relation
- **GIVEN** a seam without a Relation line
- **WHEN** check runs
- **THEN** it reports missing-relation as an error
- **TEST** `test/check.test.mjs::check SHALL report missing-relation as an error for a seam without a Relation line.`
