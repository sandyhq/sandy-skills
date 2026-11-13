## Owner decisions

- 1 recursive list of spec files for all checks.

## Agent decisions

- The list lives in src/openspec.mjs next to loadSpecs; rejected: a copy in each check, which is how the gap arose.
- A file openspec/specs/spec.md has no folder and stays no part.

## Risks

- A folder holds a spec.md that is no part → check reads it as one, as OpenSpec does.
