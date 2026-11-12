## Why

The scenario-shape error of change `check-scenario-shape` must reach every scenario the owner still works on, and none he already closed.

## Your decisions

None open.

## What Changes

- **cli** checks the scenarios in `openspec/specs/` and in the delta specs of open changes.
- **cli** never checks `openspec/changes/archive/`.

## Not in this change

- Archived changes keep their scenarios as they are.
