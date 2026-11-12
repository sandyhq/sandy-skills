## Why

Repos keep a Mermaid picture of the whole system next to their specs. Drawn by hand, it drifts from the specs' "Part of" and "Seam to" lines, and nothing notices. The picture should be generated from the specs, and check should catch a stale one.

## What Changes

- New command `sandy-skills diagram [<id>]`: prints a Mermaid flowchart of the parts, nested by Part of, with one edge per seam. With an id: that part, the parts below it and their neighbours.
- Marked blocks (`<!-- sandy-skills diagram: <id or all> -->` … `<!-- /sandy-skills diagram -->`) in any Markdown file of the repo hold a generated diagram. `diagram --write` refreshes them in place.
- `sandy-skills check` reports `stale-diagram` for a block that differs from what diagram generates, and `unknown-part` for a block that names no spec. Repos without blocks see no change.
- New standard `standards/diagrams.md`: pictures of parts and seams are generated, never drawn by hand.
- spec-first tells agents to run `sandy-skills diagram --write` after changing specs.

## Capabilities

### New Capabilities

- `diagram`: generates the diagram and keeps the marked blocks equal to it.

### Modified Capabilities

- `skills`: the seam to cli also allows `diagram`.

## Impact

No contract changes, so no confirmation is voided. The seam sentence of skills changes; it carries no confirmation.
