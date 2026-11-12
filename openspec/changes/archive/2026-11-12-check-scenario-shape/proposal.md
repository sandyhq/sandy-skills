## Why

A scenario that starts with its action hides the state it needs. The owner then reads a test case he cannot set up, and every spec writes the steps its own way.

## Your decisions

None open.

## What Changes

- **cli** reports `scenario-shape`, an error with file and line, for a scenario without exactly GIVEN, WHEN, THEN and TEST in this order; AND lines are allowed after GIVEN, WHEN or THEN.
- **Docs**: the spec format, the changes standard, the spec template and the skills show the 4 steps.

## Not in this change

- Which files check reads: change `scope-scenario-shape`.
- Word counts: the step keywords count as before.
