# Oven

## Purpose
Bakes the loaves, so orders become bread.

Kind: component · Part of: kitchen · Carried by: ana · Status: active · Code: src/oven/

## Requirements

### Requirement: Contract
The oven SHALL keep its promise.

#### Scenario: Contract
- **GIVEN** any repo
- **WHEN** it runs
- **THEN** it holds
- **TEST** `test/diagram.test.mjs::fixture`

### Requirement: Seam to orders
The oven SHALL read the next order from the order book. Read-only.

#### Scenario: Seam to orders
- **GIVEN** any repo
- **WHEN** it runs
- **THEN** it holds
- **TEST** `test/diagram.test.mjs::fixture`
