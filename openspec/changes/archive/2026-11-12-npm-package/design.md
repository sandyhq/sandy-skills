## Context

OpenSpec installs per repo and writes its skills for the agents chosen with `--tools`. Ours should follow it, not replace it.

## Decisions

- **One package, one CLI.** `sandy-skills` holds the checker and the installer. Rejected: a separate `specproof` package; two names for one tool, and `npx specproof` would need its own package.
- **Skills go where OpenSpec put its own.** init looks for `<dot dir>/skills/openspec-*`; where those are links (OpenSpec links `.claude/skills` to `.agents/skills`), ours are links the same way. None found: `.agents/skills`. `--skills-dir` overrides. Rejected: our own `--tools` list; it would drift from OpenSpec's.
- **OpenSpec is a dependency, found in this order:** `OPENSPEC_BIN`, the repo's own install, ours, PATH. The repo's own version wins so both CLIs agree.
- **Set the default schema by editing `config.yaml`.** OpenSpec only sets a default when it creates a schema (`schema init --default`). Only the `schema:` line changes.
- **Plain specs warn.** A spec with no line of the format yet is `not-adopted`, a warning; `--strict` fails on it. A spec that uses the format partly still gets errors.

## Risks / Trade-offs

- `update` overwrites the three skill directories and the schema directory: local edits there are lost. Repos change the standard here, not in their copy.
