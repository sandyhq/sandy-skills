# Using OpenSpec with sandy-skills

OpenSpec holds what the system must do; `sandy-skills check` computes from the tests what is proven. Agents follow the same loop through the skills (`spec-first`, `propose-change`, `confirm-part`, and OpenSpec's `openspec-*`). Commands below are shown bare; run them through your package manager ([getting started](getting-started.md#1-install)).

## The loop

1. **Find the part.** `openspec list --specs`, then `openspec show <id> --type spec`.
2. **Propose a change.** `openspec new change <id>` creates `openspec/changes/<id>/` with the proven schema. `openspec status --change <id>` shows which artifact is next and `openspec instructions <artifact> --change <id>` how to write it: the proposal (why), delta specs, `design.md` (decisions), `tasks.md` (the claims as todo tests).
3. **Write the claims as todo tests.** Each test's name is its claim sentence, word for word. The spec's TEST line names it as `<path>::<test name>`.
4. **Build** until the tests pass. `openspec validate --all --strict` checks the Markdown.
5. **Prove.** Run the tests with a JUnit reporter, then `sandy-skills check --junit reports/`.
6. **Archive** after the merge: `openspec archive <id>` merges the delta specs into `openspec/specs/`.

A person confirms a part with the `confirm-part` skill: `sandy-skills hash <id>` gives the contract hash, `sandy-skills confirm <id> We <who>` prints the CONFIRMED line they commit.

## sandy-skills commands

| Command | What it does |
|---|---|
| `init [--tools LIST] [--skills-dir DIR]` | Sets up OpenSpec if missing, installs the schema as default and the skills |
| `update [--skills-dir DIR]` | Installs schema and skills again from the installed version |
| `check --junit FILE\|DIR [--out FILE] [--format md\|json] [--strict]` | Lights, drift and the releasability report; exit 1 if not releasable |
| `hash <id>` | The contract hash of a part |
| `confirm <id> <I\|We\|They> <who> [--days N]` | The CONFIRMED line, valid at most 90 days |

`OPENSPEC_BIN` overrides which OpenSpec it runs; by default the repo's own install, then the one it brings.

## JUnit reports

`node --test --test-reporter=junit --test-reporter-destination=reports/junit.xml` · `vitest run --reporter=junit --outputFile=reports/junit.xml` · `bun test --reporter=junit --reporter-outfile=reports/junit.xml` · jest with `jest-junit` · `pytest --junitxml=reports/junit.xml` · `gotestsum --junitfile reports/junit.xml` · `cargo nextest` with a JUnit profile.

## CI

GitHub Actions with pnpm (npm: `npm ci` and `npx`; bun: `bun install --frozen-lockfile` and `bunx`):

```yaml
- uses: pnpm/action-setup@v4
- uses: actions/setup-node@v4
  with: { node-version: 22, cache: pnpm }
- run: pnpm install --frozen-lockfile
- run: pnpm exec openspec validate --all --strict
- run: <your tests with a JUnit reporter into reports/>
- run: pnpm exec sandy-skills check --junit reports/ --out reports/releasability.md
  if: always()
- uses: actions/upload-artifact@v4
  if: always()
  with: { name: releasability-report, path: reports/ }
```

GitLab CI runs the same commands in a `node:22` job and keeps `reports/` as `artifacts`, with `artifacts:reports:junit` for the test view. The report is an artifact of the commit; never commit it.
