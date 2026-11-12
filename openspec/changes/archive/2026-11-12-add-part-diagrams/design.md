## Context

Repos keep a Mermaid picture of their parts next to the specs. The specs already hold everything the picture shows: Part of, Seam to, Exclusive., Read-only., status. A hand-drawn copy goes stale silently.

## Decisions

- **Generated blocks inside ordinary Markdown, between two HTML comments.** The picture stays in the doc a reader opens, GitHub and GitLab render it, and the markers are invisible. Rejected: a generated file per diagram (one more file to link and keep, and docs would embed it by hand); generating into a fixed `docs/architecture.md` (repos put the picture where their readers look).
- **check compares, `diagram --write` fixes.** check stays read-only and deterministic; the fix is one command. Rejected: check rewriting the blocks (a check that writes files hides the drift it should report).
- **The label is the spec's `# ` heading** without a trailing " Specification", else the id. OpenSpec's JSON title is the id, so sandy-skills reads that one heading line itself, the only Markdown it reads. Rejected: the id alone (unreadable for people in a repo with titled specs).
- **A diagram of one part shows seams in both directions.** The seams its parts own and the seams of outside parts pointing in; an outside part is a plain node, and edges between two outside parts are left out. Who depends on a part belongs in its picture as much as what it depends on. Rejected: only the seams the part owns.
- **Mermaid ids are `p_` plus the part id** with `-` as `_` and `/` as `__`, which cannot collide for valid ids, and the prefix keeps clear of keywords such as `end`. Sorted by id at every level; classes only for statuses that occur.
- **Stale pictures are findings of the doc, not drift of the part.** Their `part` is the block's id, they carry file and line, and they make the result not releasable without lighting a part as drift. A block without its closing marker is `unclosed-diagram`, an error that `--write` cannot fix.
- **Blocks only outside code fences**, so a standard can show the marker in an example; `.git`, every `node_modules` and `openspec/changes/archive` are skipped, links are not followed.

## Risks / Trade-offs

- check now walks every Markdown file of the repo. Big vendored trees outside `node_modules` cost time, not correctness.
- A Mermaid release could stop rendering some output; the format uses only flowchart, subgraph, edge labels and classDef.
