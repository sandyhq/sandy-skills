## Owner decisions

- Two thresholds per measure, `{ warn, error }`, under `sandy-skills.limits`; no `level` key.
- A missing key or field takes its default.

## Agent decisions

- check reads only the `sandy-skills.limits` block itself; rejected: OpenSpec's YAML library, which breaks once OpenSpec drops it.
- An unknown measure stops check; rejected: ignoring it, which hides a typo.

## Risks

- The reader takes flow maps, nested lines and lists only → check names the line it cannot read.
