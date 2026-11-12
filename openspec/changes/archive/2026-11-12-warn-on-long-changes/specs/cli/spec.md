## ADDED Requirements

### Requirement: Default thresholds
If openspec/config.yaml sets no sandy-skills.limits, then the checker SHALL use the default warn and error thresholds.

#### Scenario: Default thresholds
- **WHEN** openspec/config.yaml has no sandy-skills.limits
- **THEN** check warns above 500 words per change and blocks above 750
- **TEST** `test/limits.test.mjs::If openspec/config.yaml sets no sandy-skills.limits, then the checker SHALL use the default warn and error thresholds.`

### Requirement: Warn band
When a measure of an open change is above its warn threshold and at most its error threshold, the checker SHALL report long-change as a warning.

#### Scenario: Warn band
- **WHEN** proposal.md of an open change has 151 words
- **THEN** check reports long-change and stays releasable
- **TEST** `test/limits.test.mjs::When a measure of an open change is above its warn threshold and at most its error threshold, the checker SHALL report long-change as a warning.`

### Requirement: Error band
When a measure of an open change is above its error threshold, the checker SHALL report over-limit as an error with the file, the count and the threshold.

#### Scenario: Error band
- **WHEN** proposal.md of an open change has 226 words
- **THEN** check reports over-limit with the file, 226 and 225, and is not releasable
- **TEST** `test/limits.test.mjs::When a measure of an open change is above its error threshold, the checker SHALL report over-limit as an error with the file, the count and the threshold.`
