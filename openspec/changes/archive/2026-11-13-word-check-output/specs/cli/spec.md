## ADDED Requirements

### Requirement: Glossary words in output
check SHALL word each finding and the report with glossary words, never with a word from a Not line.

#### Scenario: Glossary words in output
- **GIVEN** specs with a claim mismatch, no Contract, a seam without a Relation line and an open change with 8 claims
- **WHEN** check runs
- **THEN** no finding and no line of the report holds a word from a Not line
- **TEST** `test/check.test.mjs::check SHALL word each finding and the report with glossary words, never with a word from a Not line.`

### Requirement: Claims key
check SHALL read the limit on claims per change from the key claims of sandy-skills.limits, and from its older key of 0.5 and 0.6.

#### Scenario: Claims key
- **GIVEN** a config with `claims: { error: 6 }` or `requirements: { warn: 2 }`
- **WHEN** check reads it
- **THEN** the claims limit is 5 / 6 or 2 / 7
- **TEST** `test/limits.test.mjs::check SHALL read the limit on claims per change from the key claims of sandy-skills.limits, and from its older key of 0.5 and 0.6.`
