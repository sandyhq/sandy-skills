## Owner decisions

- Target 20 minutes, warn above 30, fail above 60.
- Code lines: warn above 200, fail above 400, whatever the minutes.
- One change is one merge request; a diff with 0 changes fails too.

## Agent decisions

- The bands compare the printed, rounded-up minutes; rejected: unrounded minutes, which the owner never sees.
- Findings: long-review and many-lines warn or fail; unowned-file, no-change, many-changes and no-delta-spec fail. An error exits 1, a warning exits 0.
- Line backstop: the test gives the gate 401 lines and 55 minutes; 401 lines in 1 part alone print 56 (50.1 + 5, rounded up).

## Risks

- Code outside every Code path fails at once → the error names each file.
