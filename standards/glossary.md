# Glossary of the standard

One word for one thing. `sandy-skills check` reports a word from a **Not** line as the error `wrong-term` in the specs and in open changes. Each repo writes the words of its own domain in `docs/glossary.md`; a word defined there is never a wrong term.

## part
One piece of the system that has its own spec file, `openspec/specs/<id>/spec.md`. Each part has an id, for example `cli`.
Not: capability, module

## kind
The size of a part. One of 5 values, from largest to smallest: context, system, container, component, operation. The spec of a part states it in the line `Kind: <value>`.

## context
A part whose kind is context. Inside a context, each word of the glossary has exactly 1 meaning. Domain-driven design calls this a bounded context.
Not: bounded context, subdomain

## contract
The 1 sentence that states what a part promises as a whole. In the spec it is the requirement with the name `Contract`.

## seam
The connection from one part to one other part: what the first part reads from the other, or writes to it. In the spec it is 1 requirement with the name `Seam to <id>` for each other part.
Not: contract between parts

## upstream
In a seam, the part whose changes the other part has to follow. The other part is downstream.

## relation
How the downstream part of a seam deals with the upstream part. The requirement `Seam to <id>` states it in the line `Relation: <value> · Upstream: <id>`. One of 7 values, from domain-driven design:
- **partnership**: the teams of both parts change their sides together, in the same release.
- **shared-kernel**: both parts use 1 shared piece of code or data model; a change to it needs both teams.
- **customer-supplier**: the upstream part builds what the downstream part asks for.
- **conformist**: the downstream part uses the data model of the upstream part unchanged.
- **anticorruption-layer**: the downstream part translates the data model of the upstream part into its own.
- **open-host-service**: the upstream part offers 1 documented interface for every downstream part.
- **published-language**: both parts exchange data in a documented format both teams agreed on, for example an OpenAPI file.

## claim
1 sentence with SHALL that states what a part does. The test that proves the claim has this sentence as its name. In the spec, each claim is 1 requirement.
Not: assertion, requirement (except headings)

## scenario
1 example for 1 claim, in 4 lines: GIVEN (the starting state), WHEN (the action), THEN (the result), TEST (the test that proves it).
Not: test case

## change
1 planned result, in the folder `openspec/changes/<id>/`. The owner decides a change as a whole. 1 change is 1 merge request.
Not: feature, story

## owner
The person who decides whether a change is made, and who approves it.
Not: stakeholder

## carrier
A person who can explain a part and confirms that it works. The spec of the part names the carrier in the line `Carried by: <name>`.
Not: maintainer

## merge request
The request to merge 1 change into the main branch. GitHub calls this a pull request.
Not: pull request, PR, MR

## review time
The minutes that `sandy-skills review-time` estimates for the review of 1 merge request.
Not: review effort
