## Why

Readers differ from repo to repo. The owner of a repo wants to set its thresholds in one file, and OpenSpec has to keep working with that file.

## Your decisions

None open.

## What Changes

- **cli** reads `sandy-skills.limits` in `openspec/config.yaml`: per measure `{ warn: N, error: N }`.
- **Partial override**: each missing measure or field keeps its default.
- **OpenSpec** still accepts the file; a test runs `openspec validate` on it.
- **Typos stop check** with a message: an unknown measure, or warn above error.

## Not in this change

- A `level` key: the owner dropped it.
- Vague words.
