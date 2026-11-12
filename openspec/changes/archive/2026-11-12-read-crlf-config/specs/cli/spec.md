## ADDED Requirements

### Requirement: CRLF config
The checker SHALL read openspec/config.yaml with CRLF line endings the same as with LF line endings.

#### Scenario: CRLF config
- **WHEN** openspec/config.yaml sets total to warn 600 and error 900 with CRLF line endings
- **THEN** check uses 600 and 900
- **TEST** `test/limits.test.mjs::The checker SHALL read openspec/config.yaml with CRLF line endings the same as with LF line endings.`
