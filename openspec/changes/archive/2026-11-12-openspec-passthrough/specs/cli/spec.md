## ADDED Requirements

### Requirement: Passthrough
Every command that sandy-skills does not own SHALL run the OpenSpec CLI with the same arguments, input and output, and exit with its exit code.

#### Scenario: Passthrough
- **WHEN** sandy-skills runs a command it does not own, with input on stdin
- **THEN** OpenSpec gets the same arguments and input, its output reaches the caller, and sandy-skills exits with OpenSpec's exit code
- **TEST** `test/cli.test.mjs::Every command that sandy-skills does not own SHALL run the OpenSpec CLI with the same arguments, input and output, and exit with its exit code.`

### Requirement: OpenSpec by name
sandy-skills openspec SHALL pass the rest of its arguments to the OpenSpec CLI, so that OpenSpec's own init, update and help stay reachable.

#### Scenario: OpenSpec by name
- **WHEN** sandy-skills runs `openspec init` or `openspec --help`
- **THEN** OpenSpec gets `init` or `--help`, not sandy-skills' own init or help
- **TEST** `test/cli.test.mjs::sandy-skills openspec SHALL pass the rest of its arguments to the OpenSpec CLI, so that OpenSpec's own init, update and help stay reachable.`

### Requirement: Help
The help SHALL list the sandy-skills commands and say that every other command goes to OpenSpec.

#### Scenario: Help
- **WHEN** sandy-skills runs with --help
- **THEN** it lists init, update, check, validate, diagram, hash and confirm and names OpenSpec for the rest
- **TEST** `test/cli.test.mjs::The help SHALL list the sandy-skills commands and say that every other command goes to OpenSpec.`

### Requirement: Validate
validate SHALL run openspec validate with its arguments and then check with --junit, --out and --strict, print both outputs, and exit non-zero when either fails.

#### Scenario: Validate
- **WHEN** validate runs with OpenSpec arguments, --strict and --junit, and OpenSpec or check fails
- **THEN** OpenSpec gets its arguments and --strict, check gets --junit and --strict, both outputs are printed and the exit code is non-zero
- **TEST** `test/cli.test.mjs::validate SHALL run openspec validate with its arguments and then check with --junit, --out and --strict, print both outputs, and exit non-zero when either fails.`
