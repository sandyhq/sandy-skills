## ADDED Requirements

### Requirement: Wrapped terms
check SHALL find a Not term of 2 or more words across a soft line wrap and through emphasis within 1 paragraph, and report it at the line where it starts.

#### Scenario: Wrapped terms
- **GIVEN** a spec with `pull` and `request` on 2 lines of 1 paragraph, `contract *between* parts`, and `pull` and `request` in 2 list items
- **WHEN** check runs
- **THEN** it reports wrong-term at the first line of each paragraph term and none across the list items
- **TEST** `test/glossary.test.mjs::check SHALL find a Not term of 2 or more words across a soft line wrap and through emphasis within 1 paragraph, and report it at the line where it starts.`
