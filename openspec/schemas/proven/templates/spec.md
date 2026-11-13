## Purpose

<!-- Shape, wording rules and limits: https://github.com/sandyhq/sandy-skills/blob/main/standards/changes.md
     New capabilities only. The why: which goal above this part it serves. -->

Kind: component · Part of: <!-- parent spec id or none --> · Carried by: <!-- who --> · Status: proposed · Code: <!-- paths -->

## ADDED Requirements

### Requirement: Contract
The <!-- part --> SHALL <!-- what must hold, one sentence -->.

#### Scenario: Contract holds
- **GIVEN** <!-- starting state; "any repo" when it does not matter -->
- **WHEN** <!-- action -->
- **THEN** <!-- outcome -->
- **TEST** `<!-- path -->::<!-- test name = the claim sentence -->`

### Requirement: Seam to <!-- id of the other part -->
The <!-- part --> SHALL <!-- what it reads from or writes to the other part -->. <!-- "Read-only." or "Exclusive." when it holds -->
Relation: <!-- 1 of partnership, shared-kernel, customer-supplier, conformist, anticorruption-layer, open-host-service, published-language; see standards/glossary.md --> · Upstream: <!-- id of the part the other one follows -->

#### Scenario: <!-- case -->
- **GIVEN** <!-- starting state; "any repo" when it does not matter -->
- **WHEN** <!-- action -->
- **THEN** <!-- outcome -->
- **TEST** `<!-- path -->::<!-- test name = the seam sentence -->`

### Requirement: <!-- claim name -->
When <!-- trigger -->, the <!-- part --> SHALL <!-- response -->.

#### Scenario: <!-- case -->
- **GIVEN** <!-- starting state; "any repo" when it does not matter -->
- **WHEN** <!-- action -->
- **THEN** <!-- outcome -->
- **TEST** `<!-- path -->::<!-- test name = the claim sentence -->`
