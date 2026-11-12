// Reads JUnit XML (Node, pytest, Go via gotestsum, Vitest, Jest, Maven/Gradle) into flat test results.
const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
const TESTCASE = /<testcase((?:\s+[\w:.-]+\s*=\s*(?:"[^"]*"|'[^']*'))*)\s*(\/?)>/g;
const ATTR = /([\w:.-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;

function decode(text) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, e) => {
    if (e[0] !== '#') return ENTITIES[e] ?? whole;
    return String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
  });
}

/** @returns {{name: string, classname: string, file: string, status: 'passed'|'failed'|'skipped'|'todo', message: string}[]} */
export function parseJUnit(xml) {
  const text = String(xml).replace(/<!--[\s\S]*?-->/g, '');
  const results = [];
  TESTCASE.lastIndex = 0;
  let m;
  while ((m = TESTCASE.exec(text))) {
    const attrs = {};
    for (const a of m[1].matchAll(ATTR)) attrs[a[1]] = decode(a[2] ?? a[3]);
    let body = '';
    if (!m[2]) {
      const end = text.indexOf('</testcase>', TESTCASE.lastIndex);
      body = text.slice(TESTCASE.lastIndex, end < 0 ? text.length : end);
      TESTCASE.lastIndex = end < 0 ? text.length : end + '</testcase>'.length;
    }
    const failure = /<(failure|error)\b((?:\s+[\w:.-]+\s*=\s*(?:"[^"]*"|'[^']*'))*)/.exec(body);
    const skipped = /<skipped\b((?:\s+[\w:.-]+\s*=\s*(?:"[^"]*"|'[^']*'))*)/.exec(body);
    let status = 'passed';
    let message = '';
    if (failure) {
      status = 'failed';
      message = decode(/message\s*=\s*"([^"]*)"/.exec(failure[2])?.[1] ?? '');
    } else if (skipped) {
      status = /type\s*=\s*"todo"/.test(skipped[1]) ? 'todo' : 'skipped';
    }
    results.push({ name: attrs.name ?? '', classname: attrs.classname ?? '', file: attrs.file ?? '', status, message });
  }
  return results;
}
