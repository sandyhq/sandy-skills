## Owner decisions

- One change is one merge request, reviewed in at most 60 minutes.
- Formula: change words / 170 + code lines / 8 + 5 per part + 8 per seam + 2 per claim.

## Agent decisions

- Diff: the working tree against the merge base of --base and HEAD; rejected: commits only, dropping uncommitted work.
- Changed lines: added plus deleted; rejected: added only, which hides deletions.
- Change words: the Markdown of each change the diff touches, counted as check counts, open or archived.
- Tie: cli and diagram both own bin/; every part at the deepest match counts; rejected: one, which hides a part.
- Tests: test/, tests/, `.test.`, `.spec.`; lock files: `*-lock.*`, `*.lock`, `*.lockb`, go.sum; generated: git's linguist-generated attribute.

## Risks

- Weights are estimates → configure-review-time makes them configurable.
