## ADDED Requirements

### Requirement: Direct limits key
The checker SHALL read thresholds only from the limits key directly under sandy-skills, never from a limits key nested deeper.

#### Scenario: Direct limits key
- **WHEN** sandy-skills.reports.limits sets total to warn 1 and sandy-skills.limits sets total to warn 600
- **THEN** check uses 600
- **TEST** `test/limits.test.mjs::The checker SHALL read thresholds only from the limits key directly under sandy-skills, never from a limits key nested deeper.`
