## ADDED Requirements

### Requirement: Nested spec
review-time SHALL read each spec under openspec/specs at any depth as the part whose id is its folder path below openspec/specs, such as domain/service.

#### Scenario: Nested spec
- **GIVEN** openspec/specs/domain/service/spec.md owns src/, and a change with a delta spec for domain/service changes src/a.mjs
- **WHEN** review-time runs
- **THEN** it counts 1 part domain/service and reports no unowned-file
- **TEST** `test/review.test.mjs::review-time SHALL read each spec under openspec/specs at any depth as the part whose id is its folder path below openspec/specs, such as domain/service.`
