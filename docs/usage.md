# Using OpenSpec with sandy-skills

OpenSpec holds what the system must do; `sandy-skills check` computes from the tests what is proven. Agents follow the same loop through the skills (`spec-first`, `propose-change`, `confirm-part`, `learn-part`, `examine-part`, and OpenSpec's `openspec-*`). Commands below are shown bare; run them through your package manager ([getting started](getting-started.md#1-install)).

One command does both: every command that sandy-skills does not own goes to OpenSpec unchanged, so `sandy-skills list --specs` is `openspec list --specs`. `openspec` itself still works the same.

## The loop

1. **Find the part.** `sandy-skills list --specs`, then `sandy-skills show <id> --type spec`.
2. **Propose a change.** `sandy-skills new change <id>` creates `openspec/changes/<id>/` with the proven schema. `sandy-skills status --change <id>` shows which artifact is next and `sandy-skills instructions <artifact> --change <id>` how to write it: the proposal (why), delta specs, `design.md` (decisions), `tasks.md` (the claims as todo tests). Each file has fixed sections with the owner's part first; `check` warns above 500 words per change, blocks above 750 and flags vague words ([changes](https://github.com/sandyhq/sandy-skills/blob/main/standards/changes.md), with the thresholds you can set in `openspec/config.yaml`).
3. **Write the claims as todo tests.** Each test's name is its claim sentence, word for word. The spec's TEST line names it as `<path>::<test name>`.
4. **Build** until the tests pass. `sandy-skills openspec validate --all --strict` checks the Markdown alone, and `sandy-skills diagram --write` refreshes the pictures of parts and seams in the docs.
5. **Prove.** Run the tests with a JUnit reporter, then `sandy-skills validate --all --strict --junit reports/`: OpenSpec's validation, then `check`.
6. **Archive** after the merge: `sandy-skills archive <id>` merges the delta specs into `openspec/specs/`; then `sandy-skills diagram --write`.

A person confirms a part with the `confirm-part` skill: `sandy-skills hash <id>` gives the contract hash, `sandy-skills confirm <id> We <who>` prints the CONFIRMED line they commit.

## Understanding what was built

Agents build faster than people follow. Two skills close the gap, both hands-on in the real repo:

- **`learn-part`** teaches one part or topic per session. You predict first, read the spec, tests and code yourself, and explain it back without notes. Then you trace, break and extend it in a scratch worktree, and write the part's intent in your own words. Earlier topics come back after 1, 3, 7, 21 and 60 days.
- **`examine-part`** is the exam. Run it with a fresh agent of another model family than the one that taught you. It seals an answer key before the first question. It asks why-chains, what-ifs and traps, and plants bugs, including some the tests miss. There's no partial credit, and test runs grade the practical tasks.

Records go to `.learn/<who>/`, which is git-ignored. Before you confirm the I side of a part, you need a passed exam on its current contract from the last 90 days; `sandy-skills confirm <id> I <who>` checks `.learn/<who>/exams/<id>.md`.

## sandy-skills commands

| Command | What it does |
|---|---|
| `init [--tools LIST] [--skills-dir DIR]` | Sets up OpenSpec if missing, installs the schema as default and the skills |
| `update [--skills-dir DIR]` | Installs schema and skills again from the installed version |
| `check --junit FILE\|DIR [--out FILE] [--format md\|json] [--strict]` | Lights, drift, stale diagrams, long or vague open changes, open changes with a long estimated review (`long-review`, no code lines counted), scenarios not shaped GIVEN, WHEN, THEN, TEST, and the releasability report; exit 1 if not releasable |
| `validate [<openspec validate args>] [--junit FILE\|DIR] [--out FILE] [--strict]` | `openspec validate` with the other arguments, then `check` with `--junit`, `--out` and `--strict` (`--strict` goes to both); prints both, non-zero if either fails |
| `diagram [<id>] [--write]` | A Mermaid flowchart of every part, or of one part, what is below it and its neighbours; `--write` refreshes every marked block in the repo's Markdown ([diagrams](https://github.com/sandyhq/sandy-skills/blob/main/standards/diagrams.md)) |
| `review-time --base <ref>` | The estimated review minutes of the diff against the merge base of `<ref>` and HEAD, and each share: change words / 170, code lines / 8 (no tests, Markdown, `openspec/`, lock or generated files), 5 per part, 8 per seam, 2 per claim. Warns above 30 minutes or 200 code lines; exit 1 above 60 minutes or 400 code lines, for a code file no part owns, and for 0 or 2 or more changes or code in a part without a delta spec in the change |
| `hash <id>` | The contract hash of a part |
| `confirm <id> <I\|We\|They> <who> [--days N]` | The CONFIRMED line, valid at most 90 days; I needs a passed exam |
| `openspec <args>` | OpenSpec with exactly these arguments: its own `init`, `update` and `--help`, whose names sandy-skills takes |
| any other command | Goes to OpenSpec unchanged, with its input, output and exit code: `list`, `show`, `new change`, `status`, `instructions`, `archive`, … |

`review-time` and `check` read their weights and thresholds from `openspec/config.yaml`; each missing key keeps its default:

```yaml
sandy-skills:
  review:
    minutes: { warn: 30, error: 60 }
    lines: { warn: 200, error: 400 }
    weights: { wordsPerMinute: 170, linesPerMinute: 8, part: 5, seam: 8, claim: 2 }
```

`OPENSPEC_BIN` overrides which OpenSpec it runs; by default the repo's own install, then the one it brings. `sandy-skills --version` is sandy-skills' version, `sandy-skills version` OpenSpec's.

## JUnit reports

`node --test --test-reporter=junit --test-reporter-destination=reports/junit.xml` · `vitest run --reporter=junit --outputFile=reports/junit.xml` · `bun test --reporter=junit --reporter-outfile=reports/junit.xml` · jest with `jest-junit` · `pytest --junitxml=reports/junit.xml` · `gotestsum --junitfile reports/junit.xml` · `cargo nextest` with a JUnit profile.

## CI

GitHub Actions with pnpm (npm: `npm ci` and `npx`; bun: `bun install --frozen-lockfile` and `bunx`):

```yaml
- uses: pnpm/action-setup@v4
- uses: actions/setup-node@v4
  with: { node-version: 22, cache: pnpm }
- run: pnpm install --frozen-lockfile
- run: <your tests with a JUnit reporter into reports/>
- run: pnpm exec sandy-skills validate --all --strict --junit reports/ --out reports/releasability.md
  if: always()
- uses: actions/upload-artifact@v4
  if: always()
  with: { name: releasability-report, path: reports/ }
```

GitLab CI runs the same commands in a `node:22` job and keeps `reports/` as `artifacts`, with `artifacts:reports:junit` for the test view. The report is an artifact of the commit; never commit it.
