## Owner decisions

- Review of 468b46a, finding 4: multi-line backtick spans give false vague-word errors.

## Agent decisions

- check closes a span at the next run of as many backticks in the same paragraph, as Markdown does; rejected: a span per line, the cause of the false findings.

## Risks

- An unclosed backtick → check reads the rest as prose, and the writer sees the finding.
