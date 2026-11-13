## Why
check read only the first Relation line of a seam. A second line, even with a value outside the glossary, went unchecked and became part of the claim sentence, so the seam passed or got a claim-mismatch instead of bad-relation.

## Your decisions
None open.

## What Changes
- **cli**: a seam with 2 or more Relation lines gets bad-relation; every Relation line stays out of the claim sentence.

## Not in this change
- A seam with 2 relations: the glossary gives each seam 1.
