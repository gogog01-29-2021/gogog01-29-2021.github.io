// Blog paywall worker.
// Validates a Polar license key (same pattern as eastside/billing.py's validate_license)
// and, depending on which benefit the key grants, returns the free-tier or full (free +
// paid) article content. No subscriber database: every request is validated live against
// Polar. Admin key bypasses Polar entirely and always gets full content.
//
// Also serves GitHub-OAuth-gated write access for /write/: sign in with GitHub, and if
// the authenticated login matches ADMIN_GITHUB_LOGIN, POST /api/save-post commits the
// draft straight to _posts/ on `main` via the Contents API. Single-admin check (repo
// owner only) — no separate role system needed since there is exactly one writer.

import sectorSpecializedFinancialLlms from "./articles/sector-specialized-financial-llms.js";
import pdeSolverAdi from "./articles/pde-solver-adi.js";
import fbaquantDeepHedging from "./articles/fbaquant-deep-hedging.js";

const POLAR_VALIDATE_URL = "https://api.polar.sh/v1/customer-portal/license-keys/validate";
const GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";
const GITHUB_API_VERSION = "2022-11-28";

// Tiered content, keyed by slug (must match the `slug` the page's widget posts).
// Each entry is { free, paid } — free-tier keys get `free`; paid-tier keys get `free + paid`.
// Covers both blog posts and gated project pages.
const ARTICLES = {
  "sector-specialized-financial-llms": sectorSpecializedFinancialLlms,
  "pde-solver-adi": pdeSolverAdi,
  "fbaquant-deep-hedging": fbaquantDeepHedging,
};

// ALLOWED_ORIGIN may be a single origin or a comma-separated list (covers the
// github.io -> custom-domain transition window without a live breakage gap).
function corsHeaders(request, env) {
  const allowed = (env.ALLOWED_ORIGIN || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  const origin = request.headers.get("Origin") || "";
  const matched = allowed.includes(origin) ? origin : allowed[0] || "*";
  return {
    "Access-Control-Allow-Origin": matched,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Credentials": "true",
    Vary: "Origin",
  };
}

function json(data, status, request, env) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(request, env) },
  });
}

// Returns "paid", "free", or null (not granted / unrecognized benefit).
async function resolveTier(key, env) {
  const res = await fetch(POLAR_VALIDATE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, organization_id: env.POLAR_ORGANIZATION_ID }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  if ((data.status || "").toLowerCase() !== "granted") return null;
  if (data.benefit_id === env.POLAR_PAID_BENEFIT_ID) return "paid";
  if (data.benefit_id === env.POLAR_FREE_BENEFIT_ID) return "free";
  return null;
}

// ---- signed-cookie session helpers (HMAC, same pattern as the desksideX worker) ----

function b64urlFromBytes(bytes) {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function b64urlToBytes(str) {
  const s = str.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((str.length + 3) % 4);
  return Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
}
async function hmacB64(secret, data) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return b64urlFromBytes(new Uint8Array(sig));
}
function mustSecret(env, name) {
  if (!env[name]) throw new Error(`${name} is not configured`);
  return env[name];
}
async function makeSession(payloadObj, secret) {
  const payload = btoa(JSON.stringify(payloadObj)).replace(/=+$/, "");
  return `${payload}.${await hmacB64(secret, payload)}`;
}
async function verifySession(cookieValue, secret) {
  if (!cookieValue) return null;
  const [payload, sig] = cookieValue.split(".");
  if (!payload || !sig) return null;
  const expected = await hmacB64(secret, payload);
  if (expected !== sig) return null;
  try {
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}
function getCookie(request, name) {
  const header = request.headers.get("Cookie") || "";
  const match = header.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function utf8ToBase64(str) {
  return btoa(Array.from(new TextEncoder().encode(str), (b) => String.fromCharCode(b)).join(""));
}

async function handleAuthGithub(request, env) {
  const url = new URL(request.url);
  const next = url.searchParams.get("next") || "/write/";
  const state = crypto.randomUUID();
  const authorizeUrl = new URL(GITHUB_AUTHORIZE_URL);
  authorizeUrl.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  authorizeUrl.searchParams.set("redirect_uri", `https://gate.zavis.chat/auth/github/callback`);
  authorizeUrl.searchParams.set("scope", "repo read:user");
  authorizeUrl.searchParams.set("state", state);
  return new Response(null, {
    status: 302,
    headers: {
      Location: authorizeUrl.toString(),
      "Set-Cookie": [
        `gh_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
        `gh_oauth_next=${encodeURIComponent(next)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
      ].join(", "),
    },
  });
}

async function handleAuthGithubCallback(request, env) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expectedState = getCookie(request, "gh_oauth_state");
  const next = decodeURIComponent(getCookie(request, "gh_oauth_next") || "/write/");
  if (!code || !state || state !== expectedState) {
    return new Response("OAuth state mismatch or missing code.", { status: 400 });
  }

  const tokenRes = await fetch(GITHUB_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: "https://gate.zavis.chat/auth/github/callback",
    }),
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    return new Response("GitHub token exchange failed.", { status: 401 });
  }

  const userRes = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      "User-Agent": "zavis-chat-write",
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": GITHUB_API_VERSION,
    },
  });
  const user = await userRes.json();
  if (!user.login || user.login !== env.ADMIN_GITHUB_LOGIN) {
    return new Response(`Signed in as ${user.login || "unknown"}, which is not the admin account. Access denied.`, { status: 403 });
  }

  const secret = mustSecret(env, "SESSION_SECRET");
  const session = await makeSession({ login: user.login, token: tokenData.access_token, t: Date.now() }, secret);
  return new Response(null, {
    status: 302,
    headers: {
      Location: next,
      "Set-Cookie": [
        `ds_write_session=${session}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=21600`,
        `gh_user=${user.login}; Path=/; Secure; SameSite=Lax; Max-Age=21600`,
        `gh_oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
        `gh_oauth_next=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
      ].join(", "),
    },
  });
}

async function handleSavePost(request, env) {
  const secret = mustSecret(env, "SESSION_SECRET");
  const session = await verifySession(getCookie(request, "ds_write_session"), secret);
  if (!session || session.login !== env.ADMIN_GITHUB_LOGIN) {
    return json({ ok: false, error: "not signed in as admin" }, 401, request, env);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "invalid JSON body" }, 400, request, env);
  }
  const path = (body.path || "").trim();
  const content = body.content || "";
  const message = (body.message || `Add ${path} via /write`).trim();
  if (!path.startsWith("_posts/") || !path.endsWith(".md")) {
    return json({ ok: false, error: "path must be _posts/<name>.md" }, 400, request, env);
  }

  const owner = env.GITHUB_OWNER;
  const repo = env.GITHUB_REPO;
  const branch = env.GITHUB_BRANCH || "main";
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const ghHeaders = {
    Authorization: `Bearer ${session.token}`,
    "User-Agent": "zavis-chat-write",
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": GITHUB_API_VERSION,
  };

  // Look up the current sha if the file already exists (required for an update, must be
  // omitted for a brand-new file or GitHub rejects the write).
  let sha;
  const existing = await fetch(`${apiUrl}?ref=${branch}`, { headers: ghHeaders });
  if (existing.status === 200) {
    const existingData = await existing.json();
    sha = existingData.sha;
  }

  const putRes = await fetch(apiUrl, {
    method: "PUT",
    headers: { ...ghHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      content: utf8ToBase64(content),
      branch,
      ...(sha ? { sha } : {}),
    }),
  });
  if (!putRes.ok) {
    const errText = await putRes.text();
    return json({ ok: false, error: `GitHub API error: ${putRes.status} ${errText}` }, 502, request, env);
  }
  const putData = await putRes.json();
  return json({ ok: true, path, commit: putData.commit && putData.commit.sha }, 200, request, env);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(request, env) });
    }

    if (url.pathname === "/auth/github" && request.method === "GET") {
      return handleAuthGithub(request, env);
    }
    if (url.pathname === "/auth/github/callback" && request.method === "GET") {
      return handleAuthGithubCallback(request, env);
    }
    if (url.pathname === "/api/save-post" && request.method === "POST") {
      return handleSavePost(request, env);
    }

    if (request.method !== "POST") {
      return json({ ok: false, error: "method not allowed" }, 405, request, env);
    }
    if (url.pathname !== "/unlock") {
      return json({ ok: false, error: "not found" }, 404, request, env);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ ok: false, error: "invalid JSON body" }, 400, request, env);
    }

    const slug = (body.slug || "").trim();
    const key = (body.license_key || "").trim();
    const article = ARTICLES[slug];
    if (!slug || !article) {
      return json({ ok: false, error: "unknown article" }, 404, request, env);
    }
    if (!key) {
      return json({ ok: false, error: "license key required" }, 400, request, env);
    }

    // Admin bypass: always full access, no Polar round-trip.
    if (env.ADMIN_KEY && key === env.ADMIN_KEY) {
      return json({ ok: true, admin: true, tier: "paid", content: article.free + article.paid }, 200, request, env);
    }

    const tier = await resolveTier(key, env);
    if (!tier) {
      return json({ ok: false, error: "license not valid or not active" }, 403, request, env);
    }

    const content = tier === "paid" ? article.free + article.paid : article.free;
    return json({ ok: true, tier, content }, 200, request, env);
  },
};
