# cli Specification

## Purpose
Computes from the specs and the test report which parts are proven, so that a release carries evidence instead of a promise.

Kind: container · Part of: sandy-skills · Carried by: nesyeklaf · Status: active · Code: bin/, src/

## Requirements

### Requirement: Contract
The checker SHALL compute lights, drift and a releasability report from OpenSpec specs and JUnit reports, and exit non-zero when the result is not releasable.

#### Scenario: Contract
- **WHEN** the checker runs on specs and JUnit reports
- **THEN** it prints the report and exits 0 only when releasable
- **TEST** `test/cli.test.mjs::The checker SHALL compute lights, drift and a releasability report from OpenSpec specs and JUnit reports, and exit non-zero when the result is not releasable.`

### Requirement: Same input, same report
When run on the same specs, report and date, the checker SHALL print the same report.

#### Scenario: Same input, same report
- **WHEN** it runs twice on the same specs, report and date
- **THEN** both reports are identical
- **TEST** `test/cli.test.mjs::When run on the same specs, report and date, the checker SHALL print the same report.`

### Requirement: JUnit parsing
The checker SHALL read test results from JUnit XML, including attribute values that contain angle brackets.

#### Scenario: JUnit parsing
- **WHEN** a report has failed, todo and skipped tests and escaped attributes
- **THEN** each test gets its status and its message
- **TEST** `test/parse.test.mjs::The checker SHALL read test results from JUnit XML, including attribute values that contain angle brackets.`

### Requirement: Hash ignores whitespace
The contract hash SHALL ignore whitespace in the contract sentence.

#### Scenario: Hash ignores whitespace
- **WHEN** a contract sentence is rewrapped
- **THEN** its hash stays the same
- **TEST** `test/parse.test.mjs::The contract hash SHALL ignore whitespace in the contract sentence.`

### Requirement: Malformed lines
If a TEST, CONFIRMED or metadata line is malformed, then the checker SHALL report it as an error.

#### Scenario: Malformed lines
- **WHEN** a TEST, CONFIRMED or metadata line has the wrong shape
- **THEN** the checker reports an error
- **TEST** `test/parse.test.mjs::If a TEST, CONFIRMED or metadata line is malformed, then the checker SHALL report it as an error.`

### Requirement: Passing test
When a referenced test passed, the checker SHALL light the requirement hard.

#### Scenario: Passing test
- **WHEN** the referenced test passed
- **THEN** the requirement is hard
- **TEST** `test/check.test.mjs::When a referenced test passed, the checker SHALL light the requirement hard.`

### Requirement: Failing test
When a referenced test failed, the checker SHALL report a break and light the requirement refuted.

#### Scenario: Failing test
- **WHEN** the referenced test failed
- **THEN** the checker reports a break
- **TEST** `test/check.test.mjs::When a referenced test failed, the checker SHALL report a break and light the requirement refuted.`

### Requirement: Missing test
If a TEST line names a test that the report does not contain, then the checker SHALL report missing-test as an error.

#### Scenario: Missing test
- **WHEN** a TEST line names a test the report lacks
- **THEN** the checker reports missing-test
- **TEST** `test/check.test.mjs::If a TEST line names a test that the report does not contain, then the checker SHALL report missing-test as an error.`

### Requirement: Claim mismatch
When a test name is a sentence that differs from its requirement, the checker SHALL report claim-mismatch.

#### Scenario: Claim mismatch
- **WHEN** a test's sentence differs from its requirement
- **THEN** the checker reports claim-mismatch
- **TEST** `test/check.test.mjs::When a test name is a sentence that differs from its requirement, the checker SHALL report claim-mismatch.`

### Requirement: Todo outside a change
When a todo test is listed in no open change, the checker SHALL report todo-outside-change as a warning.

#### Scenario: Todo outside a change
- **WHEN** a todo test is in no open change
- **THEN** the checker warns todo-outside-change
- **TEST** `test/check.test.mjs::When a todo test is listed in no open change, the checker SHALL report todo-outside-change as a warning.`

### Requirement: Soft confirmation
When a person who does not carry the part confirms its current contract, the checker SHALL light that side soft.

#### Scenario: Soft confirmation
- **WHEN** a non-carrier confirms the current contract
- **THEN** that side is soft
- **TEST** `test/check.test.mjs::When a person who does not carry the part confirms its current contract, the checker SHALL light that side soft.`

### Requirement: Claimed confirmation
When the part's carrier confirms its own contract, the checker SHALL light that side claimed.

#### Scenario: Claimed confirmation
- **WHEN** the carrier confirms
- **THEN** that side is claimed
- **TEST** `test/check.test.mjs::When the part's carrier confirms its own contract, the checker SHALL light that side claimed.`

### Requirement: Changed contract
If the contract changes after a confirmation, then the checker SHALL light that side expired.

#### Scenario: Changed contract
- **WHEN** the contract changes after a confirmation
- **THEN** that side is expired
- **TEST** `test/check.test.mjs::If the contract changes after a confirmation, then the checker SHALL light that side expired.`

### Requirement: Confirmation too long
If a confirmation is valid for more than 90 days, then the checker SHALL report confirmation-too-long.

#### Scenario: Confirmation too long
- **WHEN** a confirmation runs over 90 days
- **THEN** the checker reports confirmation-too-long
- **TEST** `test/check.test.mjs::If a confirmation is valid for more than 90 days, then the checker SHALL report confirmation-too-long.`

### Requirement: Weakest side
The checker SHALL light a part as its weakest side, and drift when the part has a finding of its own.

#### Scenario: Weakest side
- **WHEN** a part has sides of different lights
- **THEN** the part shows the weakest, or drift
- **TEST** `test/check.test.mjs::The checker SHALL light a part as its weakest side, and drift when the part has a finding of its own.`

### Requirement: Unknown parent or cycle
If Part of names no spec or leads back to the part, then the checker SHALL report unknown-parent or cycle.

#### Scenario: Unknown parent or cycle
- **WHEN** Part of is unknown or circular
- **THEN** the checker reports unknown-parent or cycle
- **TEST** `test/check.test.mjs::If Part of names no spec or leads back to the part, then the checker SHALL report unknown-parent or cycle.`

### Requirement: Contradiction
When a part has an exclusive seam to a target that a part outside it writes to, the checker SHALL report a contradiction.

#### Scenario: Contradiction
- **WHEN** an exclusive seam's target has another writer outside
- **THEN** the checker reports a contradiction
- **TEST** `test/check.test.mjs::When a part has an exclusive seam to a target that a part outside it writes to, the checker SHALL report a contradiction.`

### Requirement: Too many children
When a part has more than 7 children, the checker SHALL warn that a level may be missing.

#### Scenario: Too many children
- **WHEN** a part has more than 7 children
- **THEN** the checker warns
- **TEST** `test/check.test.mjs::When a part has more than 7 children, the checker SHALL warn that a level may be missing.`

### Requirement: Not adopted
When a spec has no metadata line, Contract, seam, TEST or CONFIRMED line, the checker SHALL report it as not-adopted with a warning instead of errors.

#### Scenario: Not adopted
- **WHEN** a spec has none of the format's lines
- **THEN** the checker warns not-adopted and reports no error for it
- **TEST** `test/check.test.mjs::When a spec has no metadata line, Contract, seam, TEST or CONFIRMED line, the checker SHALL report it as not-adopted with a warning instead of errors.`

### Requirement: Exam before I
confirm SHALL print an I confirmation only when the person passed the exam on the part's current contract within the last 90 days.

#### Scenario: Exam before I
- **WHEN** confirm is asked for the I side
- **THEN** it prints the line only with a passed, current exam on the current contract, and otherwise exits non-zero and says why
- **TEST** `test/cli.test.mjs::confirm SHALL print an I confirmation only when the person passed the exam on the part's current contract within the last 90 days.`

### Requirement: Passthrough
Every command that sandy-skills does not own SHALL run the OpenSpec CLI with the same arguments, input and output, and exit with its exit code.

#### Scenario: Passthrough
- **WHEN** sandy-skills runs a command it does not own, with input on stdin
- **THEN** OpenSpec gets the same arguments and input, its output reaches the caller, and sandy-skills exits with OpenSpec's exit code
- **TEST** `test/cli.test.mjs::Every command that sandy-skills does not own SHALL run the OpenSpec CLI with the same arguments, input and output, and exit with its exit code.`

### Requirement: OpenSpec by name
sandy-skills openspec SHALL pass the rest of its arguments to the OpenSpec CLI, so that OpenSpec's own init, update and help stay reachable.

#### Scenario: OpenSpec by name
- **WHEN** sandy-skills runs `openspec init` or `openspec --help`
- **THEN** OpenSpec gets `init` or `--help`, not sandy-skills' own init or help
- **TEST** `test/cli.test.mjs::sandy-skills openspec SHALL pass the rest of its arguments to the OpenSpec CLI, so that OpenSpec's own init, update and help stay reachable.`

### Requirement: Help
The help SHALL list the sandy-skills commands and say that every other command goes to OpenSpec.

#### Scenario: Help
- **WHEN** sandy-skills runs with --help
- **THEN** it lists init, update, check, validate, diagram, hash and confirm and names OpenSpec for the rest
- **TEST** `test/cli.test.mjs::The help SHALL list the sandy-skills commands and say that every other command goes to OpenSpec.`

### Requirement: Validate
validate SHALL run openspec validate with its arguments and then check with --junit, --out and --strict, print both outputs, and exit non-zero when either fails.

#### Scenario: Validate
- **WHEN** validate runs with OpenSpec arguments, --strict and --junit, and OpenSpec or check fails
- **THEN** OpenSpec gets its arguments and --strict, check gets --junit and --strict, both outputs are printed and the exit code is non-zero
- **TEST** `test/cli.test.mjs::validate SHALL run openspec validate with its arguments and then check with --junit, --out and --strict, print both outputs, and exit non-zero when either fails.`

### Requirement: Signals
If sandy-skills gets SIGINT, SIGTERM or SIGHUP while OpenSpec runs, then it SHALL pass the signal to OpenSpec, wait until OpenSpec ends and exit with its exit code or signal.

#### Scenario: Signals
- **WHEN** only sandy-skills gets SIGINT, SIGTERM or SIGHUP while OpenSpec runs through it
- **THEN** OpenSpec gets the signal and is gone when sandy-skills exits, and sandy-skills exits as OpenSpec did: with its code when it handled the signal, by the signal when it did not
- **TEST** `test/cli.test.mjs::If sandy-skills gets SIGINT, SIGTERM or SIGHUP while OpenSpec runs, then it SHALL pass the signal to OpenSpec, wait until OpenSpec ends and exit with its exit code or signal.`

### Requirement: Default thresholds
If openspec/config.yaml sets no sandy-skills.limits, then the checker SHALL use the default warn and error thresholds.

#### Scenario: Default thresholds
- **WHEN** openspec/config.yaml has no sandy-skills.limits
- **THEN** check warns above 500 words per change and blocks above 750
- **TEST** `test/limits.test.mjs::If openspec/config.yaml sets no sandy-skills.limits, then the checker SHALL use the default warn and error thresholds.`

### Requirement: Warn band
When a measure of an open change is above its warn threshold and at most its error threshold, the checker SHALL report long-change as a warning.

#### Scenario: Warn band
- **WHEN** proposal.md of an open change has 151 words
- **THEN** check reports long-change and stays releasable
- **TEST** `test/limits.test.mjs::When a measure of an open change is above its warn threshold and at most its error threshold, the checker SHALL report long-change as a warning.`

### Requirement: Error band
When a measure of an open change is above its error threshold, the checker SHALL report over-limit as an error with the file, the count and the threshold.

#### Scenario: Error band
- **WHEN** proposal.md of an open change has 226 words
- **THEN** check reports over-limit with the file, 226 and 225, and is not releasable
- **TEST** `test/limits.test.mjs::When a measure of an open change is above its error threshold, the checker SHALL report over-limit as an error with the file, the count and the threshold.`

### Requirement: Open changes only
The checker SHALL apply the thresholds only to open changes, never to archived changes or to openspec/specs.

#### Scenario: Open changes only
- **WHEN** an archived change and a spec hold 900 words each
- **THEN** check reports neither
- **TEST** `test/limits.test.mjs::The checker SHALL apply the thresholds only to open changes, never to archived changes or to openspec/specs.`

### Requirement: Word count
The checker SHALL count as words only tokens with a letter or digit, outside fenced code, HTML comments, TEST lines and Prove claim texts.

#### Scenario: Word count
- **WHEN** tasks.md holds a Prove line, a code fence, a comment and a TEST line
- **THEN** only Prove, the path and the prose words count
- **TEST** `test/limits.test.mjs::The checker SHALL count as words only tokens with a letter or digit, outside fenced code, HTML comments, TEST lines and Prove claim texts.`

### Requirement: Own thresholds
Where openspec/config.yaml sets sandy-skills.limits, the checker SHALL use those thresholds, and openspec validate SHALL still accept the file.

#### Scenario: Own thresholds
- **WHEN** openspec/config.yaml sets warn 10 and error 20 for every measure
- **THEN** check uses 10 and 20, and openspec validate passes
- **TEST** `test/limits.test.mjs::Where openspec/config.yaml sets sandy-skills.limits, the checker SHALL use those thresholds, and openspec validate SHALL still accept the file.`

### Requirement: Partial override
If sandy-skills.limits sets only part of the thresholds, then the checker SHALL take each missing key and field from the defaults.

#### Scenario: Partial override
- **WHEN** openspec/config.yaml sets proposal warn 100 only
- **THEN** proposal blocks above 225 and every other measure keeps its default
- **TEST** `test/limits.test.mjs::If sandy-skills.limits sets only part of the thresholds, then the checker SHALL take each missing key and field from the defaults.`

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

### Requirement: CRLF config
The checker SHALL read openspec/config.yaml with CRLF line endings the same as with LF line endings.

#### Scenario: CRLF config
- **WHEN** openspec/config.yaml sets total to warn 600 and error 900 with CRLF line endings
- **THEN** check uses 600 and 900
- **TEST** `test/limits.test.mjs::The checker SHALL read openspec/config.yaml with CRLF line endings the same as with LF line endings.`

### Requirement: Direct limits key
The checker SHALL read thresholds only from the limits key directly under sandy-skills, never from a limits key nested deeper.

#### Scenario: Direct limits key
- **WHEN** sandy-skills.reports.limits sets total to warn 1 and sandy-skills.limits sets total to warn 600
- **THEN** check uses 600
- **TEST** `test/limits.test.mjs::The checker SHALL read thresholds only from the limits key directly under sandy-skills, never from a limits key nested deeper.`

### Requirement: Quoted config values
The checker SHALL read quoted config values with commas and # as one value, and stop with a message naming the line for config syntax it does not read.

#### Scenario: Quoted config values
- **WHEN** vagueWords lists `"maybe, later"` and `"right # away"`, or a list runs over 2 lines
- **THEN** check reads 2 words, or stops and names the line
- **TEST** `test/limits.test.mjs::The checker SHALL read quoted config values with commas and # as one value, and stop with a message naming the line for config syntax it does not read.`

### Requirement: Multi-line code spans
The checker SHALL skip a backtick code span that runs over 2 or more lines of one paragraph when it looks for vague words.

#### Scenario: Multi-line code spans
- **WHEN** proposal.md says `Run ` and a code span over 2 lines that holds a listed word
- **THEN** check reports nothing
- **TEST** `test/limits.test.mjs::The checker SHALL skip a backtick code span that runs over 2 or more lines of one paragraph when it looks for vague words.`
