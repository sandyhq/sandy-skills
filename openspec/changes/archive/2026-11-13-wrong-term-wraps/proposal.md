## Why
wrong-term matched a Not term of 2 or more words within 1 line. A soft line wrap or emphasis between its words let it pass, as in `contract` and `between parts` on 2 lines or `contract *between* parts`.

## Your decisions
None open.

## What Changes
- **glossary**: wrong-term matches each Not term within 1 paragraph, across soft line wraps, with the emphasis markers `*`, `_` and `~~` removed; it reports the line where the term starts.

## Not in this change
- vague-word: its words are single words.
