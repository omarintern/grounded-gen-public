// 🔒 CONFORMS TO GROUNDED_GEN_WORKFLOW.md — real_entity (kind:real_entity) figure-ref sourcer.
// A named, SPECIFIC real NON-person entity (Punch the macaque, a real landmark) is GROUNDED with a real
// character-ref that carries its IDENTITY, then DE-NAMED by description in the prompt (the video model
// can't resolve the niche name). UNGATED: NO face blur, NO distance, NO lens — unlike the celeb path.
// Unlike _source_scene.mjs this optimizes IDENTITY LEGIBILITY, not candor/stage: pick the CLEAREST real
// photo that shows the entity + its signature. No iphone bias, no usable_stage gate, no crop, no blur.
//   node _source_entity.mjs "<entity search query>" <slug> "<what the photo must show>"
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { providerJson, textPart, imagePart } from "./provider-llm.mjs";
import { scrapeImages } from "./scrape.mjs";
import { fetchImage, isPaidStock } from "./_placeholder_card.mjs";
import { cacheRead, cacheWrite, characterKey, figureKey, slugify } from "./_ref_cache.mjs";   // shared subject-ref cache: read-before-scrape / write-provisional-then-promote. REF_CACHE=0 disables both halves.
const dlFails = new Map();   // reason -> count, reported after the download loop so failures are never silent

const OUTDIR = join(process.cwd(), "out", "_aspect");
mkdirSync(OUTDIR, { recursive: true });

const [query, slug = "entity", shows = query] = process.argv.slice(2);
if (!query) { console.error('usage: node _source_entity.mjs "<query>" <slug> "<what it must show>"'); process.exit(1); }
// MODE: "real" (default) = a real_entity (viral animal/object) → source a REAL PHOTO (drop illustrations as AI).
// "ip" = a fictional CHARACTER (e.g. a meme rabbit) → the ref SHOULD be an illustration / cartoon / official
// render, so KEEP illustrations and judge "shows the character" instead of "real_photo". Set via ENTITY_MODE.
const MODE = (process.env.ENTITY_MODE || "real").toLowerCase();

const AI = ["clipart", "vector", "illustration", "cartoon", "drawing", "vecteezy", "ai-generated", "ai generated", "aiart", "3d render", "cgi", "artstation", "deviantart"];
const host = (u) => (u || "").replace(/^https?:\/\//, "").split("/")[0];
const isPaid = (u) => isPaidStock(u);   // shared base list; entity refs need no extras (see _celeb_ref for the character-ref extras)
const isAI = (it) => { const s = JSON.stringify(it).toLowerCase(); return AI.some((d) => s.includes(d)); };

// Scrape via the dispatcher's IDENTITY route. ⚠ THIS PATH TAKES NONE OF THE SCENE DEFAULTS, because they are
// tuned for the opposite job: they optimise CANDOUR, and this sourcer optimises LEGIBILITY — the clearest
// photograph of ONE named entity, showing the signature that identifies it. The named route encodes both
// consequences, so no caller has to remember them: general indexes only (amateur-upload corpora hold ordinary
// places in quantity and a named entity essentially never, so they are not even worth backfilling from), and
// the query goes exactly as written (a candour suffix pulls for DEGRADED captures of the very thing that has
// to be seen clearly — this file's own rule, stated at the top, is "No iphone bias").
// Named rather than assembled from flags, so a future retune of the SCENE routing cannot silently reach in here.
async function scrape(q, n = 24) {
  return await scrapeImages(q, n, "identity");
}
// ⚠ USES THE SHARED HARDENED FETCH. This was a bare fetch() with no UA/Referer, no content-type gate and no
// placeholder-card rejection - so publisher hosts 403'd it (measured 75% vs 95% success with headers), HTML
// error pages were written to disk with a .jpg name, and reddit hotlink-block cards reached the identity judge
// as though they were photographs of the entity. Verified live on this path: an identity scrape returned 5
// frames of which 3 were permission cards.
async function dl(url, path) {
  const r = await fetchImage(url, { minBytes: 8000 });
  if (r.reason) { dlFails.set(r.reason, (dlFails.get(r.reason) || 0) + 1); return null; }
  writeFileSync(path, r.buf); return r.buf.length;
}

console.log(`\n─── entity search "${query}" ───`);
// ── REF CACHE KEY — the CALLER owns slug stability: ENTITY_ID_SLUG = slugify(canonical_name), threaded from the
// resolver so three phrasings of one subject file as ONE key. Falls back to a non-run-label slug, then the query
// (worse but never wrong on a probe miss — a missed hit costs money, a wrong merge corrupts a gen). ──
const idSlug = process.env.ENTITY_ID_SLUG || (slug && !/^(entity|t\d+|scene|test)$/i.test(slug) ? slug : slugify(query));
const cacheKey = MODE === "ip" ? characterKey(idSlug) : figureKey(idSlug, process.env.ENTITY_ERA || "current");
// ── REF CACHE (read) — a proven ref for this identity means NO scrape, NO judge, NO spend. cacheRead ranks
// delivered-first; rotate among the top few so repeated gens of one subject don't all reuse the SAME frame. ──
const hits = process.env.REF_CACHE_NO_READ === "1" ? [] : cacheRead(cacheKey, { minDepth: 1 });
if (hits.length) {
  const best = hits[Math.floor(Math.random() * Math.min(hits.length, 4))];
  const out = join(OUTDIR, `entity_${slug}.jpg`);
  await sharp(best.path).jpeg({ quality: 92 }).toFile(out);
  console.log(`  [ref-cache] HIT ${cacheKey} (depth ${hits.length}) → reuse ${best.path.split("/").pop()} → ${out} — NO scrape / judge / spend`);
  process.exit(0);
}
// ── SPEND CAP — figure-refs were the one sourcing stage OUTSIDE it ──────────────────────────────────
// wouldExceed() was consulted only by _adaptive_source, which drives the WORLD ref. This path runs after it,
// once per figure, and nothing bounded it: a scrape plus up to 12 identity judges, times however many figures
// the plan named. Reserving for that instead of capping it cost two thirds of the 6s margin.
// ⚠ EXIT 0 WITH NO FILE, NOT AN ERROR. _run.mjs's step() dies on any non-zero status, and a figure-ref is not
// load-bearing the way the world-ref is — the caller already guards with existsSync() and the doctrine already
// carries non-performing figures by PROSE ALONE. So the degradation is: no figure ref, the figure is prompted,
// the gen still ships ref-grounded on its world plate. Aborting the whole run to save $… would be the
// pay-the-ceiling-deliver-nothing failure in miniature.
const ENTITY_RESERVE = Number(process.env.ENTITY_COST_USD || 0.25);   // web rows + a full 12-judge pass, rounded up
const ENTITY_CAP = Number(process.env.SPEND_CAP_USD || 0);
if (ENTITY_CAP > 0) {
  const { wouldExceed, report } = await import("./_spend.mjs");
  if (wouldExceed(ENTITY_CAP, ENTITY_RESERVE)) {
    console.log(`  ✗ spend cap $${ENTITY_CAP} reached — SKIPPING this figure-ref (${report()})`);
    console.log(`    the figure will be carried by prose; the gen keeps its world plate.`);
    process.exit(0);
  }
}
const raw = await scrape(query);
// ip mode KEEPS illustrations/cartoons/renders (they ARE the character ref); real mode drops them. Both drop PAID stock.
const clean = raw.filter((it) => (MODE === "ip" || !isAI(it)) && !isPaid(it.imageUrl));
console.log(`  scraped ${raw.length} → ${clean.length} clean${MODE === "ip" ? " (ip: illustrations kept)" : ""}`);
const cands = [];
for (const [i, it] of clean.entries()) {
  const p = join(OUTDIR, `${slug}_e${i}.jpg`);
  if (!(await dl(it.imageUrl, p))) continue;
  let meta; try { meta = await sharp(p).metadata(); } catch { continue; }
  const W = meta.width ?? 0, H = meta.height ?? 0;
  if (Math.min(W, H) < 300) continue;
  cands.push({ p, host: host(it.imageUrl), px: W * H, W, H });
}
// ⚠ REPORT DOWNLOAD FAILURES. A thin entity pool and a BLOCKED entity pool look identical downstream - both
// arrive as "few candidates" - and the second is a fetch problem wearing a content problem's clothes.
if (dlFails.size) console.log(`  ⚠ ${[...dlFails.values()].reduce((a, b) => a + b, 0)} download(s) rejected: ${[...dlFails].map(([k, v]) => `${k}×${v}`).join(" ")}`);
if (!cands.length) { console.log(`✗ no clean photo for "${query}"`); process.exit(2); }

async function judge(fp) {
  try {
    const b64 = readFileSync(fp).toString("base64");
    const prompt = MODE === "ip"
      ? `Return ONLY JSON {"shows_character":bool,"real_photo":bool,"has_brand_or_watermark":bool,"has_editorial_caption":bool,"legible":0..1}. shows_character = the image clearly depicts THIS character: ${shows}. An illustration / cartoon / drawing is ALLOWED (some characters exist only as art) but it is NOT preferred — see real_photo. real_photo = an actual PHOTOGRAPH of something physically in the world: a person in costume, a figurine, a statue, a parade float, a shop display. FALSE for vector art, clipart, cartoon, digital illustration, drawing, 3D render, or a flat graphic sitting on a plain flat background. has_brand_or_watermark = TRUE if ANY of: (a) COMMERCIAL BRAND or product branding appears on or around the figure — a soft-drink or retailer logo, packaging, advertising copy, a promotional sign (a Coca-Cola Santa standee is the canonical example: the pose is fine, the branding makes it UNUSABLE); (b) a STOCK-LIBRARY preview mark or house style — Vecteezy, Shutterstock, PIXTA, Getty, Alamy, iStock, Dreamstime, imgbin, 123RF; (c) a PHOTOGRAPHER'S signature or credit line burned into the frame. Judge marks ON THE IMAGE, not the subject's own clothing. has_editorial_caption = a meme caption or added headline TEXT is overlaid on it. legible = how CLEARLY and RECOGNIZABLY the character + its signature look reads — sharp, unambiguous, the whole figure visible (1.0) vs tiny / cropped / occluded / ambiguous (0.0).`
      : `Return ONLY JSON {"real_photo":bool,"shows_subject":bool,"has_text_or_watermark_or_logo":bool,"legible":0..1}. real_photo = an actual photograph (NOT a cartoon/illustration/collage/graphic/meme-with-caption). shows_subject = the image clearly shows: ${shows}. has_text_or_watermark_or_logo = ANY overlaid caption, channel name, timestamp, watermark, or logo. legible = how CLEARLY and RECOGNIZABLY the subject reads — sharp, well-lit, the identity + its signature plainly visible (1.0) vs blurry/tiny/occluded/ambiguous (0.0).`;
    return await providerJson([textPart(prompt), imagePart("image/jpeg", b64)], { maxTokens: 200, temperature: 0.1 });
  } catch { return null; }
}

const LEGIBLE_FLOOR = 0.6; // a figure ref must READ as the entity — clearer floor than a scene ref
console.log(`\n─── identity-legibility check (${Math.min(cands.length, 12)})${MODE === "ip" ? " [ip: character, illustrations ok]" : ""} ───`);
const ok = [];
for (const c of cands.slice(0, 12)) {
  const j = await judge(c.p);
  const legible = Number(j?.legible);
  const lg = Number.isFinite(legible) ? legible : 0;
  const pass = MODE === "ip"
    ? (j && j.shows_character && !j.has_brand_or_watermark && lg >= LEGIBLE_FLOOR)       // ip: character + reads clearly + NO brand/stock mark (caption only demotes)
    : (j && j.real_photo && j.shows_subject && !j.has_text_or_watermark_or_logo && lg >= LEGIBLE_FLOOR);
  const info = j ? (MODE === "ip" ? `char=${j.shows_character} photo=${j.real_photo} brand=${j.has_brand_or_watermark} caption=${j.has_editorial_caption} legible=${lg.toFixed(2)}` : `real=${j.real_photo} subj=${j.shows_subject} text=${j.has_text_or_watermark_or_logo} legible=${lg.toFixed(2)}`) : "judge-failed";
  console.log(`  ${c.p.split("/").pop()} @${c.host} (${c.W}x${c.H}): ${info} ${pass ? "✓" : "✗"}`);
  if (pass) ok.push({ ...c, legible: lg, caption: MODE === "ip" ? !!j.has_editorial_caption : false, photo: MODE === "ip" ? !!j.real_photo : true });
}

// ── REF CACHE (write) ───────────────────────────────────────────────────────────────────────────────
// This path is the CHEAPEST of the three to cache and the most valuable, for a reason that is structural
// rather than incidental: a fictional character's canonical look is FIXED. Mario is Mario permanently, so a
// character ref never expires and one scrape retires that character's sourcing cost forever. A named real
// entity ages and so files under the figure keyspace, which carries an era.
// Same free-fill economics as the scene path: `ok` holds every legible candidate and all but one is about to
// be discarded, already scraped and already judged.
// ⚠ THE CALLER OWNS SLUG STABILITY. The key is the slug, so two runs of the same character MUST pass the same
// slug or they will file as two characters and neither will reach rotation depth. A run-label slug ("t1") is
// unusable as a key, so a generic one falls back to the query — worse, but never wrong.
try {
  // Provisional write (delivered:false) under the SAME key the read uses above; the caller promotes on ship.
  const stored = cacheWrite(cacheKey, ok, { kind: MODE === "ip" ? "character" : "figure", query, job: process.env.LEDGER_JOB });
  if (ok.length) console.log(`  [ref-cache] +${stored} new provisional ref(s) under ${cacheKey} from ${ok.length} passer(s)`);
} catch (e) { console.log(`  [ref-cache] write skipped: ${String(e?.message || e).slice(0, 80)}`); }

// Best = (ip) a PHOTOGRAPH first, then caption-free, then most legible; resolution breaks ties.
//
// ⚠ PHOTO-FIRST, NOT PHOTO-ONLY (2026-07-30). The old ip ranking sorted on legibility alone, and stock clipart
// is MAXIMALLY legible by construction — flat, centred, unoccluded — so a 1960x1960 Vecteezy vector scored 1.00
// and would have beaten a real Wikimedia photograph at 0.90. Feeding flat vector art to r2v as a character ref
// fights the whole moat: the register we want is degraded photographic footage, and a cartoon ref drags the
// render toward cartoon. Measured on the santa pool: 8 of 10 candidates passed, 6 of them clipart or stock.
//
// This stays PREFERENCE rather than a gate because some characters genuinely exist ONLY as art (a meme rabbit
// has no photograph). Sorting rather than rejecting is self-adapting: a figure people actually photograph —
// Santa, in costume, in parades, in every shopping centre on earth — yields photos and takes them; a drawn-only
// character yields none and keeps its illustration. No extra classification call needed; the pool decides.
let pick;
if (ok.length) {
  ok.sort((a, b) => (MODE === "ip" ? (a.photo === b.photo ? 0 : a.photo ? -1 : 1) : 0)
    || (MODE === "ip" ? (a.caption === b.caption ? 0 : a.caption ? 1 : -1) : 0) || b.legible - a.legible || b.px - a.px);
  pick = ok[0]; console.log(`  → pick: ${pick.p.split("/").pop()} (${MODE === "ip" ? (pick.photo ? "PHOTO, " : "illustration (no photo in pool), ") : ""}legible=${pick.legible.toFixed(2)}${MODE === "ip" && pick.caption ? ", has caption" : ""})`);
} else { cands.sort((a, b) => b.px - a.px); pick = cands[0]; console.log(`  ⚠ none passed — highest-res fallback`); }

// NO blur (ungated real_entity), NO crop — native aspect, clean jpeg.
const out = join(OUTDIR, `entity_${slug}.jpg`);
await sharp(pick.p).jpeg({ quality: 92 }).toFile(out);
console.log(`\n✓ picked ${pick.host} (${pick.W}x${pick.H}, un-blurred, native aspect) → ${out}`);
