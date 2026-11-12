## 1. Claims as tests

- [x] 1.1 Prove `test/diagram.test.mjs::The diagram command SHALL generate a Mermaid flowchart of the parts and their seams from the specs, and check SHALL report every marked diagram block that differs from it.`
- [x] 1.2 Prove `test/diagram.test.mjs::The diagram SHALL draw a part that has parts below it as a subgraph nested by Part of, and every other part as a node labelled with its spec title.`
- [x] 1.3 Prove `test/diagram.test.mjs::The diagram SHALL draw each seam as an edge to its target: solid and labelled exclusive for an exclusive seam, dotted and labelled read-only for a read-only seam, plain otherwise.`
- [x] 1.4 Prove `test/diagram.test.mjs::The diagram SHALL draw proposed parts with a dashed stroke and retired parts in grey.`
- [x] 1.5 Prove `test/diagram.test.mjs::When given a part id, diagram SHALL show that part, every part below it and every neighbour their seams touch, the neighbours as plain nodes.`
- [x] 1.6 Prove `test/diagram.test.mjs::When run on the same specs, diagram SHALL print the same diagram.`
- [x] 1.7 Prove `test/diagram.test.mjs::diagram --write SHALL rewrite every marked block to what diagram generates, leave the rest of each file byte-identical and list the files it changed.`
- [x] 1.8 Prove `test/diagram.test.mjs::When a marked diagram block differs from what diagram generates, check SHALL report stale-diagram as an error with the file and line of the block.`
- [x] 1.9 Prove `test/diagram.test.mjs::If a marked diagram block names an id that has no spec, then check SHALL report unknown-part as an error.`
- [x] 1.10 Prove `test/diagram.test.mjs::The checker SHALL read diagram blocks only from marker lines outside code fences in Markdown files outside .git, node_modules and openspec/changes/archive.`
- [x] 1.11 Prove `test/repo.test.mjs::The skills SHALL call only the sandy-skills commands check, hash, confirm and diagram. Read-only.`

## 2. Build

- [x] 2.1 src/diagram.mjs: render, find and refresh blocks, findings; the spec heading as title
- [x] 2.2 `diagram [<id>] [--write]` in the CLI and its help; check reads the blocks
- [x] 2.3 standards/diagrams.md, linked from standards/README.md and spec-format.md; usage and spec-first
- [x] 2.4 Version 0.3.0; run the tests, `openspec validate --all --strict`, `sandy-skills diagram --write` and `sandy-skills check`
