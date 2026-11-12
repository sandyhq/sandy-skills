## ADDED Requirements

### Requirement: Signals
If sandy-skills gets SIGINT, SIGTERM or SIGHUP while OpenSpec runs, then it SHALL pass the signal to OpenSpec, wait until OpenSpec ends and exit with its exit code or signal.

#### Scenario: Signals
- **WHEN** only sandy-skills gets SIGINT, SIGTERM or SIGHUP while OpenSpec runs through it
- **THEN** OpenSpec gets the signal and is gone when sandy-skills exits, and sandy-skills exits as OpenSpec did: with its code when it handled the signal, by the signal when it did not
- **TEST** `test/cli.test.mjs::If sandy-skills gets SIGINT, SIGTERM or SIGHUP while OpenSpec runs, then it SHALL pass the signal to OpenSpec, wait until OpenSpec ends and exit with its exit code or signal.`
