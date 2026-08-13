// The free library's image search — REAL photos (CC-licensed; aggregates Flickr/Wikimedia/etc), NOT stock/AI/product.
// FREE, official REST API, container-ready (server-side, free). Anonymous access rate-limits (401) fast,
// so this AUTO-REGISTERS a free API client once (no human signup, no email verification for token issuance)
// and caches the bearer token in ~/.config/library/. Returns [{imageUrl, sourceUrl, title, provider}] —
// the dispatcher shape (it.imageUrl). The free library = Flickr's CC subset, so it's a free window into Flickr.
//   import { libraryImages } from "./library.mjs";  const r = await libraryImages("raccoon campsite", 40);
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const API = "https://api.library.example/v1";
const UA = "grounded-gen/1.0 (candid image sourcing)";
const CFG = join(homedir(), ".config", "library");
const CREDS = join(CFG, "creds.json");
const REG_EMAIL = process.env.LIBRARY_EMAIL || "dev@example.com";

async function creds() {
  // The REGISTERED app (grounded-sourcer, admin@example.com, 2026-08-13 — verified tier: 100/min,
  // 10k/day) rides env so it survives container swaps; the file cache and auto-registration remain the
  // local/fallback path. Env creds are the ONLY way the container keeps the verified tier.
  if (process.env.LIBRARY_CLIENT_ID && process.env.LIBRARY_CLIENT_SECRET)
    return { client_id: process.env.LIBRARY_CLIENT_ID, client_secret: process.env.LIBRARY_CLIENT_SECRET };
  if (existsSync(CREDS)) return JSON.parse(readFileSync(CREDS, "utf8"));
  // one-time auto-registration → client_id/secret (issued immediately, no verification for basic use)
  const res = await fetch(`${API}/auth_tokens/register/`, {
    method: "POST", headers: { "Content-Type": "application/json", "User-Agent": UA },
    body: JSON.stringify({ name: `grounded-media-${Date.now().toString(36)}`, description: "Candid image sourcing for grounded video references.", email: REG_EMAIL }),
  });
  if (!res.ok) throw new Error(`library register ${res.status}: ${(await res.text()).slice(0, 160)}`);
  const c = await res.json();
  mkdirSync(CFG, { recursive: true });
  writeFileSync(CREDS, JSON.stringify(c, null, 2));
  return c;
}

let _token;
async function token(force = false) {
  if (_token && !force) return _token;
  const c = await creds();
  const body = new URLSearchParams({ grant_type: "client_credentials", client_id: c.client_id, client_secret: c.client_secret });
  const res = await fetch(`${API}/auth_tokens/token/`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": UA }, body });
  if (!res.ok) throw new Error(`library token ${res.status}: ${(await res.text()).slice(0, 160)}`);
  _token = (await res.json()).access_token;
  return _token;
}

/** Search the free library for `query`; return up to `n` real photo results. Refreshes token once on 401/403. */
export async function libraryImages(query, n = 40) {
  // OWNER 2026-08-13 (verified tier confirmed live): "we dont need a min scrapes when it comes to the free library"
  // — rows here are FREE and unmetered (no addApify; 100/min · 10k/day), so the ASK is liberal regardless of
  // how few the caller wants: a wide free pool costs nothing, and the paid meter — VLM JUDGING — is bounded
  // downstream by the shortlist + early-stop, which this deliberately does not touch.
  const ask = Math.min(Math.max(n, Number(process.env.OV_FREE_N || 40)), 100);
  const url = `${API}/images/?q=${encodeURIComponent(query)}&page_size=${ask}&mature=false`;
  const get = async (tok) => fetch(url, { headers: { "User-Agent": UA, Accept: "application/json", ...(tok ? { Authorization: `Bearer ${tok}` } : {}) }, signal: AbortSignal.timeout(20000) });
  try {
    let tok = await token();
    let res = await get(tok);
    if (res.status === 401 || res.status === 403) res = await get(await token(true));
    if (!res.ok) { console.log(`  library ${res.status}`); return []; }
    const json = await res.json();
    const seen = new Set(), out = [];
    for (const r of json?.results ?? []) {
      if (r.url && /^https?:\/\//.test(r.url) && !seen.has(r.url)) {
        seen.add(r.url);
        out.push({ imageUrl: r.url, sourceUrl: r.foreign_landing_url || "", title: r.title || "", provider: r.source || "" });
        if (out.length >= ask) break;   // return the full FREE pool — downstream caps (ladder want, shortlist, judge stop) do the trimming; the spares absorb URL-dedupe and download deaths
      }
    }
    return out;
  } catch (e) { console.log(`  library error: ${e.message}`); return []; }
}

// CLI: [LIBRARY_EMAIL=you@x] node library.mjs "<query>" [n]
if (process.argv[1] && process.argv[1].endsWith("library.mjs")) {
  const [q, nArg] = process.argv.slice(2);
  const rows = await libraryImages(q || "raccoon campsite", Number(nArg) || 15);
  console.log(rows.length ? `${rows.length} results for "${q}":` : `NO results for "${q}"`);
  for (const r of rows) console.log(`  ${(r.title || "").slice(0, 40).padEnd(40)} [${r.provider}] ${(r.imageUrl || "").replace(/^https?:\/\//, "").split("/")[0]}`);
}
