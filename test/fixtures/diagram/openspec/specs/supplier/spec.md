# Flour supplier

## Purpose
Delivers flour, so the kitchen never runs out.

Kind: system · Part of: none · Carried by: ana · Status: active · Code: src/supplier/

## Requirements

### Requirement: Contract
The flour supplier SHALL keep its promise.

#### Scenario: Contract
- **GIVEN** any repo
- **WHEN** it runs
- **THEN** it holds
- **TEST** `test/diagram.test.mjs::fixture`

### Requirement: Seam to kitchen
The supplier SHALL deliver flour to the kitchen each week.
Relation: customer-supplier · Upstream: supplier

#### Scenario: Seam to kitchen
- **GIVEN** any repo
- **WHEN** it runs
- **THEN** it holds
- **TEST** `test/diagram.test.mjs::fixture`
