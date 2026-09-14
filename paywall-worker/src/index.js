// Blog paywall worker.
// Validates a Polar license key (same pattern as eastside/billing.py's validate_license)
// and, if granted (or if the caller is the admin), returns the full gated article content.
// No subscriber database: every request is validated live against Polar.

import sectorSpecializedFinancialLlms from "./articles/sector-specialized-financial-llms.js";

const POLAR_VALIDATE_URL = "https://api.polar.sh/v1/customer-portal/license-keys/validate";

// Full article content, keyed by slug (must match the `slug` the post's widget posts).
const ARTICLES = {
  "sector-specialized-financial-llms": sectorSpecializedFinancialLlms,
};

function corsHeaders(env) {
  return {
    "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function json(data, status, env) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(env) },
  });
}

async function validatePolarKey(key, env) {
  const res = await fetch(POLAR_VALIDATE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, organization_id: env.POLAR_ORGANIZATION_ID }),
  });
  if (!res.ok) return { granted: false };
  const data = await res.json();
  const granted = (data.status || "").toLowerCase() === "granted";
  if (env.POLAR_BENEFIT_ID && data.benefit_id !== env.POLAR_BENEFIT_ID) {
    return { granted: false };
  }
  return { granted, data };
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(env) });
    }
    if (request.method !== "POST") {
      return json({ ok: false, error: "method not allowed" }, 405, env);
    }

    const url = new URL(request.url);
    if (url.pathname !== "/unlock") {
      return json({ ok: false, error: "not found" }, 404, env);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ ok: false, error: "invalid JSON body" }, 400, env);
    }

    const slug = (body.slug || "").trim();
    const key = (body.license_key || "").trim();
    if (!slug || !ARTICLES[slug]) {
      return json({ ok: false, error: "unknown article" }, 404, env);
    }
    if (!key) {
      return json({ ok: false, error: "license key required" }, 400, env);
    }

    // Admin bypass: you always get full access with your own admin key, no Polar round-trip.
    if (env.ADMIN_KEY && key === env.ADMIN_KEY) {
      return json({ ok: true, admin: true, content: ARTICLES[slug] }, 200, env);
    }

    const { granted } = await validatePolarKey(key, env);
    if (!granted) {
      return json({ ok: false, error: "license not valid or not active" }, 403, env);
    }

    return json({ ok: true, content: ARTICLES[slug] }, 200, env);
  },
};
