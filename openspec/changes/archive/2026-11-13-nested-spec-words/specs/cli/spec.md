## ADDED Requirements

### Requirement: Nested spec words
check SHALL read the scenarios and the words of each spec below openspec/specs at any depth, with its folder path as the id, as OpenSpec lists it.

#### Scenario: Nested spec words
- **GIVEN** openspec/specs/parent/a/spec.md with a scenario without GIVEN and the word `feature`
- **WHEN** check runs
- **THEN** it reports scenario-shape and wrong-term for parent/a with that file
- **TEST** `test/scenarios.test.mjs::check SHALL read the scenarios and the words of each spec below openspec/specs at any depth, with its folder path as the id, as OpenSpec lists it.`
