#!/usr/bin/env python3
"""Topic-tree rules from LOCKED_WORKFLOW.md §4 (split threshold + frozen categories).

  python3 scripts/check_topics.py          # check (called by check-workflow.sh)
  python3 scripts/check_topics.py --lock   # freeze newly added nodes into scripts/topics.lock

Rules:
  1. SPLIT: a node may hold at most SPLIT_THRESHOLD posts *directly* (posts that
     declare it but none of its children). Past that, the agent must split it into
     child concepts (the parent keeps its slug and still rolls up every post).
  2. FROZEN: once a node is in scripts/topics.lock its slug and parent are fixed.
     Removing, renaming or re-parenting a locked node fails the check. Changing
     one means editing topics.lock by hand, with the author's explicit OK.
  3. Every node in topics.yml must be locked (run --lock after adding nodes).

No third-party deps: topics.yml is parsed by indentation (its format is fixed).
"""
import glob
import os
import re
import sys

SPLIT_THRESHOLD = 10
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
TOPICS = os.path.join(ROOT, "_data", "topics.yml")
LOCK = os.path.join(ROOT, "scripts", "topics.lock")


def load_tree():
    """Return {slug: {"name", "parent"}} in file order."""
    nodes, stack, pending = {}, [], None  # stack of (indent, slug)
    for line in open(TOPICS, encoding="utf-8"):
        m = re.match(r"^(\s*)- name:\s*(.+?)\s*$", line)
        if m:
            pending = (len(m.group(1)), m.group(2).strip("\"'"))
            continue
        m = re.match(r"^\s*slug:\s*(\S+)\s*$", line)
        if m and pending:
            indent, name = pending
            slug = m.group(1).strip("\"'")
            while stack and stack[-1][0] >= indent:
                stack.pop()
            nodes[slug] = {"name": name, "parent": stack[-1][1] if stack else "-"}
            stack.append((indent, slug))
            pending = None
    return nodes


def post_categories():
    out = {}
    for f in sorted(glob.glob(os.path.join(ROOT, "_posts", "*.md"))):
        text = open(f, encoding="utf-8").read()
        fm = text.split("---", 2)[1] if text.startswith("---") else ""
        m = re.search(r"^categories:\s*\[?([^\]\n]*)\]?\s*$", fm, re.M)
        if m:
            out[os.path.basename(f)] = [c.strip(" \"'") for c in m.group(1).split(",") if c.strip()]
    return out


def load_lock():
    lock = {}
    if os.path.exists(LOCK):
        for line in open(LOCK, encoding="utf-8"):
            line = line.split("#", 1)[0].strip()
            if line:
                slug, parent = line.split()
                lock[slug] = parent
    return lock


def main():
    sys.stdout.reconfigure(encoding="utf-8")  # cp949 consoles can't print ✗/✓
    nodes = load_tree()
    lock = load_lock()

    if "--lock" in sys.argv:
        new = [s for s in nodes if s not in lock]
        fresh = not os.path.exists(LOCK)
        with open(LOCK, "a", encoding="utf-8", newline="\n") as fh:
            if fresh:
                fh.write("# Frozen topic nodes: <slug> <parent>. Edit only with the author's OK.\n")
            for s in new:
                fh.write(f"{s} {nodes[s]['parent']}\n")
        print(f"locked {len(new)} new node(s): {' '.join(new) or '-'}")
        return 0

    fail = False
    children = {s: [c for c in nodes if nodes[c]["parent"] == s] for s in nodes}
    direct = {s: [] for s in nodes}
    for post, cats in post_categories().items():
        declared = set(cats)
        for c in cats:
            if c in direct and not declared.intersection(children[c]):
                direct[c].append(post)

    for slug, posts in direct.items():
        if len(posts) > SPLIT_THRESHOLD:
            fail = True
            print(f"✗ SPLIT: '{slug}' holds {len(posts)} posts directly (> {SPLIT_THRESHOLD}) — "
                  "split it into child concepts (LOCKED_WORKFLOW.md §4)")

    for slug, parent in lock.items():
        if slug not in nodes:
            fail = True
            print(f"✗ FROZEN: locked node '{slug}' was removed or renamed")
        elif nodes[slug]["parent"] != parent:
            fail = True
            print(f"✗ FROZEN: locked node '{slug}' moved from '{parent}' to '{nodes[slug]['parent']}'")
    unlocked = [s for s in nodes if s not in lock]
    if unlocked:
        fail = True
        print(f"✗ UNLOCKED: new node(s) {' '.join(unlocked)} — run: python3 scripts/check_topics.py --lock")

    if not fail:
        busiest = sorted(direct.items(), key=lambda kv: -len(kv[1]))[:3]
        summary = ", ".join(f"{s}={len(p)}" for s, p in busiest)
        print(f"✓ topic tree: {len(nodes)} frozen nodes, max direct posts {summary} (limit {SPLIT_THRESHOLD})")
    return 1 if fail else 0


if __name__ == "__main__":
    sys.exit(main())
