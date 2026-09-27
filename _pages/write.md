---
layout: page
title: write
permalink: /write/
nav: false
description: In-browser draft studio — write a post in Markdown + LaTeX with live preview, pick tone and categories, and export a ready-to-commit <code>.md</code>. Static, client-side; nothing is saved to the server.
---

<!--
  Client-side draft studio (Editor option A — see BLOG_FEATURE_OPTIONS.md).
  Pure static: renders Markdown (marked.js) + LaTeX (site MathJax) live, then
  emits a front-matter + body .md you download into _posts/ or paste to commit.
  Category checkboxes are generated from _data/topics.yml so drafts stay aligned
  with the taxonomy (Classification option A).
-->

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.css" onerror="this.remove()" />

<style>
  .ws-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; align-items: start; }
  @media (max-width: 900px) { .ws-grid { grid-template-columns: 1fr; } }
  .ws-field { margin-bottom: 0.6rem; }
  .ws-field label { display:block; font-weight:600; font-size:0.8rem; margin-bottom:0.15rem; }
  .ws-field input, .ws-field select, .ws-field textarea {
    width:100%; padding:0.4rem 0.5rem; font-size:0.9rem;
    border:1px solid var(--global-divider-color, #ccc); border-radius:6px;
    background:var(--global-card-bg-color, #fff); color:var(--global-text-color, #111);
  }
  #ws-body { min-height: 60vh; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size:0.85rem; line-height:1.5; }
  #ws-preview { border:1px solid var(--global-divider-color,#ccc); border-radius:8px; padding:1rem 1.25rem; min-height:60vh; overflow:auto; }
  .ws-cats { display:grid; grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); gap:0.15rem 0.75rem; font-size:0.8rem; }
  .ws-cats .ws-parent { font-weight:600; margin-top:0.35rem; grid-column:1/-1; }
  .ws-toolbar { display:flex; flex-wrap:wrap; gap:0.5rem; margin:0.75rem 0; }
  .ws-toolbar button { padding:0.4rem 0.8rem; border-radius:6px; border:1px solid var(--global-theme-color,#b509ac); background:var(--global-theme-color,#b509ac); color:#fff; cursor:pointer; font-size:0.85rem; }
  .ws-toolbar button.ws-secondary { background:transparent; color:var(--global-theme-color,#b509ac); }
  .ws-toolbar-link { padding:0.4rem 0.8rem; border-radius:6px; border:1px solid #24292f; background:#24292f; color:#fff !important; text-decoration:none !important; font-size:0.85rem; display:inline-flex; align-items:center; gap:0.4rem; }
  .ws-toolbar-link:hover { background:#32383f; }
  #ws-save { background:#1a7f37; border-color:#1a7f37; }
  .ws-hint { font-size:0.75rem; opacity:0.7; margin-top:0.2rem; }
  #ws-status { font-size:0.8rem; margin-left:auto; align-self:center; opacity:0.8; }
</style>

<div class="ws-toolbar">
  <button type="button" onclick="wsInsert('$$\\n  \\n$$')">Display math $$…$$</button>
  <button type="button" onclick="wsInsert('$…$')">Inline $…$</button>
  <button type="button" onclick="wsInsert('{% raw %}{% cite KEY --file references %}{% endraw %}')">Cite</button>
  <button type="button" class="ws-secondary" onclick="wsScaffold()">Insert survey-first outline</button>
  <button type="button" onclick="wsCopy()">Copy .md</button>
  <button type="button" onclick="wsDownload()">Download .md</button>
  <a id="ws-signin" class="ws-toolbar-link" href="https://gate.zavis.chat/auth/github?next=https://zavis.chat/write/" style="display:none;">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>
    Sign in with GitHub to save
  </a>
  <button type="button" id="ws-save" style="display:none;" onclick="wsSaveToGithub()">Save to blog (@<span id="ws-gh-user"></span>)</button>
  <span id="ws-status"></span>
</div>

<div class="ws-grid">
  <div>
    <div class="ws-field">
      <label for="ws-title">Title</label>
      <input id="ws-title" type="text" placeholder="The agent loop: a field guide…" oninput="wsRender()" />
    </div>
    <div class="ws-grid" style="gap:0.6rem;">
      <div class="ws-field">
        <label for="ws-date">Date</label>
        <input id="ws-date" type="text" placeholder="YYYY-MM-DD HH:MM:SS+0900" oninput="wsRender()" />
      </div>
      <div class="ws-field">
        <label for="ws-tone">Tone (ask per topic — never silent)</label>
        <select id="ws-tone" onchange="wsRender()">
          <option value="">— choose one —</option>
          <option>Clean academic</option>
          <option>Math-compact</option>
          <option>Simulation</option>
          <option>Professor-cautious</option>
          <option>Mechanism-heavy</option>
          <option>Risk-analysis</option>
          <option>Econometric</option>
          <option>Best-paper-ready</option>
        </select>
      </div>
    </div>
    <div class="ws-field">
      <label for="ws-desc">Description</label>
      <input id="ws-desc" type="text" placeholder="One-line summary for the post header." oninput="wsRender()" />
    </div>
    <div class="ws-field">
      <label for="ws-tags">Tags (space-separated)</label>
      <input id="ws-tags" type="text" placeholder="agentic-ai reinforcement-learning survey" oninput="wsRender()" />
    </div>

    <div class="ws-field">
      <label>Categories (from <code>_data/topics.yml</code>)</label>
      <div class="ws-cats" id="ws-cats">
        {% for big in site.data.topics %}
        <label class="ws-parent"><input type="checkbox" class="ws-cat" value="{{ big.slug }}" onchange="wsRender()" /> {{ big.name }}</label>
        {% for child in big.children %}
        <label><input type="checkbox" class="ws-cat" value="{{ child.slug }}" onchange="wsRender()" /> {{ child.name }}</label>
        {% endfor %}
        {% endfor %}
      </div>
      <div class="ws-field" style="margin-top:0.4rem;">
        <label for="ws-newcat">New sector (if none fits — add it to topics.yml when you commit)</label>
        <input id="ws-newcat" type="text" placeholder="e.g. quantum-computing  (parent: physics)" oninput="wsRender()" />
        <div class="ws-hint">Typing a new slug here does <em>not</em> edit the tree — it flags that <code>_data/topics.yml</code> needs the node added under its upper branch in the same commit. The lint guard (<code>scripts/check-workflow.sh</code>) blocks a deploy if a category is missing from the tree.</div>
      </div>
    </div>

    <div class="ws-field">
      <label for="ws-body">Body (Markdown + LaTeX)</label>
      <textarea id="ws-body" oninput="wsRender()" placeholder="## Section&#10;&#10;Prose with inline math $a_t$ and display:&#10;&#10;$$&#10;  \pi(a\mid s)&#10;$$"></textarea>
      <div class="ws-hint">Math is protected from Markdown before rendering, so <code>_underscores_</code> and <code>\backslashes</code> inside <code>$…$</code> / <code>$$…$$</code> survive.</div>
    </div>
  </div>

  <div>
    <label style="font-weight:600;font-size:0.8rem;">Live preview</label>
    <div id="ws-preview"><em style="opacity:0.6;">Preview renders here…</em></div>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js"></script>
<script>
  // ---- gather form state into a front-matter + body .md string ----
  function wsSlug(t) {
    return (t || "untitled").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }
  function wsSelectedCats() {
    return Array.from(document.querySelectorAll(".ws-cat:checked")).map(function (c) { return c.value; });
  }
  function wsFrontMatter() {
    var tags = (document.getElementById("ws-tags").value || "").trim();
    var cats = wsSelectedCats();
    var tone = document.getElementById("ws-tone").value;
    var lines = ["---", "layout: post"];
    lines.push('title: "' + (document.getElementById("ws-title").value || "Untitled").replace(/"/g, "'") + '"');
    lines.push("date: " + (document.getElementById("ws-date").value || "YYYY-MM-DD HH:MM:SS+0900"));
    var desc = document.getElementById("ws-desc").value;
    if (desc) lines.push("description: " + desc);
    if (tags) lines.push("tags: " + tags);
    if (cats.length) lines.push("categories: [" + cats.join(", ") + "]");
    lines.push("related_posts: false");
    if (tone) lines.push("# tone: " + tone + "  (per LOCKED_WORKFLOW.md §2)");
    lines.push("---");
    return lines.join("\n");
  }
  function wsFullDoc() {
    return wsFrontMatter() + "\n\n" + (document.getElementById("ws-body").value || "");
  }

  // ---- protect math so marked() doesn't mangle LaTeX, then restore ----
  function wsRender() {
    var body = document.getElementById("ws-body").value || "";
    var store = [];
    function protect(re) {
      body = body.replace(re, function (m) { store.push(m); return " MATH" + (store.length - 1) + " "; });
    }
    protect(/\$\$[\s\S]*?\$\$/g); // display
    protect(/\\\[[\s\S]*?\\\]/g); // \[ \]
    protect(/\\\([\s\S]*?\\\)/g); // \( \)
    protect(/\$(?!\s)(?:[^$\n]|\\\$)+?\$/g); // inline
    var html;
    try { html = marked.parse(body); } catch (e) { html = "<pre>" + String(e) + "</pre>"; }
    html = html.replace(/ MATH(\d+) /g, function (_, i) { return store[+i]; });
    var el = document.getElementById("ws-preview");
    el.innerHTML = html || "<em style='opacity:0.6;'>Preview renders here…</em>";
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetClear && window.MathJax.typesetClear([el]);
      window.MathJax.typesetPromise([el]).catch(function () {});
    }
    var newcat = document.getElementById("ws-newcat").value.trim();
    var st = document.getElementById("ws-status");
    st.textContent = newcat ? "⚠ add sector to topics.yml: " + newcat : "";
  }

  // ---- toolbar actions ----
  function wsInsert(snippet) {
    var ta = document.getElementById("ws-body");
    var s = ta.selectionStart, e = ta.selectionEnd;
    ta.value = ta.value.slice(0, s) + snippet + ta.value.slice(e);
    ta.focus();
    ta.selectionStart = ta.selectionEnd = s + snippet.length;
    wsRender();
  }
  function wsScaffold() {
    var outline = [
      "> Survey-first: map the sector and its sub-problems honestly before any of",
      "> my own work appears.",
      "",
      "## Why this matters",
      "",
      "## The landscape (the field first)",
      "",
      "## Sub-problems and their design space",
      "",
      "## Open research",
      "",
      "## Where my own work sits (one point in the space)",
      "",
      "## References",
      "",
      "{% raw %}{% bibliography --file references --cited %}{% endraw %}",
      ""
    ].join("\n");
    wsInsert(outline);
  }
  function wsCopy() {
    navigator.clipboard.writeText(wsFullDoc()).then(function () {
      var st = document.getElementById("ws-status"); st.textContent = "copied .md to clipboard"; setTimeout(wsRender, 1500);
    });
  }
  function wsDownload() {
    var title = document.getElementById("ws-title").value;
    var date = (document.getElementById("ws-date").value || "").slice(0, 10) || "YYYY-MM-DD";
    var name = date + "-" + wsSlug(title) + ".md";
    var blob = new Blob([wsFullDoc()], { type: "text/markdown" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name; a.click();
    URL.revokeObjectURL(a.href);
  }

  // ---- GitHub sign-in + save (paywall-worker at gate.zavis.chat holds the OAuth token) ----
  var GATE_ORIGIN = "https://gate.zavis.chat";
  function wsGithubUser() {
    var m = document.cookie.match(/(?:^|; )gh_user=([^;]*)/);
    return m ? decodeURIComponent(m[1]) : null;
  }
  function wsRefreshAuthUI() {
    var user = wsGithubUser();
    document.getElementById("ws-signin").style.display = user ? "none" : "inline";
    document.getElementById("ws-save").style.display = user ? "inline-block" : "none";
    if (user) document.getElementById("ws-gh-user").textContent = user;
  }
  function wsSaveToGithub() {
    var title = document.getElementById("ws-title").value;
    var date = (document.getElementById("ws-date").value || "").slice(0, 10) || "YYYY-MM-DD";
    var path = "_posts/" + date + "-" + wsSlug(title) + ".md";
    var st = document.getElementById("ws-status");
    st.textContent = "saving…";
    fetch(GATE_ORIGIN + "/api/save-post", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: path, content: wsFullDoc(), message: "Add " + path + " via /write" }),
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        st.textContent = data.ok ? ("saved: " + data.path) : ("save failed: " + data.error);
      })
      .catch(function (e) { st.textContent = "save failed: " + e; });
  }

  document.addEventListener("DOMContentLoaded", function () { wsRender(); wsRefreshAuthUI(); });
</script>
