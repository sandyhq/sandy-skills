## Why

The standards should stand on their own: a reader needs the idea, not the project it came from. Naming those projects across the repo also ties the text to tools that are not ready for production.

## What Changes

- The README, the spec format, the schema and specproof describe the ideas without naming their source projects.
- The field mapping for a later converter moves to `standards/sources.md`, under a new heading "Concepts adopted without their tools".
- A repository test fails when any other file names a project listed under that heading.

## Capabilities

### New Capabilities

### Modified Capabilities

- `sandy-skills`: adds the claim that only the sources file names the adopted projects.

## Impact

Docs, one comment in specproof, one repository test. No change to specproof's behaviour.
