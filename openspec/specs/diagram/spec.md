# diagram Specification

## Purpose
Keeps the pictures of parts and seams equal to the specs, so that a picture in the docs can be trusted like the specs it comes from.

Kind: component · Part of: cli · Carried by: nesyeklaf · Status: active · Code: src/diagram.mjs, bin/

## Requirements

### Requirement: Contract
The diagram command SHALL generate a Mermaid flowchart of the parts and their seams from the specs, and check SHALL report every marked diagram block that differs from it.

#### Scenario: Contract
- **WHEN** diagram runs and a marked block holds an older diagram
- **THEN** diagram prints the flowchart and check fails on the block
- **TEST** `test/diagram.test.mjs::The diagram command SHALL generate a Mermaid flowchart of the parts and their seams from the specs, and check SHALL report every marked diagram block that differs from it.`

### Requirement: Nesting
The diagram SHALL draw a part that has parts below it as a subgraph nested by Part of, and every other part as a node labelled with its spec title.

#### Scenario: Nesting
- **WHEN** a system has containers and a container has components
- **THEN** system and container are nested subgraphs, the components are nodes
- **TEST** `test/diagram.test.mjs::The diagram SHALL draw a part that has parts below it as a subgraph nested by Part of, and every other part as a node labelled with its spec title.`

### Requirement: Seam edges
The diagram SHALL draw each seam as an edge to its target: solid and labelled exclusive for an exclusive seam, dotted and labelled read-only for a read-only seam, plain otherwise.

#### Scenario: Seam edges
- **WHEN** parts have exclusive, read-only and plain seams
- **THEN** each seam is an edge of its kind
- **TEST** `test/diagram.test.mjs::The diagram SHALL draw each seam as an edge to its target: solid and labelled exclusive for an exclusive seam, dotted and labelled read-only for a read-only seam, plain otherwise.`

### Requirement: Status
The diagram SHALL draw proposed parts with a dashed stroke and retired parts in grey.

#### Scenario: Status
- **WHEN** a part is proposed and another retired
- **THEN** each gets its class
- **TEST** `test/diagram.test.mjs::The diagram SHALL draw proposed parts with a dashed stroke and retired parts in grey.`

### Requirement: One part
When given a part id, diagram SHALL show that part, every part below it and every neighbour their seams touch, the neighbours as plain nodes.

#### Scenario: One part
- **WHEN** diagram runs with the id of a container
- **THEN** it shows the container, its components and their neighbours, and no other part
- **TEST** `test/diagram.test.mjs::When given a part id, diagram SHALL show that part, every part below it and every neighbour their seams touch, the neighbours as plain nodes.`

### Requirement: Same specs, same diagram
When run on the same specs, diagram SHALL print the same diagram.

#### Scenario: Same specs, same diagram
- **WHEN** diagram runs twice, on specs listed in different orders
- **THEN** both outputs are identical
- **TEST** `test/diagram.test.mjs::When run on the same specs, diagram SHALL print the same diagram.`

### Requirement: Write
diagram --write SHALL rewrite every marked block to what diagram generates, leave the rest of each file byte-identical and list the files it changed.

#### Scenario: Write
- **WHEN** diagram --write runs on a repo with a stale block
- **THEN** the block holds the generated diagram, the rest of the file is unchanged, the file is listed, and check passes
- **TEST** `test/diagram.test.mjs::diagram --write SHALL rewrite every marked block to what diagram generates, leave the rest of each file byte-identical and list the files it changed.`

### Requirement: Stale diagram
When a marked diagram block differs from what diagram generates, check SHALL report stale-diagram as an error with the file and line of the block.

#### Scenario: Stale diagram
- **WHEN** a block holds an older diagram
- **THEN** check reports stale-diagram with file and line and exits non-zero
- **TEST** `test/diagram.test.mjs::When a marked diagram block differs from what diagram generates, check SHALL report stale-diagram as an error with the file and line of the block.`

### Requirement: Unknown part
If a marked diagram block names an id that has no spec, then check SHALL report unknown-part as an error.

#### Scenario: Unknown part
- **WHEN** a block names an id with no spec
- **THEN** check reports unknown-part
- **TEST** `test/diagram.test.mjs::If a marked diagram block names an id that has no spec, then check SHALL report unknown-part as an error.`

### Requirement: Only marked blocks
The checker SHALL read diagram blocks only from marker lines outside code fences in Markdown files outside .git, node_modules and openspec/changes/archive.

#### Scenario: Only marked blocks
- **WHEN** markers sit in a code fence, under node_modules or in an archived change, and a repo has no other block
- **THEN** check reports no diagram finding
- **TEST** `test/diagram.test.mjs::The checker SHALL read diagram blocks only from marker lines outside code fences in Markdown files outside .git, node_modules and openspec/changes/archive.`

### Requirement: Distinct ids
The diagram SHALL give parts with different ids different Mermaid ids.

#### Scenario: Distinct ids
- **WHEN** parts whose ids differ only in characters outside a-z and 0-9, such as a.1 and a-46-1
- **THEN** each gets its own node
- **TEST** `test/diagram.test.mjs::The diagram SHALL give parts with different ids different Mermaid ids.`

### Requirement: Indented fences
The checker SHALL treat a line indented by up to three spaces as a code fence when CommonMark does, both to open and to close it.

#### Scenario: Indented fences
- **WHEN** a marked block sits inside a fence opened by an indented line, or follows a fence closed by an indented line
- **THEN** the first is neither checked nor written, the second is
- **TEST** `test/diagram.test.mjs::The checker SHALL treat a line indented by up to three spaces as a code fence when CommonMark does, both to open and to close it.`

### Requirement: Titles as written
The diagram SHALL write each title so that Mermaid shows it exactly as the spec writes it.

#### Scenario: Titles as written
- **WHEN** a title contains #35;, #quot;, a quote or a tag
- **THEN** the label holds them as Mermaid entities that show the title unchanged
- **TEST** `test/diagram.test.mjs::The diagram SHALL write each title so that Mermaid shows it exactly as the spec writes it.`
