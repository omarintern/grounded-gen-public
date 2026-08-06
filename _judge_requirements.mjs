// SCENE-REQUIREMENTS JUDGE — an ISOLATED, EXPLICIT check that the frame contains the physical features the STORY
// needs. Its own call, on purpose.
//
// WHY NOT FOLD IT INTO AN EXISTING FIELD (tried, failed 2026-07-31). The requirements were appended to
// SCENE_INTENT, which feeds the single boolean `shows_subject`, on the theory that the existing check would
// enforce them for free. It did not: ONE BOOLEAN CANNOT EXPRESS "shows the place but lacks two of three required
// features". The VLM weighted the primary subject ("a bedroom at night"), treated the appended clause as context,
// answered true, and a frame with NO sleeping person, NO doorway and NO floor space passed as scene-fit 1.00.
// This is the same law the quality judge already obeys: ISOLATE ANYTHING YOU GATE ON - graded and compound
// judgements flatten when crowded into another question.
//
// Owner 2026-07-31: "we must abandon cheapness for results. cost cutting is a final measure but post-launch."
// So this asks about EACH requirement SEPARATELY and returns a per-feature verdict, rather than one summary bool.
import sharp from "sharp";
import { providerJson, textPart, imagePart } from "./provider-llm.mjs";

async function view(fp, px) {
  return (await sharp(fp).resize(px, px, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 84 }).toBuffer()).toString("base64");
}

/**
 * Check a frame against the story's required features.
 * @param {string[]} requirements  e.g. ["an open doorway animals can enter through", "clear floor space"]
 * @returns {{verdicts: {feature: string, present: boolean, note: string}[], missing: string[]} | null}
 *          null on failure — callers must treat null as FAIL-CLOSED, same convention as judgeQuality.
 */
export async function judgeRequirements(filePath, requirements, opts = {}) {
  const reqs = (requirements || []).filter((r) => typeof r === "string" && r.trim());
  if (!reqs.length) return { verdicts: [], missing: [] };
  const viewPx = Number(opts.viewPx ?? process.env.VIEW_PX ?? 768);
  try {
    const b64 = await view(filePath, viewPx);
    const numbered = reqs.map((r, i) => `${i + 1}. ${r}`).join("\n");
    const j = await providerJson([
      textPart(
        `Return ONLY JSON {"verdicts":[{"n":1,"present":bool,"note":"few words"}, …]} with EXACTLY one entry per ` +
        `numbered item below, in order.\n\n` +
        `A video will be generated FROM this photograph, and the story needs the frame to CONTAIN these things:\n${numbered}\n\n` +
        `For each one, answer whether it is ACTUALLY VISIBLE IN THIS PHOTOGRAPH.\n` +
        `⚠ Judge ONLY what you can SEE. Do NOT infer things that must exist outside the frame or off-camera: a ` +
        `bedroom obviously HAS a door somewhere, but if no doorway is visible in this picture the answer is false. ` +
        `A room obviously HAS a floor, but "clear floor space for several animals to gather" is false if the floor ` +
        `is not visible, is fully occupied, or is too small a part of the frame for several animals to read there.\n` +
        `⚠ Be strict about SPACE requirements: they mean usable, UNOBSTRUCTED, IN-FRAME area at a size where the ` +
        `subject would actually render, not a sliver or a distant corner.\n` +
        `⚠ Be strict about OCCUPANT requirements: "a bed with a sleeping person" is false for an empty or merely ` +
        `rumpled bed. A body must be visibly present.\n` +
        `The generator CANNOT add these features convincingly — a missing one means the story cannot happen in ` +
        `this frame, so a false answer is far more useful to us than a generous one.`
      ),
      imagePart("image/jpeg", b64),
    ], { maxTokens: 900, temperature: 0.1 });

    const raw = Array.isArray(j?.verdicts) ? j.verdicts : [];
    const verdicts = reqs.map((feature, i) => {
      const v = raw.find((x) => Number(x?.n) === i + 1) || raw[i];
      return { feature, present: v?.present === true, note: String(v?.note || "").slice(0, 60) };
    });
    return { verdicts, missing: verdicts.filter((v) => !v.present).map((v) => v.feature) };
  } catch (e) {
    // FAIL-CLOSED, BUT NEVER SILENT. A bare `catch { return null }` hid the reason and the gate reported only
    // "judge failed", which is indistinguishable from a frame that genuinely lacks the features.
    console.log(`      \u26a0 requirements judge error: ${String(e.message).split("\n")[0].slice(0, 110)}`);
    return null;
  }
}

/** Does this frame fail the story's requirements? Fails CLOSED on a failed judgement. */
export function requirementsFail(r) {
  if (!r) return true;
  return r.missing.length > 0;
}
