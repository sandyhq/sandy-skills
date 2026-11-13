# glossary Specification

## Purpose
Fixes 1 word for each thing, so that no reader of a spec or a change has to guess.

Kind: component · Part of: cli · Carried by: nesyeklaf · Status: active · Code: src/glossary.mjs, standards/glossary.md

## Requirements

### Requirement: Contract
The glossary SHALL give each thing of the standard exactly 1 word, and check SHALL block the other words for it.

#### Scenario: Contract
- **GIVEN** a spec with each Not word of standards/glossary.md
- **WHEN** check runs
- **THEN** it blocks each one
- **TEST** `test/glossary.test.mjs::The glossary SHALL give each thing of the standard exactly 1 word, and check SHALL block the other words for it.`

### Requirement: Entries
check SHALL read each glossary entry as a level 2 heading with the word, 1 definition and an optional line Not: with the words that name the same thing.

#### Scenario: Entries
- **GIVEN** a glossary with the entry seam and the line `Not: contract between parts`
- **WHEN** check runs
- **THEN** it knows 1 word and 1 Not word
- **TEST** `test/glossary.test.mjs::check SHALL read each glossary entry as a level 2 heading with the word, 1 definition and an optional line Not: with the words that name the same thing.`

### Requirement: Wrong term
check SHALL report wrong-term as an error with file, line, word and glossary word when a spec or an open change uses a word from a Not line outside code and backticks, and outside headings for a word marked except headings.

#### Scenario: Wrong term
- **GIVEN** proposal.md of an open change says `contract between parts` in line 4
- **WHEN** check runs
- **THEN** it reports wrong-term at line 4 and names seam
- **TEST** `test/glossary.test.mjs::check SHALL report wrong-term as an error with file, line, word and glossary word when a spec or an open change uses a word from a Not line outside code and backticks, and outside headings for a word marked except headings.`

### Requirement: Repo words win
check SHALL read standards/glossary.md from the installed package and docs/glossary.md from the repo, and SHALL never report a word that docs/glossary.md defines.

#### Scenario: Repo words win
- **GIVEN** docs/glossary.md defines `PR` as a word of the domain
- **WHEN** check runs on a spec with `PR`
- **THEN** it reports nothing
- **TEST** `test/glossary.test.mjs::check SHALL read standards/glossary.md from the installed package and docs/glossary.md from the repo, and SHALL never report a word that docs/glossary.md defines.`

### Requirement: Prose only
check SHALL read for wrong-term only the prose of Markdown, never indented code or the address of a link, image or URL, while a link label counts as prose and a setext heading as a heading.

#### Scenario: Prose only
- **GIVEN** a spec with `module` in indented code, in link and image addresses, in URLs, in a link label and under a setext heading `Requirement`
- **WHEN** check runs
- **THEN** it reports wrong-term only for the link label and the list text
- **TEST** `test/glossary.test.mjs::check SHALL read for wrong-term only the prose of Markdown, never indented code or the address of a link, image or URL, while a link label counts as prose and a setext heading as a heading.`

### Requirement: Wrapped terms
check SHALL find a Not term of 2 or more words across a soft line wrap and through emphasis within 1 paragraph, and report it at the line where it starts.

#### Scenario: Wrapped terms
- **GIVEN** a spec with `pull` and `request` on 2 lines of 1 paragraph, `contract *between* parts`, and `pull` and `request` in 2 list items
- **WHEN** check runs
- **THEN** it reports wrong-term at the first line of each paragraph term and none across the list items
- **TEST** `test/glossary.test.mjs::check SHALL find a Not term of 2 or more words across a soft line wrap and through emphasis within 1 paragraph, and report it at the line where it starts.`

### Requirement: Glossary headings
check SHALL read each level 2 heading of a glossary as CommonMark does, with up to 3 spaces before it and without its closing #, as the word it defines.

#### Scenario: Glossary headings
- **GIVEN** a docs/glossary.md with `## PR ##`, `   ## MR #` and `    ## story`
- **WHEN** check reads it
- **THEN** `PR` and `MR` are repo words and `story` stays a Not term
- **TEST** `test/glossary.test.mjs::check SHALL read each level 2 heading of a glossary as CommonMark does, with up to 3 spaces before it and without its closing #, as the word it defines.`
