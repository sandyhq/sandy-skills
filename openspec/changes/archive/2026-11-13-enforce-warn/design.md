## Owner decisions

- Every finding is a warning by default; `enforce: error` blocks as 0.7.0 did.
- 1 key, no switch for each rule.

## Agent decisions

- check and review-time turn each error into a warning at the end, when bin passes the value of the key; the rules keep their severity. Rejected: a severity for each rule, which the owner ruled out.
- Under `enforce: warn`, --strict fails on no finding of check, since CI runs `validate --all --strict`. Rejected: --strict failing on warnings, which blocks again.
- The claims that name an error stay; they hold under `enforce: error`, which their tests set.

## Risks

- A repo that wants the 0.7.0 rules and lacks the key gets warnings only; the changelog names the key.
