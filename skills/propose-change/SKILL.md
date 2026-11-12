---
name: propose-change
description: Propose an OpenSpec change with the proven schema - small, owner's part first, plain exact wording - with delta specs in the part format, decisions with rejected alternatives, and tasks that are the claims to prove as todo tests. Use when new or changed behaviour needs a plan before code, or when spec-first opens a change.
---

# Propose a change

A change is the plan for a behaviour change, approved through the MR. It holds intent only: no results.

## Steps

1. **Read first.** `openspec list --specs` and `openspec show <id> --type spec --json --no-scenarios` for related parts; read the ones you will change in full. Reuse an existing part instead of inventing a near duplicate.
2. **Create it** with an id that names the outcome (`add-retry-on-timeout`):
   ```sh
   openspec new change <id> --schema proven
   openspec instructions proposal --change <id>
   ```
   Then follow `openspec instructions <artifact> --change <id>` for each artifact in order: proposal, specs, design, tasks.
3. **Read the shape.** Every file has fixed sections, the owner's part on top, and plain, exact wording: [changes](https://github.com/sandyhq/sandy-skills/blob/main/standards/changes.md). Follow it as written.
4. **proposal.md**: Why (the owner's problem, 1 or 2 sentences), Your decisions (open owner decisions with your recommendation, or `None open.`), What Changes (at most 5 bullets, parts by spec id), Not in this change. A changed contract voids every confirmation of that part; say so under What Changes.
5. **Delta specs**: the part format. A new part gets its Purpose with the `Kind: … · Part of: … · Carried by: … · Status: proposed · Code: …` line, a Contract and its claims. Every scenario is GIVEN (the starting state, `GIVEN any repo` when it does not matter), WHEN (the action), THEN (the outcome), TEST, in this order, with AND lines only after GIVEN, WHEN or THEN.
6. **design.md**: Owner decisions in his words, Agent decisions with the rejected option, Risks. This is the decision record; it is archived with the change and never edited later.
7. **tasks.md**: Your steps, Proof (per claim one line `- [ ] 2.1 Prove` followed by `<path>::<claim sentence>` in backticks), Build (by what, each task ending with its check).
8. **Check**: `openspec validate <id> --strict`, then `sandy-skills check`. Fix every `over-limit`, `vague-word` and `scenario-shape`; on `long-change`, split the change. Open the MR as draft. The owner's approval of the MR approves the change.

## Rules

- One change per outcome. A change over the limits gets split into two changes, never trimmed into vagueness.
- Never invent an opinion, reason or example for the owner; a gap becomes an open decision under Your decisions.
- Status `proposed` until the code exists; the change that ships it sets `active`.
