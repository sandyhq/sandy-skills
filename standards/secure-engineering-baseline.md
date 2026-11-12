# Secure engineering baseline

**Status:** Draft. Which checks each repo already runs is not yet inventoried.

AI makes code faster to produce, but we still answer for what we ship. The baseline sets which checks run at which stage, and makes every release carry evidence that they ran, instead of a promise that it was reviewed.

## Stages

| Stage | Checks |
|---|---|
| Pre-commit | Linter, formatter, style, secret scan, known CVEs, test first |
| Commit (CI) | Unit tests, SAST, secret detection, dependency scan, `openspec validate --all --strict`, `sandy-skills check` |
| Acceptance | Acceptance tests, deployment, DAST, vulnerability scan, SCA |
| Production | Automatic deployment, observability; what it shows feeds back into development |

Development itself is pair or ensemble programming with AI support, with a person in the loop for every change an agent writes.

## Evidence per release

Every release has a **releasability report**: which checks ran on that commit and what they found. For behaviour, that is the `sandy-skills check` report ([spec-format.md](spec-format.md)): each claim with the test that proves it at that commit, and each part's light. It is a CI artifact, never committed.

## What makes code secure

Maintained and current libraries; no secrets in code; input validation; secure authentication; encrypted transfer; code review; a person in the loop for AI-written code.

## Changes

Every change in behaviour starts as an OpenSpec change (`openspec/changes/<id>`) and is approved through its MR.

## Open

- Take stock per repo of what runs in pre-commit and CI, then agree a minimal baseline and a first pilot.
- Pick the concrete tools per language (secret scan, SAST, dependency scan) once the inventory exists.
