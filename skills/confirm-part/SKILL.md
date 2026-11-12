---
name: confirm-part
description: Interview a person to confirm one side (I, We or They) of a part's contract, and write the CONFIRMED or REFUTED line they commit. Use when sandy-skills check shows a side open or expired, before a release that needs human proof, or when the owner asks to confirm a part.
---

# Confirm a part

Tests prove the It side: does the part keep its contract. Three sides need a person, and only a person can give them. You ask; the person answers and commits. You never confirm anything yourself.

| Side | The question it answers | Who answers |
|---|---|---|
| I | Can someone explain this part? | Anyone who works on it, ideally not its carrier |
| We | Does the whole above count on it? | The carrier of the part named in `Part of` |
| They | Does it hold up among everything around it? | The carrier of a neighbour across a seam, or a user or operator |

## Steps

1. `openspec show <id> --type spec`. Note the Purpose, the Contract and the seams. Pick the side and the person with the owner.
2. Ask, one question at a time, without showing the spec first:
   - **I**: Why does this part exist? What must it always do? What happens at its edges, when a seam fails?
   - **We**: What do you rely on this part for? What would break above if its contract stopped holding?
   - **They**: What do you send it or take from it? What has gone wrong between you and it?
3. Compare the answers with the Purpose and Contract. Report back what matched, what was missing and where they hesitated.
4. The person decides the result:
   - Confirmed: `sandy-skills confirm <id> <I|We|They> <who>` prints the line, valid 90 days by default (`--days` for fewer). The person adds it under the Contract's scenario and commits it under their own name.
   - Refuted: the same line with `REFUTED` instead of `CONFIRMED`. Then open a change (propose-change) to fix the contract or the code.
5. Run `sandy-skills check`. The side now shows soft, or claimed when the person carries the part themselves.

## Rules

- `by` is the person, never an agent. An agent's review is evidence for the person, not a confirmation.
- The line carries the contract hash. If the contract changes, the confirmation stops counting on its own; then confirm again.
- No answer, or the person is unsure: write nothing. The side stays open.
