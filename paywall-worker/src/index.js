// Blog paywall worker.
// Validates a Polar license key (same pattern as eastside/billing.py's validate_license)
// and, depending on which benefit the key grants, returns the free-tier or full (free +
// paid) article content. No subscriber database: every request is validated live against
// Polar. Admin key bypasses Polar entirely and always gets full content.

import sectorSpecializedFinancialLlms from "./articles/sector-specialized-financial-llms.js";

const POLAR_VALIDATE_URL = "https://api.polar.sh/v1/customer-portal/license-keys/validate";

// Tiered article content, keyed by slug (must match the `slug` the post's widget posts).
// Each entry is { free, paid } — free-tier keys get `free`; paid-tier keys get `free + paid`.
const ARTICLES = {
  "sector-specialized-financial-llms": sectorSpecializedFinancialLlms,
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

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(request, env) });
    }
    if (request.method !== "POST") {
      return json({ ok: false, error: "method not allowed" }, 405, request, env);
    }

    const url = new URL(request.url);
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
