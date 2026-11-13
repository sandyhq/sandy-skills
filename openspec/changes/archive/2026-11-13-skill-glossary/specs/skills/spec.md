## MODIFIED Requirements

### Requirement: Seam to cli
The skills SHALL call only the sandy-skills commands check, hash, confirm, diagram, review-time and validate. Read-only.
Relation: open-host-service · Upstream: cli

#### Scenario: Seam to cli
- **GIVEN** a skill names a sandy-skills command
- **WHEN** the repository test runs
- **THEN** it is check, hash, confirm, diagram, review-time or validate
- **TEST** `test/repo.test.mjs::The skills SHALL call only the sandy-skills commands check, hash, confirm, diagram, review-time and validate. Read-only.`
