## Why
One change is one merge request, and the owner reviews it in at most 60 minutes. Counting code lines alone misses 10 lines that change 3 contracts.

## Your decisions
None open.

## What Changes
- **review-time**, a new part under **cli**: `sandy-skills review-time --base <ref>` prints the estimated review minutes of the diff and each share.
- **Formula:** change words / 170 + code lines / 8 + 5 minutes per part + 8 per changed seam + 2 per changed claim.
- **Code lines** leave out tests, Markdown, openspec/, lock files and generated files.

## Not in this change
- Thresholds that warn or fail.
- Weights in config.yaml.
