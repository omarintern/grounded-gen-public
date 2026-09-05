// PRE-GATE — settle the obvious refusals before paying to look anything up.
//
// ⚠ WHY IT IS WORTH IT, and the reason is not the one it looks like. The full character gate already refuses
// celebrities and owned IP correctly, at $…-0.110 — but that price is the PLAN phase, and the expensive part
// of the plan is ENTITY RESOLUTION: web searches that establish who a name refers to. A model that recognises a
// household name from its own weights needs no search at all. So this is not shaving an LLM call off a bill, it
// is skipping a lookup, which is why the saving is three orders of magnitude rather than a fraction.
// ⚠ AND THE REAL ARGUMENT IS ABUSE, NOT THRIFT. At $… a refusal, anyone can burn money at nine cents a
// request simply by naming celebrities — and naming celebrities is the first thing people try. A thousand
// refused attempts is $94 today and about a cent behind this gate.
//
// ⚠⚠ IT FAILS OPEN, AND THAT CONSTRAINT IS THE WHOLE DESIGN. Confident yes → refuse. No, unsure, unparseable,
// errored, timed out, or model unavailable → FALL THROUGH to the full plan exactly as before. The asymmetry is
// deliberate and worth stating plainly: a MISS costs precisely what it costs today, because the real gate is
// still behind this one and will catch it. A confident FALSE POSITIVE turns away a paying user for a legitimate
// request, is invisible to us, and is unrecoverable from their side. So a pre-gate that catches 60% and never
// misfires is worth far more than one that catches 95% and occasionally kills a real request: the 40% it misses
// cost exactly what they already cost, so the aggressive version buys nothing but risk.
// ⚠ NEVER THE ONLY THING THAT CAN REFUSE. If it is ever tempting to let this decide alone in order to skip the
// resolve, that is precisely the temptation to resist.
//
// ⚠ MEASURABILITY IS PART OF THE BUILD, NOT A FOLLOW-UP. Every verdict is logged, and so is every case where the
// full resolver later refuses something this gate passed (a MISS). Without that record the accuracy of this
// thing is unknowable and its failure mode is silent — the same defect class as every other silent gate we have
// had to chase. PREGATE=shadow runs it WITHOUT refusing, which is how you measure agreement on real traffic
// before trusting it to turn anyone away.
import { mkdirSync, appendFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const LOGDIR = join(HERE, "out", "_pregate");   // the volume: survives a deployment, like every other record we keep

// ⚠ NOT THE ABSOLUTE CHEAPEST MODEL, AND DELIBERATELY SO. The floor is $…/M in, but the ONLY risk this design
// carries is misjudgement, so a stronger model at $…/M in — still ~20x under the brain and ~6,700x under the
// refusal it replaces — buys accuracy exactly where the design is fragile. Measured 2026-08-17 off /models.
const MODEL = process.env.PREGATE_MODEL || "cheap-text-model";
const SURE = Number(process.env.PREGATE_SURE || 0.85);
const SHADOW = process.env.PREGATE === "shadow";

const log = (row) => {
  try { mkdirSync(LOGDIR, { recursive: true }); appendFileSync(join(LOGDIR, "verdicts.jsonl"), JSON.stringify({ ts: new Date().toISOString(), ...row }) + "\n"); } catch {}
};

// ⭐⭐ A NAME THE USER NEVER WROTE IS NOT A DEPICTION (owner 2026-09-05). This gate refused "The Shining
// Rollercoaster" for the Grady twins — a character the model ASSOCIATED with the film, absent from the request.
// A named work, show, game, book or place is not a character: its cast is not being asked for, and a request
// for a work's world is served by grounding the world (the appropriated-scene path), never refused for people
// who merely live in it. So the refused name must be one the model can point to IN THE REQUEST. Pure, so the
// battery tests it; it can only ever make the gate MORE permissive — the direction this whole design leans.
const STOP = new Set(["the", "a", "an", "of", "and", "from", "in", "on", "at", "by", "to", "mr", "mrs", "ms", "dr", "sir"]);
const GENERIC = new Set(["twins", "twin", "brothers", "sisters", "family", "gang", "crew", "band", "boys", "girls", "kids", "cast", "character", "characters", "man", "woman"]);
const _tok = (s) => String(s || "").toLowerCase().replace(/['\u2019]s\b/g, "").replace(/[^a-z0-9]+/g, " ").split(/\s+/).filter(Boolean);
export function namedInRequest(who, prompt) {
  const w = _tok(who), ptoks = _tok(prompt), p = new Set(ptoks);
  if (!w.length) return false;
  if ((" " + ptoks.join(" ") + " ").includes(" " + w.join(" ") + " ")) return true;
  return w.some((t) => t.length >= 2 && !STOP.has(t) && !GENERIC.has(t) && p.has(t));
}

/** Record that the FULL resolver refused something this gate let through — the only measurable disagreement. */
export function logPregateMiss(who, kind) { log({ action: "miss", who, kind, note: "full gate refused what the pre-gate passed" }); }

/**
 * @returns {Promise<{refuse:boolean, who?:string, why?:string, sure?:number, shadow?:boolean}>}
 *          refuse=false on ANY doubt, error or absence — the caller proceeds exactly as it would have.
 */
export async function pregate(prompt) {
  if (process.env.PREGATE === "0") return { refuse: false };
  try {
    // ⚠ PLAIN COMPLETION, NOT JSON MODE. providerJson sends response_format, which the cheap models reject with
    // a 400 ("response_format is not supported by this model") — measured 2026-08-17, and every call failed open
    // so the gate silently refused nothing at all. The verdict log is the only reason that was visible within a
    // minute rather than looking like a gate that simply never fires. Parse the object out of the text instead:
    // any model can produce JSON, only some can be forced to.
    const { providerText } = await import("./provider-llm.mjs");
    const ask =
      `Does this video request depict a REAL FAMOUS PERSON (a celebrity, athlete, politician, musician — anyone ` +
      `identifiable), or a FICTIONAL CHARACTER OWNED by a company or studio (a film, game, cartoon or brand ` +
      `character)?\n\nRequest: "${String(prompt).slice(0, 400)}"\n\n` +
      `⚠ Answer owned=true ONLY when you RECOGNISE the specific name and are CERTAIN it is one of those two ` +
      `things. Public-domain and folklore figures — fairy tale, myth, legend, and characters whose copyright has ` +
      `long expired — are NOT owned; answer false. Ordinary people, invented or unfamiliar names, animals, and ` +
      `generic roles are NOT owned; answer false. If you do not recognise the name, or you are unsure whether it ` +
      `is owned, answer false. Being unsure here is free and costs nothing; being wrong turns away a legitimate ` +
      `request, which cannot be undone.\n` +
      `⚠ A FILM, SHOW, GAME, BOOK OR PLACE NAMED in the request is NOT a depicted character and does not make its ` +
      `cast one: never name a character the request itself does not write. Answer owned=true only for a person or ` +
      `character whose NAME APPEARS in the request.\n` +
      `Return ONLY JSON {"owned":true|false,"who":"<the name, or empty>","why":"celebrity|owned-character|none","sure":0..1}.`;
    const { text } = await providerText(ask, { model: MODEL, maxTokens: 120, temperature: 0 });
    let j = null; try { j = JSON.parse((String(text).match(/\{[\s\S]*\}/) || ["{}"])[0]); } catch {}
    if (!j) { log({ action: "unparseable", raw: String(text).slice(0, 160), model: MODEL }); return { refuse: false }; }
    const owned = j?.owned === true;
    const sure = Number(j?.sure);
    const who = String(j?.who || "").trim();
    const named = namedInRequest(who, prompt);   // a name the user never wrote is an ASSOCIATION, never a depiction
    const confident = owned && Number.isFinite(sure) && sure >= SURE && who.length > 0 && named;
    log({ action: SHADOW ? "shadow" : confident ? "refused" : (owned && Number.isFinite(sure) && sure >= SURE && who && !named) ? "association" : "passed", owned, who, why: j?.why, sure, named, model: MODEL, prompt: String(prompt).slice(0, 200) });
    if (!confident) return { refuse: false };
    if (SHADOW) { console.log(`  [pregate] SHADOW — would have refused "${who}" (${j?.why}, sure ${sure}); falling through as instructed`); return { refuse: false, shadow: true }; }
    return { refuse: true, who, why: String(j?.why || "owned"), sure };
  } catch (e) {
    log({ action: "error", err: String(e?.message || e).slice(0, 120) });
    return { refuse: false };   // fail OPEN, always: an unavailable pre-check must never cost anyone their request
  }
}
