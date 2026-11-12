## ADDED Requirements

### Requirement: Missing step
If a scenario misses a GIVEN, WHEN, THEN or TEST line, then the checker SHALL report the error scenario-shape with file and line.

#### Scenario: Missing step
- **GIVEN** a scenario without GIVEN
- **WHEN** check runs
- **THEN** check reports scenario-shape and is not releasable
- **TEST** `test/scenarios.test.mjs::If a scenario misses a GIVEN, WHEN, THEN or TEST line, then the checker SHALL report the error scenario-shape with file and line.`

### Requirement: Wrong order
When the lines of a scenario are out of order, the checker SHALL report the error scenario-shape with file and line.

#### Scenario: Wrong order
- **GIVEN** a scenario with WHEN before GIVEN
- **WHEN** check runs
- **THEN** check reports scenario-shape
- **TEST** `test/scenarios.test.mjs::When the lines of a scenario are out of order, the checker SHALL report the error scenario-shape with file and line.`

### Requirement: AND lines
The checker SHALL accept AND lines after GIVEN, WHEN or THEN.

#### Scenario: AND lines
- **GIVEN** a scenario with AND after GIVEN, WHEN and THEN
- **WHEN** check runs
- **THEN** check reports no scenario-shape
- **TEST** `test/scenarios.test.mjs::The checker SHALL accept AND lines after GIVEN, WHEN or THEN.`
