## Context

The I side asks whether someone can explain a part. The checker can't see understanding, only lines in specs. Learning needs state (what is due, what was missed) that is personal and must not land in a shared repo.

## Decisions

- **Records in `.learn/<who>/`, git-ignored.** Per repo, next to the code they are about. Rejected: committing them (personal, noisy); the home directory (lost link to the repo, survives the wrong things).
- **The exam gates only the I side.** I asks "can someone explain this part?", exactly what the exam tests. We and They ask how other parts rely on it; their confirmers are other people and other questions. Rejected: gating all sides.
- **confirm reads one line, not a report.** `- **EXAMINED** <who> on <date>, passed|failed, contract <hash>, key <hash>` in `.learn/<who>/exams/<id>.md`. The latest line for the current contract decides; it must be `passed` and at most 90 days old, like a confirmation. Rejected: a JSON verdict; a second format for one fact.
- **The examiner is a fresh agent of another model family.** It has not seen the teaching, so it neither goes easy nor repeats the lessons. Rejected: the teaching agent in a new session.
- **The answer key is sealed before the first question** (`git hash-object`) and its hash goes into the EXAMINED line. Grading against a key written in advance can't drift toward the answers given. Practical tasks are graded by test runs, not by the examiner's opinion.
- **No partial credit.** A dimension passes only when all its questions pass; the exam only when all dimensions pass. A wrong pass costs more than a wrong fail: the fail sends the person back to learn, the pass lets them vouch for something they can't explain.

## Risks / Trade-offs

- The key sits in the person's own repo; nothing stops them reading it. The exam is for them; the seal only stops the key from changing.
- The EXAMINED line is local, so CI can't check it. The gate is at `confirm`, where the CONFIRMED line is made.
