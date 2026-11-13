## Owner decisions

- None.

## Agent decisions

- A paragraph ends at a blank line, a heading, a list item or a table row, so a term never spans 2 list items; rejected: the whole file as 1 text, which joins unrelated lines.
- `_` counts as emphasis only at the edge of a word, so node_modules keeps its underscore.
- 1 finding per term and line, so a term twice on 1 line gives 1 error.

## Risks

- A list item continued on the next line without indent → read as 1 paragraph, as CommonMark reads it.
