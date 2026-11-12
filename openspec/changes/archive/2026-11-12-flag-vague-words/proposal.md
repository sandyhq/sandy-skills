## Why

Words like `should`, `soon` or `some` leave the owner guessing who does what, and by when. He wants check to catch them before he reads.

## Your decisions

None open.

## What Changes

- **cli** reports `vague-word`, an error, with file, line and word for each listed word in an open change.
- **Default list** of 21 words and phrases; `sandy-skills.limits.vagueWords` in `openspec/config.yaml` replaces it.
- **Skipped**: fenced code, HTML comments, backticks, SHALL and the scenario keywords WHEN, THEN, AND and GIVEN.

## Not in this change

- Wording rules that need a reader, such as one term per thing.
