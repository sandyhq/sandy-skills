# Order book

## Purpose
Keeps the orders, so nothing is baked twice or forgotten.

Kind: component · Part of: kitchen · Carried by: ana · Status: active · Code: src/orders/

## Requirements

### Requirement: Contract
The order book SHALL keep its promise.

#### Scenario: Contract
- **GIVEN** any repo
- **WHEN** it runs
- **THEN** it holds
- **TEST** `test/diagram.test.mjs::fixture`

### Requirement: Seam to ledger
The order book SHALL book every paid order in the ledger. Exclusive.
Relation: customer-supplier · Upstream: ledger

#### Scenario: Seam to ledger
- **GIVEN** any repo
- **WHEN** it runs
- **THEN** it holds
- **TEST** `test/diagram.test.mjs::fixture`
