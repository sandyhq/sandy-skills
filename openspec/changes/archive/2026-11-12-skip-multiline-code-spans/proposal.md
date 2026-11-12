## Why

A command in backticks that wraps onto a 2nd line counts as prose today. check then reports a vague word the owner never wrote as prose.

## Your decisions

None open.

## What Changes

- **cli** skips a backtick code span over 2 or more lines of one paragraph when it looks for vague words.

## Not in this change

- Spans over a blank line: Markdown ends the span there, and check reads both lines as prose.
