// Exam verdicts: the EXAMINED lines examine-part writes to .learn/<who>/exams/<id>.md. Pure.
const LINE = /^- \*\*EXAMINED\*\* (\S+) on (\d{4}-\d{2}-\d{2}), (passed|failed), contract ([0-9a-f]+), key ([0-9a-f]+)\s*$/;
export const MAX_EXAM_DAYS = 90;

export function parseExamined(text) {
  return text.split('\n').map((l) => l.trim().match(LINE)).filter(Boolean)
    .map(([, who, on, result, contract, key]) => ({ who, on, result, contract, key }));
}

/** The latest exam of who on this contract decides: it must be passed and at most 90 days old. */
export function examAllows(entries, { who, hash, today }) {
  const mine = entries.filter((e) => e.who === who && e.contract === hash && e.on <= today).sort((a, b) => a.on.localeCompare(b.on));
  const last = mine.at(-1);
  if (!last) return { ok: false, reason: `no exam by ${who} on contract ${hash}` };
  if (last.result !== 'passed') return { ok: false, reason: `the latest exam, on ${last.on}, failed` };
  if ((Date.parse(today) - Date.parse(last.on)) / 864e5 > MAX_EXAM_DAYS) return { ok: false, reason: `the exam on ${last.on} is older than ${MAX_EXAM_DAYS} days` };
  return { ok: true, exam: last };
}
