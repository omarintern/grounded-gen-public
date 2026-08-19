// SWAP CHECK — when the plate already holds the body the subject must replace, did beat zero actually put
// the subject THERE?
//
// ⚠ WHY IT EXISTS. The swap is instructed and was never verified. _ground_prompt asks the world-ref VLM for
// the single occupant at the action spot, and when it finds one the writer contract carries an explicit
// order: "Beat 1 MUST begin by replacing <standin> with <target>, which takes over that exact position."
// Nothing anywhere checked that the beat obeyed it — the third instance today of a law with no check behind
// it, after the payoff verdict and the cast ledger.
//
// MEASURED (punch monkey, 2026-08-19). The plate is a city walkway with one person in it, walking away from
// camera in the foreground; the sourcing judge scored her figures=true, standin_role=in_role, i.e. the exact
// role the action needs. The contract said "replacing the person walking with a backpack with a punch monkey,
// which takes over that exact position." Beat zero came back:
//     "[0s] Punch ... walks determinedly along the paved walkway from one block to another, dragging ..."
// Anchored to a plate noun, so the staging law passed — and no position, no orientation, no relation to the
// body being replaced. The engine then held a photograph containing a woman walking away and a beat about a
// monkey walking somewhere on the same pavement, and had to decide for itself whether that was a replacement
// or an addition. It decides at frame zero, which is where drift stops being recoverable. The owner's read of
// the delivered clip: "all frames (2 locations) in punch monkey are diffusing heavily".
//
// ⚠ THE PLACEMENT IS THE POINT, NOT THE VERB. A beat can echo the stand-in's ACTION ("walks") and still put
// the subject nowhere — that is exactly what happened, so a token-overlap test passes the failing case.
//
// ⚠⚠ EXTRACT, DO NOT JUDGE. The first cut asked the model to judge whether the beat "takes over that exact
// position", and it answered TAKES_POSITION for the known-bad beat, justifying it as "same walkway, same
// facing" — a facing the beat never states. A subjective sufficiency question gets a generous answer, which is
// the same way `crisp` failed. So this asks the model to EXTRACT what the beat STATES about position and
// facing, and the RULE lives in code: a swap beat must state at least one of them.
//     shipped punch monkey    position "not stated" · facing "not stated"      0/2  FAIL
//     the same beat, fixed    position "not stated" · facing "away from camera" 1/2  pass
//     penguin (delivered ok)  position "down the snowy slope" · facing "away from camera"  2/2  pass
// This verifies a NECESSARY condition, not the full semantics: it cannot confirm the subject stands exactly
// where the body stood, only that beat zero says anything about where it is at all — which is precisely what
// was missing, and what the generator otherwise invents.
//
// ⚠ IT NEVER EDITS THE BEAT. Same rule the fine-detail and payoff repairs follow: re-ask, verify, and ship the
// original with a warning if the retry does not improve. A working clip with a loose beat zero beats no clip.
// SWAP_CHECK unset or "1" re-asks; "shadow" only watches; "0" disables it entirely.
import { providerText } from "./provider-llm.mjs";

const MODEL = process.env.SWAP_MODEL || "cheap-text-model";   // cheap text tier

/** First [Ns] line only — beat zero is the whole question, and later beats are a different world after a cut. */
export function beatZeroOnly(beatsText) {
  for (const l of String(beatsText || "").split("\n")) {
    const m = l.trim().match(/^\[\d+(?:\.\d+)?s\]\s*(.+)$/);
    if (m) return m[1].trim();
  }
  return "";
}

/**
 * @returns {Promise<{verdict:"anchored"|"unanchored"|null, position:string, facing:string, mode:string}>}
 *          verdict null on any failure — the caller must treat that as "no opinion", never as a fault.
 */
export async function swapVerdict(standin, placement, target, beatsText) {
  const mode = String(process.env.SWAP_CHECK || "1");
  if (mode === "0") return { verdict: null, position: "", facing: "", mode };
  const beat0 = beatZeroOnly(beatsText);
  if (!beat0 || !standin || !target) return { verdict: null, position: "", facing: "", mode };
  try {
    const ask =
      `Below is the opening beat of a video that will be generated FROM a photograph.\n\n` +
      `THE BEAT: ${beat0.slice(0, 400)}\n\n` +
      `Extract ONLY what the beat itself STATES about where the subject is in the FRAME and which way it FACES.\n` +
      `Do not infer, do not fill gaps, do not be generous — if the beat does not say it, it is not stated.\n` +
      `· "position" = where in the picture (near/far, left/right, foreground/background, at/beside a named ` +
      `object). A bare place noun the whole scene shares ("along the walkway", "in the kitchen") is NOT a ` +
      `position — write "not stated".\n` +
      `· "facing" = which way it is turned (toward/away from camera, back turned, in profile). Not stated → "not stated".\n` +
      `Return ONLY JSON {"position":"<what the beat states, or 'not stated'>","facing":"<... or 'not stated'>"}.`;
    const { text } = await providerText(ask, { model: MODEL, maxTokens: 90, temperature: 0 });
    let j = null; try { j = JSON.parse((String(text).match(/\{[\s\S]*\}/) || ["{}"])[0]); } catch {}
    const said = (v) => { const t = String(v || "").trim().toLowerCase(); return t && t !== "not stated" && t !== "none" && t !== "n/a"; };
    const position = String(j?.position || "").slice(0, 80), facing = String(j?.facing || "").slice(0, 80);
    if (!j) return { verdict: null, position, facing, mode };
    // THE RULE LIVES HERE, NOT IN THE PROMPT: at least one of the two must be stated.
    return { verdict: (said(position) || said(facing)) ? "anchored" : "unanchored", position, facing, mode };
  } catch { return { verdict: null, position: "", facing: "", mode }; }
}

export function swapActs() { return String(process.env.SWAP_CHECK || "1") === "1"; }
