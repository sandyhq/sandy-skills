## Why
CHANGELOG.md says what each version newly blocks, but the npm package left it out, so a repo upgrading from the installed package found no changelog in node_modules.

## Your decisions
None open.

## What Changes
- **sandy-skills**: the npm package holds CHANGELOG.md; the smoke install checks that the installed package has it.
- **sandy-skills**: CHANGELOG.md names the 0.7.0 review fixes.

## Not in this change
- docs/: it stays out of the package; README.md links it on GitHub.
