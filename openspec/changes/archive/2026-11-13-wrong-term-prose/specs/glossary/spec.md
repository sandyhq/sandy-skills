## ADDED Requirements

### Requirement: Prose only
check SHALL read for wrong-term only the prose of Markdown, never indented code or the address of a link, image or URL, while a link label counts as prose and a setext heading as a heading.

#### Scenario: Prose only
- **GIVEN** a spec with `module` in indented code, in link and image addresses, in URLs, in a link label and under a setext heading `Requirement`
- **WHEN** check runs
- **THEN** it reports wrong-term only for the link label and the list text
- **TEST** `test/glossary.test.mjs::check SHALL read for wrong-term only the prose of Markdown, never indented code or the address of a link, image or URL, while a link label counts as prose and a setext heading as a heading.`
