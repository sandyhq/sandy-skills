## ADDED Requirements

### Requirement: Docs wording
README.md, CHANGELOG.md and the Markdown files in docs/, standards/ and skills/ SHALL hold no vague word and, outside standards/glossary.md, no word from a Not line of the glossary.

#### Scenario: Docs wording
- **GIVEN** the docs, standards and skills of this repository
- **WHEN** the repository test runs
- **THEN** it finds no vague word and no word from a Not line
- **TEST** `test/repo.test.mjs::README.md, CHANGELOG.md and the Markdown files in docs/, standards/ and skills/ SHALL hold no vague word and, outside standards/glossary.md, no word from a Not line of the glossary.`
