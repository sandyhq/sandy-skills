## Why
check's own output used words that its glossary rule blocks in specs: `does not state the requirement`, a report column `Requirement`. The limits table in standards/changes.md names the key `claims`, which check did not read.

## Your decisions
None open.

## What Changes
- **cli**: findings and the report say claim and seam; a heading is named in backticks, as in `### Requirement: Contract`.
- **cli**: `sandy-skills.limits.claims` sets the limit on claims per change; `requirements` from 0.5 and 0.6 still works.

## Not in this change
- The JSON keys `requirement` and `requirements`: scripts read them.
