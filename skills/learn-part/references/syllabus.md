# Syllabus

Everything the learner needs to understand to own this repo, as topics with a source each. A topic without a source in the repo or a run can't be taught or examined; ask the learner whether it matters and where its truth lives.

## Topics

- **Parts.** `openspec list --specs`. Order them along `Part of`, top-down: the system, then its containers, then components. For each part, the learner learns six things: intent (Purpose), contract, claims and their tests, seams, decisions (the archived `design.md` of the changes that touched it), and failure modes.
- **Beyond the specs**, as far as the learner needs them to work with the repo:
  - how the repo is laid out and why: README, AGENTS.md, docs/
  - the toolchain: build, tests, CI, release, deploy
  - the domain concepts the specs use
  - the main dependencies and what each is trusted with
  - operations: how it runs, where logs and alerts go, how it fails in production

## Order

Start with what the learner must decide on or approve soon. Next comes what changes most (`git log --since=1.month --name-only`). Then the parts whose I side `sandy-skills check` shows open or expired.

## Format

`.learn/<who>/syllabus.md` holds one table with the columns topic, kind (part, concept, tool, ops), sources, level and next review.
