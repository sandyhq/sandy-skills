## ADDED Requirements

### Requirement: Comments and fences in order
The checker SHALL read HTML comments and fences in document order, so a fence inside a comment and a comment opener inside a fence hide no prose after them.

#### Scenario: Comments and fences in order
- **WHEN** a comment holds a fence opener, and line 4 says `We should ship soon.`
- **THEN** check reports `should` and `soon` on line 4
- **TEST** `test/limits.test.mjs::The checker SHALL read HTML comments and fences in document order, so a fence inside a comment and a comment opener inside a fence hide no prose after them.`
