## ADDED Requirements

### Requirement: Quoted config values
The checker SHALL read quoted config values with commas and # as one value, and stop with a message naming the line for config syntax it does not read.

#### Scenario: Quoted config values
- **WHEN** vagueWords lists `"maybe, later"` and `"right # away"`, or a list runs over 2 lines
- **THEN** check reads 2 words, or stops and names the line
- **TEST** `test/limits.test.mjs::The checker SHALL read quoted config values with commas and # as one value, and stop with a message naming the line for config syntax it does not read.`
