## Why
Each rule of sandy-skills blocked a merge request at once. A refactor of 10000 lines, or work outside the workflow, met one block after the other. The owner wants warnings first.

## Your decisions
None open.

## What Changes
- **cli**: check and validate report each finding of check as a warning and exit 0 for it.
- **cli**: `sandy-skills.enforce: error` in openspec/config.yaml keeps the severities of 0.7.0.
- **review-time**: the same for its findings.

## Not in this change
- A switch for each rule.
- The errors and the exit code of openspec validate itself.
