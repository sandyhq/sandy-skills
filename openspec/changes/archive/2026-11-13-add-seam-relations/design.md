## Owner decisions

- Each `Seam to <id>` carries `Relation: <value> · Upstream: <id>`, with 1 of the 7 values of the glossary.
- A seam without a Relation line: Error right away.

## Agent decisions

- check reads the 7 values from the relation entry of `standards/glossary.md`; rejected: a second list in the code.
- The Relation line stays out of the claim sentence, so the test name stays the same.
- The seam from skills to cli: `Relation: open-host-service · Upstream: cli`, because cli offers 1 documented set of commands to each caller.
- The arrow reads the relation first, then read-only or exclusive: `conformist, read-only`.

## Risks

- Each adopting repo fails check until each seam has a Relation line → the finding names the seam.
