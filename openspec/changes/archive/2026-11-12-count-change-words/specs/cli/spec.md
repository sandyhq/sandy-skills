## ADDED Requirements

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
