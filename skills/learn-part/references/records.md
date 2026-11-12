# Records

All under `.learn/<who>/`, git-ignored, Markdown:

- `syllabus.md`: the topics ([syllabus](syllabus.md)).
- `progress.md`: one section per topic. It holds the level of each dimension, the date of the last and next review, the open gaps in the learner's words, and the learner's intent statement.
- `sessions/<date>.md`: per session, the unit and goal, the predictions next to what was true, the gaps and the exercise outcome.
- `exams/<id>.md`: written by examine-part only.

## Levels, per dimension

| Level | The learner can |
|---|---|
| 0 | nothing yet |
| 1 | recall it when asked |
| 2 | explain it without notes |
| 3 | predict it in a case they have not seen |
| 4 | change it and prove the change |
| 5 | pass the exam on it |

A level counts only when shown in a session or review. It drops to 2 when a review is missed or a gap reopens.

## Reviews

After a unit, review it after 1, 3, 7, 21 and 60 days. A correct review moves it one step further. A miss puts it back to 1 day. Mix the topics that are due; don't review one topic in a block.

## Ready for the exam

A topic is ready when every dimension is at level 4 and the last two reviews had no misses. Then tell the learner, and say that examine-part must run as a fresh agent of another model family.
