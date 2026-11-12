## Owner decisions

- Review of 468b46a, finding 3: "keep it hand-written but small, and reject what you do not support with a clear message instead of misreading it".
- OpenSpec's YAML parser is no dependency check relies on.

## Agent decisions

- check strips a comment only outside quotes, and only at a # after a space; rejected: a regex per value, which the quotes defeat.
- Single quotes take `''` as one quote; double quotes with a backslash stop check; rejected: reading YAML escapes, 1 rule set more.

## Risks

- An adopter writes valid YAML that check rejects → the message names the line and the form to use.
