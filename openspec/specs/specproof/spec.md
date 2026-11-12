# specproof Specification

## Purpose
Computes from the specs and the test report which parts are proven, so that a release carries evidence instead of a promise.

Kind: container · Part of: sandy-skills · Carried by: nesyeklaf · Status: active · Code: tools/specproof/

## Requirements

### Requirement: Contract
The checker SHALL compute lights, drift and a releasability report from OpenSpec specs and JUnit reports, and exit non-zero when the result is not releasable.

#### Scenario: Contract
- **WHEN** the checker runs on specs and JUnit reports
- **THEN** it prints the report and exits 0 only when releasable
- **TEST** `tools/specproof/test/cli.test.mjs::The checker SHALL compute lights, drift and a releasability report from OpenSpec specs and JUnit reports, and exit non-zero when the result is not releasable.`

### Requirement: Same input, same report
When run on the same specs, report and date, the checker SHALL print the same report.

#### Scenario: Same input, same report
- **WHEN** it runs twice on the same specs, report and date
- **THEN** both reports are identical
- **TEST** `tools/specproof/test/cli.test.mjs::When run on the same specs, report and date, the checker SHALL print the same report.`

### Requirement: JUnit parsing
The checker SHALL read test results from JUnit XML, including attribute values that contain angle brackets.

#### Scenario: JUnit parsing
- **WHEN** a report has failed, todo and skipped tests and escaped attributes
- **THEN** each test gets its status and its message
- **TEST** `tools/specproof/test/parse.test.mjs::The checker SHALL read test results from JUnit XML, including attribute values that contain angle brackets.`

### Requirement: Hash ignores whitespace
The contract hash SHALL ignore whitespace in the contract sentence.

#### Scenario: Hash ignores whitespace
- **WHEN** a contract sentence is rewrapped
- **THEN** its hash stays the same
- **TEST** `tools/specproof/test/parse.test.mjs::The contract hash SHALL ignore whitespace in the contract sentence.`

### Requirement: Malformed lines
If a TEST, CONFIRMED or metadata line is malformed, then the checker SHALL report it as an error.

#### Scenario: Malformed lines
- **WHEN** a TEST, CONFIRMED or metadata line has the wrong shape
- **THEN** the checker reports an error
- **TEST** `tools/specproof/test/parse.test.mjs::If a TEST, CONFIRMED or metadata line is malformed, then the checker SHALL report it as an error.`

### Requirement: Passing test
When a referenced test passed, the checker SHALL light the requirement hard.

#### Scenario: Passing test
- **WHEN** the referenced test passed
- **THEN** the requirement is hard
- **TEST** `tools/specproof/test/check.test.mjs::When a referenced test passed, the checker SHALL light the requirement hard.`

### Requirement: Failing test
When a referenced test failed, the checker SHALL report a break and light the requirement refuted.

#### Scenario: Failing test
- **WHEN** the referenced test failed
- **THEN** the checker reports a break
- **TEST** `tools/specproof/test/check.test.mjs::When a referenced test failed, the checker SHALL report a break and light the requirement refuted.`

### Requirement: Missing test
If a TEST line names a test that the report does not contain, then the checker SHALL report missing-test as an error.

#### Scenario: Missing test
- **WHEN** a TEST line names a test the report lacks
- **THEN** the checker reports missing-test
- **TEST** `tools/specproof/test/check.test.mjs::If a TEST line names a test that the report does not contain, then the checker SHALL report missing-test as an error.`

### Requirement: Claim mismatch
When a test name is a sentence that differs from its requirement, the checker SHALL report claim-mismatch.

#### Scenario: Claim mismatch
- **WHEN** a test's sentence differs from its requirement
- **THEN** the checker reports claim-mismatch
- **TEST** `tools/specproof/test/check.test.mjs::When a test name is a sentence that differs from its requirement, the checker SHALL report claim-mismatch.`

### Requirement: Todo outside a change
When a todo test is listed in no open change, the checker SHALL report todo-outside-change as a warning.

#### Scenario: Todo outside a change
- **WHEN** a todo test is in no open change
- **THEN** the checker warns todo-outside-change
- **TEST** `tools/specproof/test/check.test.mjs::When a todo test is listed in no open change, the checker SHALL report todo-outside-change as a warning.`

### Requirement: Soft confirmation
When a person who does not carry the part confirms its current contract, the checker SHALL light that side soft.

#### Scenario: Soft confirmation
- **WHEN** a non-carrier confirms the current contract
- **THEN** that side is soft
- **TEST** `tools/specproof/test/check.test.mjs::When a person who does not carry the part confirms its current contract, the checker SHALL light that side soft.`

### Requirement: Claimed confirmation
When the part's carrier confirms its own contract, the checker SHALL light that side claimed.

#### Scenario: Claimed confirmation
- **WHEN** the carrier confirms
- **THEN** that side is claimed
- **TEST** `tools/specproof/test/check.test.mjs::When the part's carrier confirms its own contract, the checker SHALL light that side claimed.`

### Requirement: Changed contract
If the contract changes after a confirmation, then the checker SHALL light that side expired.

#### Scenario: Changed contract
- **WHEN** the contract changes after a confirmation
- **THEN** that side is expired
- **TEST** `tools/specproof/test/check.test.mjs::If the contract changes after a confirmation, then the checker SHALL light that side expired.`

### Requirement: Confirmation too long
If a confirmation is valid for more than 90 days, then the checker SHALL report confirmation-too-long.

#### Scenario: Confirmation too long
- **WHEN** a confirmation runs over 90 days
- **THEN** the checker reports confirmation-too-long
- **TEST** `tools/specproof/test/check.test.mjs::If a confirmation is valid for more than 90 days, then the checker SHALL report confirmation-too-long.`

### Requirement: Weakest side
The checker SHALL light a part as its weakest side, and drift when the part has a finding of its own.

#### Scenario: Weakest side
- **WHEN** a part has sides of different lights
- **THEN** the part shows the weakest, or drift
- **TEST** `tools/specproof/test/check.test.mjs::The checker SHALL light a part as its weakest side, and drift when the part has a finding of its own.`

### Requirement: Unknown parent or cycle
If Part of names no spec or leads back to the part, then the checker SHALL report unknown-parent or cycle.

#### Scenario: Unknown parent or cycle
- **WHEN** Part of is unknown or circular
- **THEN** the checker reports unknown-parent or cycle
- **TEST** `tools/specproof/test/check.test.mjs::If Part of names no spec or leads back to the part, then the checker SHALL report unknown-parent or cycle.`

### Requirement: Contradiction
When a part has an exclusive seam to a target that a part outside it writes to, the checker SHALL report a contradiction.

#### Scenario: Contradiction
- **WHEN** an exclusive seam's target has another writer outside
- **THEN** the checker reports a contradiction
- **TEST** `tools/specproof/test/check.test.mjs::When a part has an exclusive seam to a target that a part outside it writes to, the checker SHALL report a contradiction.`

### Requirement: Too many children
When a part has more than 7 children, the checker SHALL warn that a level may be missing.

#### Scenario: Too many children
- **WHEN** a part has more than 7 children
- **THEN** the checker warns
- **TEST** `tools/specproof/test/check.test.mjs::When a part has more than 7 children, the checker SHALL warn that a level may be missing.`
