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
import { rideFamilyOf } from "./_ride.mjs";
import { HOUSEHOLD_LAW, DENAMEABLE_LAW } from "./_fame_law.mjs";   // one fame line and one de-name test for both judges (owner 2026-09-22)   // pure: does the maker's request name a park ride?

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
// ⭐⭐ ON A RIDE, THE WORK'S FACE IS AN ANIMATRONIC (owner 2026-09-11: "yes for a ride they're indeed animatronics so it works"). Every owned
// figure that has ever worked on a ride entered through a real photograph of it in a scene and was WRITTEN BY ROLE AND LOOK — the caretaker in
// the red plaid jacket, a figure in a red winter jacket — its name never reaching the take (the prose law bans it; the planner declares it by
// role). So an owned CHARACTER the maker names in a request for a park ride is the ride's own figure, not a depiction: the door lets the name
// through and everything downstream stays as it is. A real person is never an animatronic here; a transport "ride" (a car ride) is no park ride.
export function animatronicOnRide(userPrompt, why) { return !!rideFamilyOf(userPrompt) && String(why || "") === "owned-character"; }
/** THE WORDS A RIDE IS NAMED IN (2026-09-24, engine review C; job 3a316a37): a remix's change ("the same except jack chases the man") names no ride, and the
 *  ride lives in the original's words, so every EXEMPTION that asks "is this on a ride?" reads the maker's words with the original's (REMIX_PARENT_WORDS,
 *  from _remix_run). A refusal is still charged only to the words the user wrote (namedInRequest). A fresh gen has no original: the words stand alone. */
export function onRideWords(words = "", parent = process.env.REMIX_PARENT_WORDS || "") { return [words, parent].map((s) => String(s || "").trim()).filter(Boolean).join("\n"); }
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
/** @param prompt      the text that will EXECUTE (the app's compiled prompt when one exists)
 *  @param userPrompt  the user's OWN words — the only text a refusal may be charged against (owner 2026-09-05:
 *                     "unwritten names are fine. it's just unwritten names that it flags itself" — our compiler
 *                     may elaborate with names; the gate must never refuse the user for what WE wrote). */
export async function pregate(prompt, userPrompt = "") {
  if (process.env.PREGATE === "0") return { refuse: false };
  try {
    // ⚠ PLAIN COMPLETION, NOT JSON MODE. providerJson sends response_format, which the cheap models reject with
    // a 400 ("response_format is not supported by this model") — measured 2026-08-17, and every call failed open
    // so the gate silently refused nothing at all. The verdict log is the only reason that was visible within a
    // minute rather than looking like a gate that simply never fires. Parse the object out of the text instead:
    // any model can produce JSON, only some can be forced to.
    const { providerText } = await import("./provider-llm.mjs");
    const ask =
      `Does this video request depict a HOUSEHOLD-NAME REAL PERSON (${HOUSEHOLD_LAW}), or a FICTIONAL CHARACTER OWNED by a company or studio (a film, game, cartoon or brand ` +
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
      `⚠ AMONG OWNED CHARACTERS ONLY THE WORK'S FACE IS BLOCKED. canonical=true when the character is a protagonist, title ` +
      `character or lead whose name and look a general audience knows on sight (Jack Torrance, Mickey Mouse); canonical=false ` +
      `for a peripheral or lesser-known figure of a work — a one-scene pair, a background or minor supporting character a ` +
      `general audience could not name (the Grady twins). Judge the character's own prominence, never the work's fame. ` +
      `⚠ FOR AN OWNED CHARACTER ALSO ANSWER denameable: ${DENAMEABLE_LAW}. ` +
      `A household-name real PERSON is always canonical.\n` +
      `Return ONLY JSON {"owned":true|false,"who":"<the name, or empty>","why":"celebrity|owned-character|none","canonical":true|false,"denameable":true|false,"sure":0..1}.`;
    const { text } = await providerText(ask, { model: MODEL, maxTokens: 400, temperature: 0 });
    let j = null; try { j = JSON.parse((String(text).match(/\{[\s\S]*\}/) || ["{}"])[0]); } catch {}
    if (!j) { log({ action: "unparseable", raw: String(text).slice(0, 160), model: MODEL }); return { refuse: false }; }
    const owned = j?.owned === true;
    const sure = Number(j?.sure);
    const who = String(j?.who || "").trim();
    const named = namedInRequest(who, userPrompt || prompt);   // judged against the USER'S OWN WORDS — a name our compiler or the model supplied is never the user's depiction
    const compiledOnly = !named && !!userPrompt && namedInRequest(who, prompt);   // present in what executes, absent from what the user wrote: ours, not theirs
    // ⭐ ONLY THE WORK'S FACE REFUSES (owner 2026-09-05: "allow through non-canonical ip … it should block jack torrance").
    // A real person is always canonical; an owned character refuses only when the model is CERTAIN it is the face
    // of its work. Unknown or false → falls through to the full gate, which fails closed on its own evidence.
    // ⭐⭐ AND THE WORK'S FACE REFUSES ONLY WHEN IT CANNOT BE DE-NAMED (owner 2026-09-21: "instead of refusing any owned character, it
    // needs to engage that nuance" — greenlight Ronald McDonald, a clown in yellow and red once de-named; reject Sonic, whose identity IS
    // the design). The door's denameable answer opens the door; the full gate's verdict is the resolver's web-searched basic_guise.
    // ⭐⭐ THE DOOR REFUSES ONLY A HOUSEHOLD NAME (2026-09-24, the owner's ruling R2: the quick check folds into the one context-aware verdict and refuses
    // only what it refuses). Its canonical / denameable answers are a guess from memory with no search and no context, and 6 of its 7 census refusals
    // were owned characters it guessed wrong (the Grady twins, Cody, the Lil Caesars mascot, Ronald McDonald, Jack on a ride); an owned character now
    // goes to the resolver's web-searched verdict (castVerdict) with the ride and the original in view. A household name still refuses here, for nothing.
    const canonicalBlock = j?.why === "celebrity";
    const animatronic = canonicalBlock && animatronicOnRide(onRideWords(userPrompt || prompt), j?.why);   // the work's face on a park ride: the ride's animatronic, never refused at the door
    const confident = owned && Number.isFinite(sure) && sure >= SURE && who.length > 0 && named && canonicalBlock && !animatronic;
    log({ action: SHADOW ? "shadow" : confident ? "refused" : (animatronic && owned && Number.isFinite(sure) && sure >= SURE && who && named) ? "ride-animatronic" : (owned && Number.isFinite(sure) && sure >= SURE && who && !named) ? (compiledOnly ? "ours-not-theirs" : "association") : (owned && Number.isFinite(sure) && sure >= SURE && who && named && j?.canonical === true && j?.denameable === true) ? "denameable" : (owned && Number.isFinite(sure) && sure >= SURE && who && named && !canonicalBlock) ? "non-canonical" : "passed", owned, who, why: j?.why, canonical: j?.canonical, denameable: j?.denameable, sure, named, compiled_only: compiledOnly, model: MODEL, prompt: String(prompt).slice(0, 200), user_prompt: String(userPrompt || "").slice(0, 120) });
    if (!confident) return { refuse: false };
    if (SHADOW) { console.log(`  [pregate] SHADOW — would have refused "${who}" (${j?.why}, sure ${sure}); falling through as instructed`); return { refuse: false, shadow: true }; }
    return { refuse: true, who, why: String(j?.why || "owned"), sure };
  } catch (e) {
    log({ action: "error", err: String(e?.message || e).slice(0, 120) });
    return { refuse: false };   // fail OPEN, always: an unavailable pre-check must never cost anyone their request
  }
}
