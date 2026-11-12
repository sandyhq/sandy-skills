---
name: spec-first
description: Build or change behaviour in a repo whose OpenSpec uses the proven schema - find the part, state each behaviour as a claim with a todo test, build until the tests pass, and prove it with specproof. Use for any code change in a repo with openspec/schemas/proven/.
---

# Spec first

The spec says what must hold, a test proves each claim, `specproof` computes what is proven. Format: [spec-format.md](../../standards/spec-format.md).

## Steps

1. **Find the part.** `openspec list --specs`, then `openspec show <id> --type spec` for every part the change touches: its Purpose (why), Contract, Seams and claims. Read the code under its `Code:` paths. A part that does not exist yet is a new capability.
2. **Open a change.** Use the propose-change skill. Skip it only for a change with no spec-level behaviour (refactor, tooling, docs): then write no claim and no todo test.
3. **Write the claims as todo tests first.** One test per claim. Its name is the requirement sentence, word for word; mark it todo or skipped. The TEST line in the spec and the task in `tasks.md` both name it as `<path>::<test name>`. Unit tests under the part's `Code:` path prove the part; an integration test proves a seam or a container; an end-to-end test proves the system.
4. **Build.** Turn one todo test at a time into a passing test, then the next. Change a claim sentence only in the spec and the test together.
5. **Prove.** Run the tests the change reaches with a JUnit reporter, then:
   ```sh
   openspec validate --all --strict
   specproof check --junit <report.xml or dir>
   ```
   Fix every error. A warning stays only with a reason in the MR description.
6. **Hand over.** Put the report (`--out reports/specproof.md`) in the MR. Name which claims are proven by a passing test and which are still open. Archive the change (`openspec archive <id>`) when the MR merges.

## Rules

- Never write `CONFIRMED` or `REFUTED` lines. Those come from a person through the confirm-part skill.
- A failing or missing test is never fixed by deleting its TEST line. Change the claim, through a change, if the behaviour really changes.
- Decisions: one module's in its doc comment, one behaviour's in its test, across parts in the change's `design.md`.
