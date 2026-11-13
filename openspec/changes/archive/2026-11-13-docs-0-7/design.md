## Owner decisions

- The docs pass the vague-word and wrong-term rules too.
- Vitest and Vite+ come first in the JUnit list; Vite+ is marked untested unless tried.

## Agent decisions

- `vp test run` was tried with vite-plus 1.6.0, and check proved a TEST line from its report, so Vite+ is not marked untested.
- standards/glossary.md is left out of wrong-term only: its Not lines name the words.
- The CI jobs fetch the full history; rejected: a shallow clone, which has no merge base.

## Risks

- The GitLab job runs on no pipeline yet → the first merge request pipeline proves it.
