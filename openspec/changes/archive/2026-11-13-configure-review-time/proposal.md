## Why
The minutes per part, seam and claim are estimates. The owner calibrates them on 5 to 10 past merge requests, without a new release.

## Your decisions
None open.

## What Changes
- **review-time** reads weights and thresholds from `sandy-skills.review` in `openspec/config.yaml`; a missing key keeps its default.
- **cli**: `check` estimates each open change before code exists, from its words, parts, seams and claims, with the same thresholds.

## Not in this change
- The calibration itself: the owner's step after the release.
