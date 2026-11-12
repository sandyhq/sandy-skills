## Owner decisions

- Words are whitespace-separated tokens, without fenced code, HTML comments, TEST lines and Prove claim texts.
- Limits apply to active changes only, never to the archive or the specs.

## Agent decisions

- A token counts only with a letter or digit; rejected: counting `-`, `[ ]` and `##`, 4 words per task line.
- In a Prove task, "Prove" and the path count; rejected: dropping the line, which hides a long list of claims.

## Risks

- Prose inside a code fence escapes the count → the reviewer sees the fence in the diff.
