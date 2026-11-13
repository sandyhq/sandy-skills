## ADDED Requirements

### Requirement: One Relation line
check SHALL report bad-relation as an error when a seam has 2 or more Relation lines, and SHALL keep each Relation line out of the claim sentence.

#### Scenario: One Relation line
- **GIVEN** a seam from cli to init with `Relation: conformist · Upstream: init` and a second line `Relation: friendship · Upstream: c`
- **WHEN** check runs
- **THEN** it reports bad-relation for that seam, and the claim sentence holds no Relation line
- **TEST** `test/check.test.mjs::check SHALL report bad-relation as an error when a seam has 2 or more Relation lines, and SHALL keep each Relation line out of the claim sentence.`
