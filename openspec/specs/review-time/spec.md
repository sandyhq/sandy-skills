# review-time Specification

## Purpose
Estimates the minutes one review of a merge request takes, so that one change fits one review.

Kind: component · Part of: cli · Carried by: nesyeklaf · Status: active · Code: src/review.mjs

## Requirements

### Requirement: Contract
review-time SHALL print the review minutes of the diff against --base: change words / 170 + code lines / 8 + 5 per part + 8 per seam + 2 per claim, rounded up.

#### Scenario: Contract
- **GIVEN** 340 change words, 10 code lines, 2 parts, 3 seams and 2 claims
- **WHEN** review-time runs
- **THEN** it prints 42 minutes
- **TEST** `test/review.test.mjs::review-time SHALL print the review minutes of the diff against --base: change words / 170 + code lines / 8 + 5 per part + 8 per seam + 2 per claim, rounded up.`

### Requirement: Code lines
review-time SHALL count as code lines the changed lines outside tests, Markdown, openspec/, lock files and linguist-generated files.

#### Scenario: Code lines
- **GIVEN** 30 changed lines in src/a.mjs, 50 in test/a.test.mjs and 20 in pnpm-lock.yaml
- **WHEN** review-time runs
- **THEN** it counts 30 code lines
- **TEST** `test/review.test.mjs::review-time SHALL count as code lines the changed lines outside tests, Markdown, openspec/, lock files and linguist-generated files.`

### Requirement: Deepest part
review-time SHALL count a part for each changed file under its Code paths, deepest match first, and for each delta spec; a seam for each Seam to requirement and a claim for each other requirement.

#### Scenario: Deepest part
- **GIVEN** cli owns src/, diagram owns src/diagram.mjs, and the diff changes src/diagram.mjs
- **WHEN** review-time runs
- **THEN** it counts the part diagram only
- **TEST** `test/review.test.mjs::review-time SHALL count a part for each changed file under its Code paths, deepest match first, and for each delta spec; a seam for each Seam to requirement and a claim for each other requirement.`
