## ADDED Requirements

### Requirement: Own thresholds
Where openspec/config.yaml sets sandy-skills.limits, the checker SHALL use those thresholds, and openspec validate SHALL still accept the file.

#### Scenario: Own thresholds
- **WHEN** openspec/config.yaml sets warn 10 and error 20 for every measure
- **THEN** check uses 10 and 20, and openspec validate passes
- **TEST** `test/limits.test.mjs::Where openspec/config.yaml sets sandy-skills.limits, the checker SHALL use those thresholds, and openspec validate SHALL still accept the file.`

### Requirement: Partial override
If sandy-skills.limits sets only part of the thresholds, then the checker SHALL take each missing key and field from the defaults.

#### Scenario: Partial override
- **WHEN** openspec/config.yaml sets proposal warn 100 only
- **THEN** proposal blocks above 225 and every other measure keeps its default
- **TEST** `test/limits.test.mjs::If sandy-skills.limits sets only part of the thresholds, then the checker SHALL take each missing key and field from the defaults.`
