// KILL-SHOT PASS — the cheap first gate. Asks ONLY the three questions that eliminate most candidates outright,
// in a prompt a fraction of the full rubric's size, so the ~2,264-token identity rubric is never sent to a frame
// that was never going to survive.
//
// MEASURED on 122 real candidates from the 2026-07-29/30 logs:
//   • 70 of 122 (57%) died on real_photo / ai_generated / shows_subject ALONE.
//   • Every one of those paid full price for a rubric it never needed.
//   • Projected saving ≈ 22% of scene judging tokens. NOT larger, because a provider image costs a FLAT ~1,000
//     input tokens per call regardless of size — adding a tier adds an image charge for EVERY candidate, which
//     eats most of the rubric saving. 22% for zero quality risk is still the cheapest win available.
//
// WHY NOT JUST TRIM THE BIG RUBRIC (which would save ~31%): the wording is load-bearing. DEGRADE_FLOOR=0.6 was
// calibrated against the CURRENT text, and it is established that scores do NOT transfer between promptings (the
// same wording scored the owner's reference 0.88 on a crop and 0.72 whole-frame). Trimming invalidates the floor
// and forces a recalibration cycle. This tier changes NO wording, so nothing needs recalibrating.
//
// ⚠ THE CLAUSES ARE IMPORTED, NOT RETYPED. gateClauses() is the single source of text shared with the full
// rubric — a paraphrased copy would let the two gates drift, and the ai_generated clause is safety-critical
// (owner: "No AI images ... a hard no go") and deliberately fails CLOSED. Never inline a shortened version here.
import sharp from "sharp";
import { providerJson, textPart, imagePart } from "./provider-llm.mjs";
import { gateClauses } from "./_judge_identity.mjs";

async function smallViewAt(fp, px) {
  return (await sharp(fp).resize(px, px, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82 }).toBuffer()).toString("base64");
}

/**
 * Cheap 3-field gate. Returns {real_photo, ai_generated, shows_subject} or null on failure.
 * null must be treated as FAIL-CLOSED by the caller (same convention as judgeQuality).
 */
export async function judgeKillshot(filePath, subjectStr, opts = {}) {
  const sceneIntent = opts.sceneIntent ?? process.env.SCENE_INTENT ?? "";
  const viewPx = Number(opts.viewPx ?? process.env.VIEW_PX ?? 512);
  try {
    const b64 = await smallViewAt(filePath, viewPx);
    return await providerJson([
      textPart(`Return ONLY JSON {"real_photo":bool,"ai_generated":0..1,"shows_minor":bool,"content_flag":"none|nudity|distress|personal_data|third_party_media|symbol","shows_subject":bool}. ` +
        gateClauses(subjectStr, sceneIntent)),
      imagePart("image/jpeg", b64),
      // GENEROUS ceiling for the same reason as the other judges: max_tokens is billed on ACTUAL output, so a
      // high ceiling is free when unused, while too low a ceiling truncates and providerJson's ladder re-bills the
      // WHOLE call (measured: a 300 ceiling cost 2.4x on the quality judge, invisibly, all HTTP 200).
    ], { maxTokens: 1200, temperature: 0.1 });
  } catch (e) {
    // INFRA IS NOT A VERDICT. A null return means "judged and unreadable" and fails CLOSED, which is
    // right. But a provider 402/429/5xx means we never judged at all - flattening that to null made the
    // sourcer report an UNJUDGED pool as "all posed/stock/off-subject" (validated 2026-08-01).
    if (e?.name === "ProviderInfraError") throw e;
    return null;
  }
}

// ── GRID KILL-SHOT: ONE IMAGE CHARGE FOR N CANDIDATES ─────────────────────────────────────────────────────
// The measured cost driver is JUDGE CALLS, not adapt rounds — sampled 2026-08-10 across four prompts, one of
// which settled in a SINGLE round and still cost $… because it judged 24 candidates. Material-gathering
// averaged $… against a $… all-in COGS ceiling, so this leg is what breaks a fixed price.
//
// The lever is already documented at the top of this file: a provider image costs a FLAT ~1,000 input tokens per
// call REGARDLESS OF SIZE. That is why adding a cheap tier saved less than expected — every candidate paid an
// image charge. Tiling N candidates into ONE image inverts it: one image charge for the whole window.
//
// ⚠ SCOPED TO THE KILL-SHOT, DELIBERATELY. This tier asks near-categorical questions (real_photo, ai_generated,
// shows_subject + the safety flags). The FULL 12-field rubric stays per-image: its graded fields already
// collapse under multi-field crowding — that is what forced `degradation` and `subject_scale` into their own
// calls — and a grid adds spatial crowding on top. Cheap categorical work grids; calibrated graded work does not.
//
// ⚠ THE CLAUSES ARE STILL IMPORTED, NOT RETYPED. gateClauses() is the single source shared with the full rubric;
// a paraphrase here would let the two gates drift, and the ai_generated clause is safety-critical.
//
// ⚠ FAILS CLOSED PER CELL. A short array, a missing index, an unparseable cell — each becomes null for THAT
// candidate, which killshotFails() already treats as elimination. A grid must never let one bad cell pass a
// frame nobody judged, and must never let one bad cell condemn the whole window either.
// ── THE CONTACT SHEET, BUILT ONCE ─────────────────────────────────────────────────────────────────────────
// Both grid judges assembled their own identical copy of this. Every duplicate in this codebase began as a
// reasonable local copy, and the two had already drifted apart in cell size; a sheet whose geometry differs
// between the prefilter and the full judge means the two see different pictures of the same candidates.
//
// ⚠ THE PROMPT DESCRIBED GUTTERS THAT DID NOT EXIST. Tiles were composited flush — width exactly cellPx at
// left = i*cellPx — so horizontally adjacent cells TOUCHED. Each cell is letterboxed with near-black padding
// and the sheet background was also near-black, so the boundary between two candidates was a seam between two
// identical darks, and the model was told to trust "the black gutters" to separate them. It had only the
// number strips. A real gap in an unmistakably non-photographic colour costs a few hundred pixels and makes
// the segmentation unambiguous — the model should never have to infer where one candidate ends.
//
// ⚠ AND THE CELL WAS SMALLER THAN THE SINGLE-IMAGE PATH. 384 against VIEW_PX 512: the prefilter, whose whole
// job is to decide what deserves a closer look, was looking at LESS than the judge it feeds. A prefilter may
// be cheaper; it must not be blinder, or it discards what it merely could not see. Matched to 512.
export const GRID_GAP = 12;
export const GRID_GUTTER = { r: 255, g: 0, b: 255 };   // magenta: no photograph contains it, so it cannot read as content
async function buildContactSheet(files, cellPx) {
  const cols = Math.ceil(Math.sqrt(files.length));
  const rows = Math.ceil(files.length / cols);
  const labelH = 34, cellH = cellPx + labelH;
  const tiles = await Promise.all(files.map(async (f, i) => {
    const img = await sharp(f).resize(cellPx, cellPx, { fit: "contain", background: { r: 20, g: 20, b: 20 } }).toBuffer();
    const label = Buffer.from(
      `<svg width="${cellPx}" height="${labelH}"><rect width="100%" height="100%" fill="#000"/>` +
      `<text x="8" y="25" font-family="sans-serif" font-size="26" fill="#fff">${i + 1}</text></svg>`);
    return sharp({ create: { width: cellPx, height: cellH, channels: 3, background: { r: 0, g: 0, b: 0 } } })
      .composite([{ input: label, top: 0, left: 0 }, { input: img, top: labelH, left: 0 }]).png().toBuffer();
  }));
  const sheet = await sharp({ create: {
    width: cols * cellPx + (cols + 1) * GRID_GAP,
    height: rows * cellH + (rows + 1) * GRID_GAP,
    channels: 3, background: GRID_GUTTER,
  } })
    .composite(tiles.map((input, i) => ({
      input,
      left: GRID_GAP + (i % cols) * (cellPx + GRID_GAP),
      top: GRID_GAP + Math.floor(i / cols) * (cellH + GRID_GAP),
    })))
    .jpeg({ quality: 82 }).toBuffer();
  return { sheet, cols, rows };
}

/** Map the model's cells back onto the input files BY ITS OWN `n`, and never by position.
 *  ⚠⚠ THE POSITIONAL FALLBACK ATTACHED A VERDICT TO THE WRONG CANDIDATE. `cells.find(n === i+1) ?? cells[i]`
 *  reads as a harmless default and is not one: if the model omits `n`, reorders, or skips a cell, then cells[i]
 *  is some OTHER candidate's answer, and in the prefilter that answer can be a REJECTION. So a usable frame is
 *  discarded for something another image did, while the image that actually failed is passed through. It is the
 *  borrowed-field failure with the borrowing done in code, and it makes grid results look randomly wrong rather
 *  than systematically wrong — which is exactly how it stayed unexplained.
 *  Unmatched now yields null, which every caller already treats as "no opinion, send it to the real judge".
 *  Losing a cheap opinion costs one closer look; guessing costs the wrong candidate. */
export function mapCellsByNumber(cells, count) {
  const out = new Array(count).fill(null);
  let unmatched = 0;
  for (let i = 0; i < count; i++) {
    const c = (cells || []).find((x) => Number(x?.n) === i + 1);
    if (c) out[i] = c; else unmatched++;
  }
  if (unmatched) console.warn(`  [grid] ${unmatched}/${count} cell(s) had no matching "n" — those go to the per-image judge rather than borrowing another cell's verdict`);
  return out;
}

export async function judgeKillshotGrid(filePaths, subjectStr, opts = {}) {
  const files = Array.from(filePaths || []);
  if (!files.length) return [];
  const sceneIntent = opts.sceneIntent ?? process.env.SCENE_INTENT ?? "";
  const cellPx = Number(opts.cellPx ?? process.env.GRID_CELL_PX ?? 512);
  try {
    // Each cell is letterboxed onto a fixed tile with a numbered strip above it, so the answer is keyed by the
    // model's own cell number rather than by it describing what it saw. Geometry is shared with the prefilter —
    // see buildContactSheet: two copies had already drifted to different cell sizes, which meant the prefilter
    // and the judge it feeds were looking at different pictures of the same candidates.
    const { sheet, cols, rows } = await buildContactSheet(files, cellPx);
    const out = await providerJson([
      textPart(`This image is a CONTACT SHEET of ${files.length} SEPARATE candidate photographs, tiled in a ${cols}x${rows} grid and NUMBERED 1 to ${files.length} in white at the top-left of each cell, reading left to right then top to bottom. ` +
        `Judge EACH numbered cell INDEPENDENTLY, as if it were the only image you had been shown. The cells are unrelated to one another: they are different candidates for the same slot, NOT frames of one scene, NOT a sequence, and NOT a composite. ` +
        `⚠ EACH CELL IS BOUNDED BY A BRIGHT MAGENTA BORDER. Everything inside one magenta frame belongs to ONE candidate; nothing crosses it. The magenta and the number strips are artefacts of this sheet and are NOT part of any candidate, and a cell being one panel of this grid does NOT make it a split-screen or a composite. Judge only what is inside each cell. ` +
        `Return ONLY JSON {"cells":[{"n":1,"real_photo":bool,"ai_generated":0..1,"shows_minor":bool,"content_flag":"none|nudity|distress|personal_data|third_party_media|symbol","shows_subject":bool}, …]} with EXACTLY ${files.length} entries, one per cell, in cell order. ` +
        gateClauses(subjectStr, sceneIntent)),
      imagePart("image/jpeg", sheet.toString("base64")),
    ], { maxTokens: 400 + files.length * 260, temperature: 0.1 });
    return mapCellsByNumber(Array.isArray(out?.cells) ? out.cells : [], files.length);
  } catch (e) {
    if (e?.name === "ProviderInfraError") throw e;   // infra is not a verdict — same contract as the single judge
    return files.map(() => null);
  }
}

// ── PRE-FILTER GRID: REJECT-ONLY, TWO BOOLEANS, NEVER THE LAST WORD ───────────────────────────────────────
// The full grid above is CLOSED as a negative — 32-candidate agreement sample: 75% agreement, and 2 of the 8
// disagreements were UNSAFE (the grid PASSED what per-image REJECTED, on a tier that gates minors). Half the
// cells came back unanswered, so it cost more than baseline. Do not build on it.
//
// This is the salvage, and its safety comes from SHAPE rather than from accuracy. Two changes:
//
//   1. IT ASKS ONLY TWO PLAIN BOOLEANS — real_photo and shows_subject. Both are categorical: "is this a
//      photograph", "is the subject in it". Neither is checked against a tuned threshold, so neither can DRIFT
//      under a new prompting — which is the failure this codebase has measured repeatedly (DEGRADE_FLOOR set
//      from a copied prompt, subject_scale collapsing, degradation forced into its own call). ai_generated is
//      excluded ON PURPOSE: it is graded 0..1 against AI_CEILING, so it is exactly the kind of field that
//      shifts. shows_minor and content_flag are excluded because they are safety.
//
//   2. IT CAN ONLY REJECT, NEVER PASS. A cell it condemns is dropped; a cell it clears still goes to the FULL
//      per-image kill-shot including every safety field. So a false PASS costs nothing — the real judge catches
//      it — and the unsafe-disagreement class becomes structurally impossible rather than merely unlikely.
//      Only a false REJECT costs anything, and it costs one candidate, not a safety hole.
//
// WHY IT PAYS: this file's own header measured 70 of 122 candidates (57%) dying on real_photo / ai_generated /
// shows_subject ALONE. Eliminating that majority for ONE image charge, instead of one charge each, is the
// difference between a ~$… material leg and something near $….
//
// ⚠ UNANSWERED IS NOT A REJECT HERE. Unlike the full grid, an unparseable or missing cell returns UNDECIDED and
// the candidate proceeds to the per-image judge. Failing closed would be wrong on a pre-filter: it would let an
// infra blip discard candidates the scrape already paid for, which is the exact defect the window fallback was
// added to fix.
export async function prefilterGrid(filePaths, subjectStr, opts = {}) {
  const files = Array.from(filePaths || []);
  if (!files.length) return [];
  const undecided = () => files.map(() => null);          // null ⇒ "no opinion" ⇒ send to the real judge
  const cellPx = Number(opts.cellPx ?? process.env.GRID_CELL_PX ?? 512);
  try {
    const { sheet, cols, rows } = await buildContactSheet(files, cellPx);
    const out = await providerJson([
      textPart(`This image is a CONTACT SHEET of ${files.length} SEPARATE candidate photographs, tiled in a ${cols}x${rows} grid and NUMBERED 1 to ${files.length} in white at the top-left of each cell, left to right then top to bottom. ` +
        `The cells are unrelated candidates for the same slot — NOT frames of one scene, NOT a sequence. ⚠ EACH CELL IS BOUNDED BY A BRIGHT MAGENTA BORDER: everything inside one magenta frame belongs to ONE candidate and nothing crosses it. The magenta and the number strips are artefacts of this sheet and belong to no candidate; a cell being one panel here does NOT make it a split-screen or composite. ` +
        `Answer TWO questions about EACH cell, independently:\n` +
        `real_photo = is the content of this cell a photograph made by a REAL CAMERA pointed at a REAL SCENE THAT PHYSICALLY EXISTED? FALSE for a cartoon, illustration, render, graphic, or an image synthesised by a model. ⚠ Judge only what is INSIDE the cell.\n` +
        `shows_subject = does this cell clearly show: ${subjectStr}?\n` +
        `⚠ WHEN YOU ARE UNSURE ABOUT A CELL, ANSWER null FOR THAT FIELD. A wrong FALSE discards a usable candidate; null simply sends it for a closer look, which costs little. Guessing helps nobody.\n` +
        `Return ONLY JSON {"cells":[{"n":1,"real_photo":bool|null,"shows_subject":bool|null}, …]} with EXACTLY ${files.length} entries in cell order.`),
      imagePart("image/jpeg", sheet.toString("base64")),
      // ⚠ GENEROUS CEILING, FOR THE REASON THIS FILE ALREADY RECORDS TWICE: max_tokens is billed on ACTUAL
      // output, so a high ceiling is FREE when unused and a low one TRUNCATES — and a truncated response is
      // unparseable, which becomes null, which a reader then mistakes for "the model had no opinion".
      // Measured 2026-08-10: at 200 + 90/cell (=560 for a 4-cell sheet) TWO OF THREE POOLS returned 8/8
      // undecided, and I read that as model unreliability rather than my own ceiling. the provider's model emits
      // ~700-1000 reasoning+JSON tokens before the answer even starts.
    ], { maxTokens: 1200 + files.length * 120, temperature: 0.1 });
    const mapped = mapCellsByNumber(Array.isArray(out?.cells) ? out.cells : [], files.length);
    return mapped.map((c) => {
      if (!c) return null;
      // ONLY an explicit false rejects. true and null both mean "let the real judge decide".
      const dead = c.real_photo === false || c.shows_subject === false;
      return dead ? { reject: true, why: c.real_photo === false ? "not-a-photo" : "off-subject" } : null;
    });
  } catch (e) {
    if (e?.name === "ProviderInfraError") return undecided();   // infra is NOT a verdict, and never a rejection
    return undecided();
  }
}

/** Does this kill-shot verdict eliminate the candidate? Mirrors the full gate's logic for these three fields. */
// requireSubject=false on the PLACE-ONLY rung (actor dropped/conjured) — the place IS the subject there, so a
// frame need not show a presented actor (owner 2026-08-06: "white rabbit doesnt need swappable subject" — an ip /
// arriving actor is RENDERED into the place, no stand-in). Every SAFETY gate below (minors / content / real_photo
// / ai) still fires regardless; only the shows_subject requirement is waived.
/** The SAFETY subset only: minors + content flags. No real_photo, no ai_generated.
 *  ⚠ FOR REFS THAT ARE LEGITIMATELY NOT PHOTOGRAPHS. A style reference, or an IP character-ref, is often a
 *  drawing, a render or a painting BY DESIGN — running the full gate there rejects the very thing being asked
 *  for, on a field that is not a safety question. What is absolute stays absolute: minors and content flags are
 *  mode-independent and fail CLOSED, so a missing judgement, a missing key or an unrecognised value all reject.
 *  ⚠ EXPORTED BECAUSE IT WAS ALREADY WRITTEN TWICE. An inline copy in _source_entity.mjs guards content_flag with
 *  `k.content_flag && k.content_flag !== "none"`, which passes a MISSING key — the exact truthiness hole removed
 *  from killshotFails on 2026-08-07. One address, so a fix lands everywhere instead of in whichever copy the
 *  reader found. */
// ── WHICH content_flags REJECT ────────────────────────────────────────────────────────────────────────────
// Owner 2026-08-08: NSFW IS OPEN. Adult material is not filtered at sourcing — "we're not gonna apply filters
// on scrape to avoid nsfw, the vlm will handle that anyway". So `nudity` does NOT reject here.
//
// The rest still do, and for reasons that are not about taste: personal_data (plates, house numbers,
// documents) is exposure that would be RE-RENDERED into the output; distress is footage we would not ship;
// symbol is the harmful-symbol case (owner: "only harmful symbols like Nazi"). third_party_media was retired
// 2026-08-09 — see contentFlagFails. Absent, null, "" and any unrecognised value still fail CLOSED — that is the truthiness
// hole closed on 2026-08-07 and it is unrelated to which flags we honour.
// ⚠⚠ INTERLOCK — NUDITY RE-GATES THE MOMENT THE SCENE HAS CHILDREN IN IT.
// Updated 2026-08-08 when the owner allowed children in scrape for stand-ins. shows_minor is NO LONGER an
// absolute reject, so this gate now carries more weight than it did, not less. NSFW-open stays safe because
// three things hold together: a minor may appear only in a WORLD-REF, that plate's faces are BLURRED before
// gen, a minor may never be a CHARACTER-ref, and adult material cannot enter the same generation at all. Each
// covers a different opening — identity, reproduction, and juxtaposition — and none substitutes for another.
// The combination they jointly prevent is the one that must never be buildable.
//
// _run sets NUDITY_GATE=1 when castHasMinors(prompt) — a classroom, a playground, a school bus. Ordinary
// prompts are unaffected: nudity stays open exactly as the owner asked.
export const MINORS_ABSOLUTE = true;
export const nudityGates = () => process.env.NUDITY_GATE === "1";

/** One address for the content_flag verdict, so opening a category cannot land in one gate and miss the other. */
export function contentFlagFails(flag) {
  const f = String(flag ?? "");
  if (f === "none") return false;                       // clean
  if (f === "nudity" && !nudityGates()) return false;   // owner: adult material is not gated at sourcing…
  // ⚠ third_party_media RETIRED 2026-08-09. Its rubric is "copyrighted work INSIDE the frame that would be
  // re-rendered: a poster, wall art, an album cover, or a TV or monitor displaying a film, show or game" —
  // written for a living-room photo smuggling a poster into the output. It is exactly backwards for SCENE
  // APPROPRIATION, where the copyrighted work is not incidentally in the frame, it IS the frame: measured the
  // same day on a Ratatouille scrape, where it killed three genuine film frames including a TV displaying the
  // film, which is its rubric verbatim. Owner: "get rid of third_party_media because it hasnt helped us at
  // all." The ©-exposure it was guarding is read at GENERATION by the provider's own output gate, which is the
  // layer that actually refuses — this one only removed candidates before that layer could judge them.
  if (f === "third_party_media") return false;
  return true;                                          // …unless this run renders children. Plus absent / unrecognised / every other flag.
}

// ── MINORS: FATAL FOR AN IDENTITY REF, SURVIVABLE FOR A STAGE ─────────────────────────────────────────────
// Owner 2026-08-08: children may be scraped, because the STAND-IN is what stops a gen looking conjured. Two
// different uses, two different answers, and the difference is what the reference is FOR:
//   · a WORLD-REF is a stage. It contributes pose, scale and framing, and its faces are blurred before it
//     reaches the generator (_run sets WORLD_REDACT_FACES with ALLOW_MINOR_PLATE). A blurred child in a plate
//     carries composition, not identity.
//   · a CHARACTER-REF exists to carry identity forward. That is its entire function, so no redaction makes it
//     safe and ALLOW_MINOR_PLATE deliberately does not reach it — a child figure is conjured from the beats.
// An UNANSWERED shows_minor still rejects everywhere: the waiver is for a KNOWN minor on a stage we are about
// to blur, never for a frame nobody screened.
export const minorPlateAllowed = () => process.env.ALLOW_MINOR_PLATE === "1";

export function minorFails(k, { plate = false } = {}) {
  if (k?.shows_minor === false) return false;               // no minor at all
  if (k?.shows_minor === true && plate && minorPlateAllowed()) return false;  // known minor, blurred stage
  return true;                                              // true-without-waiver, or unanswered ⇒ reject
}

export function safetyOnlyFails(k, { plate = false } = {}) {
  if (!k) return true;                       // no judgement ⇒ unscreened ⇒ reject
  if (minorFails(k, { plate })) return true;
  return contentFlagFails(k.content_flag);
}

export function killshotFails(k, aiCeiling, opts = {}) {
  const { requireSubject = true } = opts;
  if (!k) return true;                                    // fail CLOSED on a failed judgement
  const ai = Number(k.ai_generated);
  const aiSuspect = Number.isFinite(ai) ? ai : 1;         // unparseable ⇒ suspect, never clean
  // MINORS ARE AN ABSOLUTE REJECT, checked in the CHEAPEST tier so a frame containing a child never reaches
  // the rubric, the requirements judge, the picker or the generator. Fails closed with the rest of this gate.
  if (minorFails(k, { plate: opts.plate })) return true;
  // SAFETY FLAGS, same tier and same fail-closed convention. These exist because the material we deliberately
  // search for is exactly where they cluster: security/dash footage is published BECAUSE something bad
  // happened, bedroom queries reach nudity, street scenes carry plates and house numbers, and interiors carry
  // posters and switched-on televisions that would be re-rendered into the output.
  // ⚠ NO TRUTHINESS GUARD HERE. `k.content_flag && ...` let a MISSING key through: undefined is falsy, so the
  // whole condition was false and an unscreened frame passed the safety tier — while shows_minor one line up
  // fails closed on exactly the same shape. The comment above claimed both conventions matched; only one did.
  // Bare inequality is the fail-closed form: absent, null, "" and any unrecognised value all reject. If the
  // judge stops returning the field the run fails LOUDLY and completely, which is the correct direction for a
  // gate whose whole purpose is that the material we deliberately search for is where this content clusters.
  // ⚠ WHICH flags reject now lives in contentFlagFails, above — nudity is open per the owner, the rest hold,
  // and absent/unrecognised still fails closed. Both gates read the same function so a category cannot be
  // opened in one and left shut in the other.
  if (contentFlagFails(k.content_flag)) return true;
  return k.real_photo !== true || aiSuspect > aiCeiling || (requireSubject && !k.shows_subject);
}
