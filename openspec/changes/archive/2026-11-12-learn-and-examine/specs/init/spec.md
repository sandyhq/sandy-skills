## ADDED Requirements

### Requirement: Learning records stay local
When init or update runs, it SHALL add .learn/ to the repo's .gitignore once and keep the file's other lines.

#### Scenario: Learning records stay local
- **WHEN** init or update runs, with or without a .gitignore
- **THEN** it lists .learn/ exactly once and keeps its other lines
- **TEST** `test/init.test.mjs::When init or update runs, it SHALL add .learn/ to the repo's .gitignore once and keep the file's other lines.`
