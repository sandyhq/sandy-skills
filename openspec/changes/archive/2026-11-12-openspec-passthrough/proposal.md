## Why

A repo with sandy-skills runs two CLIs: `openspec` for the specs and changes, `sandy-skills` for the proof. People and agents have to remember which command belongs to which tool, and CI runs `openspec validate` and `sandy-skills check` as two steps that only make sense together. One command name should be enough.

## What Changes

- Every command sandy-skills does not own (`init`, `update`, `check`, `validate`, `diagram`, `hash`, `confirm`) goes to the OpenSpec CLI that sandy-skills already runs, unchanged: same arguments, inherited input and output, same exit code. `sandy-skills list --specs` is `openspec list --specs`.
- `sandy-skills openspec <args>` runs OpenSpec with those arguments, for the commands whose names sandy-skills takes (`openspec init`, `openspec update`) and for OpenSpec's help.
- New command `sandy-skills validate`: `openspec validate` with the given arguments, then `sandy-skills check` with `--junit`, `--out` and `--strict`; both outputs, non-zero when either fails.
- `sandy-skills --help` lists the sandy-skills commands and says that every other command is OpenSpec's.
- Docs use `sandy-skills <command>` throughout and say that `openspec` still works directly. spec-first proves with `sandy-skills validate`.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `cli`: passes every other command to OpenSpec, and adds `validate`.
- `skills`: the seam to cli also allows `validate`.

## Impact

No contract changes, so no confirmation is voided. The seam sentence of skills changes; it carries no confirmation. `openspec` keeps working as before; nothing a repo runs today breaks. Version 0.4.0.
