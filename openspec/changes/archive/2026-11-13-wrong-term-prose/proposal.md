## Why
wrong-term read Markdown line by line and skipped only fences, comments and backticks. An indented code example or a URL in a link blocked a spec, and the error asked to reword an address. A setext heading counted as prose, so a word allowed in headings was reported there.

## Your decisions
None open.

## What Changes
- **glossary**: wrong-term reads only prose: indented code, the addresses of links, images, autolinks and URLs, and reference definitions are left out; link labels stay in.
- **glossary**: a setext heading is a heading, as an ATX heading is.

## Not in this change
- vague-word: it keeps its line rules.
