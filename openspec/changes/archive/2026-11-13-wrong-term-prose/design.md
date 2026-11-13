## Owner decisions

- Link labels stay checked.

## Agent decisions

- A line indented by 4 is code only after a blank line or a heading and outside a list, as CommonMark reads it; rejected: each indented line, which skips list text.
- Addresses are blanked, not removed, so each finding keeps its line.
- A path in prose, as `docs/story.md`, stays prose; rejected: guessing paths, which also skips words.

## Risks

- A Markdown form this reader does not know → it stays prose and gets checked.
