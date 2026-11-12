## 1. Claims as tests

- [x] 1.1 Prove `test/init.test.mjs::init SHALL set up OpenSpec when the repo has none, make proven its default schema and install the skills where OpenSpec installed its own.`
- [x] 1.2 Prove `test/init.test.mjs::When OpenSpec linked an agent's skills to another directory, init SHALL link the skills the same way.`
- [x] 1.3 Prove `test/init.test.mjs::update SHALL replace the schema and the skills with this version's and keep the rest of openspec/config.yaml.`
- [x] 1.4 Prove `test/init.test.mjs::If the repo has no openspec directory, then update SHALL fail and change nothing.`
- [x] 1.5 Prove `test/check.test.mjs::When a spec has no metadata line, Contract, seam, TEST or CONFIRMED line, the checker SHALL report it as not-adopted with a warning instead of errors.`
- [x] 1.6 Prove `test/repo.test.mjs::The npm package SHALL contain the CLI, the proven schema, the skills and the standards, and no tests.`

## 2. Build

- [x] 2.1 Root package.json, bin/sandy-skills.mjs, src/install.mjs, OpenSpec lookup in src/openspec.mjs
- [x] 2.2 Skills and standards use sandy-skills commands and URLs
- [x] 2.3 Docs: getting started and usage for npm, pnpm and bun
- [x] 2.4 CI installs with pnpm and runs the tests, `openspec validate --all --strict` and `sandy-skills check`
