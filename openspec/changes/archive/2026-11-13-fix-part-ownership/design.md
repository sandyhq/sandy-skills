## Owner decisions

- Drop bin/ from the Code line of diagram; add package.json to the Code line of cli.
- A change that touches cli code brings a cli delta spec; the gate stays.

## Agent decisions

- scripts/, LICENSE, .gitignore, .agents/ and .claude/ go to sandy-skills, the part of the whole repo; rejected: a new part for 5 small files.
- The Code lines change in openspec/specs directly, because a delta spec carries no Purpose.

## Risks

- A new top-level file fails the repository test → the test names the file.
