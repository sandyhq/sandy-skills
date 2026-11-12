## Owner decisions

- Exactly GIVEN, WHEN, THEN, TEST, in this order; AND after GIVEN, WHEN or THEN.
- A start state that does not matter is written out: "GIVEN any repo".
- The 67 existing scenarios get GIVEN by moving the start state out of WHEN, with no new content.

## Agent decisions

- The finding points at the scenario heading; rejected: the first wrong step, which a missing step lacks.
- Lines other than the 5 step keywords, such as CONFIRMED, are no steps; rejected: flagging them, which breaks confirmations.

## Risks

- Steps inside a code fence or comment → check skips them, as for words.
