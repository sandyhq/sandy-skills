## Why
A Go test file a_test.go counted as code: 405 changed test lines failed review-time with many-lines, although tests never count as code lines.

## Your decisions
None open.

## What Changes
- **review-time** counts *_test.go, test_*.py and *_test.py as tests.

## Not in this change
- Test file names of other languages: each one gets its own change when a repo needs it.
