# Getting started

Set up a repo with OpenSpec, the proven schema and the skills. You need Node 22.12 or newer and one of npm, pnpm or bun. Nothing here needs a clone of this repo.

## 1. Install

Per repo, as a dev dependency, so the lockfile pins the version:

```sh
npm install --save-dev @sandyhq/sandy-skills @fission-ai/openspec
pnpm add --save-dev @sandyhq/sandy-skills @fission-ai/openspec
bun add --dev @sandyhq/sandy-skills @fission-ai/openspec
```

The package `@sandyhq/sandy-skills` installs the command `sandy-skills` and brings OpenSpec along; installing OpenSpec next to it pins its version in the lockfile, and sandy-skills then runs that one. Run it through the package manager: `npx sandy-skills`, `pnpm exec sandy-skills` or `bunx sandy-skills`.

`sandy-skills` is the only command you need: every command it does not own goes to OpenSpec unchanged (`sandy-skills list --specs`, `sandy-skills show <id>`, `sandy-skills archive <id>`). `sandy-skills openspec <args>` reaches OpenSpec's own `init`, `update` and `--help`. `openspec` itself still works directly.

To try it without installing, name the package: `npx @sandyhq/sandy-skills init`, `pnpm dlx @sandyhq/sandy-skills init` or `bunx @sandyhq/sandy-skills init`. Installing globally also works (`npm install -g`, `pnpm add -g`, `bun add -g`), but each repo then depends on what each machine has installed.

## 2. Set up a repo

```sh
npx sandy-skills init --tools pi,claude,codex
```

- If the repo has no `openspec/`, init runs `openspec init`. `--tools` goes to it: the agents OpenSpec writes its skills for (`sandy-skills openspec init --help` lists them; `all`, `none`). Without `--tools`, OpenSpec asks.
- It copies the schema to `openspec/schemas/proven/` and sets `schema: proven` in `openspec/config.yaml`, so every new change uses it.
- It adds `.learn/` to `.gitignore`: each person's learning records and exam results stay on their machine.
- It installs the skills `spec-first`, `propose-change`, `confirm-part`, `learn-part` and `examine-part` next to OpenSpec's own skills, as links where OpenSpec used links. If OpenSpec wrote none, they go to `.agents/skills/`; `--skills-dir <dir>` chooses.

Commit everything it wrote. Then add the checks to CI: [usage](usage.md#ci).

## 3. Switch an existing OpenSpec repo

Run the same `init`. It keeps `openspec/`, your specs and your config; it only replaces the `schema:` line.

- Open changes keep the schema they started with (their `.openspec.yaml`). New changes use proven.
- `sandy-skills check` reports every spec that does not use the format yet as `not-adopted`, a warning, so CI stays green. Adopt one part at a time: add the details line under Purpose, a `Requirement: Contract` and TEST lines ([spec format](../standards/spec-format.md)). A part that uses the format partly gets errors.
- Once every part is adopted, run `check --strict` in CI, which fails on warnings too.

To go back: set `schema: spec-driven` again and delete `openspec/schemas/proven/` and the five skill directories. Remove `.learn/` from `.gitignore` if you like.

## 4. Stay current

Upgrade the package, then run `sandy-skills update` and commit the diff. It replaces the schema and the skills with that version's; edits to your copies are lost, so change the standard upstream instead. `sandy-skills openspec update` refreshes OpenSpec's own skills.

## 5. Upgrade to 0.7 from 0.4 or older

Upgrade the package and run `sandy-skills update` (section 4). Since 0.7.1 these findings are warnings, so CI stays green; with `sandy-skills.enforce: error` they are errors and block, as in 0.7.0 ([changelog](https://github.com/sandyhq/sandy-skills/blob/main/CHANGELOG.md), [warnings or errors](usage.md#warnings-or-errors)):

| Finding | Since | Reports |
|---|---|---|
| `over-limit` | 0.5 | an open change over 750 words, a file over its limit, or more than 7 claims |
| `vague-word` | 0.5 | a word such as `should`, `may` or `etc` in an open change |
| `scenario-shape` | 0.5 | a scenario without the lines GIVEN, WHEN, THEN, TEST in this order |
| `long-review` | 0.6 | an open change of more than 60 estimated review minutes |
| `wrong-term` | 0.7 | a word from a Not line of the [glossary](https://github.com/sandyhq/sandy-skills/blob/main/standards/glossary.md) in specs and open changes |
| `missing-relation`, `bad-relation` | 0.7 | a seam without a valid line `Relation: <value> · Upstream: <id>` |
| `unowned-file`, `no-change` and the other `review-time` errors | 0.6 | a merge request with a code file no part owns, with 0 or 2 or more changes, or over 60 minutes or 400 code lines |

Fix them in this order:

1. Give each scenario its GIVEN and TEST lines: the starting state moves out of WHEN into GIVEN, `GIVEN any repo` when it does not matter.
2. Split each open change over the limits into 2 changes, and replace its vague words.
3. Write `docs/glossary.md` with the words of your domain (entry format: [repo structure](https://github.com/sandyhq/sandy-skills/blob/main/standards/repo-structure.md)), then replace each `wrong-term` word that is left.
4. Give each seam its Relation line, with 1 of the 7 values of the glossary.
5. Extend the Code lines of the parts until each code file git tracks lies under exactly 1 part.
6. Then add the `review-time` job to CI ([usage](usage.md#ci)).
7. Set `enforce: error` under `sandy-skills:` in `openspec/config.yaml` when the findings shall block.

## 6. What a repo needs besides init

- Tests with a JUnit reporter that write into `reports/` ([JUnit reports](usage.md#junit-reports)).
- A CI job that runs `sandy-skills validate --all --strict --junit reports/`, and on merge requests `sandy-skills review-time` ([CI](usage.md#ci)). It blocks only with `sandy-skills.enforce: error`.
- An `AGENTS.md` that names the checks to run before a commit and tells agents to work spec first ([repo structure](https://github.com/sandyhq/sandy-skills/blob/main/standards/repo-structure.md)).
- The checks and release evidence of the [secure engineering baseline](https://github.com/sandyhq/sandy-skills/blob/main/standards/secure-engineering-baseline.md).
