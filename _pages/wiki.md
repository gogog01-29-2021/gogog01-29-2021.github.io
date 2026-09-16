---
layout: page
title: wiki
permalink: /wiki/
nav: true
nav_order: 2.5
description: Every published post, treated as one knowledge base — browse the map, or ask a question across all of them.
---

## Knowledge map

Every post on the blog, connected wherever a post declares a `related:` link to
another. Click a node to open that post.

{% include knowledge_map.liquid %}

---

## Ask a question

<div id="wiki-chat" style="border:1px solid var(--global-divider-color); border-radius:8px; padding:1.25rem; margin:1.5rem 0;">
  <p id="wiki-chat-note" style="margin-top:0; opacity:0.75;">
    Answers are generated from the full text of every post above, not a search
    index — so an answer can draw on more than one post at once.
    <strong>Not wired up yet</strong> — this box is the interface only; there's
    no backend answering questions until that's built and gated to admin-only
    login.
  </p>
  <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
    <input
      type="text"
      id="wiki-chat-input"
      placeholder="Ask something about what's on this blog…"
      style="flex:1; min-width:200px; padding:0.5rem;"
      disabled
    />
    <button id="wiki-chat-ask" disabled>Ask</button>
  </div>
  <div id="wiki-chat-answer" style="margin-top:1rem;"></div>
</div>
