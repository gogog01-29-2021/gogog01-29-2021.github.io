---
layout: page
title: topics
permalink: /topics/
nav: true
nav_order: 2
description: Browse posts by topic. The taxonomy is a generated snapshot of an LLM-derived ontology in <code>_data/topics.yml</code>, nested to arbitrary depth.
---

{% include topic-tree.liquid nodes=site.data.topics depth=0 %}

---

**How this works.** A post is filed under a node by declaring its **full
ancestor path** of `slug`s in its front matter, so every level of the tree
rolls up and stays browsable:

```yaml
categories: [math, analysis, complex-analysis]
# math → analysis → complex-analysis (leaf)
```

A category page becomes browsable once at least one post uses its slug
(Jekyll only generates an archive for non-empty categories).

**The tree is generated, not hand-edited.** `_data/topics.yml` is a snapshot of
an LLM-derived ontology (see `LOCKED_WORKFLOW.md` §4): concepts are extracted
from each post, placed under the right branch, and the tree is rebalanced into
upper/lower concepts as it grows. Leaf slugs never get renamed (they drive these
URLs); regrouping only adds new upper-concept nodes above them. The renderer
(`_includes/topic-tree.liquid`) recurses to any depth automatically.
