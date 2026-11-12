## Why

Adopting the standard needed a clone of this repo: the schema and skills were copied by hand and the checker ran from `tools/specproof`. A repo should get everything from npm, the way it gets OpenSpec, and switch an existing OpenSpec setup without breaking its CI on day one.

## What Changes

- The repo is the npm package `sandy-skills` with one CLI, `sandy-skills`: `init`, `update`, `check`, `hash`, `confirm`. The checker moves from `tools/specproof/` to `bin/` and `src/`; its spec is renamed `cli`.
- `init` runs `openspec init` when the repo has none, copies the proven schema, makes it the default and installs the skills next to OpenSpec's own. `update` refreshes schema and skills.
- `check` reports a plain OpenSpec spec as `not-adopted` (warning), so a repo adopts part by part.
- OpenSpec becomes the package's one dependency, so `npx sandy-skills init` works in an empty repo.
- Skills link to the standards by URL, not by a path in this repo.

## Capabilities

### New Capabilities

- `init`: installing the standard into a repo.

### Modified Capabilities

- `cli`: plain specs are not-adopted.
- `sandy-skills`: the npm package.

## Impact

New package on npm (published by the owner). Docs for npm, pnpm and bun.
