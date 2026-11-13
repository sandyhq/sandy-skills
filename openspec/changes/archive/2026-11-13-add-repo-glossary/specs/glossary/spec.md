## ADDED Requirements

### Requirement: Repo words win
check SHALL read standards/glossary.md from the installed package and docs/glossary.md from the repo, and SHALL never report a word that docs/glossary.md defines.

#### Scenario: Repo words win
- **GIVEN** docs/glossary.md defines `PR` as a word of the domain
- **WHEN** check runs on a spec with `PR`
- **THEN** it reports nothing
- **TEST** `test/glossary.test.mjs::check SHALL read standards/glossary.md from the installed package and docs/glossary.md from the repo, and SHALL never report a word that docs/glossary.md defines.`
