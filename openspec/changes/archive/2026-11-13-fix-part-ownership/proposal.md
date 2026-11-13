## Why
review-time blocks a merge request for a code file that no part owns. In this repo, bin/ belonged to cli and diagram, so each change to bin/sandy-skills.mjs needed a delta spec for both. package.json, scripts/, LICENSE, .gitignore, .agents/ and .claude/ belonged to no part.

## Your decisions
None open.

## What Changes
- **diagram** owns src/diagram.mjs only.
- **cli** owns package.json too.
- **sandy-skills** owns scripts/, LICENSE, .gitignore, .agents/ and .claude/ too.
- **sandy-skills**: a repository test proves that each tracked code file has exactly 1 owner.

## Not in this change
- The review-time gate: a change that touches cli code still brings a cli delta spec.
