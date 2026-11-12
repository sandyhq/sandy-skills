## Why

A config.yaml saved on Windows ends its lines with CRLF. check stops on such a file today, and the owner cannot release.

## Your decisions

None open.

## What Changes

- **cli** reads `openspec/config.yaml` with CRLF line endings the same as with LF.

## Not in this change

- CRLF in the Markdown files of a change.
