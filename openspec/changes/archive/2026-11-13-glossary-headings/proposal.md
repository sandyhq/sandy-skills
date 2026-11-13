## Why
docs/glossary.md defines a repo word by a level 2 heading. `## PR ##` defined the word `PR ##`, and `  ## PR` defined nothing, though both render as the heading `PR`. The repo word then got reported as wrong-term.

## Your decisions
None open.

## What Changes
- **glossary**: a glossary heading is read as CommonMark reads an ATX heading: up to 3 spaces before `##`, and a closing run of `#` after a space dropped.

## Not in this change
- Setext headings in a glossary: the entry format is `## word`.
