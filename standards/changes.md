# Changes: small, owner first, exact

**Status:** Draft. `sandy-skills check` measures the limits and the vague words; only this repo uses them so far.

A change is the plan for one outcome. The owner reads it in about 3 minutes and decides from it. So a change is short, puts the owner's part on top and names each thing one way. A change over the limits is split into two changes, never trimmed until it says less.

## Files

Each file has fixed headings, in this order, and stands on its own: no pointers to another file of the change.

**proposal.md**

- `## Why`: one or two sentences, the problem as the owner sees it.
- `## Your decisions`: each open owner decision with the agent's recommendation, or `None open.`
- `## What Changes`: at most 5 bullets, key words bold first. Name each part by its spec id. Mark **BREAKING**, and a changed Contract, which voids that part's confirmations.
- `## Not in this change`: what a reader might expect here and will not find.

```markdown
## Why

Long changes lose the owner halfway; he wants each one readable in 3 minutes.

## Your decisions

- **Block at 750 or 1000 words?** Recommendation: 750, so a split comes early.

## What Changes

- **cli** warns above 500 words per open change and blocks above 750.

## Not in this change

- Limits for archived changes.
```

**design.md**, the decision record, archived with the change and never edited afterwards:

- `## Owner decisions`: one line each, what the owner chose and why, in his words.
- `## Agent decisions`: one line each, what the agent chose and the rejected option in one clause.
- `## Risks`: one line each, risk → answer.

Never in design.md: context, current state, runbooks, maps, research notes, file names.

```markdown
## Owner decisions

- Warn at 500 words, block at 750: "a change is read in 3 minutes".

## Agent decisions

- Only tokens with a letter or digit count; rejected: counting Markdown marks like `-` and `##`.

## Risks

- A split loses the thread → each change names its own outcome in Why.
```

**tasks.md**

- `## 1. Your steps`: the owner's steps (decide, approve, confirm), or `- [ ] 1.1 None`.
- `## 2. Proof`: one `Prove` line per new or changed claim, its test written first as a todo test named by the claim sentence.
- `## 3. Build`: tasks grouped by what they build, not by file; each ends with its check.

```markdown
## 1. Your steps

- [ ] 1.1 None

## 2. Proof

- [ ] 2.1 Prove `test/limits.test.mjs::When a measure of an open change is above its warn threshold and at most its error threshold, the checker SHALL report long-change as a warning.`

## 3. Build

- [ ] 3.1 Thresholds in check; run the tests and `sandy-skills check`
```

**Delta specs**, `specs/<spec id>/spec.md` in the [spec format](spec-format.md): `## ADDED`, `MODIFIED`, `REMOVED` or `RENAMED Requirements`. Each requirement is one claim sentence with SHALL; each scenario has WHEN, THEN and a TEST line. A new part starts with `## Purpose`.

```markdown
## ADDED Requirements

### Requirement: Warn band
When a measure of an open change is above its warn threshold and at most its error threshold, the checker SHALL report long-change as a warning.

#### Scenario: Long proposal
- **WHEN** proposal.md has 151 words
- **THEN** check reports long-change as a warning
- **TEST** `test/limits.test.mjs::When a measure of … as a warning.`
```

## Wording

Simple and exact, so that a reader cannot misread it.

- Answer first. At most 5 items per list, sentences up to 25 words, one point per line.
- One term per thing. Name a part by its spec id and use the same word for the same thing in every file of the change. No synonyms.
- Every statement says who does what: a named subject, active voice. No "it", "this" or "that" without its noun in the same sentence.
- Numbers with units instead of size or time words: "in 2 days", not "soon"; "3 files", not "a few".
- Say what is not known: "not known" or a range, never a confident guess.
- Mark each constraint hard or negotiable, and each decision with who made it: owner or agent.
- Why, Your decisions and Your steps carry no jargon. A technical term the owner did not use gets one clause on what it means for him.
- Your decisions and Owner decisions use the owner's own words where he gave them. Never invent an opinion, reason or example for him; a gap becomes an open decision.
- A label made up during the work (finding P1, slice 2b) always comes with what it means.
- Simplify the telling, never the claim: round a number, do not invent one.

## Limits

`sandy-skills check` measures every open change in `openspec/changes/`, never `archive/` or `openspec/specs/`. More than warn is `long-change` (a warning); more than error is `over-limit` (an error: not releasable). Each finding names the file, the measured count and the threshold.

| Measure | warn | error |
|---|---|---|
| `total`: words in all files of the change | 500 | 750 |
| `proposal`: words in proposal.md | 150 | 225 |
| `design`: words in design.md | 125 | 190 |
| `tasks`: words in tasks.md | 75 | 115 |
| `specs`: words in all delta specs | 150 | 225 |
| `requirements`: in all delta specs | 5 | 7 |

500 words take about 3 minutes at 170 words per minute. A word is a whitespace-separated token with a letter or digit, so `-`, `[ ]` and `##` do not count. Not counted: fenced code blocks, HTML comments, `- **TEST**` lines, and in tasks.md the claim text of a Prove line (`Prove` and the path count).

`vague-word` (an error) is each word of the list below in an open change, matched as a whole word in any case. Not matched: fenced code, HTML comments, text in backticks, SHALL and the scenario keywords WHEN, THEN, AND and GIVEN. Default list: should, may, might, could, just, simply, probably, maybe, etc, various, appropriate, appropriately, as needed, if needed, and/or, tbd, some, several, soon, fast, quickly.

Override in `openspec/config.yaml`, which OpenSpec accepts with this key. A missing measure or field keeps its default; `vagueWords` replaces the whole list.

```yaml
sandy-skills:
  limits:
    total: { warn: 600, error: 900 }
    tasks: { error: 100 }
    vagueWords: [should, may, soon]
```
