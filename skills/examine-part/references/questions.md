# Question types

Use every type in each exam, and at least two questions per dimension ([grading](grading.md)). Ask about this repo, never textbook knowledge.

- **Why, until the bottom.** Take an answer and ask why it is so. Keep going until you reach a fact in the repo or a decision with its record, usually four or five levels deep. A step the person can't take fails the question.
- **What if.** A case the spec does not spell out: a seam partner is down, the input is malformed, two calls race, a dependency's limit is reached. Ask what happens, where it shows, and which claim covers it, or why none does.
- **Traps.** State something false about the part with full confidence, such as a wrong default, a seam that doesn't exist or a decision that was rejected. They must catch it and say what is true. Agreeing fails.
- **From memory.** "Explain this part to a new colleague: why it exists, what it promises, what it touches." Grade it against the Purpose, the Contract and the seams. A missing element fails.
- **Decisions.** Ask why it is built this way, what was rejected, and what the choice costs. The answer is in the archived `design.md`. "It was simpler" without what was given up fails.
- **Numbers and names.** Limits, timeouts, the test that proves a claim, the file a seam lives in. Exact or fail.

Mix the types and the dimensions. Don't announce which type a question is.
