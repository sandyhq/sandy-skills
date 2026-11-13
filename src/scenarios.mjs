// Scenario shape: every scenario is GIVEN, WHEN, THEN, TEST in this order, with AND lines after GIVEN, WHEN or THEN.
import { proseLines } from './limits.mjs';
import { mainSpecFiles } from './openspec.mjs';

const SCENARIO = /^####\s+Scenario:\s*(.*)$/;
const HEADING = /^#{1,6}\s/;
const STEP = /^\s*-\s+\*\*(GIVEN|WHEN|THEN|AND|TEST)\*\*/;
const SHAPE = /^GIVEN( AND)* WHEN( AND)* THEN( AND)* TEST$/;

/**
 * The spec files whose scenarios and words check reads: every main spec at any depth and the delta specs of open changes,
 * never openspec/changes/archive/.
 * @returns [{part, file: relative to root, text}]
 */
export function readSpecFiles(root, changes) {
  const specs = mainSpecFiles(root).map(({ id, file, text }) => ({ part: id, file, text }));
  const deltas = changes.flatMap((c) => c.files.filter((f) => f.path.startsWith('specs/') && f.path.endsWith('.md')).map((f) => ({ part: c.id, file: `${c.dir}/${f.path}`, text: f.text })));
  return [...specs, ...deltas];
}

/** Errors scenario-shape, one per scenario whose step lines outside fenced code and comments do not have the shape. */
export function scenarioFindings(files) {
  const findings = [];
  for (const { part, file, text } of files) {
    const lines = proseLines(text);
    lines.forEach((l, i) => {
      const m = SCENARIO.exec(l);
      if (!m) return;
      const steps = [];
      for (let j = i + 1; j < lines.length && !HEADING.test(lines[j]); j++) {
        const s = STEP.exec(lines[j]);
        if (s) steps.push(s[1]);
      }
      if (SHAPE.test(steps.join(' '))) return;
      const has = steps.length ? `has ${steps.join(', ')}` : 'has no steps';
      findings.push({ part, kind: 'scenario-shape', severity: 'error', file, line: i + 1, detail: `${file}:${i + 1}: scenario "${m[1].trim()}" ${has}; write GIVEN, WHEN, THEN, TEST, with AND lines after GIVEN, WHEN or THEN` });
    });
  }
  return findings;
}
