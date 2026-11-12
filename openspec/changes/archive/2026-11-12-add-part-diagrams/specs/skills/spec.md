## MODIFIED Requirements

### Requirement: Seam to cli
The skills SHALL call only the sandy-skills commands check, hash, confirm and diagram. Read-only.

#### Scenario: Seam to cli
- **WHEN** a skill names a sandy-skills command
- **THEN** it is check, hash, confirm or diagram
- **TEST** `test/repo.test.mjs::The skills SHALL call only the sandy-skills commands check, hash, confirm and diagram. Read-only.`
