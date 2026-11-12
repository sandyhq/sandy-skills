## ADDED Requirements

### Requirement: Multi-line code spans
The checker SHALL skip a backtick code span that runs over 2 or more lines of one paragraph when it looks for vague words.

#### Scenario: Multi-line code spans
- **WHEN** proposal.md says `Run ` and a code span over 2 lines that holds a listed word
- **THEN** check reports nothing
- **TEST** `test/limits.test.mjs::The checker SHALL skip a backtick code span that runs over 2 or more lines of one paragraph when it looks for vague words.`
