# sandy-skills

Engineering standards for repos where people and AI agents build together, and the tools that check them: an [OpenSpec](https://github.com/Fission-AI/OpenSpec) schema, agent skills and a checker, as one npm package.

The idea is proof next to intent. Every part of a system states why it exists and what must hold. Every behaviour is one sentence that a named test proves, and CI computes which parts are proven at this commit. Everything is Markdown in OpenSpec plus the tests in the code. Where the ideas come from: [sources](standards/sources.md).

The check also keeps specs and changes readable. A change warns above 500 words and is split above 750; vague words such as `should` are the error `vague-word` ([changes](standards/changes.md)). Every scenario has the lines GIVEN, WHEN, THEN, TEST, in this order. Specs use 1 word per thing from the [glossary](standards/glossary.md), plus the repo's own words in `docs/glossary.md`; a word from a Not line is the error `wrong-term`. Each seam names how its 2 parts relate in a `Relation:` line. `sandy-skills review-time` estimates the review minutes of a merge request and blocks one with more than 60 minutes, more than 400 code lines or other than 1 change ([usage](docs/usage.md)). What each version added: [changelog](CHANGELOG.md).

## Quick start

```sh
npm install --save-dev @sandyhq/sandy-skills @fission-ai/openspec   # or: pnpm add -D … / bun add -d …
npx sandy-skills init --tools pi,claude,codex              # or: pnpm exec … / bunx …
```

`init` sets up OpenSpec if the repo has none, makes the `proven` schema its default and installs the skills next to OpenSpec's. Every other command goes to OpenSpec unchanged, so `sandy-skills` is the one command to type; `sandy-skills validate` runs OpenSpec's validation and the check together. Then [getting started](docs/getting-started.md) covers switching an existing OpenSpec repo and staying current, and [usage](docs/usage.md) the daily loop, the commands and CI.

## What is here

- [standards/](standards/README.md): the secure engineering baseline, the spec format, the shape and size of a change, diagrams and the repo structure.
- [openspec/schemas/proven/](openspec/schemas/proven/schema.yaml): the schema. Each change lists its claims as todo tests and keeps its decisions in `design.md`.
- [skills/](skills/), in the Agent Skills format: `spec-first`, `propose-change` and `confirm-part` for working spec first; `learn-part` and `examine-part` so the people who own the repo understand what agents built, and prove it.
- [bin/](bin/sandy-skills.mjs), [src/](src/): the `sandy-skills` CLI. Its only dependency is OpenSpec.
- [openspec/specs/](openspec/specs/): this repo's own parts, proven by its own tests in CI.

## Status

A draft: the tools prove this repo; no other repo has adopted them yet. License: MIT.
