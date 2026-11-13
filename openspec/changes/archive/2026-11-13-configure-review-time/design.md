## Owner decisions

- Weights and thresholds in `sandy-skills.review`: minutes, lines and weights, defaults as in estimate-review-time and gate-merge-requests.
- The owner calibrates the weights on 5 to 10 past merge requests.

## Agent decisions

- The limits reader also reads `sandy-skills.review`, by the same rules; rejected: a second reader.
- check: delta specs are the parts, no code lines; long-review warns above warn and fails above error.
- Version 0.6.0 ships with this change.

## Risks

- Calibration changes no claim → every claim names the key, not the number.
