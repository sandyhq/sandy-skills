## Owner decisions

- Review of 468b46a, finding 2: "only the direct child of sandy-skills counts".

## Agent decisions

- check takes the indent of the first key under `sandy-skills` as the child level; rejected: a fixed indent of 2 spaces, which breaks a 4-space file.

## Risks

- A file indents the keys under `sandy-skills` unevenly → YAML rejects that file too, and check takes the first key's indent.
