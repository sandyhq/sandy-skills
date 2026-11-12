# Spec format: proof next to intent

**Status:** Draft. The checker, schema and skills live in this repo and prove this repo's own parts; no other repo uses them yet.

Two ideas, kept without their tools: from **Holons**, every part has a why, a contract and proof from four sides, and the tree shows where the system is not proven; from **scryer**, the spec is the tests: every behaviour is one claim sentence, and the test that proves it carries that sentence as its name. Everything is Markdown in OpenSpec plus the tests in the code. There are no extra source files, and no app or server is needed.

## A part

One OpenSpec capability, `openspec/specs/<id>/spec.md`. This repo's [specproof spec](../openspec/specs/specproof/spec.md) is a full example.

- `## Purpose`: the why, then one line `Kind: container · Part of: <id or none> · Carried by: <who> · Status: active · Code: <paths>`. Kinds: context, system, container, component, operation. Status: proposed, active, retired.
- `### Requirement: Contract`: what must hold, one SHALL sentence.
- `### Requirement: Seam to <id>`: one per neighbour; `Read-only.` or `Exclusive.` (the only writer) in the sentence.
- Every other requirement is one claim, one [EARS](https://alistairmavin.com/ears/) sentence.
- A scenario a test proves ends with `- **TEST** \`<path>::<test name>\``; the test name is the requirement sentence.
- A person's confirmation: `- **CONFIRMED** <I|We|They> by <who> on <date>, expires <date>, contract <hash>` (or `REFUTED`), at most 90 days, hash from `specproof hash <id>`.

## Lights and drift

Computed by `specproof` from the specs and the JUnit report of the current commit; never committed.

- **It** (keeps its contract): ● hard when every referenced test passed, ✕ refuted when one failed, ○ open when one is todo, skipped or untested.
- **I** (someone can explain it), **We** (the whole above counts on it), **They** (it holds among its neighbours): ◐ soft when a person confirmed the current contract, ◌ claimed when that person carries the part, ◇ expired after its date or when the contract changed.
- A part is as proven as its weakest side, or ◇ drift when it has a finding of its own: a failing, missing or todo test outside an open change, a test name that differs from its claim, an unknown parent or seam target, a cycle, a contradiction (an exclusive seam to X while a part outside writes to X), no why, status proposed, or more than 7 children.

## Changes and decisions

Changes use the [proven schema](../openspec/schemas/proven/schema.yaml): the proposal is the why, `tasks.md` lists the claims as todo tests, `design.md` holds the decisions with rejected alternatives and is archived with the change. A decision about one module also sits in its doc comment. Architecture rules (layers, allowed imports) go in `docs/architecture.md`, enforced by the language's import linter; mutation testing on a schedule probes whether the tests really pin the claims.

## Checks

```sh
openspec validate --all --strict
<run the tests with a JUnit reporter>
specproof check --junit <report> --out reports/specproof.md
```

Skills: [spec-first](../skills/spec-first/SKILL.md), [propose-change](../skills/propose-change/SKILL.md), [confirm-part](../skills/confirm-part/SKILL.md).

## Later: the Holons tools

Every field has one place: Purpose and its line give why, kind, partOf, carriedBy, status and code. The Contract and Seam requirements give the contract and seams, the CONFIRMED lines give the confirmations, and the hash is the Holon contract hash, shortened. A converter can be written once those tools are ready; nothing here depends on it.
