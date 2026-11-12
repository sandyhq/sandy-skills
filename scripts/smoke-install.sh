#!/usr/bin/env bash
# Installs the packed package into empty repos with npm, pnpm and bun, then runs init and check there.
# Proves that nothing needs a clone of this repo. Usage: scripts/smoke-install.sh [npm pnpm bun]
set -euo pipefail
root=$(cd "$(dirname "$0")/.." && pwd)
out=$(mktemp -d)
tgz="$out/$(cd "$root" && npm pack --silent --pack-destination "$out" | tail -1)"
for pm in "${@:-npm pnpm bun}"; do
  for p in $pm; do
    dir="$out/$p"; mkdir -p "$dir"; cd "$dir"; git init -q
    echo "== $p"
    case $p in
      npm)  npm init -y >/dev/null; npm install --silent --save-dev "$tgz"; run=(npx --no-install sandy-skills) ;;
      pnpm) echo '{"name":"smoke","private":true}' > package.json; pnpm add --silent --save-dev "$tgz"; run=(pnpm exec sandy-skills) ;;
      bun)  echo '{"name":"smoke","private":true}' > package.json; bun add --silent --dev "$tgz"; run=(bunx sandy-skills) ;;
    esac
    "${run[@]}" --version
    "${run[@]}" init --tools pi,claude > init.log
    grep -q '^schema: proven' openspec/config.yaml
    test -f .agents/skills/spec-first/SKILL.md
    test -L .claude/skills/spec-first
    "${run[@]}" check --today 2026-01-01 > report.md
    grep -q '^\*\*Releasable\*\*' report.md
    echo "ok: $p"
  done
done
