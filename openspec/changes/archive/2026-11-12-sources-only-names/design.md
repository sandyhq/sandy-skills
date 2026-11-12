## Context

The owner asked that source projects be named only in the sources markdown.

## Decisions

- The test reads the project names from the link texts under "Concepts adopted without their tools" in `standards/sources.md`, so the list has one place and the test holds no names itself.
- It searches the files Git tracks, case-insensitive, and skips `standards/sources.md` and OpenSpec's archived changes, which keep history as it was.
