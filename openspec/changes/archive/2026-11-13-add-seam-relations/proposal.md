## Why
A seam states who reads or writes, not which part has to follow the other. A reader of a change cannot see which side breaks.

## Your decisions
None open.

## What Changes
- **cli**: each seam `Seam to <id>` gets the line `Relation: <value> · Upstream: <id>`, with 1 of the 7 values from the glossary.
- **cli**: check reports an unknown value, or an upstream outside the 2 parts of the seam, as an error, and a seam without a Relation line too.
- **diagram**: each seam arrow shows its relation.

## Not in this change
- The relations of the MailGate seams.
