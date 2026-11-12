## Why

The passthrough runs OpenSpec as a child that waits synchronously. A SIGTERM or SIGINT sent to sandy-skills alone (a CI runner cancelling a job, a supervisor stopping a process, `kill <pid>`) ends sandy-skills and leaves OpenSpec running, detached from anyone waiting for it. A wrapper must not change how a process stops.

## What Changes

- While OpenSpec runs for the passthrough, `sandy-skills openspec` or `validate`, sandy-skills passes SIGINT, SIGTERM and SIGHUP to it, waits until it ends, then exits with its exit code, or ends itself by the same signal when a signal ended OpenSpec.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `cli`: the passthrough forwards signals.

## Impact

No contract changes, so no confirmation is voided. Ctrl-C in a terminal behaves as before: the terminal signals both processes.
