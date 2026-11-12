# sandy-skills

Engineering standards for repos where people and AI agents build together, and the tools that check them: an OpenSpec schema, a checker and agent skills.

The central idea is proof next to intent. Every part of a system states why it exists and what must hold. Every behaviour is one sentence that a named test proves, and CI computes which parts are proven at this commit. Everything is Markdown in [OpenSpec](https://github.com/Fission-AI/OpenSpec) plus the tests in the code. The concepts come from Holons and scryer ([sources](standards/sources.md)), but nothing here needs either tool.

## What is here

- [standards/](standards/README.md): the secure engineering baseline, the spec format and the repo structure.
- [openspec/schemas/proven/](openspec/schemas/proven/schema.yaml): the OpenSpec schema. Each change lists its claims as todo tests and keeps its decisions in `design.md`.
- [tools/specproof/](tools/specproof/): the checker. Node 20+, no dependencies. It reads `openspec show --json` and JUnit reports, and writes lights, drift and a releasability report.
- [skills/](skills/): `spec-first`, `propose-change` and `confirm-part`, in the Agent Skills format.
- [openspec/specs/](openspec/specs/): this repo's own parts, proven by its own tests in CI.

## specproof

```sh
node tools/specproof/bin/specproof.mjs check --junit reports/junit.xml        # Markdown report; exit 1 if not releasable
node tools/specproof/bin/specproof.mjs check --junit reports/ --format json   # every JUnit file in a directory
node tools/specproof/bin/specproof.mjs hash <spec-id>                         # contract hash for a CONFIRMED line
node tools/specproof/bin/specproof.mjs confirm <spec-id> We <who>             # the line a person commits
```

`OPENSPEC_BIN` overrides how OpenSpec is called, for example `npx --yes @fission-ai/openspec@2.0.0`.

## Status

A draft. The tools prove this repo; no other repo has adopted them yet. Adopting: [standards/README.md](standards/README.md#adopting). License: MIT.
