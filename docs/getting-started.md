# Getting started

Set up a repo with OpenSpec, the proven schema and the skills. You need Node 22.12 or newer and one of npm, pnpm or bun. Nothing here needs a clone of this repo.

## 1. Install

Per repo, as a dev dependency, so the lockfile pins the version:

```sh
npm install --save-dev @sandyhq/sandy-skills @fission-ai/openspec
pnpm add --save-dev @sandyhq/sandy-skills @fission-ai/openspec
bun add --dev @sandyhq/sandy-skills @fission-ai/openspec
```

The package `@sandyhq/sandy-skills` installs the command `sandy-skills` and brings OpenSpec along, but installing it next to it puts `openspec` on the package manager's path, and both then use the same version. Run the CLIs through the package manager: `npx sandy-skills`, `pnpm exec sandy-skills` or `bunx sandy-skills` (the same for `openspec`).

To try it without installing, name the package: `npx @sandyhq/sandy-skills init`, `pnpm dlx @sandyhq/sandy-skills init` or `bunx @sandyhq/sandy-skills init`. Installing globally also works (`npm install -g`, `pnpm add -g`, `bun add -g`), but each repo then depends on what each machine has installed.

## 2. Set up a repo

```sh
npx sandy-skills init --tools pi,claude,codex
```

- If the repo has no `openspec/`, init runs `openspec init`. `--tools` goes to it: the agents OpenSpec writes its skills for (`openspec init --help` lists them; `all`, `none`). Without `--tools`, OpenSpec asks.
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

Upgrade the package, then run `sandy-skills update` and commit the diff. It replaces the schema and the skills with that version's; edits to your copies are lost, so change the standard upstream instead. `openspec update` refreshes OpenSpec's own skills.
