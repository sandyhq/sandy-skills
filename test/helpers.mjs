// Builds the JSON that `openspec show <id> --type spec --json` returns, without OpenSpec.
export const TODAY = '2026-11-12';

export function spec(id, { why = `Does the ${id} work so that the whole above can count on it.`, kind = 'container', partOf = 'none', carriedBy = 'ana', status = 'active', contract = `The ${id} SHALL keep its promise.`, tests = [], extra = [], requirements = [] } = {}) {
  const contractLines = [...tests.map((t) => `- **TEST** \`${t}\``), ...extra];
  return {
    id,
    overview: `${why}\n\nKind: ${kind} · Part of: ${partOf} · Carried by: ${carriedBy} · Status: ${status} · Code: src/${id}/`,
    requirements: [
      ...(contract === null ? [] : [{ name: 'Contract', text: contract, scenarios: [{ name: 'Holds', rawText: ['- **WHEN** it runs', '- **THEN** it holds', ...contractLines].join('\n') }] }]),
      ...requirements.map(([name, text, lines = []]) => ({ name, text, scenarios: [{ name: 'Case', rawText: ['- **WHEN** x', '- **THEN** y', ...lines].join('\n') }] })),
    ],
  };
}

export const passed = (name, file = 'test/a.test.mjs') => ({ name, classname: 'suite', file, status: 'passed', message: '' });
export const withStatus = (status, name, file = 'test/a.test.mjs') => ({ ...passed(name, file), status });
