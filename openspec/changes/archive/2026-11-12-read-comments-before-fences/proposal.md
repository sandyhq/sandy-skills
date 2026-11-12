## Why

A commented-out code example hides every line after the comment today. check then counts and checks less than the owner reads.

## Your decisions

None open.

## What Changes

- **cli** reads HTML comments and fences in the order they open: a fence inside a comment ends with the comment, and `<!--` inside a fence is code.
- **Line numbers** of findings stay those of the file.

## Not in this change

- A `<!--` inside backticks: check still reads it as a comment.
