## MODIFIED Requirements

### Requirement: Seam to cli
The skills SHALL call only the sandy-skills commands check, hash, confirm, diagram and validate. Read-only.

#### Scenario: Seam to cli
- **WHEN** a skill names a sandy-skills command
- **THEN** it is check, hash, confirm, diagram or validate
- **TEST** `test/repo.test.mjs::The skills SHALL call only the sandy-skills commands check, hash, confirm, diagram and validate. Read-only.`
