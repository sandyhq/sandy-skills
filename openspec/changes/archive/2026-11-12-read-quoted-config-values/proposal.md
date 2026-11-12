## Why

A quoted vague word with a comma splits in two today, and one with # stops check. The owner gets other words than he wrote, or no report.

## Your decisions

None open.

## What Changes

- **cli** reads a quoted value in `sandy-skills.limits` as one value, with its commas and #.
- **cli** stops with the line number for YAML it does not read: a list over 2 or more lines, backslash escapes, anchors, block text and flow maps on the `sandy-skills` or `limits` line.

## Not in this change

- A full YAML reader.
