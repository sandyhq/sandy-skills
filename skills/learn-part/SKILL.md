---
name: learn-part
description: Teach a person what was built in this repo until they can explain it, predict its behaviour and change it themselves - its parts from the specs, and the tools, concepts and operations they need. Hands-on in the real repo, with spaced reviews in .learn/. Use when someone wants to understand a part, catch up on agent-built work, or prepare for examine-part.
---

# Learn a part

Goal: the learner can explain the part to a new colleague without notes, predict what it does in a case they have not seen, and change it safely. Reading a good explanation feels like understanding and is not. Only what the learner says, predicts or does counts.

## Before you start

- The learner's handle `<who>` is the name they use in CONFIRMED lines. Their records live in `.learn/<who>/`, which setting up sandy-skills adds to `.gitignore`; add `.learn/` yourself if it is missing. Layout and review schedule: [records](references/records.md).
- Read `.learn/<who>/progress.md`. None yet: build the syllabus ([syllabus](references/syllabus.md)), agree the first topic with the learner, and ask at most three questions to place their level.
- Teach in the words of the [glossary](https://github.com/sandyhq/sandy-skills/blob/main/standards/glossary.md) and the repo's `docs/glossary.md`. When the learner uses a word from a Not line, name the glossary word.

## A session: one unit

1. **Recall.** Ask the questions due today from earlier units. No notes, no hints. A miss sends that item back to tomorrow.
2. **Goal.** Name one part or topic, and what the learner can do after this session that they can't now.
3. **Predict first.** Before showing anything, the learner guesses why it exists, what it promises, what it touches and how it fails. Write the guesses down.
4. **Read it together; the learner drives.** They run the commands: `openspec show <id> --type spec`, then the tests its TEST lines name, then the code, then the decisions in `openspec/changes/archive/*/design.md`. For each seam, read its Relation line (`Relation: <value> · Upstream: <id>`): which part follows which, and how. Explain at most about ten lines at a time, mechanism first, then an example, then hand back. Compare with the guesses from step 3.
5. **Explain back.** The learner explains it as to a new colleague, without notes. Name each gap and each wrong model directly. Re-teach only the gap, then ask again.
6. **Hands-on.** Do the next rung of the [practice ladder](references/practice.md) for this topic.
7. **Intent.** The learner writes the part's why in their own words. Compare it with the Purpose. If the learner was wrong, that is a gap. If the spec is wrong or thin, open a change (propose-change) with the learner's words: the intent is theirs to state.
8. **Record** progress, the session log and the next reviews ([records](references/records.md)).

## Rules

- The learner does the work. Never answer your own question; wait for theirs.
- Correct a wrong model at once and plainly. Politeness that lets it survive does harm.
- Use the real repo and real commands. Edit only in a scratch worktree under `.learn/<who>/scratch/` and remove it afterwards. Real changes go through propose-change.
- A unit ends with its goal met or recorded as open, never as done because time ran out.
- Say when the learner is ready for examine-part ([records](references/records.md)). You never examine them yourself: the exam needs an agent that did not teach.
