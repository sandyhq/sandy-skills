# Standards

Engineering standards for repos where people and AI agents build together. Each standard is one file; status says how far it is tried.

| Standard | Question it answers | Status |
|---|---|---|
| [Secure engineering baseline](secure-engineering-baseline.md) | Which checks run where, and what evidence a release carries | Draft, not yet adopted by any repo |
| [Spec format](spec-format.md) | How intent, proof and decisions are written so a machine can check them | Draft; tooling in this repo, proven on this repo only |
| [Repo structure](repo-structure.md) | Where each kind of knowledge lives in a repo | Proposal, not yet tried on a project |

Where the ideas come from: [sources.md](sources.md).

## Adopting

Introduce a standard repo by repo, one MR each; the repo's own `AGENTS.md` and checks win where they conflict. To adopt the spec format, follow [Getting started](https://github.com/sandyhq/sandy-skills/blob/main/docs/getting-started.md): `sandy-skills init` sets up OpenSpec, the schema and the skills in the repo.
