# Practical tasks

All tasks run in a scratch worktree, `git worktree add --detach .learn/<who>/scratch/exam-<id>`, which you remove afterwards. The key records each task before it starts. Tests and runs decide the grade.

- **Bug hunt.** Plant one bug that the tests catch, for example a flipped condition, a boundary off by one, a dropped field or a swallowed error. Give only the symptom a user would see. They find it and fix it. Pass: the suite is green again with a fix at the planted spot, within the time set in the key.
- **Silent bug.** Plant a bug the tests miss, and check this first: the suite stays green on it. Say only that a bug exists in the part. They must find it and write the test that exposes it. Pass: their test fails on the bug and passes on HEAD.
- **Predict.** They state the result before a run: which tests fail on a given diff, what `sandy-skills check` reports, what a command prints or logs. Pass: it matches what the run shows.
- **Drill.** An incident, such as a seam partner timing out or bad data arriving. Ask what the user sees, where they would look first and which claim covers it, then let them show it in the worktree. Set the time in the key. Pass: all three answers are right in time and the demonstration matches.
- **Change.** A small change under a constraint, for example "retry once more, but never past the timeout". Pass: their test for it fails before the change, and all tests pass after.

For topics without a spec, use the same kinds on the tool or the operation: reproduce a CI failure, find a broken setting, predict a build's output.
