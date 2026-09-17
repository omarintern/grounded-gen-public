// ═══ SOURCEABILITY — THE DECISION TO SCRAPE IS A JUDGEMENT, MADE BEFORE ANY QUERY IS SPENT (owner 2026-09-11) ═══════════════════
// "the key is a reference, or references, but if no such exists then it shouldn't begin to scrape. for example something highly
// specific that a query won't yield. but this the model has to measure/telegraph before making the decision to scrape."
// A run that cannot be grounded in a real photograph is DENIED here, honestly, with nothing scraped — never degraded later into an
// off-subject plate (the Penguin gen: an inferred register let an ordinary replica photo win the pool). The probe answers per SUBJECT
// (a place, a work, a form), never per prompt: the engine splits a form from its place, so "cctv of the oval office" is two subjects
// that each yield. ⚠ FAILS OPEN — an unanswered probe never denies, a "no" under the confidence bar never denies (the pregate's law:
// a false denial turns away a paying user and is invisible to us). ⚠ MEASURABLE — every verdict is logged; SOURCEABILITY=shadow
// logs the denial it would have made without making it; SOURCEABILITY=0 disables the probe.
import { providerJson, textPart } from "./provider-llm.mjs";
import { mkdirSync, appendFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const HERE = dirname(fileURLToPath(import.meta.url));
export const SOURCEABLE_SURE = Number(process.env.SOURCEABILITY_SURE || 0.85);

export const SOURCEABILITY_LAW =
  `You decide, BEFORE any image search is run, what REAL PHOTOGRAPH(S) can ground each subject. The platform grounds every video on real photographs and WRITES the specifics into them; nothing is ever refused for lack of a photograph — a subject that no query yields as itself is REDUCED to its photographable KIND(S), and a subject with no visible kind is INFERRED into the scene that would depict it. ` +
  `SOURCEABLE AS ITSELF: a named real place with public photographs (a landmark, a public building, a chain, a stadium — including an official-only interior such as an office of state, which press and official photographs cover); the world of a named film, show or game (its own frames exist); a KIND of place or scene (a medieval bedchamber, a diner at night, a subway car, an office interior); a capture form by its bare words (security camera footage, dashcam footage, a rollercoaster POV); an animal or species, a vehicle, a common object. ` +
  `REDUCED TO ITS KIND(S): a private or unknown specific ("my late grandmother's kitchen in Leeds" → a domestic kitchen; the grandmother's things are written); an invented place ("the kitchen of a wizard on the moon" → a kitchen AND the moon's surface, two photographs; the wizard's things written); a specific moment ("the second a stranger's dog sneezed in 2019" → a dog in a living room; the moment is the story, written). ` +
  `EVERY PHOTOGRAPHABLE NOUN OF A DEMAND IS ITS OWN KIND, and a STYLE is never sourced, only written: "the moon in retrograde style with tall buildings" → the moon AND tall buildings, two photographs, "retrograde style" written into the prose — a style is not a specific appropriation. ` +
  `INFERRED: a pure abstraction or a subject that is nothing but a description ("the feeling of a Tuesday afternoon" → a quiet living room in flat afternoon light; "the concept of debt" → a kitchen table covered in opened envelopes) — infer the most photographable scene that would depict it, and say so. ` +
  `A pairing is NOT judged as one photograph: the place is sourced and the actor is written, so "a penguin in the Oval Office" is the Oval Office, sourceable. ` +
  `THE PAIR IS JUDGED TOO (owner 2026-09-17: "would a trail cam be very likely in everest? answer is probably no"): when the subjects include a capture FORM and a PLACE, also say whether that form is plausibly found at that place in real footage — a trail camera on Mount Everest, a doorbell camera in the Sahara: unlikely; CCTV in a shopping mall: likely. When unlikely, give the place's bare KIND as an image query ("snowy mountain ridge"), so the form can be hunted as itself in that kind of place and the specific place written. ` +
  `Judge each subject on its own. Return ONLY JSON {"pairs":[{"form":string,"place":string,"likely":boolean,"confidence":0..1,"place_kind":string}],"subjects":[{"subject":string,"sourceable":boolean,"reduction":[string],"written":[string],"inferred":boolean,"confidence":0..1,"kind":"named place|work|kind of place|form|thing|private specific|invented|specific moment|abstraction|other","query":string|null,"why":string}]} ` +
  `— "sourceable" is true when the subject can be photographed AS ITSELF; "reduction" lists the bare image queries for its photographable kind(s) when it cannot (NEVER empty: infer if you must, and set "inferred" true); "written" lists the style words and specifics that go to the prose rather than the search; "query" is the best bare image query when sourceable; "confidence" is how sure you are.`;

const _norm = (s) => String(s || "").replace(/\s+/g, " ").trim();
const _key = (s) => _norm(s).toLowerCase();
/** THE SUBJECTS THAT MUST BE PHOTOGRAPHED for this run — the world or its places, the rooms of a themed ride, the capture form by its bare
 *  words. Figures are never subjects: a figure is written or conjured, never a plate. Pure. */
export function sourceabilitySubjects({ plan = {}, world = [], device = "", ride = null, rawPrompt = "" } = {}) {
  const out = []; const add = (subject, role, required = true) => { const k = _key(subject); if (!k || out.some((o) => _key(o.subject) === k)) return; out.push({ subject: _norm(subject), role, required }); };
  const places = Array.isArray(plan?.form?.places) ? plan.form.places.filter(Boolean) : [];
  if (ride) {
    const title = ride?.world?.named ? _norm(ride.world.title) : "";
    if (title) add(ride.world.mode === "theme" ? `the world of ${title}` : title, "world");
    for (const p of places) add(title && ride.world.mode === "theme" ? `${title}: ${p}` : p, ride.world.mode === "theme" ? "room" : "place");
    if (ride.noun) add(`${ride.noun} POV footage`, "form");
  } else {
    if (device) add(/footage$/i.test(device) ? device : `${device} footage`, "form");
    for (const p of places) add(p, "place");
    if (!places.length) { const w = _norm(plan?.form?.setting || plan?.form?.world || world[0] || ""); if (w) add(w, "world"); }
  }
  return out.slice(0, 6);
}
/** The judge's answer shaped onto the subjects asked (a verdict for a subject never asked is dropped; an unjudged subject is absent, which never denies). Pure. */
export function shapeVerdicts(raw, subjects = []) {
  const arr = Array.isArray(raw?.subjects) ? raw.subjects : [];
  const out = [];
  for (const s of subjects) {
    const v = arr.find((x) => _key(x?.subject) === _key(s.subject)) || arr.find((x) => _key(x?.subject) && (_key(s.subject).includes(_key(x.subject)) || _key(x.subject).includes(_key(s.subject))));
    if (!v || typeof v.sourceable !== "boolean") continue;
    const c = Number(v.confidence); const reduction = (Array.isArray(v.reduction) ? v.reduction : []).map(_norm).filter(Boolean).slice(0, 3); const written = (Array.isArray(v.written) ? v.written : []).map(_norm).filter(Boolean).slice(0, 6);
    out.push({ subject: s.subject, role: s.role, required: s.required !== false, sourceable: v.sourceable, reduction, written, inferred: v.inferred === true, confidence: Number.isFinite(c) ? Math.max(0, Math.min(1, c)) : 0, kind: _norm(v.kind || "other"), query: v.query ? _norm(v.query) : null, why: _norm(v.why).slice(0, 160) });
  }
  return out;
}
/** THE PAIRS: a capture form judged against each place it must be found in. Only pairs of subjects actually asked are kept; a pair with no
 *  boolean "likely" is dropped (never acts). Pure. */
export function shapePairs(raw, subjects = []) {
  const arr = Array.isArray(raw?.pairs) ? raw.pairs : [];
  const forms = subjects.filter((s) => s.role === "form").map((s) => _key(s.subject));
  const places = subjects.filter((s) => s.role === "place" || s.role === "world").map((s) => _key(s.subject));
  const out = [];
  for (const p of arr) {
    if (!p || typeof p.likely !== "boolean") continue;
    const f = _key(p.form), pl = _key(p.place);
    if (!forms.some((x) => x === f || x.includes(f) || f.includes(x))) continue;
    if (!places.some((x) => x === pl || x.includes(pl) || pl.includes(x))) continue;
    const c = Number(p.confidence);
    out.push({ form: _norm(p.form), place: _norm(p.place), likely: p.likely, confidence: Number.isFinite(c) ? Math.max(0, Math.min(1, c)) : 0, placeKind: _norm(p.place_kind || "") });
  }
  return out;
}
/** APPROPRIATION (owner 2026-09-17): the first SURE "unlikely" pair whose place has a kind — the form is hunted as itself in that kind of place;
 *  the specific place is written (option one) or rides as a second plate (option two). Pure. */
export function appropriationOf(pairs = [], sure = SOURCEABLE_SURE) {
  return (Array.isArray(pairs) ? pairs : []).find((p) => p && p.likely === false && p.confidence >= sure && p.placeKind) || null;
}
/** THE REDUCTIONS: a subject that cannot be photographed as itself but HAS a photographable kind — the kind's queries lead the hunt, the specifics are
 *  written (owner 2026-09-11: "my late grandmother's kitchen in Leeds would become a kitchen query however. our moat stands"). Pure. */
export function sourceabilityReductions(verdicts = []) {
  return (Array.isArray(verdicts) ? verdicts : []).filter((v) => v && v.sourceable === false && Array.isArray(v.reduction) && v.reduction.length).map((v) => ({ subject: v.subject, role: v.role, kinds: v.reduction.slice(0, 3), written: Array.isArray(v.written) ? v.written : [], inferred: v.inferred === true, kind: v.kind }));
}
/** NO DENIAL (owner 2026-09-11: "even if nothing photographable, it must infer to produce. sometimes a prompt dont produce so we must fill in"). Kept as a
 *  function so the battery can pin that it returns nothing: a subject the judge could not reduce is INFERRED by the judge, and if it still came back
 *  empty the run proceeds with the planner's own queries — never a refusal for lack of a photograph. Pure. */
export function sourceabilityDenies() { return []; }
async function defaultJudge(subjects) {
  return providerJson([textPart(`${SOURCEABILITY_LAW}\n\nSubjects: ${JSON.stringify(subjects.map((s) => s.subject))}`)], { tag: "sourceability", maxTokens: 2000, temperature: 0.1 });
}
/** One judge call for the run's subjects → { ok, verdicts, denied, failedOpen }. Never throws; an error or an unparseable answer fails OPEN. */
export async function judgeSourceability(subjects = [], { judge = defaultJudge, sure = SOURCEABLE_SURE, log = () => {} } = {}) {
  if (!Array.isArray(subjects) || !subjects.length) return { ok: true, verdicts: [], reductions: [], pairs: [], denied: [], failedOpen: false };
  let raw = null;
  try { raw = await judge(subjects); } catch (e) { log(`  ◇ sourceability probe errored (${String(e?.message || e).slice(0, 80)}) — fails open`); return { ok: true, verdicts: [], reductions: [], denied: [], failedOpen: true }; }
  const verdicts = shapeVerdicts(raw, subjects);
  if (!verdicts.length) return { ok: true, verdicts: [], reductions: [], denied: [], failedOpen: true };
  const denied = sourceabilityDenies(); const reductions = sourceabilityReductions(verdicts);   // never a denial — a subject with no kind is inferred, and an empty answer leaves the planner's queries in place
  const pairs = shapePairs(raw, subjects);
  try { mkdirSync(join(HERE, "out", "_sourceability"), { recursive: true }); appendFileSync(join(HERE, "out", "_sourceability", "verdicts.jsonl"), JSON.stringify({ at: new Date().toISOString(), job: process.env.LEDGER_JOB || "", verdicts, reductions, pairs, denied: denied.map((d) => d.subject) }) + "\n"); } catch {}
  return { ok: !denied.length, verdicts, reductions, pairs, denied, failedOpen: false };
}
