## Owner decisions

- Warn at 500 words, block at 750: "The best change is 500 to 750 words."
- Per-file thresholds scale the same way, from proposal 150 and 225 to requirements 5 and 7.

## Agent decisions

- A finding starts above the threshold, so 500 words pass; rejected: starting at 500, which warns on exactly 5 requirements.
- Findings belong to the change, never to a part's drift; rejected: drift on the parts it touches.

## Risks

- A writer trims a long change into vagueness → the finding says "split the change".
