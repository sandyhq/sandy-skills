# Practice ladder

One rung per session, the next one the learner has not passed for this topic. Each rung ends with something the learner did that a run can check.

1. **Trace.** Follow one claim from the spec sentence to its test, then to the lines of code that make the test pass. The learner shows the path; you only confirm or say "no".
2. **Predict, then run.** The learner predicts a test result, a command's output, a log line or what `sandy-skills check` will show, then runs it. A mismatch is the lesson: find out which model was wrong.
3. **Break it.** The learner picks a change meant to break one claim and predicts which test fails. Then they apply it in a scratch worktree and run the tests. If no test fails, the proof has a gap: note it for propose-change.
4. **Extend.** The learner writes a test for an edge case the spec states or misses. It must fail first, for the right reason, and then pass.
5. **Change.** The learner makes a small real change through propose-change, writing the claims, the tests and the code themselves. You review like a colleague.

For tools and operations: do the thing somewhere safe. Run the build, read a CI log, reproduce a failure, do a release dry run, follow a request through the logs.

Scratch worktree: `git worktree add --detach .learn/<who>/scratch/<name>`; afterwards `git worktree remove --force .learn/<who>/scratch/<name>`.
