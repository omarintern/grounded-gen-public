// ═══ THE SEAT HUNT — POOL → CLEAN → ONE LOOK EACH → RANK THE WHOLE POOL → THE BEST (owner 2026-09-09) ═══════════════════════
// Frame zero of a travelling form is a real photograph taken from the rider's own seat. The old hunt lived inside the general
// scene sourcer as a branch of branches (APPARATUS_HUNT, two looks, a standing rule, a dark-ride relaxation) and anchored the FIRST
// frame that passed — so a press photo beside the car rode as frame zero while better frames sat unjudged behind it. This hunt is
// the seat's own: the ride decision (RIDE in env) gives the two queries and the engine ladder; the pool is scraped by the shared
// route (scrape.mjs walks SEAT_LADDER for a dark ride, the form route otherwise); every clean candidate gets ONE look
// (_judge_seat); the whole pool is ranked and the best aboard frame is served, with its reading — the way, the vehicle, the
// environment — written beside it for the writer, whose words come from the plate (form and content awareness).
//   node _ride_seat.mjs <slug> [aspect]     → out/_aspect/world_<slug>.jpg + world_<slug>.pick.json (+ seen sidecar, contact sheet)
//   exit 0 served · 2 no seat in the pool · 4 budget cap · 5 infrastructure (never a verdict on the pool)
import "./_meter_boot.mjs";   // the ledger rides EVERY orchestration
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { lineagePlate } from "./_plate_skip.mjs";
import { scrapeImages, IndexInfraError } from "./scrape.mjs";
import { withSlot } from "./_provider_gate.mjs";
import { isPlaceholderCard, isPaidStock } from "./_placeholder_card.mjs";
import { writeContactSheet, sheetLegend } from "./_contact_sheet.mjs";
import { judgeSeat, seatVerdict, rankSeats, seatLabel, diffuseSeat, SEAT_BAND } from "./_judge_seat.mjs";
const SEAT_BAND_LOG = SEAT_BAND;
import { rideFromEnv, craftVehicle } from "./_ride.mjs";
import { spent } from "./_spend.mjs";   // the hunt negotiates its own budget, exactly as the adaptive sourcer does

const onFatal = (e) => {
  if (e?.ledgerCap) { console.error(`\n✗ BUDGET CAP — ${e.message}`); process.exit(4); }
  if (e?.name === "IndexInfraError" || e instanceof IndexInfraError) { console.error(`\n✗ INDEX INFRA FAILURE — ${e.message}\n  (not a content miss: the query is NOT at fault)`); process.exit(5); }
  if (e?.name === "ProviderInfraError") { console.error(`\n✗ PROVIDER INFRA FAILURE — ${e.message}\n  (the frames were never judged: make NO claim about the pool)`); process.exit(5); }
  console.error(e); process.exit(1);
};
process.on("uncaughtException", onFatal);
process.on("unhandledRejection", onFatal);

const HERE = dirname(fileURLToPath(import.meta.url));
const OUTDIR = join(process.cwd(), "out", "_aspect");
mkdirSync(OUTDIR, { recursive: true });
const [slug = "seat"] = process.argv.slice(2);
const D = rideFromEnv();
if (!D) { console.error("✗ _ride_seat: no ride decision in env (RIDE) — the run decides the ride before it hunts the seat"); process.exit(1); }
const QUERIES = (Array.isArray(D.seat?.queries) ? D.seat.queries : []).map((q) => String(q || "").trim()).filter(Boolean);
if (!QUERIES.length) { console.error("✗ _ride_seat: the decision carries no seat queries"); process.exit(1); }
process.env.APPARATUS_HUNT = "1";                                                     // scrape.mjs: the seat's own route
process.env.SEAT_LADDER = (Array.isArray(D.seat?.ladder) ? D.seat.ladder : []).join(",");
const SCRAPE_N = Number(process.env.SCRAPE_N || 24), OVERASK = Number(process.env.SCRAPE_OVERASK ?? 1.7);
const JUDGE_BUDGET = Number(process.env.JUDGE_BUDGET ?? 24);
const ENOUGH = Number(process.env.SEAT_ENOUGH ?? 5);       // aboard frames WITH the vehicle in view: enough to rank among, stop spending
const SECOND_AT = Number(process.env.SEAT_SECOND_AT ?? 3); // fewer aboard frames than this after the first query → the second query joins the pool
const MIN_SIDE = Number(process.env.SEAT_MIN_SIDE ?? 400);
const DL_PAR = Math.max(1, Number(process.env.DL_PAR || 6)), JUDGE_PAR = Math.max(1, Number(process.env.SEAT_JUDGE_PAR || 4));
const VIEW_PX = Number(process.env.SEAT_VIEW_PX ?? 768);
const CROP_MAX = 0.22;   // the largest edge band a caption or title may cost

// a cold start: this hunt's own candidates and sidecars from an earlier attempt are never a pool (audit 2026-09-06)
for (const f of readdirSync(OUTDIR)) {
  if ((f.startsWith(`${slug}_c`) && /\.jpg$/.test(f)) || f === `world_${slug}.seen.json` || f === `world_${slug}.pick.json` || f === `sheet_${slug}.jpg` || f === `world_${slug}.diag.json`) { try { rmSync(join(OUTDIR, f), { force: true }); } catch {} }
}
const AI_WORDS = ["clipart", "vector", "illustration", "cartoon", "drawing", "vecteezy", "magnific", "ai-generated", "ai generated", "aiart", "ai art", "digital art", "3d render", "cgi", "artstation", "deviantart"];
const isAI = (it) => { const s = JSON.stringify(it).toLowerCase(); return AI_WORDS.some((d) => s.includes(d)); };
const hostOf = (u) => { try { return new URL(u).hostname; } catch { return String(u || "").replace(/^https?:\/\//, "").split("/")[0]; } };
const UA = "grounded-gen/1.0";
const dlFails = new Map();
const miss = (k) => { dlFails.set(k, (dlFails.get(k) || 0) + 1); return null; };
async function dl(url, path, sourceUrl = "") {
  try {
    let ref = sourceUrl; if (!ref) { try { ref = new URL(url).origin + "/"; } catch { ref = ""; } }
    const r = await fetch(url, { signal: AbortSignal.timeout(15000), headers: { "User-Agent": UA, Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8", "Accept-Language": "en-US,en;q=0.9", ...(ref ? { Referer: ref } : {}) } });
    if (!r.ok) return miss(String(r.status));
    if (!(r.headers.get("content-type") || "").split(";")[0].trim().startsWith("image/")) return miss("not-image");
    const b = Buffer.from(await r.arrayBuffer());
    if (b.length < 8000) return miss("tiny");
    if (await isPlaceholderCard(b)) return miss("placeholder-card");
    let meta; try { meta = await sharp(b).metadata(); } catch { return miss("unreadable"); }
    const W = Number(meta.width) || 0, H = Number(meta.height) || 0;
    if (Math.min(W, H) < MIN_SIDE) return miss(`small<${MIN_SIDE}`);
    try { const st = await sharp(b).stats(); if (st.channels.length && st.channels.every((c) => c.mean < 16 && c.stdev < 10)) return miss("near-black"); } catch {}
    if (await lineagePlate(b)) return miss("lineage-plate");   // the parent's seat plate, never served twice (WORLD_SKIP)
    writeFileSync(path, b); return { W, H };
  } catch { return miss("net"); }
}

let nextId = 0;
async function collect(query, ri) {
  console.log(`\n─── seat query ${ri} "${query}" ───`);
  // ⚠ THE SEAT HUNT NEGOTIATES ITS BUDGET LIKE EVERY OTHER HUNT (2026-09-18, job 4a60a30b). scrape.mjs shrinks the scoped search's
  // tries, and stands the paid tier down entirely, from SCRAPE_USD_LEFT; that variable was set only by the adaptive
  // sourcer, so this hunt read Infinity and rode three FULL paid tries on one query, $… of a $… cap, for 0
  // conforming rows apiece. Set per query, not once, because the figure moves as the hunt spends. Guarded inline and
  // failing to "Infinity" exactly as the sourcer does: no cap set or spend unreadable means no signal, NEVER "0.00",
  // which would silence the paid tier altogether.
  process.env.SCRAPE_USD_LEFT = (() => { try { const cap = Number(process.env.SPEND_CAP_USD || 0); if (!(cap > 0)) return "Infinity"; return Math.max(0, cap - (Number(spent().total) || 0)).toFixed(2); } catch { return "Infinity"; } })();
  let raw = [];
  try { raw = await scrapeImages(query, Math.ceil(SCRAPE_N * OVERASK)); }
  catch (e) { if (e?.ledgerCap) throw e; if (e instanceof IndexInfraError || e?.name === "IndexInfraError") { console.log(`  ✗ the route is unavailable (${String(e.message).slice(0, 80)})`); throw e; } console.log(`  ✗ scrape failed (${String(e?.message || e).slice(0, 80)})`); return []; }
  // ⭐⭐ ONE PICTURE, ONE READING (2026-09-18, job 6442a7c6). The two seat queries of that run returned the same techeblog frame, and
  // nothing deduped across them: it was downloaded twice, judged twice, and came back "own boat under the camera · water channel receding"
  // the first time and "own kart under the camera · road receding" the second. Both entered the pool, so the diffuser counted two copies
  // of one photograph as two of its "3 equally good seats", served the copy carrying the wrong reading, and the run took a kart's words
  // into the writer and into a location hunt it did not need. A judge call is money; a contradiction is worse.
  const fresh = raw.filter((it) => it?.imageUrl && !seenUrls.has(it.imageUrl));
  const dup = raw.filter((it) => it?.imageUrl && seenUrls.has(it.imageUrl)).length;
  const clean = fresh.filter((it) => !isAI(it) && !isPaidStock(it.imageUrl));
  for (const it of clean) seenUrls.add(it.imageUrl);
  console.log(`  scraped ${raw.length} → ${clean.length} clean (dropped ${raw.length - clean.length - dup} stock/AI${dup ? `, ${dup} already judged this run` : ""})`);
  dlFails.clear();
  const cands = [];
  for (let base = 0; base < clean.length && cands.length < SCRAPE_N; base += DL_PAR) {
    const chunk = clean.slice(base, base + DL_PAR);
    const got = await Promise.all(chunk.map(async (it) => {
      const id = nextId++, p = join(OUTDIR, `${slug}_c${id}.jpg`);
      const ok = await dl(it.imageUrl, p, it.sourceUrl || it.pageUrl || "");
      return ok ? { p, url: it.imageUrl, host: hostOf(it.imageUrl), engine: it.engine || "route", q: query, ri, W: ok.W, H: ok.H } : null;
    }));
    for (const c of got) if (c && cands.length < SCRAPE_N) cands.push(c);
  }
  if (dlFails.size) console.log(`  downloads lost: ${[...dlFails.entries()].map(([k, v]) => `${k}×${v}`).join(" · ")}`);
  console.log(`  ${cands.length} candidate(s) on disk`);
  return cands;
}

// ⭐⭐ THE MAKER'S OWN HULL, IN THE JUDGE'S WORD (2026-09-18, job 6442a7c6): the ranking prefers it and refuses another kind outright.
const WANT_VEHICLE = craftVehicle(D.craft || D.noun || "");
if (WANT_VEHICLE) console.log(`  ◈ the maker's own craft is a ${D.craft || D.noun} — a frame whose vehicle reads "${WANT_VEHICLE}" outranks one of another kind, which is no seat for this request at all`);
const RANKOPTS = { family: D.family, vehicle: WANT_VEHICLE };
const JOPTS = { noun: D.noun, kind: D.kind, family: D.family, viewPx: VIEW_PX, setting: D.kind !== "ridden" ? String(D.world?.words || "") : "" };   // a worn or driven frame is judged against the setting too (2026-09-14)
let judgeCalls = 0;
const recs = [];
const seenUrls = new Set();   // every image this hunt has already bought, across all its queries (2026-09-18)
const withVehicle = () => recs.filter((r) => r.aboard && r.j?.own_part === true).length;
async function judgeAll(cands) {
  for (let base = 0; base < cands.length; base += JUDGE_PAR) {
    if (judgeCalls >= JUDGE_BUDGET) { console.log(`  (judge budget ${JUDGE_BUDGET} spent — the rest of the pool is unjudged)`); break; }
    if (withVehicle() >= ENOUGH) { console.log(`  (${withVehicle()} aboard frames with the vehicle in view — enough to rank among; the rest is unjudged)`); break; }
    const chunk = cands.slice(base, Math.min(base + JUDGE_PAR, base + (JUDGE_BUDGET - judgeCalls)));
    const out = await Promise.all(chunk.map((c) => withSlot(async () => { judgeCalls++; const j = await judgeSeat(c.p, JOPTS); return { c, j }; }, "vision")));
    for (const { c, j } of out) {
      const v = j ? seatVerdict(j, { family: D.family }) : { aboard: false, why: "unjudged (unreadable / no opinion)" };
      const rec = { ...c, j, aboard: v.aboard, why: v.why };
      recs.push(rec);
      console.log(`  ${c.p.split("/").pop()} @${c.host} (${c.W}x${c.H}, ${c.engine}) ${seatLabel(rec)}`);
    }
  }
}

console.log(`◉ THE SEAT: a ${D.noun} (${D.kind}, ${D.family}) — queries ${JSON.stringify(QUERIES)}${process.env.SEAT_LADDER ? ` · ladder ${process.env.SEAT_LADDER.replace(/,/g, " → ")}` : " · the form route"}`);
const aboardN = () => recs.filter((r) => r.aboard).length;
// ⚠⚠ A HUNT WITH SOMETHING ON ITS SHELF SETTLES WHEN THE CAP TRIPS; IT NEVER THROWS THE SHELF AWAY (2026-09-18, job
// 4a60a30b). The ledgerCap throw comes out of collect(), and onFatal above is this process's handler for it, so the rank,
// the pick and the serve below were never reached: two judged, aboard, on-disk plates the job had already paid for were
// deleted with the process, _run exited 4 and the user was refunded. The world hunt has settled on its own pool since the
// day it was written (BEST-OF-BUNCH); the seat hunt had no settle path at all. The platform reduces, never refuses.
// ⚠ SCOPED TO A SHELF THAT HOLDS SOMETHING. A cap with nothing aboard is still exit 4: no plate beats a wrong plate, and
// a recovery that always succeeds is a bug report. Every other fault, and every other throw, still belongs to onFatal.
let capSettled = false;
try {
  await judgeAll(await collect(QUERIES[0], 0));
  if (QUERIES[1] && aboardN() < SECOND_AT && judgeCalls < JUDGE_BUDGET) {
    console.log(`  ${aboardN()} aboard after the first query — the second query joins the pool`);
    await judgeAll(await collect(QUERIES[1], 1));
  }
  // THE FALLBACK QUERIES (owner 2026-09-15, the water route: "with fallback queries as well in place"): a decision may carry more than two phrasings; each one past the
  // second is walked only while NOTHING is aboard and the judge budget holds — a boat dark ride's hunt does not die on its first two phrasings.
  for (let qi = 2; qi < QUERIES.length && aboardN() === 0 && judgeCalls < JUDGE_BUDGET; qi++) {
    console.log(`  nothing aboard after ${qi} queries — fallback query ${qi} joins the pool ("${QUERIES[qi]}")`);
    await judgeAll(await collect(QUERIES[qi], qi));
  }
} catch (e) {
  if (!e?.ledgerCap || aboardN() === 0) throw e;   // an empty shelf, or any other fault, is the fatal handler's
  capSettled = true;
  console.log(`  [seat] BUDGET CAP reached with ${aboardN()} judged aboard frame(s) already on the shelf: the hunt stops here and serves the best of them, bought and paid for (the platform reduces, never refuses)`);
}
try { writeFileSync(join(OUTDIR, `world_${slug}.calls.json`), JSON.stringify({ judgeCalls })); } catch {}
const seen = recs.map((r) => ({ p: r.p, host: r.host, url: r.url, engine: r.engine, q: r.q, W: r.W, H: r.H, verdict: r.aboard ? "pass" : "reject", why: r.aboard ? seatLabel(r).replace(/^✓ /, "") : r.why, reading: r.j }));
const ranked = rankSeats(recs, RANKOPTS);
// DIFFUSED SCRAPING (owner 2026-09-10): the seat is served at random among the equally good aboard frames, never the argmax — the same ride
// every run was the rewrite's regression (three Shining gens, one laviezine plate)
const _diff = diffuseSeat(ranked, RANKOPTS);
const pick = _diff.pick || null;
if (pick && _diff.tier.length > 1) console.log(`  ⚄ diffused: ${_diff.tier.length} equally good seat(s) within ${SEAT_BAND_LOG} points of the best — served #${_diff.index + 1} (${pick.p.split("/").pop()} @${pick.host}), the others: ${_diff.tier.filter((r) => r !== pick).map((r) => `${r.p.split("/").pop()} @${r.host}`).join(", ")}`);
if (pick) seen.forEach((s) => { if (s.p === pick.p) s.verdict = "pick"; });
try { writeFileSync(join(OUTDIR, `world_${slug}.seen.json`), JSON.stringify(seen, null, 2)); } catch {}
try {
  const sheet = await writeContactSheet(seen, join(OUTDIR, `sheet_${slug}.jpg`));
  if (sheet) console.log(`\n▣ contact sheet → ${sheet.path} (${Object.entries(sheet.counts).map(([k, v]) => `${k} ${v}`).join(", ")})\n${sheetLegend(seen)}`);
} catch {}
if (!pick) {
  console.log(`\n✗ NO SEAT IN THE POOL — ${recs.length} judged, none aboard (${judgeCalls} look(s))`);
  try { writeFileSync(join(OUTDIR, `world_${slug}.diag.json`), JSON.stringify({ reason: "no seat in the pool", judged: recs.length, calls: judgeCalls, queries: QUERIES }, null, 2)); } catch {}
  process.exit(2);
}
console.log(`\n─── the seat ─── ${ranked.length} aboard of ${recs.length} judged → ${pick.p.split("/").pop()} @${pick.host} (${pick.engine}, "${pick.q}")`);
console.log(`  ${seatLabel(pick)}${pick.j?.why ? `\n  ${String(pick.j.why).slice(0, 160)}` : ""}`);
// a caption, a title or a logo on an EDGE is cropped away, never a reason to lose the one seat frame in the pool (owner 2026-09-06: cropped, not rejected)
let img = sharp(pick.p), cropped = null;
const text = String(pick.j?.text || "none").toLowerCase(), edge = String(pick.j?.text_edge || "none").toLowerCase();
if (!["none", "viewer_chrome", "device_overlay"].includes(text) && ["top", "bottom", "left", "right"].includes(edge)) {
  const band = CROP_MAX;
  const W = pick.W, H = pick.H;
  const region = edge === "top" ? { left: 0, top: Math.round(H * band), width: W, height: H - Math.round(H * band) }
    : edge === "bottom" ? { left: 0, top: 0, width: W, height: H - Math.round(H * band) }
    : edge === "left" ? { left: Math.round(W * band), top: 0, width: W - Math.round(W * band), height: H }
    : { left: 0, top: 0, width: W - Math.round(W * band), height: H };
  if (Math.min(region.width, region.height) >= MIN_SIDE) { img = img.extract(region); cropped = { edge, band }; console.log(`  ✂ ${text} at the ${edge} edge cropped (${Math.round(band * 100)}% band)`); }
}
const out = join(OUTDIR, `world_${slug}.jpg`);
await img.jpeg({ quality: 92 }).toFile(out);
const j = pick.j || {};
writeFileSync(join(OUTDIR, `world_${slug}.pick.json`), JSON.stringify({
  placeOnly: true, needsStandin: false, standin: 0, first_person: true,
  engine: pick.engine, host: pick.host, url: pick.url, query: pick.q, conceded: false, width: pick.W, height: pick.H, cropped,
  reading: { camera_position: j.camera_position ?? null, footing: j.footing ?? null, way_direction: j.way_direction ?? null, fits_setting: j.fits_setting ?? null, riders: j.riders ?? null, vehicle_in_foreground: j.own_part === true, own_part: j.own_part === true, signs: ["walkway_or_footprint_markings", "hazard_stripes", "queue_railing", "people_beside_track", "empty_seats_looked_at", "vehicle_seen_from_outside"].filter((k) => j[k] === true), lighting: j.lighting ?? null, way_recedes: j.way_recedes === true, environment: j.environment ?? null, way: j.way ?? null, vehicle: j.vehicle ?? null, text: j.text ?? null, ai_generated: Number.isFinite(Number(j.ai_generated)) ? Number(j.ai_generated) : null, why: j.why ?? null },
  aboard_look: { camera_position: j.camera_position ?? null, environment: j.environment ?? null, way: j.way ?? null, vehicle: j.vehicle ?? null },
  ranked: ranked.length, judged: recs.length, calls: judgeCalls, settle_cause: capSettled ? "cap" : null,   // the world hunt's own word for the same fact
}, null, 2));
console.log(`✓ seat served → ${out} (${pick.W}x${pick.H}, native aspect)`);
// the candidates that did not serve are swept — the pick and the sidecars stay for the run and for the eye
for (const r of recs) if (r.p !== pick.p) { try { rmSync(r.p, { force: true }); } catch {} }
process.exit(0);
