# Repo structure for projects with AI agents

**Status:** Proposal, not yet tried on a project. The benefit is argued, not measured: after the first project, record which files were actually read.

Project knowledge spread across wikis, tickets and people's heads makes agents guess, and a different layout in every repo makes onboarding, handovers and reviews start from zero. A fixed layout in which each file answers one question works for people and agents alike.

## Five rules

1. Everything an agent needs as context is in the repo. Joint writing can happen in a wiki; the result moves into the repo and is linked from there.
2. Everything is Markdown, except API descriptions.
3. A fact lives in exactly one place; other files link to it.
4. Every file fits on one screen; when it grows, it becomes two files.
5. A file is created only once it has content. No empty scaffolding.

## Layout

Each entry answers one question and is created when that question first comes up.

```
README.md            What is this, what state is it in, how do I start?
AGENTS.md            How do I build and test here, what must I not touch?
docs/
  scope.md           What is built, and what explicitly not, per milestone
  architecture.md    Which parts, how they connect, which imports are allowed
  test-strategy.md   Which environment, which check runs where
  runbook.md         Deploy, rollback, alerts; updated after every incident
  open-questions.md  Question, who answers it, open since when
  glossary.md        What a word means here
  sources.md         Where the knowledge comes from
openspec/            Parts, claims and changes (see spec-format.md)
api/                 Machine-readable API descriptions
services/            Code, one folder per service
deploy/              Automation for environments
spikes/              Throwaway code; what is adopted moves to services/ after review
```

- **AGENTS.md** stays short: build and test commands, naming and commit conventions, areas an agent must not change, and a pointer to `scope.md` with the rule "what is not in scope is not built".
- **scope.md** has two lists, in and deliberately out; the second stops agents and people from building more than asked.
- **Decisions** live in the `design.md` of the OpenSpec change that made them, archived and never edited, superseded by a later change; a decision about one module also in its doc comment ([spec-format.md](spec-format.md)). A repo without OpenSpec keeps them in `docs/decisions/`, one record per file after Michael Nygard: context, decision, rejected alternatives, consequences.
- **sources.md** and **deploy/** hold no passwords or keys; the secret scan of the [baseline](secure-engineering-baseline.md) checks it.

## Why a standard

Agents work only as well as their context, and find it without guidance when it sits in the same place in every repo. Who knows one repo knows all. A handover to operations becomes checkable through `runbook.md` and `test-strategy.md`. Short single-question files make reviews smaller. Nothing here is new: decision records after Nygard, a structure after arc42, `AGENTS.md` as the file several coding agents read.

## Open

- What stays in the wiki and the ticket tracker. Proposal: tickets and status in the tracker, discussion in the wiki, everything durable in the repo.
- Whether an audit regime the project falls under already sets rules for development and change; the standard must fit them.
