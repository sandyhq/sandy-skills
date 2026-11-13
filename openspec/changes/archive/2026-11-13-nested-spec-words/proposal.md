## Why
A spec in a folder below openspec/specs, as `parent/a`, is a part for OpenSpec and review-time, but check read only the first level for scenario shape and glossary words. Moving a spec into a context folder turned both checks off.

## Your decisions
None open.

## What Changes
- **cli**: 1 list of the main spec files at any depth, read by check, the scenarios and the glossary.
- **review-time**: reads its parts from that list.

## Not in this change
- Delta specs: they were read at any depth already.
