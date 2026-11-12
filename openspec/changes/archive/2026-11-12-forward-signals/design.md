## Context

The passthrough used a synchronous spawn: while it waits, Node runs no signal handler, so a signal sent to sandy-skills alone takes the default action and kills only sandy-skills.

## Decisions

- **Async spawn with handlers for SIGINT, SIGTERM and SIGHUP while the child runs.** Each handler sends the same signal to the child; the handlers come off when the child ends. Rejected: running OpenSpec in sandy-skills' own process (OpenSpec's CLI is not a library entry point); a process group kill (not portable, and would also hit processes OpenSpec meant to leave running).
- **Exit as the child did.** With an exit code, sandy-skills exits with it. Ended by a signal, sandy-skills removes its handlers and sends itself that signal, so its parent sees the same signal status a direct `openspec` run gives; 128 plus the signal number is the fallback should it survive.
- **validate stops when a signal ended OpenSpec.** It ends itself by that signal before check runs; someone stopping the process wants it stopped.

## Risks / Trade-offs

- SIGKILL cannot be caught; after one, OpenSpec still runs to its end.
- Ctrl-C in a terminal signals the whole foreground group, so OpenSpec may get SIGINT twice; one SIGINT already ends it.
