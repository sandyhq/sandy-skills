## 1. Claims as tests

- [x] 1.1 Prove `test/cli.test.mjs::If sandy-skills gets SIGINT, SIGTERM or SIGHUP while OpenSpec runs, then it SHALL pass the signal to OpenSpec, wait until OpenSpec ends and exit with its exit code or signal.`

## 2. Build

- [x] 2.1 Async passthrough with signal forwarding in src/openspec.mjs; the CLI awaits it
- [x] 2.2 Run the tests, `openspec validate --all --strict`, `sandy-skills check`, `scripts/smoke-install.sh` and the signal probe
