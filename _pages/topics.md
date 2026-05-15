---
layout: page
title: topics
permalink: /topics/
nav: true
nav_order: 2
description: Browse posts by topic. The taxonomy is data-driven — edit <code>_data/topics.yml</code> to add a big category or a sub-category.
---

{% assign base = '/blog/category/' %}

<ul>
{% for big in site.data.topics %}
  <li>
    <strong><a href="{{ base | append: big.slug | relative_url }}">{{ big.name }}</a></strong>
    {% if big.children and big.children.size > 0 %}
    <ul>
      {% for child in big.children %}
      <li><a href="{{ base | append: child.slug | relative_url }}">{{ child.name }}</a></li>
      {% endfor %}
    </ul>
    {% endif %}
  </li>
{% endfor %}
</ul>

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
