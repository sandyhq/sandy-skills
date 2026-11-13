## Owner decisions

- Each repo writes its own words in `docs/glossary.md`.
- The claim moved here from add-glossary, so that no change goes over 225 words of specs.

## Agent decisions

- The Not lines of `docs/glossary.md` count too; a word it defines as a heading is never reported.
- check reads `standards/glossary.md` from the installed package, not from the repo; rejected: a copy per repo that ages.
- A repo without `docs/glossary.md` gets the standard's words only.

## Risks

- A repo defines a word of the standard as its own → check stops reporting that word in the repo; the definition stays visible in `docs/glossary.md`.
