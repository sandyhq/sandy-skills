## Why
Since 0.7.0 check blocks a seam without a Relation line, but the spec template had no seam. A part written from it got its first seam without the line and failed missing-relation.

## Your decisions
None open.

## What Changes
- **proven-schema**: the spec template has a `Seam to` example with a Relation line; the schema's spec instruction names that line.

## Not in this change
- OpenSpec's own words in the schema, as `ADDED Requirements`: OpenSpec reads them.
