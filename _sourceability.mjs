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
  `THE PAIR IS JUDGED TOO (owner 2026-09-17: "would a trail cam be very likely in everest? answer is probably no"): when the subjects include a capture FORM and a PLACE, also say whether that form is plausibly found at that place in real footage — a trail camera on Mount Everest, a doorbell camera in the Sahara: unlikely; CCTV in a shopping mall: likely. ⭐⭐ A NAMED SITE IS NEVER A HABITAT (owner 2026-09-22, drawing the line across the board): a form's footage accumulates at a KIND of place, never at one address. Dashcam footage of a bridge is likely; of a NAMED bridge it is not, however ordinary the form is on bridges. So a place the maker NAMED — a brand's premises, a particular building, a titled landmark, any one site — is answered UNLIKELY, and "likely" belongs to the kind alone. Judge the place exactly as it is named, never the kind behind it. The form and the place are then sourced as two photographs and composed, which costs nothing and always works, while one photograph carrying both is a search for something nobody took. ALWAYS give the place's bare KIND as an image query ("snowy mountain ridge"), whether the form is likely there or not: when it is unlikely the form is hunted as itself in that kind of place and the specific place is written, and when it is likely the kind is the ladder the hunt falls back to if the pairing yields no photograph of the form. ` +
  `A CAPTURE FORM IS SOURCED IN ITS OWN HABITAT, NEVER AT THE REQUEST'S PLACE (owner 2026-09-18: "either it doesnt understand what determines 'trail cam' style or something else" — it understood the look and rejected every ordinary photograph; what did not exist was the SUPPLY). For a subject that is a FORM, "query" is where that form's footage is ABUNDANT: the places and subjects it is actually made of — a trail camera is forests, deer and bears at night; a security camera is shops, forecourts and hallways; a dashcam is roads. It is NEVER the place this request names, and never that place's kind: there is almost no trail-camera footage of any mountain, so a form-at-place query returns ordinary photographs of the place and a form-at-kind query returns the same. The place is sourced as ITSELF, separately, and the two photographs are composed. ` +
  `A THING THE MAKER NAMED IS PHOTOGRAPHED AS ITSELF (owner 2026-09-18: the tsunami "must be sourced for sure"; a photographed thing is installed on the host photograph by replacement, water replaces water): a subject with role "thing" is an object or a phenomenon the request shows — a tsunami, a wildfire, a flood, a sandstorm, a crowd, a wreck, an animal as a thing. It is SOURCEABLE when real photographs of it exist, kind "thing", with its bare image query ("tsunami wave", "wildfire front"); a thing that cannot be photographed (a feeling, a style, an invented object) is NOT sourceable and is written. A person, a vehicle the maker rides, a named work's character and the capture form are never things. ` +
  `A PLACE ANOTHER SUBJECT'S PHOTOGRAPH ALREADY HOLDS IS NOT PHOTOGRAPHED TWICE (owner 2026-09-18: "the open ocean as the place, is that its own image? no — we either source the water of the tsunami or grab it from the pov"): when a listed thing is a state or an event OF a listed place (a tsunami of the ocean, a wildfire of the forest, an avalanche of the mountainside, a flood of the street), the thing's photograph holds that place; and when the maker's own craft travels ON the place (a boat on the sea, a car on the road, skis on the snow), the seat photograph shot from aboard it holds the place. Say so in "held_by": the subject whose photograph holds this place (the thing's own subject, or the word "seat"), else null. ⭐⭐ THE SEAT HOLDS A MEDIUM, NEVER A NAMED PLACE: what a craft travels through is the same thing anywhere — water, road, snow, air — and a photograph from aboard holds it because there is nothing else to it. A place that has a NAME is known by what stands AT it, its sign, its frontage, its building, and the seat photograph is hunted for the form and never for those, so it cannot hold one however literally the craft travels on it. A named place stays its own photograph. A place with a look of its own that neither holds (a harbour, a reef, a coastal town, a mountain pass) stays its own photograph. ` +
  `A PLACE'S OWN PEOPLE (owner 2026-09-26): for a subject with role "world", "place" or "room", say whether this video, as the maker's words stage it, shows the place with the people who belong to it at that moment, apart from the story's own figures, who are always added: "peopled" true, false when it shows the place empty of them, null when either reads right. ` +
  `Judge each subject on its own. Return ONLY JSON {"pairs":[{"form":string,"place":string,"likely":boolean,"confidence":0..1,"place_kind":string}],"subjects":[{"subject":string,"sourceable":boolean,"reduction":[string],"written":[string],"inferred":boolean,"confidence":0..1,"kind":"named place|work|kind of place|form|thing|private specific|invented|specific moment|abstraction|other","query":string|null,"held_by":string|null,"peopled":true|false|null,"why":string}]} ` +
  `— "sourceable" is true when the subject can be photographed AS ITSELF; "reduction" lists the bare image queries for its photographable kind(s) when it cannot (NEVER empty: infer if you must, and set "inferred" true); "written" lists the style words and specifics that go to the prose rather than the search; "query" is the best bare image query when sourceable; "confidence" is how sure you are.`;

const _norm = (s) => String(s || "").replace(/\s+/g, " ").trim();
const _key = (s) => _norm(s).toLowerCase();
// ⭐⭐ "X-LIKE Y" IS AN ORDERED PREFERENCE, NOT A KIND (owner 2026-09-18: "everest-like mountains would be incorrect as the place,
// because the user is asking for everest or just snowy mountains with the same conditions as everest, perhaps hedging against the
// possibility that the engine can't source everest"). The maker names the place they want FIRST and supplies their own fallback in the
// same breath. Read as a kind, the hedge becomes the request: the pair judge is asked about mountains rather than about Everest and
// says a trail camera is likely there, the appropriation never fires, and the hunt spends itself on a pairing that does not exist.
// Read in order, X is hunted as itself (Everest is photographed constantly), and only if X cannot be sourced does Y stand in, in X's
// own conditions, with those conditions written into the prose either way.
// ⚠ SHAPE ONLY, AND THE CALLER RESOLVES. This says what the phrase LOOKS like; whether X is a real place is the resolver's answer,
// so likePlaceOf() acts only when X matches a venue the run already resolved. "a kitchen like grandma's" therefore changes nothing.
const LIKE_HYPHEN = /^(?:(.*?)\s)?([A-Za-z][\w'.]*(?:\s+[A-Za-z][\w'.]*)?)-like\s+(.+)$/;   // the prefix ends at a SPACE, so "snow-swept Everest-like" names Everest and not "swept Everest"
const LIKE_WORD = /^(.+?)\s+(?:like|resembling)\s+(?:a |an |the )?(.+)$/i;
/** { named, kind, conditions, phrase } for "X-like Y", "Y like X" and "Y resembling X"; null for an ordinary place noun. Pure. */
export function likeShape(noun = "") {
  const s = _norm(noun);
  if (!s) return null;
  let m = s.match(LIKE_HYPHEN);
  if (m) return { named: _norm(m[2]), kind: _norm(m[3]), conditions: _norm(m[1]), phrase: s };
  m = s.match(LIKE_WORD);
  if (m) return { named: _norm(m[2]), kind: _norm(m[1]), conditions: "", phrase: s };
  return null;
}
/** The ordered preference for a plan's place: the named place FIRST, its kind as the maker's own fallback, the conditions written.
 *  Acts only when the named half matches a venue the run resolved, and answers with that venue's canonical spelling. Pure. */
export function likePlaceOf(noun = "", plan = {}) {
  const sh = likeShape(noun);
  if (!sh || !sh.named) return null;
  const venues = (Array.isArray(plan?.world_clearance?.entities) ? plan.world_clearance.entities : [])
    .filter((e) => e && e.name && (!e.kind || /venue|place|landmark/i.test(String(e.kind)))).map((e) => String(e.name));
  const world = String(plan?.form?.world || "").trim();
  const pool = [...venues, ...(world ? [world] : [])];
  const hit = pool.find((v) => _key(v) === _key(sh.named) || _key(v).includes(_key(sh.named)) || _key(sh.named).includes(_key(v)));
  if (!hit) return null;
  const conditions = [sh.conditions, sh.kind].map((x) => _norm(x)).filter(Boolean).join(" ");
  return { named: _norm(hit), kind: _norm(sh.kind), conditions, phrase: sh.phrase, fallback: `${conditions} like ${_norm(hit)}`.replace(/\s{2,}/g, " ").trim() };
}
/** THE SUBJECTS THAT MUST BE PHOTOGRAPHED for this run — the world or its places, the rooms of a themed ride, the capture form by its bare
 *  words. Figures are never subjects: a figure is written or conjured, never a plate. Pure. */
// ⭐⭐ THE PAIR IS JUDGED ON THE MAKER'S OWN PLACE, NOT THE NOUN A REWRITE NARROWED IT TO (2026-09-18, job e6da6fa8). The maker
// wrote "everest-like mountains"; the brief's places field said "mountainside" and applyPlanShape takes the brief as
// authoritative, so the judge was asked whether a trail camera is likely at "a mountainside" and answered YES. It is. A trail
// camera on EVEREST is not, and the same judge said so at 95% the day before on the same maker's words. The likelihood flipped
// on which noun reached the judge. The qualified form is what the plan itself keeps for exactly this reason (qualifiedPlaces:
// "mountainside" → "snow-swept Everest-like mountainside"), and the world's own name is more specific still. Longest wins,
// because a narrower noun can only make a form MORE plausible and a false likely is the one that ships the wrong register.
/** THE MAKER'S THINGS (owner 2026-09-18: "it must be sourced for sure"): the request's own photographable nouns that are neither a place,
 *  a figure, the ride's vehicle, the capture form nor a person — read off the intent parse the planner already made (its terms with
 *  renders true, identifies_material false, rides_as_the_seat false). They are asked of the sourceability judge as role "thing", after
 *  the places, so a tsunami is a subject and not a word the writer is left to imagine. Pure. */
const _PERSON = /^(?:a |an |the )?(?:man|woman|person|people|guy|girl|boy|child|kid|rider|driver|pilot|tourist|couple|crowd of people|someone|figure)s?$/i;
export function makerThings(plan = {}, { device = "", ride = null } = {}) {
  const bare = (x) => _key(x).replace(/^(?:the|a|an)\s+/, "");
  const terms = (Array.isArray(plan?.world_clearance?.intent?.subjects) ? plan.world_clearance.intent.subjects : [])
    .filter((t) => t && t.term && t.renders !== false && t.identifies_material !== true && t.rides_as_the_seat !== true && t.is_the_event === true).map((t) => _norm(t.term));   // the resolver read the request and said this is the EVENT the video shows (owner 2026-09-18: "it depends on the plan"); an object in passing is written, never plated
  const places = new Set((Array.isArray(plan?.form?.places) ? plan.form.places : []).map(bare));
  const qualified = new Set(Object.values(plan?.form?.qualifiedPlaces || {}).map(bare));
  const figures = new Set((Array.isArray(plan?.figures) ? plan.figures : []).flatMap((f) => [f?.name, f?.source_term, f?.canonical_name, f?.promptRef]).filter(Boolean).map(bare));
  const vehicle = new Set([ride?.noun, ride?.craft, ride?.vehicle, ride?.seat?.vehicle, plan?.world_clearance?.intent?.subjects?.find?.((t) => t?.rides_as_the_seat)?.term].filter(Boolean).map(bare));   // craft = the maker's own hull word on a boat (the ride's noun is its camera)
  const form = bare(String(device || plan?.form?.mediaForm || "").replace(/\s*footage$/i, ""));
  const out = [];
  for (const t of terms) {
    const b = bare(t);
    if (!b || _PERSON.test(b) || places.has(b) || qualified.has(b) || figures.has(b) || vehicle.has(b)) continue;
    if (/\b(?:footage|video|recording|cam|camera|pov|cctv|bodycam|dashcam|trailcam)\b/i.test(b)) continue;   // a term that names a capture medium is the FORM, never a thing
    const _sq = (x) => x.replace(/[\s-]/g, "");
    if (form && (_sq(b).includes(_sq(form)) || _sq(form).includes(_sq(b)))) continue;
    if ([...places, ...qualified].some((pl) => pl === b || (pl.length >= 4 && b.includes(pl)))) continue;   // "ocean" is the place "open ocean"; but "tsunami" inside the qualified "ocean with a tsunami" is a THING, not that place
    if (!out.includes(t)) out.push(t);
  }
  return out.slice(0, 3);
}
export function sourceabilitySubjects({ plan = {}, world = [], device = "", ride = null, rawPrompt = "" } = {}) {
  // ⭐ THE BARE PLACE RIDES ON THE RECORD (2026-09-26, job 49f068b3): a place is ASKED with the world's name beside it ("picnic table (french park
  // picnic table)"), and the strike that removes a place the judge read as a thing matched the asked string against the bare place and never hit, so
  // the table was held twice (a cut slot and a thing plate). The strike reads this field, never the asked words.
  const out = []; const add = (subject, role, required = true, place = "") => { const k = _key(subject); if (!k || out.some((o) => _key(o.subject) === k)) return; out.push({ subject: _norm(subject), role, required, ...(place ? { place: _norm(place) } : {}) }); };
  const _qual = (p) => {
    // ⭐⭐ AN ORDERED PREFERENCE IS JUDGED ON ITS NAMED HALF (owner 2026-09-18): "everest-like mountains" asks for Everest first, so
    // the pair judge is asked about Everest. Its kind is the maker's own fallback and reaches the hunt as the reduction, not here.
    const pref = likePlaceOf(_norm(plan?.form?.qualifiedPlaces?.[p] || p), plan) || likePlaceOf(_norm(p), plan);
    if (pref) return pref.named;
    const q = _norm(plan?.form?.qualifiedPlaces?.[p] || "");
    const w = _norm(plan?.form?.world || "");
    const cand = [q, _norm(p)].filter(Boolean);
    const best = cand.sort((a, b) => b.length - a.length)[0] || _norm(p);
    // the world's own NAME rides along when neither form of the place carries it ("mountainside" says nothing of Everest)
    return w && !_key(best).includes(_key(w)) ? `${best} (${w})` : best;
  };
  const places = Array.isArray(plan?.form?.places) ? plan.form.places.filter(Boolean) : [];
  if (ride) {
    const title = ride?.world?.named ? _norm(ride.world.title) : "";
    if (title) add(ride.world.mode === "theme" ? `the world of ${title}` : title, "world");
    for (const p of places) add(title && ride.world.mode === "theme" ? `${title}: ${p}` : p, ride.world.mode === "theme" ? "room" : "place", true, p);
    if (ride.noun) add(`${ride.noun} POV footage`, "form");
    for (const t of makerThings(plan, { device, ride })) add(t, "thing", false);
  } else {
    if (device) add(/footage$/i.test(device) ? device : `${device} footage`, "form");
    for (const p of places) add(_qual(p), "place", true, p);
    if (!places.length) { const w = _norm(plan?.form?.setting || plan?.form?.world || world[0] || ""); if (w) add(w, "world"); }
    for (const t of makerThings(plan, { device, ride })) add(t, "thing", false);
  }
  return out.slice(0, 8);   // places and the form first, then up to three of the maker's things
}
/** The judge's answer shaped onto the subjects asked (a verdict for a subject never asked is dropped; an unjudged subject is absent, which never denies). Pure. */
export function shapeVerdicts(raw, subjects = []) {
  const arr = Array.isArray(raw?.subjects) ? raw.subjects : [];
  const out = [];
  for (const s of subjects) {
    const v = arr.find((x) => _key(x?.subject) === _key(s.subject)) || arr.find((x) => _key(x?.subject) && (_key(s.subject).includes(_key(x.subject)) || _key(x.subject).includes(_key(s.subject))));
    if (!v || typeof v.sourceable !== "boolean") continue;
    const c = Number(v.confidence); const reduction = (Array.isArray(v.reduction) ? v.reduction : []).map(_norm).filter(Boolean).slice(0, 3); const written = (Array.isArray(v.written) ? v.written : []).map(_norm).filter(Boolean).slice(0, 6);
    out.push({ subject: s.subject, ...(s.place ? { place: s.place } : {}), role: s.role, required: s.required !== false, sourceable: v.sourceable, reduction, written, inferred: v.inferred === true, confidence: Number.isFinite(c) ? Math.max(0, Math.min(1, c)) : 0, kind: _norm(v.kind || "other"), query: v.query ? _norm(v.query) : null, held_by: v.held_by ? _norm(v.held_by) : null, peopled: v.peopled === true ? true : v.peopled === false ? false : null, why: _norm(v.why).slice(0, 160) });
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
export function appropriationOf(pairs = [], sure = SOURCEABLE_SURE, { named = [], log = null } = {}) {
  // ⭐⭐ A NAMED PLACE IS UNLIKELY BY LAW, NOT BY OPINION (owner 2026-09-22: "Dashcam footage of a bridge is likely, of a famous bridge
  // is not. im drawing a clear distinction across the board"). Job 7c482091's judge answered likely at confidence 1 for a brand's own
  // parking lot, so the split never happened and one photograph was sent to carry both the register and the venue. The law is in the
  // question; this clamps it, because the owner drew it as a line rather than a leaning — and it clamps only toward the SPLIT, which
  // the appropriation makes free: two photographs always compose, one photograph of a named site in a named register may not exist.
  const isNamed = (p) => (Array.isArray(named) ? named : []).some((n) => n && _key(n) === _key(p?.place));
  const list = (Array.isArray(pairs) ? pairs : []).map((p) => {
    if (!p || p.likely !== true || !isNamed(p)) return p;
    if (log) log(`  ◇ the pair judge called "${p.form}" likely at "${p.place}" — a NAMED site is never a habitat, so the form and the place are sourced apart`);
    return { ...p, likely: false, confidence: Math.max(Number(p.confidence) || 0, sure), clamped: true };
  });
  return list.find((p) => p && p.likely === false && p.confidence >= sure && p.placeKind) || null;
}
/** THE REDUCTIONS: a subject that cannot be photographed as itself but HAS a photographable kind — the kind's queries lead the hunt, the specifics are
 *  written (owner 2026-09-11: "my late grandmother's kitchen in Leeds would become a kitchen query however. our moat stands"). Pure. */
export function sourceabilityReductions(verdicts = []) {
  return (Array.isArray(verdicts) ? verdicts : []).filter((v) => v && v.sourceable === false && Array.isArray(v.reduction) && v.reduction.length).map((v) => ({ subject: v.subject, role: v.role, kinds: v.reduction.slice(0, 3), written: Array.isArray(v.written) ? v.written : [], inferred: v.inferred === true, kind: v.kind }));
}
/** A PHOTOGRAPHABLE THING IS PHOTOGRAPHED; ONLY THE UNPHOTOGRAPHABLE IS WRITTEN (owner 2026-09-18, reversing the same day's
 *  "a thing is written, never hunted": "it must be sourced for sure … the tsunami would replace the prompted tsunami … water replaces
 *  water"). The judge answers a KIND per subject. A thing it calls SOURCEABLE becomes a THING PLATE — a photograph of the thing itself,
 *  hunted on its own, read for its element, installed on the host photograph at frame zero by replacement, and riding in the bag
 *  behind the place plate. A thing it cannot source stays written. Either way a thing leaves form.places and its vantage slot goes with
 *  it: a wave is never the story's second LOCATION and never a cut. Returns the plan's places, public places, qualified places and
 *  vantage slots with every thing removed, the things to write, and the plates to hunt. Pure. */
/** The image query for a thing: the judge's phrasing, with the subject's own head word prefixed when it is missing. Pure. */
export function thingQuery(subject = "", query = "") {
  const s = _norm(subject).replace(/^(?:the|a|an)\s+/i, ""), q = _norm(query || subject);
  const words = s.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2);   // any of the subject's own words present = the maker's word survived
  const kept = words.some((w) => new RegExp(`(?:^|[^a-z0-9])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i").test(q));
  return words.length && !kept ? `${s} ${q}`.replace(/\s+/g, " ").trim() : q;
}
/** A PLACE ANOTHER PHOTOGRAPH ALREADY HOLDS (owner 2026-09-18: "the open ocean as the place, is that its own image? id say no, we either source
 *  water of tsunami or grab it from pov"; job f8fa74dc bought the ocean twice beside a tsunami plate and the take showed two oceans). The judge
 *  names, per place, the subject whose photograph holds it: a sourceable THING the place is the ground of (the tsunami holds the ocean), or the
 *  SEAT the maker's own craft travels on (a boat holds the water). Only a photograph the run will actually have can hold a place — a thing the
 *  judge could not source holds nothing, and the place stays its own. → [{ place, by, kind: "thing"|"seat" }]. Pure. */
export function heldPlaces(verdicts = []) {
  const vs = Array.isArray(verdicts) ? verdicts : [];
  const same = (a, b) => { const x = _key(a).replace(/^(?:the|a|an)\s+/, ""), y = _key(b).replace(/^(?:the|a|an)\s+/, ""); return !!x && !!y && (x === y || (x.length >= 4 && y.length >= 4 && (x.includes(y) || y.includes(x)))); };
  const things = vs.filter((v) => v && /^thing$/i.test(String(v.kind || "").trim()) && v.sourceable === true);
  const forms = vs.filter((v) => v && (v.role === "form" || /^form$/i.test(String(v.kind || "").trim())));
  const out = [];
  for (const v of vs) {
    if (!v || !v.held_by) continue;
    // KINDS OF PLACE ONLY (job 1c70830a: the judge said "the world of The Simpsons is held by the seat"): the seat holds the ground a craft
    // travels on and a thing holds the place it is a state of — a WORK's world and a work's ROOM are never held by either.
    const role = String(v.role || ""), vk = String(v.kind || "").toLowerCase();
    if (!(role === "place" || (role === "world" && /kind of place/.test(vk)))) continue;
    // ⭐⭐ A NAMED PLACE IS NEVER HELD BY THE SEAT (owner 2026-09-22, job 7c482091). The judge answered held_by "seat" for a brand's own
    // parking lot, reasoning that the camera travels on it — literally true, and wrong: the rule exists for an unbounded medium that is
    // the same thing anywhere, and a named site is known by what stands at it, which the seat hunt never asks for. The place was then
    // never planned as its own photograph, the seat came back a stock picture of the device, and the location had to be sourced late.
    // The law is in the question above; this is the backstop, and it reads the judge's OWN word for the place, never our own guess.
    if (/^named place$/i.test(String(v.kind || "").trim()) && /^(?:the )?(?:seat|pov|craft|vehicle|seat photograph)$/i.test(_norm(String(v.held_by)))) continue;
    const by = String(v.held_by);
    const th = things.find((t) => same(t.subject, by));
    if (th) { out.push({ place: _norm(v.subject), by: _norm(th.subject), kind: "thing" }); continue; }
    if (/^(?:the )?(?:seat|pov|craft|vehicle|host|seat photograph)$/i.test(_norm(by)) || forms.some((f) => same(f.subject, by))) out.push({ place: _norm(v.subject), by: "seat", kind: "seat" });
  }
  return out;
}
export function thingVerdicts(verdicts = [], plan = {}, { seat = false } = {}) {
  const bare = (x) => String(x || "").toLowerCase().replace(/^(?:the|a|an)\s+/, "").replace(/\s+/g, " ").trim();
  const places = Array.isArray(plan?.form?.places) ? plan.form.places.slice() : [];
  const things = (Array.isArray(verdicts) ? verdicts : []).filter((v) => v && (/^thing$/i.test(String(v.kind || "").trim()) || String(v.role || "") === "thing"));
  const plates = [], written = [], gone = new Set();
  for (const v of things) {
    const isThing = /^thing$/i.test(String(v.kind || "").trim());
    if (!isThing) continue;   // a role-"thing" subject the judge read as a place or a work is not a thing
    const hit = places.find((p) => bare(p) === bare(v.place || v.subject));
    if (hit) gone.add(bare(hit));
    // THE THING QUERY KEEPS THE MAKER'S OWN WORD (owner 2026-09-19: "a big wave is different than tsunami, so it should have used tsunami in query"):
    // the judge composes the image query and may drift to a kind ("storm wave"); the subject's head word is prefixed whenever the query lost it.
    const _thing = v.place || v.subject;   // the thing's own words, never the world's name the question carried
    if (v.sourceable === true) { if (!plates.some((x) => bare(x.subject) === bare(_thing))) plates.push({ subject: _norm(_thing), query: thingQuery(_thing, v.query) }); }
    else if (!written.some((w) => bare(w) === bare(_thing))) written.push(hit || _norm(_thing));
  }
  // a place another photograph holds leaves the places and its slot exactly as a thing does (only the seat of a RIDE can hold one: `seat`)
  const held = heldPlaces(verdicts).filter((h) => h.kind === "thing" || seat);
  for (const h of held) { const hit = places.find((p) => bare(p) === bare(h.place) || (bare(p).length >= 4 && (bare(h.place).includes(bare(p)) || bare(p).includes(bare(h.place))))); gone.add(bare(hit || h.place)); }
  const keptPlaces = places.filter((p) => !gone.has(bare(p)));
  const publicPlaces = Array.isArray(plan?.form?.publicPlaces) ? plan.form.publicPlaces.filter((p) => !gone.has(bare(p))) : plan?.form?.publicPlaces;
  const qualifiedPlaces = plan?.form?.qualifiedPlaces && typeof plan.form.qualifiedPlaces === "object"
    ? Object.fromEntries(Object.entries(plan.form.qualifiedPlaces).filter(([k]) => !gone.has(bare(k)))) : plan?.form?.qualifiedPlaces;
  const vantage = Array.isArray(plan?.slots?.vantage)
    ? plan.slots.vantage.filter((sl) => ![...(sl?.queries || []), sl?.scope].some((q) => q && [...gone].some((g) => bare(q).includes(g)))) : plan?.slots?.vantage;
  return { places: keptPlaces, publicPlaces, qualifiedPlaces, vantage, written, plates, held, removed: [...gone].filter((g) => !held.some((h) => bare(h.place) === g || (g.length >= 4 && (bare(h.place).includes(g) || g.includes(bare(h.place))))) ) };
}
/** @deprecated the 2026-09-18 morning rule; kept for one release so an older import fails at review, not at runtime. */
export function writtenThings(verdicts = [], plan = {}) { const t = thingVerdicts(verdicts, plan); return { ...t, written: [...t.written, ...t.plates.map((p) => p.subject)] }; }
/** NO DENIAL (owner 2026-09-11: "even if nothing photographable, it must infer to produce. sometimes a prompt dont produce so we must fill in"). Kept as a
 *  function so the battery can pin that it returns nothing: a subject the judge could not reduce is INFERRED by the judge, and if it still came back
 *  empty the run proceeds with the planner's own queries — never a refusal for lack of a photograph. Pure. */
export function sourceabilityDenies() { return []; }
async function defaultJudge(subjects, context = "") {
  return providerJson([textPart(`${SOURCEABILITY_LAW}\n\nSubjects: ${JSON.stringify(subjects.map((s) => s.subject))}${context ? `\nContext: ${context}` : ""}`)], { tag: "sourceability", maxTokens: 6000, temperature: 0.1 });
}
/** One judge call for the run's subjects → { ok, verdicts, denied, failedOpen }. Never throws; an error or an unparseable answer fails OPEN. */
export async function judgeSourceability(subjects = [], { judge = defaultJudge, sure = SOURCEABLE_SURE, log = () => {}, context = "" } = {}) {
  if (!Array.isArray(subjects) || !subjects.length) return { ok: true, verdicts: [], reductions: [], pairs: [], denied: [], failedOpen: false };
  let raw = null;
  try { raw = await judge(subjects, String(context || "")); } catch (e) { log(`  ◇ sourceability probe errored (${String(e?.message || e).slice(0, 80)}) — fails open`); return { ok: true, verdicts: [], reductions: [], denied: [], failedOpen: true }; }
  const verdicts = shapeVerdicts(raw, subjects);
  if (!verdicts.length) return { ok: true, verdicts: [], reductions: [], denied: [], failedOpen: true };
  const denied = sourceabilityDenies(); const reductions = sourceabilityReductions(verdicts);   // never a denial — a subject with no kind is inferred, and an empty answer leaves the planner's queries in place
  const pairs = shapePairs(raw, subjects);
  try { mkdirSync(join(HERE, "out", "_sourceability"), { recursive: true }); appendFileSync(join(HERE, "out", "_sourceability", "verdicts.jsonl"), JSON.stringify({ at: new Date().toISOString(), job: process.env.LEDGER_JOB || "", verdicts, reductions, pairs, denied: denied.map((d) => d.subject) }) + "\n"); } catch {}
  return { ok: !denied.length, verdicts, reductions, pairs, denied, failedOpen: false };
}
