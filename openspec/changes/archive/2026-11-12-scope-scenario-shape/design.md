## Owner decisions

- Scope: `openspec/specs/` and open changes, never the archive.

## Agent decisions

- check reads `openspec/specs/<id>/spec.md` from disk, beside the OpenSpec JSON; rejected: the JSON, which drops line numbers.
- A finding in an open change belongs to the change id; rejected: the spec id, which would read as drift of a part.
