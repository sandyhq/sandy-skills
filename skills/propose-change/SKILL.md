---
name: propose-change
description: Propose an OpenSpec change with the proven schema - why, delta specs in the part format, decisions with rejected alternatives, and tasks that are the claims to prove as todo tests. Use when new or changed behaviour needs a plan before code, or when spec-first opens a change.
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
3. **proposal.md**: the why in two sentences, what changes, the parts it creates or modifies.
4. **Delta specs**: the part format. A new part gets its Purpose with the `Kind: … · Part of: … · Carried by: … · Status: proposed · Code: …` line, a Contract and its claims. A changed contract voids every confirmation of that part. Say so in the proposal, so the carrier knows to confirm it again.
5. **design.md**, only when a choice is open: each decision with the alternatives rejected and why. This is the decision record; it is archived with the change and never edited later.
6. **tasks.md**: one task per claim, naming its test as `<path>::<claim sentence>`, then the build work, each group ending with running its tests and `specproof check`.
7. **Check**: `openspec validate <id> --strict`. Open the MR as draft. The owner's approval of the MR approves the change.

## Rules

- One change per outcome. Split a change that needs more than one screen of tasks.
- Status `proposed` until the code exists; the change that ships it sets `active`.
