## ADDED Requirements

### Requirement: Vague words
When a file of an open change uses a word of the default vague-word list, the checker SHALL report vague-word as an error with the file, line and word.

#### Scenario: Vague words
- **WHEN** proposal.md says `We should ship it soon, etc.`
- **THEN** check reports `should`, `etc` and `soon` with their line
- **TEST** `test/limits.test.mjs::When a file of an open change uses a word of the default vague-word list, the checker SHALL report vague-word as an error with the file, line and word.`

### Requirement: Own vague words
Where openspec/config.yaml sets sandy-skills.limits.vagueWords, the checker SHALL use that list instead of the default list.

#### Scenario: Own vague words
- **WHEN** vagueWords lists hurry and right away
- **THEN** check reports those two and no default word
- **TEST** `test/limits.test.mjs::Where openspec/config.yaml sets sandy-skills.limits.vagueWords, the checker SHALL use that list instead of the default list.`

### Requirement: Code is no prose
The checker SHALL skip fenced code, HTML comments, backticks and the keywords SHALL, WHEN, THEN, AND and GIVEN when it looks for vague words.

#### Scenario: Code is no prose
- **WHEN** a listed word stands in code, a comment, backticks or a keyword
- **THEN** check reports nothing
- **TEST** `test/limits.test.mjs::The checker SHALL skip fenced code, HTML comments, backticks and the keywords SHALL, WHEN, THEN, AND and GIVEN when it looks for vague words.`
