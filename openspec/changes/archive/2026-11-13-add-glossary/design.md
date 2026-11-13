## Owner decisions

- 1 word for each thing. sandy-skills ships `standards/glossary.md` with the 14 words of the standard.
- Every part has a Contract: "The glossary SHALL give each thing of the standard exactly 1 word, and check SHALL block the other words for it."
- Over 225 words of specs: the claim on `docs/glossary.md` moves into its own change add-repo-glossary.
- wrong-term is an error in the specs and in open changes.

## Agent decisions

- Matching as for vague words: whole word, any case, outside fenced code, HTML comments and backticks. A plural with s or es counts too.
- Scope: `openspec/specs/*/spec.md` and each Markdown file of an open change; archived changes stay unread.

## Risks

- A repo fails check on its first run with 0.7.0 → each finding names the glossary word to write.
