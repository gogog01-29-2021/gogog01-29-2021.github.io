#!/usr/bin/env bash
# scripts/check-workflow.sh
# Enforces the machine-checkable invariants in LOCKED_WORKFLOW.md.
# Run before any deploy:  bash scripts/check-workflow.sh
# Exit code 0 = clean, 1 = one or more violations. See LOCKED_WORKFLOW.md.

set -uo pipefail
cd "$(dirname "$0")/.." || exit 2

RED=$'\033[31m'; GRN=$'\033[32m'; YEL=$'\033[33m'; NC=$'\033[0m'
fail=0
note() { printf '%s\n' "$*"; }
bad()  { printf '%s✗ %s%s\n' "$RED" "$*" "$NC"; fail=1; }
ok()   { printf '%s✓ %s%s\n' "$GRN" "$*" "$NC"; }
warn() { printf '%s! %s%s\n' "$YEL" "$*" "$NC"; }

# ---- 1. Every post category must exist in _data/topics.yml -------------------
note "== Classification: post categories exist in topics.yml =="
known_slugs="$(grep -E '^[[:space:]]*slug:' _data/topics.yml | sed -E 's/.*slug:[[:space:]]*//; s/["'\'' ]//g' | sort -u)"
for f in _posts/*.md; do
  [ -e "$f" ] || continue
  # front matter is between the first two '---' lines
  cat_line="$(awk 'BEGIN{fm=0} /^---[[:space:]]*$/{fm++; next} fm==1 && /^categories:/{print; exit}' "$f")"
  [ -z "$cat_line" ] && continue
  # normalize "categories: [a, b]" or "categories: a" -> tokens
  cats="$(printf '%s' "$cat_line" | sed -E 's/^categories:[[:space:]]*//; s/[][]//g; s/,/ /g')"
  for c in $cats; do
    c="$(printf '%s' "$c" | tr -d '"'\'' ')"
    [ -z "$c" ] && continue
    if printf '%s\n' "$known_slugs" | grep -qx "$c"; then :; else
      bad "$f declares category '$c' — missing from _data/topics.yml (add the node under its upper branch)"
    fi
  done
done
[ "$fail" -eq 0 ] && ok "all post categories resolve in the topic tree"

# ---- 2. Every {% cite key --file references %} resolves in references.bib ----
note "== References: cite keys resolve =="
cite_fail=0
grep -rho '{%[[:space:]]*cite[[:space:]]\+[A-Za-z0-9_:+-]\+' _posts/*.md 2>/dev/null \
  | sed -E 's/.*cite[[:space:]]+//' | sort -u | while read -r key; do
    [ -z "$key" ] && continue
    if grep -q "{$key," _bibliography/references.bib; then :; else
      printf '%s✗ cite key "%s" not found in references.bib%s\n' "$RED" "$key" "$NC"
    fi
  done
# recompute fail for cite (subshell above can't set parent fail)
missing_keys="$(grep -rho '{%[[:space:]]*cite[[:space:]]\+[A-Za-z0-9_:+-]\+' _posts/*.md 2>/dev/null \
  | sed -E 's/.*cite[[:space:]]+//' | sort -u \
  | while read -r key; do [ -n "$key" ] && ! grep -q "{$key," _bibliography/references.bib && printf '%s ' "$key"; done)"
if [ -n "$missing_keys" ]; then bad "unresolved cite keys: $missing_keys"; else ok "all cite keys resolve in references.bib"; fi

# ---- 3. papers.bib and references.bib must NOT share keys (no mixing) --------
note "== References: papers.bib / references.bib not mixed =="
keys_papers="$(grep -oE '^@[A-Za-z]+\{[^,]+,' _bibliography/papers.bib 2>/dev/null | sed -E 's/^@[A-Za-z]+\{//; s/,$//' | sort -u)"
keys_refs="$(grep -oE '^@[A-Za-z]+\{[^,]+,' _bibliography/references.bib 2>/dev/null | sed -E 's/^@[A-Za-z]+\{//; s/,$//' | sort -u)"
shared="$(comm -12 <(printf '%s\n' "$keys_papers") <(printf '%s\n' "$keys_refs") | grep -v '^$')"
if [ -n "$shared" ]; then bad "keys present in BOTH bibs (mixing own work with citations): $shared"; else ok "papers.bib and references.bib are disjoint"; fi

# ---- 4. .nojekyll must exist on gh-pages (soft: needs gh + network) ---------
note "== Deploy: .nojekyll present on gh-pages =="
if command -v gh >/dev/null 2>&1; then
  repo="$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null)"
  if [ -n "$repo" ] && gh api "repos/$repo/contents/.nojekyll?ref=gh-pages" >/dev/null 2>&1; then
    ok ".nojekyll present on gh-pages ($repo)"
  else
    warn "could not confirm .nojekyll on gh-pages (offline, or branch not built yet) — verify before/after deploy"
  fi
else
  warn "gh CLI not found — skipping .nojekyll check (verify manually)"
fi

echo
if [ "$fail" -eq 0 ]; then printf '%sWorkflow check PASSED%s\n' "$GRN" "$NC"; exit 0
else printf '%sWorkflow check FAILED — fix the ✗ items above before deploying%s\n' "$RED" "$NC"; exit 1; fi
