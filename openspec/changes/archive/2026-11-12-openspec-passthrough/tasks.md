## 1. Claims as tests

- [x] 1.1 Prove `test/cli.test.mjs::Every command that sandy-skills does not own SHALL run the OpenSpec CLI with the same arguments, input and output, and exit with its exit code.`
- [x] 1.2 Prove `test/cli.test.mjs::sandy-skills openspec SHALL pass the rest of its arguments to the OpenSpec CLI, so that OpenSpec's own init, update and help stay reachable.`
- [x] 1.3 Prove `test/cli.test.mjs::The help SHALL list the sandy-skills commands and say that every other command goes to OpenSpec.`
- [x] 1.4 Prove `test/cli.test.mjs::validate SHALL run openspec validate with its arguments and then check with --junit, --out and --strict, print both outputs, and exit non-zero when either fails.`
- [x] 1.5 Prove `test/repo.test.mjs::The skills SHALL call only the sandy-skills commands check, hash, confirm, diagram and validate. Read-only.`

## 2. Build

- [x] 2.1 Passthrough, `openspec` and `validate` in the CLI and its help
- [x] 2.2 getting-started, usage and README use `sandy-skills <command>`; spec-first proves with `sandy-skills validate`
- [x] 2.3 Version 0.4.0; run the tests, `openspec validate --all --strict`, `sandy-skills check` and `scripts/smoke-install.sh`
