# Changes: small, owner first, exact

A change plans one outcome the owner decides in 3 minutes; over the limits, the change is split, never trimmed to say less.

## Files

Headings in this order; no file points to another.

**proposal.md**: the owner's problem, 1–2 sentences; open decisions with a recommendation; at most 5 bullets, bold key words, parts by spec id, **BREAKING** and changed Contracts marked; what readers will not find.

```markdown
## Why
Long changes lose the owner.
## Your decisions
None open.
## What Changes
- **cli** blocks above 750 words.
## Not in this change
- Archives.
```

**design.md**, frozen at archiving: owner choices and why, his words; agent choices with the rejected option; risk → answer. One line each; never context, current state, runbooks, maps, research notes or file names.

```markdown
## Owner decisions
- 750 words: "read in 3 minutes".
## Agent decisions
- Skip marks; rejected: counting ##.
## Risks
- Lost thread → Why names the outcome.
```

**tasks.md**: owner steps (decide, approve, confirm); a Prove line per new or changed claim, todo test first, named by the claim; build tasks by outcome, each with its check.

```markdown
## 1. Your steps
- [ ] 1.1 None
## 2. Proof
- [ ] 2.1 Prove `test/a.test.mjs::<claim>`
## 3. Build
- [ ] 3.1 Thresholds; run tests
```

**Delta specs** follow the [spec format](spec-format.md): one SHALL sentence per requirement, WHEN, THEN and TEST per scenario, Purpose first in new parts.

```markdown
### Requirement: Warn band
Above warn, check SHALL warn.
#### Scenario: Long
- **WHEN** 151 words
- **THEN** check warns
- **TEST** `test/a.test.mjs::<claim>`
```

## Wording

Simple and exact, so a reader cannot misread it.

1. Answer first; one point per line; at most 5 items per list, 25 words per sentence.
2. One term per thing, in every file; parts by spec id.
3. Named subjects, active voice; "it", "this", "that" only with their noun.
4. Numbers with units: "in 2 days", not "soon".
5. Unknowns: "not known" or a range, never a guess.
6. Constraints: hard or negotiable; decisions: owner or agent.
7. No jargon in Why, Your decisions, Your steps; one clause explains each term new to the owner.
8. His decisions in his words, nothing invented; gaps become open decisions.
9. Made-up labels (P1) with their meaning.
10. Simplify the telling, never the claim.

## Limits

`sandy-skills check` measures open changes only: above warn `long-change` (warning), above error `over-limit` (blocks release), with file, count and threshold.

Key | warn | error
---|---|---
total (whole change) | 500 | 750
proposal | 150 | 225
design | 125 | 190
tasks | 75 | 115
specs (delta specs) | 150 | 225
requirements (headings) | 5 | 7

Other keys count words: tokens with a letter or digit, outside code fences, comments, TEST lines and Prove claims.

`vague-word` blocks release: listed words, whole, any case, outside backticks, SHALL and bold WHEN, THEN, AND, GIVEN. Default: should, may, might, could, just, simply, probably, maybe, etc, various, appropriate, appropriately, as needed, if needed, and/or, tbd, some, several, soon, fast, quickly.

Override under `sandy-skills.limits` in `openspec/config.yaml`, as in `tasks: { error: 100 }`. Missing keys or fields keep defaults; `vagueWords` replaces the default list; other YAML stops check at its line.
