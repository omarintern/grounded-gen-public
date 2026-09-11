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
  `You decide, BEFORE any image search is run, whether a REAL PHOTOGRAPH of each subject can be found by an ordinary image query on the open web. ` +
  `SOURCEABLE: a named real place with public photographs (a landmark, a public building, a chain, a stadium — including an official-only interior such as an office of state, which press and official photographs cover); ` +
  `the world of a named film, show or game (its own frames exist); a KIND of place or scene (a medieval bedchamber, a diner at night, a subway car, an office interior); ` +
  `a capture form by its bare words (security camera footage, dashcam footage, a rollercoaster POV); an animal or species, a vehicle, a common object. ` +
  `NOT SOURCEABLE: a private or unknown specific (someone's own home, "my office", an unnamed person's room, a shop with no name); a place the maker invented that no work depicts (the throne room of the crab king, the kitchen of a wizard on the moon); ` +
  `a specific moment nobody photographed (the exact second a named stranger's dog sneezed in 2019); a subject that exists only as a description. ` +
  `A pairing is NOT judged as one photograph: the place is sourced and the actor is written, so "a penguin in the Oval Office" is the Oval Office, sourceable. ` +
  `Judge each subject on its own. Return ONLY JSON {"subjects":[{"subject":string,"sourceable":boolean,"confidence":0..1,"kind":"named place|work|kind of place|form|thing|private specific|invented|unphotographed moment|other","query":string|null,"why":string}]} ` +
  `— "query" is the best bare image query when sourceable (the place's name, the kind, the form's own words), null when not; "confidence" is how sure you are of the verdict.`;

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
    const c = Number(v.confidence); out.push({ subject: s.subject, role: s.role, required: s.required !== false, sourceable: v.sourceable, confidence: Number.isFinite(c) ? Math.max(0, Math.min(1, c)) : 0, kind: _norm(v.kind || "other"), query: v.query ? _norm(v.query) : null, why: _norm(v.why).slice(0, 160) });
  }
  return out;
}
/** THE DENIAL: a REQUIRED subject the judge is SURE cannot be photographed. A low-confidence "no", an optional subject, an unjudged subject never denies. Pure. */
export function sourceabilityDenies(verdicts = [], { sure = SOURCEABLE_SURE } = {}) {
  return (Array.isArray(verdicts) ? verdicts : []).filter((v) => v && v.required !== false && v.sourceable === false && Number(v.confidence) >= sure);
}
async function defaultJudge(subjects) {
  return providerJson([textPart(`${SOURCEABILITY_LAW}\n\nSubjects: ${JSON.stringify(subjects.map((s) => s.subject))}`)], { maxTokens: 900, temperature: 0.1 });
}
/** One judge call for the run's subjects → { ok, verdicts, denied, failedOpen }. Never throws; an error or an unparseable answer fails OPEN. */
export async function judgeSourceability(subjects = [], { judge = defaultJudge, sure = SOURCEABLE_SURE, log = () => {} } = {}) {
  if (!Array.isArray(subjects) || !subjects.length) return { ok: true, verdicts: [], denied: [], failedOpen: false };
  let raw = null;
  try { raw = await judge(subjects); } catch (e) { log(`  ◇ sourceability probe errored (${String(e?.message || e).slice(0, 80)}) — fails open`); return { ok: true, verdicts: [], denied: [], failedOpen: true }; }
  const verdicts = shapeVerdicts(raw, subjects);
  if (!verdicts.length) return { ok: true, verdicts: [], denied: [], failedOpen: true };
  const denied = sourceabilityDenies(verdicts, { sure });
  try { mkdirSync(join(HERE, "out", "_sourceability"), { recursive: true }); appendFileSync(join(HERE, "out", "_sourceability", "verdicts.jsonl"), JSON.stringify({ at: new Date().toISOString(), job: process.env.LEDGER_JOB || "", verdicts, denied: denied.map((d) => d.subject) }) + "\n"); } catch {}
  return { ok: !denied.length, verdicts, denied, failedOpen: false };
}
