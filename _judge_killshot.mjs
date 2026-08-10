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
export async function judgeKillshotGrid(filePaths, subjectStr, opts = {}) {
  const files = Array.from(filePaths || []);
  if (!files.length) return [];
  const sceneIntent = opts.sceneIntent ?? process.env.SCENE_INTENT ?? "";
  const cellPx = Number(opts.cellPx ?? process.env.GRID_CELL_PX ?? 384);
  const cols = Math.ceil(Math.sqrt(files.length));
  const rows = Math.ceil(files.length / cols);
  try {
    // Each cell is letterboxed onto a fixed tile so the model sees a clean lattice; a numbered strip is drawn
    // above each so the answer can be keyed by position rather than by the model describing what it sees.
    const tiles = await Promise.all(files.map(async (f, i) => {
      const img = await sharp(f).resize(cellPx, cellPx, { fit: "contain", background: { r: 20, g: 20, b: 20 } }).toBuffer();
      const label = Buffer.from(
        `<svg width="${cellPx}" height="34"><rect width="100%" height="100%" fill="#000"/>` +
        `<text x="8" y="25" font-family="sans-serif" font-size="26" fill="#fff">${i + 1}</text></svg>`);
      return sharp({ create: { width: cellPx, height: cellPx + 34, channels: 3, background: { r: 0, g: 0, b: 0 } } })
        .composite([{ input: label, top: 0, left: 0 }, { input: img, top: 34, left: 0 }]).png().toBuffer();
    }));
    const cellH = cellPx + 34;
    const sheet = await sharp({ create: { width: cols * cellPx, height: rows * cellH, channels: 3, background: { r: 0, g: 0, b: 0 } } })
      .composite(tiles.map((input, i) => ({ input, left: (i % cols) * cellPx, top: Math.floor(i / cols) * cellH })))
      .jpeg({ quality: 82 }).toBuffer();
    const out = await providerJson([
      textPart(`This image is a CONTACT SHEET of ${files.length} SEPARATE candidate photographs, tiled in a ${cols}x${rows} grid and NUMBERED 1 to ${files.length} in white at the top-left of each cell, reading left to right then top to bottom. ` +
        `Judge EACH numbered cell INDEPENDENTLY, as if it were the only image you had been shown. The cells are unrelated to one another: they are different candidates for the same slot, NOT frames of one scene, NOT a sequence, and NOT a composite. ` +
        `⚠ The lattice itself is an artefact of this sheet — the black gutters and the number strips are NOT part of any candidate, and a cell being one panel of this grid does NOT make it a split-screen or a composite. Judge only what is inside each cell. ` +
        `Return ONLY JSON {"cells":[{"n":1,"real_photo":bool,"ai_generated":0..1,"shows_minor":bool,"content_flag":"none|nudity|distress|personal_data|third_party_media|symbol","shows_subject":bool}, …]} with EXACTLY ${files.length} entries, one per cell, in cell order. ` +
        gateClauses(subjectStr, sceneIntent)),
      imagePart("image/jpeg", sheet.toString("base64")),
    ], { maxTokens: 400 + files.length * 260, temperature: 0.1 });
    const cells = Array.isArray(out?.cells) ? out.cells : [];
    // Key by the model's own `n` when present, else by position — then fail closed on anything missing.
    return files.map((_, i) => cells.find((c) => Number(c?.n) === i + 1) ?? cells[i] ?? null);
  } catch (e) {
    if (e?.name === "ProviderInfraError") throw e;   // infra is not a verdict — same contract as the single judge
    return files.map(() => null);
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
