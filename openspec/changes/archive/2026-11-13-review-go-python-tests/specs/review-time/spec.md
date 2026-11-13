## ADDED Requirements

### Requirement: Go and Python tests
review-time SHALL count Go files ending in _test.go and Python files named test_*.py or *_test.py as tests, never as code lines.

#### Scenario: Go and Python tests
- **GIVEN** a change with a delta spec for service changes src/a.go (3 lines), src/contest.py (2 lines), src/a_test.go (400 lines), src/test_a.py (50 lines) and src/a_test.py (60 lines)
- **WHEN** review-time runs
- **THEN** it counts 5 code lines
- **TEST** `test/review.test.mjs::review-time SHALL count Go files ending in _test.go and Python files named test_*.py or *_test.py as tests, never as code lines.`
