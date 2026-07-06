---
layout: page
title: topics
permalink: /topics/
nav: true
nav_order: 2
description: Browse posts by topic. The taxonomy is data-driven — edit <code>_data/topics.yml</code> to add a big category or a sub-category.
---

{% include topic-tree.liquid nodes=site.data.topics depth=0 %}

---

**How this works.** A post is filed under a node by declaring the node's
`slug` in its front matter, e.g.:

```yaml
categories: [topology]   # a sub-category
# or
categories: [llm]        # a big category
```

A category page becomes browsable once at least one post uses its slug
(Jekyll only generates an archive for non-empty categories).

**Adding categories.** Edit `_data/topics.yml`:

- **Big category** — add a new top-level `- name: / slug:` block.
- **Sub-category** — add an entry under that big category's `children:`.

No template changes needed; this page re-renders the tree automatically.
