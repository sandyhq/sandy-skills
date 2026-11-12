## Why

The owner loses the thread in a long change. He wants each change readable in about 3 minutes, and a clear stop when one grows past that.

## Your decisions

None open.

## What Changes

- **cli** warns with `long-change` when an open change has more than 500 words, and blocks with `over-limit` above 750.
- **Per file**, warn and block: proposal 150 and 225 words, design 125 and 190, tasks 75 and 115, delta specs 150 and 225, requirements 5 and 7.
- **Defaults** hold while `openspec/config.yaml` sets no limits.

## Not in this change

- How words are counted, and which changes are measured.
- Own thresholds in `openspec/config.yaml`.
- Vague words.
