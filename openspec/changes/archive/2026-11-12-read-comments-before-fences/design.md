## Owner decisions

- Review of 468b46a, finding 5: "strip comments before fences, keep line numbers".

## Agent decisions

- One pass over the lines tracks the open comment or fence; rejected: comments first over the whole text, which lets an `<!--` in a fence hide the rest.

## Risks

- An unclosed comment → check skips the rest of the file, as Markdown hides it.
