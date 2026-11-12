## Why

A repo that keeps other sandy-skills settings with their own limits key gets the wrong thresholds today. The owner then sees a block he never set.

## Your decisions

None open.

## What Changes

- **cli** reads thresholds only from `limits` directly under `sandy-skills`; a `limits` key 2 or more levels down counts as no threshold.

## Not in this change

- Other keys under `sandy-skills`: check ignores them, as before.
