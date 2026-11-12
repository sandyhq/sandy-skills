## Owner decisions

- Review of 468b46a, finding 1: "normalise line endings first".

## Agent decisions

- check turns CRLF and a lone CR into LF before it reads a line; rejected: a CR-aware pattern per line, 5 patterns to change.

## Risks

- A CR inside a quoted value turns into LF → no limit or word holds a CR.
