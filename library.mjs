// The free library's image search — REAL photos (CC-licensed; aggregates Flickr/Wikimedia/etc), NOT stock/AI/product.
// FREE, official REST API, container-ready (server-side, free). Anonymous access rate-limits (401) fast,
// so this AUTO-REGISTERS a free API client once (no human signup, no email verification for token issuance)
// and caches the bearer token in ~/.config/library/. Returns [{imageUrl, sourceUrl, title, provider}] —
// the dispatcher shape (it.imageUrl). The free library = Flickr's CC subset, so it's a free window into Flickr.
//   import { libraryImages } from "./library.mjs";  const r = await libraryImages("raccoon campsite", 40);
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { shapeForSource } from "./_query.mjs";   // the ONE owner of every appendage (owner 2026-09-19); pure and import-free, so no cycle

const API = "https://api.openverse.org/v1";
const UA = "grounded-gen/1.0 (candid image sourcing)";
const CFG = join(homedir(), ".config", "library");
const CREDS = join(CFG, "creds.json");
const REG_EMAIL = process.env.LIBRARY_EMAIL || "dev@example.com";

// ⭐⭐ AN OUTAGE IS A STATE, NOT AN EMPTY POOL (owner 2026-09-08: «we never planned for when the free library is down,
// like it is now. if its down, then our codebase should fallback to paid routes»). Before this, a 5xx, a
// timeout or a dead token endpoint logged one quiet line and returned [] — the SAME shape as "no CC photograph
// exists" — so the pool read an outage as a content miss, every later call in the run paid the 20 s timeout
// again, and nothing outside the log could tell. Now a failure of the SERVICE (5xx, 429, auth that a refresh
// did not cure, network/timeout, the token or register endpoint) trips a circuit: the free tier is skipped
// for OV_DOWN_TTL_MS (60 s — owner: «it should act quickly»; the skip is instant, and a recovered tier is back
// within a minute) and answers [] at once, the reason is logged loudly ONCE per trip, and the state
// is written to out/_ledger/library.json so /health carries it. Callers still receive [] — the pool's web
// leg and the ladders' paid tiers already carry a hunt whose free tier gave nothing (scrape.mjs now hands the
// free tier's seat to the paid member outright and says why). A 4xx on the search itself (a bad query) is
// OURS, not an outage, and does not trip anything.
const STATUS_FILE = process.env.LIBRARY_STATUS_FILE || join(dirname(fileURLToPath(import.meta.url)), "out", "_ledger", "library.json");
const DOWN_TTL_MS = Number(process.env.OV_DOWN_TTL_MS || 60_000);
// HALF-OPEN: the first call after the window is a PROBE on a short leash (6 s, not 20 s) — a tier still hanging
// costs a run at most six seconds a minute, a tier answering 500 costs nothing measurable, a healthy answer
// closes the circuit on the spot.
const PROBE_MS = Number(process.env.OV_PROBE_MS || 6000);
// A RUN IS A FRESH PROCESS, so the circuit is inherited from the marker: a run that starts while the server's
// probe (or the previous run) found the tier down 40 s ago skips it outright, and one that starts after the
// window probes on the short leash — never the 20 s wait a process with no memory would pay (measured live
// 2026-09-08: a hanging api.openverse.org cost a fresh process 20,013 ms before the first trip).
const _seed = () => {
  try {
    const s = JSON.parse(readFileSync(STATUS_FILE, "utf8"));
    if (s && s.at && Date.now() - Date.parse(s.at) < 10 * 60_000) return { ok: s.ok ?? null, at: s.at, status: s.status ?? null, why: s.why ?? null, down_since: s.down_since ?? null };
  } catch { /* no marker, or an unreadable one → no memory */ }
  return { ok: null, at: null, status: null, why: null, down_since: null };
};
let _state = _seed();
let _lastWrite = 0;
const _persist = (force) => {
  if (!force && Date.now() - _lastWrite < 60_000) return;   // a healthy tier is re-stamped at most once a minute
  try { mkdirSync(dirname(STATUS_FILE), { recursive: true }); writeFileSync(STATUS_FILE, JSON.stringify(_state)); _lastWrite = Date.now(); } catch { /* the marker is a courtesy to /health, never a failure */ }
};
/** The free tier's last observed state; `skipped` is true while the circuit holds calls back. */
export const libraryStatus = () => ({ ..._state, skipped: _state.ok === false && !!_state.at && Date.now() - Date.parse(_state.at) < DOWN_TTL_MS });
export const libraryDown = () => libraryStatus().skipped;
const markDown = (status, why) => {
  const first = _state.ok !== false;
  const clean = String(why || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 120);   // an HTML error page is not a reason
  _state = { ok: false, at: new Date().toISOString(), status: status ?? null, why: clean, down_since: first ? new Date().toISOString() : _state.down_since };
  _persist(true);
  if (first) console.log(`  ⛔ library UNAVAILABLE (${status ?? "network"}: ${_state.why}) — free tier skipped for ${Math.round(DOWN_TTL_MS / 1000)} s (then re-probed on a ${Math.round(PROBE_MS / 1000)} s leash); the paid tiers carry the hunt`);
};
const markUp = () => {
  const was = _state.ok === false;
  _state = { ok: true, at: new Date().toISOString(), status: 200, why: null, down_since: null };
  _persist(was);
  if (was) console.log(`  ✓ the free library is back — the free tier resumes`);
};

const _plain = (body) => String(body || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160);   // an HTML error page is not a reason

async function creds(tmo = 15000) {
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
    signal: AbortSignal.timeout(tmo),   // a hanging register endpoint is an outage, never an open wait
  });
  if (!res.ok) { const err = new Error(`library register ${res.status}: ${_plain(await res.text())}`); err.status = res.status; throw err; }
  const c = await res.json();
  mkdirSync(CFG, { recursive: true });
  writeFileSync(CREDS, JSON.stringify(c, null, 2));
  return c;
}

let _token;
async function token(force = false, tmo = 15000) {
  if (_token && !force) return _token;
  const c = await creds(tmo);
  const body = new URLSearchParams({ grant_type: "client_credentials", client_id: c.client_id, client_secret: c.client_secret });
  const res = await fetch(`${API}/auth_tokens/token/`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": UA }, body, signal: AbortSignal.timeout(tmo) });   // the token endpoint had NO timeout — a black hole held a run open
  if (!res.ok) { const err = new Error(`library token ${res.status}: ${_plain(await res.text())}`); err.status = res.status; throw err; }
  _token = (await res.json()).access_token;
  return _token;
}

/** Search the free library for `query`; return up to `n` real photo results. Refreshes token once on 401/403. */
export async function libraryImages(query, n = 40) {
  // owner 2026-08-13: a clause is not an identification — refuse before the engine (free here, but a
  // clause matches nothing anywhere; the loud refusal points at the producer). Mirrors scrape.mjs's guard.
  const _q = String(query || "").trim();
  if (!_q || /,\s*(?:where|who|which|while|as|returning|and then)\b/i.test(_q) || _q.split(/\s+/).length > 14) {
    console.log(`  [GUARD] query is a CLAUSE, not an identification — REFUSED before the free library ("${_q.slice(0, 70)}…"); fix the producer.`);
    return [];
  }
  // OWNER 2026-08-13 (verified tier confirmed live): "we dont need a min scrapes when it comes to the free library"
  // — rows here are FREE and unmetered (no addApify; 100/min · 10k/day), so the ASK is liberal regardless of
  // how few the caller wants: a wide free pool costs nothing, and the paid meter — VLM JUDGING — is bounded
  // downstream by the shortlist + early-stop, which this deliberately does not touch.
  // OWNER 2026-08-13: the free library never receives the paid engines' APPENDAGES — "iphone footage" and the
  // "footage" bias are web/scoped levers; on the free library they narrow a metadata search that thrives on bare
  // nouns. Strip trailing bias tokens at this choke point so every caller is covered.
  // ⭐⭐ IT APPLIES TO EVERYTHING ON LIBRARY (owner 2026-09-22: "it applies to everything on the free library"). This choke point stripped only a trailing
  // "footage" / "video", so job bebe5716's "Little Caesars interior footage" reached the free library as "Little Caesars interior" — the chain
  // appendage kept — and three callers reach this client with no other shaping at all (the ride-seat ladder, a peopled broadcast's lead, a
  // direct "library" request). The compiler's own free-source rule is applied here instead: every paid appendage and a trailing "interior"
  // go, whoever called, and the query actually sent is logged whenever it differs from the one handed in.
  const _clean = shapeForSource(_q, "library") || _q;
  if (_clean !== _q) console.log(`  [library] asked the bare place: "${_q}" → "${_clean}"`);
  const ask = Math.min(Math.max(n, Number(process.env.OV_FREE_N || 40)), 100);
  const url = `${API}/images/?q=${encodeURIComponent(_clean)}&page_size=${ask}&mature=false`;
  const probing = _state.ok === false;   // the window has passed but the last word was "down" → half-open probe on the short leash
  const tmo = probing ? PROBE_MS : 20000;
  const get = async (tok) => fetch(url, { headers: { "User-Agent": UA, Accept: "application/json", ...(tok ? { Authorization: `Bearer ${tok}` } : {}) }, signal: AbortSignal.timeout(tmo) });
  if (libraryDown()) { console.log(`  [library] skipped — down since ${_state.down_since} (${_state.status ?? "network"}: ${_state.why}); the paid tiers carry this call`); return []; }
  try {
    let tok = await token(false, tmo);
    let res = await get(tok);
    if (res.status === 401 || res.status === 403) res = await get(await token(true, tmo));
    if (!res.ok) {
      // the SERVICE failed (5xx / rate limit / auth a refresh did not cure) → outage; any other 4xx is our query
      if (res.status >= 500 || res.status === 429 || res.status === 401 || res.status === 403) { markDown(res.status, `HTTP ${res.status} on /images`); return []; }
      console.log(`  library ${res.status}`); return [];
    }
    const json = await res.json();
    const seen = new Set(), out = [];
    for (const r of json?.results ?? []) {
      if (r.url && /^https?:\/\//.test(r.url) && !seen.has(r.url)) {
        seen.add(r.url);
        out.push({ imageUrl: r.url, sourceUrl: r.foreign_landing_url || "", title: r.title || "", provider: r.source || "" });
        if (out.length >= ask) break;   // return the full FREE pool — downstream caps (ladder want, shortlist, judge stop) do the trimming; the spares absorb URL-dedupe and download deaths
      }
    }
    markUp();
    return out;
  } catch (e) { markDown(e?.status ?? null, e.message); return []; }   // network, timeout, token/register endpoint → an outage, never a content miss
}

// CLI: [LIBRARY_EMAIL=you@x] node library.mjs "<query>" [n]
if (process.argv[1] && process.argv[1].endsWith("library.mjs")) {
  const [q, nArg] = process.argv.slice(2);
  const rows = await libraryImages(q || "raccoon campsite", Number(nArg) || 15);
  console.log(rows.length ? `${rows.length} results for "${q}":` : `NO results for "${q}"`);
  for (const r of rows) console.log(`  ${(r.title || "").slice(0, 40).padEnd(40)} [${r.provider}] ${(r.imageUrl || "").replace(/^https?:\/\//, "").split("/")[0]}`);
}
