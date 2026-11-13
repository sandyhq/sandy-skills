## ADDED Requirements

### Requirement: Template seam
A part written from the spec template SHALL pass check without missing-relation or bad-relation.

#### Scenario: Template seam
- **GIVEN** 2 parts written from the spec template, each with a seam to the other
- **WHEN** check runs
- **THEN** it reports neither missing-relation nor bad-relation
- **TEST** `test/repo.test.mjs::A part written from the spec template SHALL pass check without missing-relation or bad-relation.`
