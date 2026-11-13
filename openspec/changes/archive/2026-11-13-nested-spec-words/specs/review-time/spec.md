## MODIFIED Requirements

### Requirement: Nested spec
review-time SHALL read its parts from the spec files check reads: each spec under openspec/specs at any depth, as the part whose id is its folder path below openspec/specs, such as domain/service.

#### Scenario: Nested spec
- **GIVEN** openspec/specs/domain/service/spec.md owns src/, and a change with a delta spec for domain/service changes src/a.mjs
- **WHEN** check lists its spec files and review-time runs
- **THEN** both name the part domain/service, and review-time counts 1 part and reports no unowned-file
- **TEST** `test/review.test.mjs::review-time SHALL read its parts from the spec files check reads: each spec under openspec/specs at any depth, as the part whose id is its folder path below openspec/specs, such as domain/service.`
