# Changelog

What each version newly blocks, then what else changed. Upgrading from 0.4 or older: [getting started](docs/getting-started.md#5-upgrade-to-07-from-04-or-older).

## 0.7.0

Blocks newly, as errors of `check` in specs and open changes:

- `wrong-term`: a word from a Not line of the [glossary](standards/glossary.md). The repo's `docs/glossary.md` adds its own words; a word it defines is never wrong.
- `missing-relation`, `bad-relation`: a seam without the line `Relation: <value> · Upstream: <id>`, with a value outside the 7 of the glossary, with an upstream that is neither part of the seam, or with 2 or more Relation lines.
- `scenario-shape` and `wrong-term` also in specs in nested folders below `openspec/specs/`.

Also:

- `wrong-term` reads only prose: never fenced or indented code, the address of a link, image or URL; link labels count. It finds a term of 2 or more words across line wraps and emphasis. A word that `docs/glossary.md` defines, with up to 3 spaces before `##` or a closing `#`, also covers its plural and singular.
- The diagram writes the relation of each seam on its arrow.
- The package holds this changelog.
- Findings and the report say claim and seam. The limits key `claims` sets the claims per change; `requirements` still works.
- The spec template has a seam with its Relation line. The skills name the glossary, the Relation line, and in propose-change `review-time`.

## 0.6.0

Blocks newly:

- `sandy-skills review-time --base <ref>` exits 1 for a merge request with more than 60 estimated review minutes or more than 400 code lines, a code file no part owns (`unowned-file`), 0 or 2 or more changes (`no-change`, `many-changes`), or code in a part without a delta spec (`no-delta-spec`). It warns above 30 minutes or 200 code lines, and blocks only where CI runs it ([CI](docs/usage.md#ci)).
- `long-review` in `check`: an open change of more than 60 estimated review minutes; a warning above 30.

Also: weights and thresholds in `sandy-skills.review` of `openspec/config.yaml`. Specs in nested folders below `openspec/specs/` are parts; Go and Python test files count as tests, not code lines.

## 0.5.0

Blocks newly, as errors of `check`:

- `over-limit`: an open change over 750 words, a file over its limit (proposal 225, design 190, tasks 115, specs 225 words) or more than 7 claims. `long-change` warns above 500 words, 150, 125, 75 and 150 words, or 5 claims.
- `vague-word`: a word such as `should`, `may`, `etc` or `tbd` in an open change.
- `scenario-shape`: a scenario in specs or open changes without the lines GIVEN, WHEN, THEN, TEST in this order.

Also: proposal, design and tasks have fixed sections with the owner's part first; thresholds in `sandy-skills.limits` of `openspec/config.yaml`.
