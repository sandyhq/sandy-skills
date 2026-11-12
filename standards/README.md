# Standards

Engineering standards for repos where people and AI agents build together. Each standard is one file; status says how far it is tried.

| Standard | Question it answers | Status |
|---|---|---|
| [Secure engineering baseline](secure-engineering-baseline.md) | Which checks run where, and what evidence a release carries | Draft, not yet adopted by any repo |
| [Spec format](spec-format.md) | How intent, proof and decisions are written so a machine can check them | Draft; tooling in this repo, proven on this repo only |
| [Repo structure](repo-structure.md) | Where each kind of knowledge lives in a repo | Proposal, not yet tried on a project |

Where the ideas come from: [sources.md](sources.md).

## Adopting

Introduce a standard repo by repo, one MR each; the repo's own `AGENTS.md` and checks win where they conflict. To adopt the spec format:

1. `openspec init --tools pi,claude,codex` and commit what it generates (OpenSpec writes its skills per project, not globally).
2. Copy [openspec/schemas/proven/](../openspec/schemas/proven/) into the repo and set `schema: proven` in `openspec/config.yaml`.
3. Install the skills from [skills/](../skills/) where the agents load them (for example `.agents/skills/`).
4. Add the three checks from [spec-format.md](spec-format.md#checks) to CI.
