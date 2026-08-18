// 🔒 CONFORMS TO GROUNDED_GEN_WORKFLOW.md — real_entity (kind:real_entity) figure-ref sourcer.
// A named, SPECIFIC real NON-person entity (Punch the macaque, a real landmark) is GROUNDED with a real
// character-ref that carries its IDENTITY, then DE-NAMED by description in the prompt (the video model
// can't resolve the niche name). UNGATED: NO face blur, NO distance, NO lens — unlike the celeb path.
// Unlike _source_scene.mjs this optimizes IDENTITY LEGIBILITY, not candor/stage: pick the CLEAREST real
// photo that shows the entity + its signature. No iphone bias, no usable_stage gate, no crop, no blur.
//   node _source_entity.mjs "<entity search query>" <slug> "<what the photo must show>"
import "./_meter_boot.mjs";   // ledger rides EVERY orchestration (owner, x26e) — self-boots if _run's bootstrap was bypassed
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { providerJson, textPart, imagePart } from "./provider-llm.mjs";
import { scrapeImages } from "./scrape.mjs";
import { judgeKillshot, killshotFails, safetyOnlyFails, contentFlagFails } from "./_judge_killshot.mjs";   // SHARED minors/content kill-shot — this figure/char-ref sourcer was the ONE ref path that never ran it (the other four do)
import { fetchImage, isPaidStock } from "./_placeholder_card.mjs";
import { cacheRead, cacheWrite, characterKey, figureKey, slugify } from "./_ref_cache.mjs";
import { bgCutout } from "./_plate_sane.mjs";
import { ipRubric } from "./_charref_rubric.mjs";   // the ip class rubric lives in its own module so the cache back-fill judges the EXACT wording that ships — import, never paste   // owner 2026-08-14: char-refs keep their background — flattened cutouts reject   // shared subject-ref cache: read-before-scrape / write-provisional-then-promote. REF_CACHE=0 disables both halves.
const dlFails = new Map();   // reason -> count, reported after the download loop so failures are never silent

const OUTDIR = join(process.cwd(), "out", "_aspect");
mkdirSync(OUTDIR, { recursive: true });

const [query, slug = "entity", shows = query] = process.argv.slice(2);
import { spawnSync } from "node:child_process";   // judge-exhaustion backfill: one self-re-exec on the scoped tier
if (!query) { console.error('usage: node _source_entity.mjs "<query>" <slug> "<what it must show>"'); process.exit(1); }
// MODE: "real" (default) = a real_entity (viral animal/object) → source a REAL PHOTO (drop illustrations as AI).
// "ip" = a fictional CHARACTER (e.g. a meme rabbit) → the ref SHOULD be an illustration / cartoon / official
// render, so KEEP illustrations and judge "shows the character" instead of "real_photo". Set via ENTITY_MODE.
const MODE = (process.env.ENTITY_MODE || "real").toLowerCase();
const ENSEMBLE = process.env.ENTITY_ENSEMBLE === "1";   // gap-4 exemption: the CALLER casts an ensemble (from the plan's cast) — never inferred from the image; absent = single-character law

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
// ── FIGURE-REF ROW BUDGET (owner 2026-08-13, SUPERSEDING the same-day flat 8: "lets max at 12 for characters,
// but can it scrape to 5 then decide if it must go beyond? this acts like a control.") — the raise is forced by
// data: every reconstructable historical pick sat PAST row 5 (b8=7th, b9=10th, b27=8th, mined from rerun logs;
// shallow rows are the reposted/captioned crops the judge rejects), so a flat 8 would have missed or last-rowed
// all three. the web index bills PER ROW ($… + $…/row) and takes NO offset — a literal two-stage scrape re-bills
// rows 1-5 ($… vs $…) — so the SCRAPE is one call at 12 ($…, still 47% under the old 24-row $…)
// and the owner's 5-then-decide control lives at the JUDGE layer below, where extending is free to have skipped.
async function scrape(q, n = Number(process.env.ENTITY_ROWS || 12)) {
  // ENTITY_TRANSPORT: the judge-exhaustion backfill's engine override (owner 2026-08-15) — the QUERY never
  // changes (bare-name law), only the index. Default = the identity route (web-led general indexes).
  return await scrapeImages(q, n, process.env.ENTITY_TRANSPORT || "identity");
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
const ENTITY_RESERVE = Number(process.env.ENTITY_COST_USD || 0.16);   // 12 web rows ($…) + a worst-case 12-judge pass, rounded up (owner 2026-08-13: 12-max with the 5-then-decide judge control; shallow settle spends ~5 judges)
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
  // ── NO CUTOUTS (owner 2026-08-14: "we keep the background on them even though just character is used") —
  // a flattened promo/transparent asset conditions the gen like a STICKER (x2's "immovable character") and
  // sits closest to the canonical owned design (©-pull). Mechanical gate, both modes; a natural dark studio
  // backdrop passes (uniformity-of-fill, not darkness, is the test — Tyson's press black measures 81%, passes).
  const co = await bgCutout(p);
  if (co.cutout) { console.log(`  skip ${host(it.imageUrl)} (CUTOUT: ${co.why} — the character must live IN a scene)`); continue; }
  cands.push({ p, row: i, host: host(it.imageUrl), px: W * H, W, H });   // row = scrape position — pick telemetry for the ENTITY_ROWS budget (8-vs-6 settles on data)
}
// ⚠ REPORT DOWNLOAD FAILURES. A thin entity pool and a BLOCKED entity pool look identical downstream - both
// arrive as "few candidates" - and the second is a fetch problem wearing a content problem's clothes.
if (dlFails.size) console.log(`  ⚠ ${[...dlFails.values()].reduce((a, b) => a + b, 0)} download(s) rejected: ${[...dlFails].map(([k, v]) => `${k}×${v}`).join(" ")}`);
// ENGINE LADDER: web/identity → scoped-reddit (fan layer) → the free library (FREE rows; CC corpora are thin for
// protected characters, but zero-cost is zero-downside — the TERMINAL stage). The QUERY never changes at any
// stage (bare-name law); each stage is one self-re-exec so the entire judged pipeline reuses verbatim.
// ⛔ SCOPED RAW REMOVED FROM THE LADDER (owner 2026-08-15: "we should scrap scoped raw as an option in scrape
// immediately" — superseding the same-day terminal-fallback ruling). The measured record that killed it:
// Garfield raw round = top crust hotlink-blocks (8/12 placeholder cards, 1 junk survivor); Sonic raw rounds =
// wallpaper/pinterest slop, nothing the cleaner tiers hadn't already served. Raw search's head results are
// either unfetchable or junk-class for character work — do not re-add without a new owner ruling.
// ⚠ CALLED FROM EVERY CONTENT-EXHAUSTION EXIT — the empty-pool exit AND the judged-all-rejected exit
// (rebank4 bug: the ladder hooked only the judge branch, so a stage whose pool died at download killed the
// whole chain with exit 2 instead of walking on). Infra errors still throw past this: an outage is not exhaustion.
function escalateEngine(reason) {
  const STAGES = [
    { transport: "scoped", env: {}, label: "scoped-reddit (fan layer)" },
    { transport: "library", env: {}, label: "the free library (CC corpus, free rows — terminal stage)" },
  ];
  const stage = Number(process.env.ENTITY_BACKFILL || 0);
  if (stage >= STAGES.length) return false;   // terminal stage — the caller proceeds to its own honest exit
  const s = STAGES[stage];
  console.log(`  ↯ ${reason} → engine ladder ${stage + 1}/${STAGES.length}: ${s.label} — same bare query (owner 2026-08-15)`);
  const r = spawnSync("node", [process.argv[1], query, slug, shows], { stdio: "inherit", env: { ...process.env, ENTITY_BACKFILL: String(stage + 1), ENTITY_TRANSPORT: s.transport, ...s.env, REF_CACHE_NO_READ: "1" } });
  process.exit(r.status ?? 0);
}
if (!cands.length) { console.log(`✗ no clean pool for "${query}" at this engine`); escalateEngine("EMPTY POOL"); console.log(`✗ no clean photo for "${query}" — ladder exhausted`); process.exit(2); }

async function judge(fp) {
  try {
    const b64 = readFileSync(fp).toString("base64");
    const prompt = MODE === "ip"
      ? ipRubric(shows)
      : `Return ONLY JSON {"real_photo":bool,"shows_subject":bool,"has_text_or_watermark_or_logo":bool,"legible":0..1}. real_photo = an actual photograph (NOT a cartoon/illustration/collage/graphic/meme-with-caption). shows_subject = the image clearly shows: ${shows}. has_text_or_watermark_or_logo = ANY overlaid caption, channel name, timestamp, watermark, or logo. legible = how CLEARLY and RECOGNIZABLY the subject reads — sharp, well-lit, the identity + its signature plainly visible (1.0) vs blurry/tiny/occluded/ambiguous (0.0).`;
    return await providerJson([textPart(prompt), imagePart("image/jpeg", b64)], { maxTokens: 200, temperature: 0.1 });
  } catch { return null; }
}

const LEGIBLE_FLOOR = 0.6; // a figure ref must READ as the entity — clearer floor than a scene ref
console.log(`\n─── identity-legibility check (${Math.min(cands.length, 12)})${MODE === "ip" ? " [ip: character, illustrations ok]" : ""} ───`);
const ok = [];
async function judgeOne(c) {
  // SAFETY KILL-SHOT (shared _judge_killshot) — the one ref path that lacked minors/content gating; its own
  // identity judge asks real_photo / shows_subject / legible and NEVER age or content. shows_minor + content_flag
  // are ABSOLUTE and mode-independent; fails CLOSED (null / infra → drop, so an outage degrades to a prose-carried
  // figure, never ships an unscreened frame). "ip" mode may legitimately be a CARTOON, so gate only on the safety
  // subset there (killshotFails' real_photo/ai would wrongly reject a drawing); "real" mode uses the full
  // killshotFails, matching the four sibling paths. requireSubject:false — a char-ref SHOWS its subject by design.
  let ks; try { ks = await judgeKillshot(c.p, shows); } catch { ks = null; }
  const unsafe = MODE === "ip"
    ? safetyOnlyFails(ks)   // fail-closed on minors AND content — the shared version; a MISSING content_flag key rejects (the old `k.content_flag && …` truthiness let it pass)
    : killshotFails(ks, Number(process.env.AI_CEILING ?? 0.3), { requireSubject: false });
  if (unsafe) {
    // ⚠⚠ NAME THE REASON THAT ACTUALLY DECIDED, NOT WHICHEVER FLAG HAPPENS TO BE SET (app lane, 2026-08-18:
    // "I chased the wrong flag for two runs"). This printed content_flag whenever it was non-"none", so an
    // entire scrape reported "KILL-SHOT ✗ THIRD_PARTY_MEDIA" while the real cause was real_photo !== true.
    // third_party_media has been RETIRED since 2026-08-09 (_judge_killshot:265) — contentFlagFails returns
    // false for it, so it CANNOT reject anything, and the log was naming a cause that is incapable of being
    // one. A dishonest rejection label is worse than none: it sends the reader to fix something that is not
    // broken. The reasons are tested in the SAME ORDER the gate applies them, so the label is the verdict.
    const _why = !ks ? "UNSCREENED"
      : ks.shows_minor ? "MINOR"
      : contentFlagFails(ks) ? String(ks.content_flag).toUpperCase()
      : ks.real_photo !== true ? "NOT-A-PHOTO"
      : Number(ks.ai_generated) > Number(process.env.AI_CEILING ?? 0.3) ? `AI ${Number(ks.ai_generated).toFixed(2)}`
      : "unsafe";
    console.log(`  ${c.p.split("/").pop()} @${c.host}: KILL-SHOT ✗ ${_why} — dropped`);
    return null;
  }
  const j = await judge(c.p);
  const legible = Number(j?.legible);
  const lg = Number.isFinite(legible) ? legible : 0;
  const pass = MODE === "ip"
    ? (j && j.shows_character && !j.has_brand_or_watermark && j.editorial_composite !== true && j.portrait_framing === true && lg >= LEGIBLE_FLOOR)   // portraits are DEFINITIONAL (owner 2026-08-15): a non-portrait is not a candidate — same class as composite, wide scenes die by FRAMING   // ip: character + reads clearly + NO brand/stock mark + NOT an editorial composite (owner by-eye 2026-08-14: article-header collages dominate bare-name results for famous IP and are paste-in class; caption only demotes)
    : (j && j.real_photo && j.shows_subject && !j.has_text_or_watermark_or_logo && lg >= LEGIBLE_FLOOR);
  const info = j ? (MODE === "ip" ? `char=${j.shows_character} photo=${j.real_photo} brand=${j.has_brand_or_watermark} composite=${j.editorial_composite === true} portrait=${j.portrait_framing === true} title=${j.subject_title_art === true} mark=${j.third_party_watermark === true} co=${j.other_characters === true} caption=${j.has_editorial_caption} legible=${lg.toFixed(2)}` : `real=${j.real_photo} subj=${j.shows_subject} text=${j.has_text_or_watermark_or_logo} legible=${lg.toFixed(2)}`) : "judge-failed";
  console.log(`  ${c.p.split("/").pop()} @${c.host} (${c.W}x${c.H}): ${info} ${pass ? "✓" : "✗"}`);
  return pass ? { ...c, legible: lg, composite: MODE === "ip" ? false : null, portrait: MODE === "ip" ? true : null, caption: MODE === "ip" ? !!j.has_editorial_caption : false, titleArt: MODE === "ip" ? j.subject_title_art === true : false, thirdMark: MODE === "ip" ? j.third_party_watermark === true : false, coChars: MODE === "ip" ? j.other_characters === true : false, photo: MODE === "ip" ? !!j.real_photo : true } : null;
}
// ── THE 5-THEN-DECIDE CONTROL (owner 2026-08-13) — one scrape, judged in TRANCHES. Rows 1-5 first; SETTLE
// when a CLEAN passer exists, else extend to 6-12. Clean = pass plus, in ip mode, PHOTO and caption-free —
// exactly the two axes the pick sort prefers below: settling on a demoted illustration would buy back ~$…
// of judges by fixing in a worse ref class, and a drawn-only character (no photo exists) extends ONCE, then
// its ref-cache entry retires the whole cost. The row=N stamp on the pick is the control's own report card:
// it tells us over time how often tranche 2 fires and where winners actually sit.
const JUDGE_T1 = 5;
const pool = cands.slice(0, 12);
const cleanPass = (e) => (MODE === "ip" ? e.photo && !e.caption && !e.titleArt && !e.thirdMark && (ENSEMBLE || !e.coChars) : true);
for (const c of pool.slice(0, JUDGE_T1)) { const e = await judgeOne(c); if (e) ok.push(e); }
if (ok.some(cleanPass)) {
  console.log(`  ── settled in the first ${Math.min(JUDGE_T1, pool.length)} (clean passer) — ${Math.max(0, pool.length - JUDGE_T1)} deeper row(s) unjudged ──`);
} else if (pool.length > JUDGE_T1) {
  console.log(`  ── no clean passer in the first ${Math.min(JUDGE_T1, pool.length)} — extending to ${pool.length} ──`);
  for (const c of pool.slice(JUDGE_T1)) { const e = await judgeOne(c); if (e) ok.push(e); }
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
// ── CAPTION IS ABSOLUTE (owner 2026-08-13: "that requirement should persist and not let it settle on a
// captioned one, so lets establish that") — caption-free was the tranche-1 SETTLE criterion; it is now a HARD
// GATE on the WIN. A captioned passer may never be picked even when tranche 2 exhausts at 12: fixing a
// captioned frame into the gen — and into the cache rotation via the provisional write — is worse than no
// figure ref at all. The run prose-carries (this file's own non-load-bearing degradation below), and the
// banked captioned entries stay AUDIT-ONLY (the cache's serve side excludes caption===true, _ref_cache:134).
// PHOTO stays a PREFERENCE — a drawn-only character legitimately wins with a clean illustration. NOTE no
// same-query re-scrape is attempted here: web takes no offset, so the identical rows come back re-billed;
// the useful retry belongs to the CALLER (a different query, or prose-carry + the engine ladder).
const winnable = ok.filter((e) => !e.caption && !e.titleArt && !e.thirdMark && (ENSEMBLE || !e.coChars));   // caption-ABSOLUTE shape ×4 (owner 2026-08-14): title art, third-party marks, and CO-FIGURES (gap-4: "single character or ensemble if ensemble is used") — banked for audit, never a win; ENSEMBLE (caller-cast) waives only the co-figure law
if (ok.length && !winnable.length)
  console.log(`  ✗ ${ok.length} passer(s), ALL flagged (caption/title-art/third-party mark/co-figures) — the absolute gates hold: no figure ref rather than a flagged one`);
if (winnable.length) {
  winnable.sort((a, b) => (MODE === "ip" ? (a.photo === b.photo ? 0 : a.photo ? -1 : 1) : 0)
    || b.legible - a.legible || b.px - a.px);
  pick = winnable[0]; console.log(`  → pick: ${pick.p.split("/").pop()} (${MODE === "ip" ? (pick.photo ? "PHOTO, " : "illustration (no photo in pool), ") : ""}legible=${pick.legible.toFixed(2)})`);
} else {
  // ⭐ JUDGE-EXHAUSTION BACKFILL (owner 2026-08-15, approved after two zero-yield Garfield rounds): when the
  // general index's layer is CLASS-rejected wholesale (composites, title-art, captions, brand marks — the
  // article-header stratum that dominates bare-name results for famous subjects), exhaustion escalates the
  // ENGINE, never the query — one scoped-reddit round (search scoped to the fan-upload corpus, where
  // natural-scene character material actually lives), then honest prose-carry. Amends this file's own older
  // "not even worth backfilling" assumption, which was written for real-person LEGIBILITY picks on general
  // indexes — the class-reject case is a different failure. ONE self-re-exec with the engine swapped: the
  // entire judged pipeline (killshot, cutout, composite, caption-absolute, cache write) reuses verbatim.
  escalateEngine("JUDGE-EXHAUSTION");   // walks the engine ladder; returns only at the terminal stage
  // FAIL CLOSED (was: ship the highest-res UNJUDGED frame — an identity + safety bypass; on a provider outage every
  // judge returned null and this shipped a frame vetted for NOTHING). Nothing cleared the identity + kill-shot
  // gates, so emit NO figure ref: the figure is carried by PROSE and the gen keeps its world plate — the file's
  // own non-load-bearing degradation (matching the spend-cap EXIT-0-NO-FILE path above). Never ref-ground on an
  // unjudged frame. EXIT 0 (not 2): a missing figure-ref must not kill the run — _run guards with existsSync.
  console.log(`  ✗ none passed identity + safety gates — no figure ref (carried by prose; gen keeps its world plate)`);
  process.exit(0);
}

// NO blur (ungated real_entity), NO crop — native aspect, clean jpeg.
const out = join(OUTDIR, `entity_${slug}.jpg`);
await sharp(pick.p).jpeg({ quality: 92 }).toFile(out);
console.log(`\n✓ picked ${pick.host} row=${pick.row ?? "?"} (${pick.W}x${pick.H}, un-blurred, native aspect) → ${out}`);
