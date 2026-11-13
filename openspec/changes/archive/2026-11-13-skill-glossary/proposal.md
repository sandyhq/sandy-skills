## Why
Since 0.7.0 check blocks words from a Not line and seams without a Relation line, and review-time gates each merge request. The skills that write and read specs said none of it, so an agent following them wrote specs that check blocks.

## Your decisions
None open.

## What Changes
- **skills**: propose-change, spec-first, examine-part and learn-part use the glossary words and the Relation line.
- **skills**: propose-change says 1 change is 1 merge request and runs `sandy-skills review-time` with its limits; the seam to cli now allows review-time.

## Not in this change
- The other skills: they neither write nor read specs.
