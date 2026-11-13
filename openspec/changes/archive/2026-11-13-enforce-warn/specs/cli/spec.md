## ADDED Requirements

### Requirement: Warnings by default
check and validate SHALL report each finding of check as a warning and exit 0 for it, also with --strict, unless openspec/config.yaml sets sandy-skills.enforce: error.

#### Scenario: Warnings by default
- **GIVEN** a repo with 1 finding of each kind and no enforce key
- **WHEN** check, check --strict and validate --all --strict run
- **THEN** each finding is a warning, the report says Releasable and each exits 0
- **TEST** `test/cli.test.mjs::check and validate SHALL report each finding of check as a warning and exit 0 for it, also with --strict, unless openspec/config.yaml sets sandy-skills.enforce: error.`

### Requirement: Enforce error
Where openspec/config.yaml sets sandy-skills.enforce: error, check and validate SHALL keep the severity of each finding and exit 1 for an error, as 0.7.0 did.

#### Scenario: Enforce error
- **GIVEN** the same repo with `enforce: error`
- **WHEN** check and validate run
- **THEN** each finding has its 0.7.0 severity and each exits 1
- **TEST** `test/cli.test.mjs::Where openspec/config.yaml sets sandy-skills.enforce: error, check and validate SHALL keep the severity of each finding and exit 1 for an error, as 0.7.0 did.`
