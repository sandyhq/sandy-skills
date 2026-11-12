# Order book

## Purpose
Keeps the orders, so nothing is baked twice or forgotten.

Kind: component · Part of: kitchen · Carried by: ana · Status: active · Code: src/orders/

## Requirements

### Requirement: Contract
The order book SHALL keep its promise.

#### Scenario: Contract
- **WHEN** it runs
- **THEN** it holds

### Requirement: Seam to ledger
The order book SHALL book every paid order in the ledger. Exclusive.

#### Scenario: Seam to ledger
- **WHEN** it runs
- **THEN** it holds
