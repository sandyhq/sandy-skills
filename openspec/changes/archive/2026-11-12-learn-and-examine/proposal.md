## Why

Agents build faster than their owner can follow. A confirmation that someone can explain a part (the I side) was only their word, and nothing helped them get there. People need a way to learn what was built, in theory and hands-on, and a hard exam that shows whether they did.

## What Changes

- New skill `learn-part`: teaches whatever the person needs to understand in the repo (parts from the specs, plus tools, concepts and operations), hands-on in the real repo, with reviews spaced over time. Records in `.learn/<who>/`.
- New skill `examine-part`: a hard exam by a fresh agent of another model family, against an answer key sealed before the first question, with practical tasks graded by test runs. Writes an `EXAMINED` line.
- `sandy-skills confirm <id> I <who>` refuses unless that person passed the exam on the part's current contract in the last 90 days.
- `init` and `update` add `.learn/` to `.gitignore`: learning records stay personal and local.

## Capabilities

### Modified Capabilities

- `skills`: two new skills; the EXAMINED line format is shared with the CLI.
- `cli`: confirm checks the exam for the I side.
- `init`: ignores `.learn/`.

## Impact

No contract changes, so no confirmation is voided. Repos that already confirmed an I side keep it until it expires; the next one needs an exam.
