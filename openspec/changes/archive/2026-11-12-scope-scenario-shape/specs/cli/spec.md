## ADDED Requirements

### Requirement: Archive ignored
The checker SHALL check scenarios in openspec/specs and open changes, never in archived changes.

#### Scenario: Archive ignored
- **GIVEN** a scenario without GIVEN in a spec, an open change and an archive
- **WHEN** check runs
- **THEN** check reports the spec and the open change
- **TEST** `test/scenarios.test.mjs::The checker SHALL check scenarios in openspec/specs and open changes, never in archived changes.`
