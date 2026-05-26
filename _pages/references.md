---
layout: page
permalink: /references/
title: references
description: Curated essays and papers that scaffold the research direction. Each card links to the source; longer reading-archive write-ups live under <a href="/blog/category/papers/">/blog/category/papers/</a>.
nav: true
nav_order: 7
---

<ul class="reference-list" style="list-style:none; padding:0; margin:0;">
{% for ref in site.data.references %}
  <li style="margin: 0 0 2.5rem 0; display: flex; gap: 1.25rem; align-items: flex-start; flex-wrap: wrap;">
    {% if ref.image %}
      <a href="{{ ref.url }}" target="_blank" rel="noopener noreferrer" style="flex-shrink: 0;">
        <img src="{{ ref.image | relative_url }}" alt="{{ ref.title }} cover" style="width: 220px; height: auto; border-radius: 4px; box-shadow: 0 1px 6px rgba(0,0,0,0.08);">
      </a>
    {% endif %}
    <div style="flex: 1; min-width: 280px;">
      <h3 style="margin: 0 0 0.25rem 0;">
        <a href="{{ ref.url }}" target="_blank" rel="noopener noreferrer">{{ ref.title }}</a>
      </h3>
      <p class="post-meta" style="margin: 0 0 0.6rem 0;">
        {{ ref.author }} &middot; {{ ref.year }}{% if ref.category %} &middot; {{ ref.category }}{% endif %}
      </p>
      {% if ref.one_line %}<p style="font-style: italic; margin: 0 0 0.6rem 0;">{{ ref.one_line }}</p>{% endif %}
      {% if ref.why %}<p style="margin: 0;">{{ ref.why }}</p>{% endif %}
    </div>
  </li>
{% endfor %}
</ul>

---

<p class="post-meta" style="margin-top: 1.5rem;">
Add a new reference by appending an entry to <code>_data/references.yml</code>.
Only real published works with verifiable URLs; never fabricate quotes or
metadata.
</p>
