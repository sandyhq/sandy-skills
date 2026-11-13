## ADDED Requirements

### Requirement: Repo word forms
check SHALL never report the singular or the plural of a word that docs/glossary.md defines.

#### Scenario: Repo word forms
- **GIVEN** a docs/glossary.md defining `PRs`, and another defining `stories`
- **WHEN** check runs on a spec with `PRs` and `PR`, and on one with `story`
- **THEN** it reports nothing, while a repo word `PRO` leaves `PR` reported
- **TEST** `test/glossary.test.mjs::check SHALL never report the singular or the plural of a word that docs/glossary.md defines.`
