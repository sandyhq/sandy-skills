## Why
OpenSpec lists a spec in openspec/specs/domain/service/ as the part domain/service. review-time read only 1 folder level, so the Code paths of domain/service owned no file, and review-time failed with unowned-file.

## Your decisions
None open.

## What Changes
- **review-time** reads each spec.md below openspec/specs at any depth; the part id is the folder path, as OpenSpec names it.

## Not in this change
- Nested folders in openspec/changes: review-time reads them already.
