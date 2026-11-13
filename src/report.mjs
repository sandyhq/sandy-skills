// The releasability report: one Markdown page per run, for a merge request comment and a CI artifact.
export const SYMBOL = { hard: '●', soft: '◐', claimed: '◌', open: '○', refuted: '✕', expired: '◇', drift: '◇' };
const cell = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');

export function renderMarkdown(result) {
  const { summary, parts, findings, today } = result;
  const out = [];
  out.push('# Releasability report', '');
  out.push(`**${summary.releasable ? 'Releasable' : 'Not releasable'}** · ${today} · ${summary.parts} parts · ${summary.errors} errors · ${summary.warnings} warnings`, '');
  out.push('Lights: ● hard (test passed at this commit) · ◐ soft (confirmed by a person) · ◌ claimed (confirmed by its own carrier) · ○ open · ✕ refuted · ◇ expired or drift', '');
  out.push('| Part | Kind | Light | I | It | We | They | Seams |', '|---|---|---|---|---|---|---|---|');
  for (const p of parts) {
    const seams = p.seams.map((s) => `${SYMBOL[s.light]} ${s.to}${s.exclusive ? ' (exclusive)' : s.readOnly ? ' (read-only)' : ''}`).join(', ');
    out.push(`| ${cell(p.id)} | ${cell(p.kind)} | ${SYMBOL[p.light]} ${p.light} | ${SYMBOL[p.sides.I]} | ${SYMBOL[p.sides.It]} | ${SYMBOL[p.sides.We]} | ${SYMBOL[p.sides.They]} | ${cell(seams)} |`);
  }
  const shown = findings.filter((f) => f.severity !== 'info');
  out.push('', '## Findings', '');
  if (shown.length === 0) out.push('None.');
  else {
    out.push('| Severity | Part | Kind | Claim or seam | Detail |', '|---|---|---|---|---|');
    for (const f of shown) out.push(`| ${f.severity} | ${cell(f.part)} | ${f.kind} | ${cell(f.requirement ?? '')} | ${cell(f.detail)} |`);
  }
  out.push('', '## Claims and seams', '');
  for (const p of parts) {
    out.push(`### ${p.id}`, '');
    for (const r of p.requirements) {
      const tests = r.tests.length ? r.tests.map((t) => `${SYMBOL[t.light]} \`${t.ref}\` ${t.status}`).join(', ') : '○ untested';
      out.push(`- **${r.name}**: ${tests}`);
    }
    for (const c of p.confirmations) out.push(`- **${c.side}** ${SYMBOL[c.light]} ${c.result} by ${c.by} on ${c.on}, expires ${c.expires}`);
    out.push('');
  }
  return out.join('\n');
}
