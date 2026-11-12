## Context

sandy-skills already resolves and runs OpenSpec for `init` and to read the specs (`OPENSPEC_BIN`, else the repo's install, else the one it depends on, else PATH). Users still type `openspec` for everything else, and CI pairs `openspec validate` with `sandy-skills check` by hand.

## Decisions

- **Pass through by default, own a fixed list.** Any first argument that is not one of sandy-skills' commands goes to OpenSpec unchanged, so new OpenSpec commands work without a sandy-skills release. Rejected: a list of forwarded OpenSpec commands (goes stale with every OpenSpec release); a separate wrapper binary (two names again).
- **The first argument decides, before sandy-skills parses any option.** OpenSpec's options (`--all`, `--specs`, `--json`) never reach sandy-skills' parser, which would misread them. A first argument starting with `-` stays sandy-skills' own (`--help`, `--version`). Rejected: finding the command after leading options (needs to know which options take a value, for both tools).
- **Inherited stdio and the child's exit code**, run in the current directory with the OpenSpec sandy-skills resolves there. Prompts and colours work as with `openspec` itself. A child killed by a signal exits 1.
- **`sandy-skills openspec <args>` for the shadowed names.** sandy-skills' `init` and `update` wrap OpenSpec's, so OpenSpec's own stay reachable by name, and `sandy-skills openspec --help` shows OpenSpec's help. Rejected: renaming sandy-skills' init (breaks every doc and repo that uses it).
- **validate runs both, always.** `--junit` and `--out` go to check only; `--strict` goes to both, since `openspec validate --strict` and `check --strict` mean the same thing: warnings fail. Everything else goes to `openspec validate`. check runs even when OpenSpec fails, so one run shows every problem. The exit code is OpenSpec's when it failed, else check's. Rejected: stopping after the first failure (hides the second one until the next run).
- **check without `--junit` still checks.** In a repo whose specs have TEST lines, `validate` then reports missing tests; that is the point of the command. To check only the Markdown, `sandy-skills openspec validate` remains.

## Risks / Trade-offs

- A future OpenSpec command named like a sandy-skills command is shadowed; `sandy-skills openspec <name>` reaches it.
- `sandy-skills --version` prints sandy-skills' version; `sandy-skills version` is OpenSpec's.
