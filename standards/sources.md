# Sources

Where the standards come from. Notes on what each source contributed; read the source for the rest.

## Talks

- Stefan Ellersdorfer (S2 Smarter Software), "Secure Coding in the Age of AI: between CI, TDD, AI and executable evidence", [Cybersecurity Day 2026](https://lakeside-scitec.com/aktuelles/neuigkeiten/neuigkeiten-detail/cybersecurity-day-2026-cybersecurity-competition-2026), 2026-11-11 ([programme](https://cyber-night-and-day.at/)). Pipeline stages, the releasability report, the list of what makes code secure. Our notes come from photos of two slides, not a recording.

## Spec and proof

- [OpenSpec](https://github.com/Fission-AI/OpenSpec): specs and changes as Markdown, custom schemas (`openspec schema fork`), `openspec show --json` which `specproof` reads. Built against 2.0.0.
- [Holons](https://github.com/nesyeklaf/holons) (repository not public yet) and the essay [Every part is a whole](https://falkeysen.com/writing/every-part-is-a-whole/): why, contract and proof per part; the four sides I, It, We, They; lights; drift kinds; contract hash; 90-day human proofs; more than 7 children as a missing level.
- [scryer](https://github.com/aklos/scryer): the spec is the tests; each behaviour a claim written as a test before it is built; the plan as the list of todo tests; architecture styles and mutation probes.
- [EARS](https://alistairmavin.com/ears/) (Mavin et al., "Easy Approach to Requirements Syntax", 2009): the sentence patterns for claims.
- [JUnit XML](https://github.com/testmoapp/junitxml): the report format every major test runner can write.

## Repo structure

- Michael Nygard, [Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions), 2011.
- [arc42](https://arc42.org/): the template the layout borrows from.
- [AGENTS.md](https://agents.md/): the convention for agent instructions in a repo.
- [Agent Skills](https://agentskills.io/): the `SKILL.md` format of the skills here.

## Tools named in the standards

- Import linters: [import-linter](https://github.com/seddonym/import-linter) (Python), [dependency-cruiser](https://github.com/sverweij/dependency-cruiser) (JS/TS), [go-arch-lint](https://github.com/fe3dback/go-arch-lint) (Go), [ArchUnit](https://www.archunit.org/) (JVM).
- Mutation testing: [Stryker](https://stryker-mutator.io/) (JS/TS, .NET, Scala), [mutmut](https://github.com/boxed/mutmut) (Python), [cargo-mutants](https://github.com/sourcefrog/cargo-mutants) (Rust).
