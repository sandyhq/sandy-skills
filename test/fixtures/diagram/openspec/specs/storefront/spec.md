# Storefront

## Purpose
Takes orders from customers, so the kitchen knows what to bake.

Kind: container · Part of: shop · Carried by: ana · Status: proposed · Code: src/storefront/

## Requirements

### Requirement: Contract
The storefront SHALL keep its promise.

#### Scenario: Contract
- **GIVEN** any repo
- **WHEN** it runs
- **THEN** it holds
- **TEST** `test/diagram.test.mjs::fixture`

### Requirement: Seam to orders
The storefront SHALL hand each order to the order book.
Relation: customer-supplier · Upstream: orders

#### Scenario: Seam to orders
- **GIVEN** any repo
- **WHEN** it runs
- **THEN** it holds
- **TEST** `test/diagram.test.mjs::fixture`
