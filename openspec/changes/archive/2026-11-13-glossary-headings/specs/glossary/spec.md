## ADDED Requirements

### Requirement: Glossary headings
check SHALL read each level 2 heading of a glossary as CommonMark does, with up to 3 spaces before it and without its closing #, as the word it defines.

#### Scenario: Glossary headings
- **GIVEN** a docs/glossary.md with `## PR ##`, `   ## MR #` and `    ## story`
- **WHEN** check reads it
- **THEN** `PR` and `MR` are repo words and `story` stays a Not term
- **TEST** `test/glossary.test.mjs::check SHALL read each level 2 heading of a glossary as CommonMark does, with up to 3 spaces before it and without its closing #, as the word it defines.`
