## ADDED Requirements

### Requirement: Not adopted
When a spec has no metadata line, Contract, seam, TEST or CONFIRMED line, the checker SHALL report it as not-adopted with a warning instead of errors.

#### Scenario: Not adopted
- **WHEN** a spec has none of the format's lines
- **THEN** the checker warns not-adopted and reports no error for it
- **TEST** `test/check.test.mjs::When a spec has no metadata line, Contract, seam, TEST or CONFIRMED line, the checker SHALL report it as not-adopted with a warning instead of errors.`
