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
export function safetyOnlyFails(k) {
  if (!k) return true;                       // no judgement ⇒ unscreened ⇒ reject
  if (k.shows_minor !== false) return true;  // absolute; undefined rejects
  return k.content_flag !== "none";          // bare inequality: absent / null / "" / unrecognised all reject
}

export function killshotFails(k, aiCeiling, { requireSubject = true } = {}) {
  if (!k) return true;                                    // fail CLOSED on a failed judgement
  const ai = Number(k.ai_generated);
  const aiSuspect = Number.isFinite(ai) ? ai : 1;         // unparseable ⇒ suspect, never clean
  // MINORS ARE AN ABSOLUTE REJECT, checked in the CHEAPEST tier so a frame containing a child never reaches
  // the rubric, the requirements judge, the picker or the generator. Fails closed with the rest of this gate.
  if (k.shows_minor !== false) return true;
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
  if (k.content_flag !== "none") return true;
  return k.real_photo !== true || aiSuspect > aiCeiling || (requireSubject && !k.shows_subject);
}
