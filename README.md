# sandy-skills

Engineering standards for repos where people and AI agents build together, and the tools that check them: an [OpenSpec](https://github.com/Fission-AI/OpenSpec) schema, agent skills and a checker, as one npm package.

The idea is proof next to intent. Every part of a system states why it exists and what must hold. Every behaviour is one sentence that a named test proves, and CI computes which parts are proven at this commit. Everything is Markdown in OpenSpec plus the tests in the code. Where the ideas come from: [sources](standards/sources.md).

## Quick start

```sh
npm install --save-dev @sandyhq/sandy-skills @fission-ai/openspec   # or: pnpm add -D … / bun add -d …
npx sandy-skills init --tools pi,claude,codex              # or: pnpm exec … / bunx …
```

`init` sets up OpenSpec if the repo has none, makes the `proven` schema its default and installs the skills next to OpenSpec's. Then [getting started](docs/getting-started.md) covers switching an existing OpenSpec repo and staying current, and [usage](docs/usage.md) the daily loop, the commands and CI.

## What is here

- [standards/](standards/README.md): the secure engineering baseline, the spec format and the repo structure.
- [openspec/schemas/proven/](openspec/schemas/proven/schema.yaml): the schema. Each change lists its claims as todo tests and keeps its decisions in `design.md`.
- [skills/](skills/): `spec-first`, `propose-change` and `confirm-part`, in the Agent Skills format.
- [bin/](bin/sandy-skills.mjs), [src/](src/): the `sandy-skills` CLI. Its only dependency is OpenSpec.
- [openspec/specs/](openspec/specs/): this repo's own parts, proven by its own tests in CI.

## Status

A draft: the tools prove this repo; no other repo has adopted them yet. License: MIT.
