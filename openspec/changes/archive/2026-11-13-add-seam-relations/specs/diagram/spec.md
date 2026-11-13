## ADDED Requirements

### Requirement: Relation on arrow
The diagram SHALL write the relation of each seam on its arrow.

#### Scenario: Relation on arrow
- **GIVEN** the seam from cli to init with Relation: conformist · Upstream: init
- **WHEN** diagram runs
- **THEN** the arrow from cli to init reads conformist
- **TEST** `test/diagram.test.mjs::The diagram SHALL write the relation of each seam on its arrow.`
