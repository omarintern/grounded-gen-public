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

// ⭐⭐ A KIND KEEPS ITS SUBJECT'S IDENTITY (owner 2026-10-01, job 159434cb: "a ufo is not a spaceship per say, its an alien ufo"; "spaceship completely
// departs from ufo so thats an issue, and so whether its translating to adjacent things or general version of a thing is something we need to look into").
// The reduction turned "ufo bar interior" into "bar interior" + "spaceship interior": a neighbouring thing, not the UFO broader, and the hunt and its
// retries walked on to "nasa spaceship interior". One law, worded with both reviews (the reviewer 5.5, the reviewer 5.1), read by the judge and by the improviser
// (_adaptive_source.mjs). Declared above SOURCEABILITY_LAW, which reads it. Owner, same day: "a user doesnt always identify what they want so sometimes
// it needs to be inferred, so sometimes its works against us to assume the identity of a thing as a given" — so identity binds what the maker NAMED,
// and where their words leave the thing open the kind is inferred (the law's INFERRED, said so), a neighbour included.
export const KIND_IDENTITY_LAW =
  `\u2b50\u2b50 A KIND KEEPS WHAT THE MAKER NAMED. The maker names a thing when their word picks out one kind a person would recognise in a photograph; their words leave it open when several different kinds would answer them. A named thing's kind is that thing as a photograph shows it: a person shown the photograph names what it shows by the maker's own word. Its query says it in the maker's own words, their slang and their descriptors included: a word may join them to keep it what it is (a built form a camera has stood before: made as a set, a full-size replica or exhibit of it, a building made in its shape; a word that keeps it a place), never replace them. Where nothing is photographed in the maker's words, the run falls back to the bare kind (those words without their descriptors) on its own. Where the maker's words leave the thing open, the kind is INFERRED: the most photographable thing that fits what they said, with "inferred" set true, and there a neighbouring thing is a fair reading. A neighbour that shares only a look, a category or a use stands in for a named thing only when neither it nor any built form of it is photographed, and then "inferred" is set true. Where a demand holds two things, each keeps its own kind: two photographs. Each kind is a PLACE or a THING the scene holds; the scene's people and creatures are conjured into the place. `;

/** THE IMPROVISER'S FORM OF THE LAW (the reviewer review, 2026-10-01): it sees the scene and the place, never the maker's raw words, so the named-or-open
 *  question was settled upstream (the judge's "inferred", carried as PLACE_INFERRED) and it is told which. Beside the judge's law, so the two cannot drift. Pure. */
export const placeIdentityLaw = (place, inferred = false) => place
  ? `THE PLACE KEEPS ITS IDENTITY: a person shown the photograph calls it "${place}". Its queries say it in these words: a word may join them (a built form a camera has stood before: a set, a full-size replica or exhibit, a building in its shape; a word that keeps it this place), never replace them; when they find nothing, its bare kind (these words without their descriptors). A neighbour that shares only a look, a category or a use is a different place. ${inferred ? `"${place}" was read from open words: once every way of saying it has failed, another reading of the scene is fair.` : `"${place}" is what the maker asked for: every attempt is still a photograph of it.`}`
  : "";

// ⭐⭐ WHICH KIND HOSTS (owner 2026-10-01: "appropriation is first", "themed version is fallback", and "the two-photo split depends on which is most
// appropriate ... if not a form gen then appropriation is instead dependant on factors that determine which enters which"). Worded with both reviews
// (the reviewer 5.1's wording, the reviewer 5.5's "together" field): the camera and the bodies decide the host and the maker's grammar reads it; supply is the run's
// ladder (the roles swap, then the place built as both, then the host alone), never the judge's decision. Declared above SOURCEABILITY_LAW, which reads it.
export const HOST_RULE =
  `\u2b50\u2b50 WHEN A SUBJECT REDUCES TO MORE THAN ONE KIND, SAY WHICH HOSTS. The HOST is the kind whose space the maker's words put the camera and the bodies in: a place with floor, standing room and a way in. Every other kind ENTERS the host's photograph: as a PLACE when it is a room, a shell or a ground whose surfaces and signature pieces take the host's walls, ceiling, windows, lights and fixtures (a shell around the room, a view beyond it, the ground under it); as a THING when it is one object or fixture that stands in the host where one of the host's own pieces stood. The maker's grammar decides: in "X in Y" the camera stands in X and Y is its shell; in "Y with X in it" the camera stands in Y and X is a thing in it. A kind that is an object, a finish or a view never hosts. "host" names the hosting kind's query; "enters" lists each other kind as "place" or "thing"; "identity" gives, for each kind in "reduction" and in its order, the maker's own word for it, the word a person shown its photograph would use. Every query in "reduction" is one bare image phrase for one kind. ` +
  `\u2b50\u2b50 THE OPENING FRAME IS THE PLACE A VIDEO MODEL COULD LEAST DRAW (owner 2026-10-02). "opens" names a kind only when one kind is an extraordinary place, one few photographs show and a video model draws badly from words (a submarine's hull, a volcano's crater, the surface of another planet, the bottom of the sea), and another is an everyday place (a kitchen, an office, a bedroom, a café, a beach, a forest, a park, a street): then "opens" is the extraordinary kind, whatever the grammar, and the everyday place is put into its photograph by its signature pieces. Otherwise "opens" is null: two everyday places, two extraordinary ones, or a view (a view never opens). `;

export const SOURCEABILITY_LAW =
  `You decide, BEFORE any image search is run, what REAL PHOTOGRAPH(S) can ground each subject. The platform grounds every video on real photographs and WRITES the specifics into them; nothing is ever refused for lack of a photograph — a subject that no query yields as itself is REDUCED to its photographable KIND(S), and a subject with no visible kind is INFERRED into the scene that would depict it. ` +
  `SOURCEABLE AS ITSELF: a named real place with public photographs (a landmark, a public building, a chain, a stadium — including an official-only interior such as an office of state, which press and official photographs cover); the world of a named film, show or game (its own frames exist); a KIND of place or scene (a medieval bedchamber, a diner at night, a subway car, an office interior); a capture form by its bare words (security camera footage, dashcam footage, a rollercoaster POV); an animal or species, a vehicle, a common object. ` +
  `REDUCED TO ITS KIND(S): a private or unknown specific ("my late grandmother's kitchen in Leeds" → a domestic kitchen; the grandmother's things are written); an invented place ("the kitchen of a wizard on the moon" → a kitchen AND the moon's surface, two photographs; the wizard's things written); a specific moment ("the second a stranger's dog sneezed in 2019" → a living room; the dog and its sneeze are the story, added and written). ` +
  KIND_IDENTITY_LAW +
  HOST_RULE +
  `EVERY PHOTOGRAPHABLE NOUN OF A DEMAND IS ITS OWN KIND, and a STYLE is never sourced, only written: "the moon in retrograde style with tall buildings" → the moon AND tall buildings, two photographs, "retrograde style" written into the prose — a style is not a specific appropriation. ` +
  `\u2b50\u2b50 A QUALITY OF A PLACE IS ITS OWN LOOK, SEARCHED AND NEVER WRITTEN (owner 2026-10-02: "we dont prompt for qualities, especially qualities of places. we'd search dreamy forest"): a word the maker attaches to a place noun, a feeling included ("a dreamy forest", "a foggy pier", "an abandoned mall"), is that place's look and part of its query, and a kind of place said with its qualities is sourceable as the maker said it. A STYLE is what the maker names as the whole video's rendering ("in retrograde style", a medium, black and white). ` +
  `INFERRED: a pure abstraction or a subject that is nothing but a description, with no place noun of its own ("the feeling of a Tuesday afternoon" → a quiet living room in flat afternoon light; "the concept of debt" → a kitchen table covered in opened envelopes) — infer the most photographable scene that would depict it, and say so. ` +
  `A pairing is NOT judged as one photograph: the place is sourced and the actor is written, so "a penguin in the Oval Office" is the Oval Office, sourceable. ` +
  `THE PAIR IS JUDGED TOO (owner 2026-09-17: "would a trail cam be very likely in everest? answer is probably no"): when the subjects include a capture FORM and a PLACE, also say whether that form is plausibly found at that place in real footage — a trail camera on Mount Everest, a doorbell camera in the Sahara: unlikely; CCTV in a shopping mall: likely. ⭐⭐ A NAMED SITE IS NEVER A HABITAT (owner 2026-09-22, drawing the line across the board): a form's footage accumulates at a KIND of place, never at one address. Dashcam footage of a bridge is likely; of a NAMED bridge it is not, however ordinary the form is on bridges. So a place the maker NAMED — a brand's premises, a particular building, a titled landmark, any one site — is answered UNLIKELY, and "likely" belongs to the kind alone. Judge the place exactly as it is named, never the kind behind it. The form and the place are then sourced as two photographs and composed, which costs nothing and always works, while one photograph carrying both is a search for something nobody took. ALWAYS give the place's bare KIND as an image query ("snowy mountain ridge"), whether the form is likely there or not: when it is unlikely the form is hunted as itself in that kind of place and the specific place is written, and when it is likely the kind is the ladder the hunt falls back to if the pairing yields no photograph of the form. ` +
  `A CAPTURE FORM IS SOURCED IN ITS OWN HABITAT, NEVER AT THE REQUEST'S PLACE (owner 2026-09-18: "either it doesnt understand what determines 'trail cam' style or something else" — it understood the look and rejected every ordinary photograph; what did not exist was the SUPPLY). For a subject that is a FORM, "query" is where that form's footage is ABUNDANT: the places and subjects it is actually made of — a trail camera is forests, deer and bears at night; a security camera is shops, forecourts and hallways; a dashcam is roads. It is NEVER the place this request names, and never that place's kind: there is almost no trail-camera footage of any mountain, so a form-at-place query returns ordinary photographs of the place and a form-at-kind query returns the same. The place is sourced as ITSELF, separately, and the two photographs are composed. ` +
  `A THING THE MAKER NAMED IS PHOTOGRAPHED AS ITSELF (owner 2026-09-18: the tsunami "must be sourced for sure"; a photographed thing is installed on the host photograph by replacement, water replaces water): a subject with role "thing" is an object or a phenomenon the request shows — a tsunami, a wildfire, a flood, a sandstorm, a crowd, a wreck, an animal as a thing. It is SOURCEABLE when real photographs of it exist, kind "thing", with its bare image query ("tsunami wave", "wildfire front"); a thing that cannot be photographed (a feeling, a style, an invented object) is NOT sourceable and is written. A person, a vehicle the maker rides, a named work's character and the capture form are never things (a character's EFFIGY is: a statue, an animatronic or a puppet of it, named as such, for a work without frames). On a ride the way itself, the track, the rails, the coaster train, the ride car, is the seat photograph's own and never a thing. ` +
  `A PLACE ANOTHER SUBJECT'S PHOTOGRAPH ALREADY HOLDS IS NOT PHOTOGRAPHED TWICE (owner 2026-09-18: "the open ocean as the place, is that its own image? no — we either source the water of the tsunami or grab it from the pov"): when a listed thing is a state or an event OF a listed place (a tsunami of the ocean, a wildfire of the forest, an avalanche of the mountainside, a flood of the street), the thing's photograph holds that place; and when the maker's own craft travels ON the place (a boat on the sea, a car on the road, skis on the snow), the seat photograph shot from aboard it holds the place. Say so in "held_by": the subject whose photograph holds this place (the thing's own subject, or the word "seat"), else null. ⭐⭐ THE SEAT HOLDS A MEDIUM, NEVER A NAMED PLACE: what a craft travels through is the same thing anywhere — water, road, snow, air — and a photograph from aboard holds it because there is nothing else to it. A place that has a NAME is known by what stands AT it, its sign, its frontage, its building, and the seat photograph is hunted for the form and never for those, so it cannot hold one however literally the craft travels on it. A named place stays its own photograph. A place with a look of its own that neither holds (a harbour, a reef, a coastal town, a mountain pass) stays its own photograph. ` +
  `A NAMED WORK WITHOUT FRAMES IS GROUNDED BY ITS MATERIAL CANON (owner 2026-09-27, the Odyssey ride): a poem, a myth, a novel never filmed, a painting or a piece of music has no frames to photograph, so its world is carried by the REAL OBJECTS that carry it in the world — the artifacts, replicas, sculptures, effigies, editions and stagings a camera has stood before — each a THING photographed as itself (a museum's Greek vase, a replica warship, a statue of the giant), and the things the planner derived from such a work are the work's own, never inventions. A canon thing's query names the object, never a medium word (illustration, painting, drawing) and never the room or the museum that houses it. ` +
  `A PLACE'S PEOPLE (owner 2026-09-26; 2026-10-02: a photograph's people are swapped for the story's figures, which renders better than figures added to an empty place): for a subject with role "world", "place" or "room", say whether this video, as the maker's words stage it, shows the place with people in it at that moment, the story's own figures counted: "peopled" true when the words fill it with people of any kind, or it is a place people fill at that moment by its nature; false when the words stage it empty (closed, abandoned, after hours) or put the figure alone in it; null when either reads right. ` +
  `Judge each subject on its own. Return ONLY JSON {"pairs":[{"form":string,"place":string,"likely":boolean,"confidence":0..1,"place_kind":string}],"subjects":[{"subject":string,"sourceable":boolean,"reduction":[string],"written":[string],"inferred":boolean,"confidence":0..1,"kind":"named place|work|kind of place|form|thing|private specific|invented|specific moment|abstraction|other","query":string|null,"held_by":string|null,"peopled":true|false|null,"host":string|null,"enters":[{"query":string,"as":"place|thing"}],"identity":[string],"opens":string|null,"why":string}]} ` +
  `— "sourceable" is true when the subject can be photographed AS ITSELF; "reduction" lists the bare image queries for its photographable kind(s) when it cannot (NEVER empty: infer if you must, and set "inferred" true); "written" lists what no photograph of the place shows (the story's own people and events, the video's rendering style), never a quality of the place; "query", when sourceable, says the place in the maker's own words, their slang and descriptors included ("the hood", "dreamy forest"): a word may join them to keep it a place ("ghetto hood"), never replace them; "host", "enters" and "identity" are answered when "reduction" holds more than one kind, else null and empty; "opens" is null unless the opening-frame clause above holds; "confidence" is how sure you are.`;

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
/** A NAMED WORK WITHOUT FRAMES (owner 2026-09-27): the clearance named a work, it is no set (no zones), and no shot set of its frames exists — a poem, a myth,
 *  a novel never filmed, a painting. Its world cannot be photographed as places; it is grounded by its material canon (canonThings). Pure. */
export function isWorkWithoutFrames(plan = {}) {
  const wc = plan?.world_clearance || {};
  // a WORK the maker's words identify (the resolver's search_kind), never any admitted entity: a venue, a landmark or a product is "named" too (the reviewer, the build check)
  const likeness = likenessOf(plan);   // a work named as a likeness of the maker's place dresses it: the canon applies as it does when the work is the world (owner 2026-09-28)
  const work = !!likeness || (Array.isArray(wc.intent?.subjects) ? wc.intent.subjects : []).some((s) => s && s.identifies_material === true && String(s.search_kind || "").toLowerCase() === "work");
  // …and one with no frames: not a set (zones), not broadcast (a film or show has its frames), not drawn (a cartoon has its cels), no shot set
  const venue = wc.chainVenue === true || (Array.isArray(wc.entities) ? wc.entities : []).some((e) => /^(?:venue|chain)$/i.test(String(e?.kind || "")));   // a venue or a chain has its own photographs (the reviewer: the Oval Office, Little Caesars, the Jungle Cruise admitted on the first cut)
  // …AND THE WORK MUST BE THE WORLD (the 2026-09-28 study: "a man reading moby dick on the subway" reads Moby-Dick as a material work; the book is read, the subway is the world):
  // the entity finder named it, or the pre-plan ride decision named the theme, or the subject rides as the seat, or the planner's own world names the work
  const _subs = Array.isArray(wc.intent?.subjects) ? wc.intent.subjects : [];
  const _bareN = (x) => String(x || "").toLowerCase().replace(/^(?:the|a|an)\s+/, "").replace(/[^a-z0-9]+/g, " ").trim();
  const _hay = _bareN([plan?.form?.world, plan?.world_theme?.work, plan?.slots?.world?.scope, ...(Array.isArray(plan?.slots?.world?.queries) ? plan.slots.world.queries : [])].filter(Boolean).join(" | "));
  const worldIsWork = !!likeness || wc.named === true || plan?._meta?.rideNamedPre === true || _subs.some((s) => s && s.identifies_material === true && String(s.search_kind || "").toLowerCase() === "work" && (s.rides_as_the_seat === true || [s.search_name, s.term].some((n) => { const b = _bareN(n).replace(/\s+(?:ride|dark ride|coaster|rollercoaster)$/, ""); return !!b && _hay.includes(b); })));
  // THE SUBJECT'S OWN RECORD ADMITS, NEVER THE PLAN'S `named` FLAG (owner 2026-09-27, the rerun 03e5671d: "the odyssey ride" in lower case resolved no world
  // entity, so `named` was false while the subject record still read search_kind "work" / "The Odyssey"; the flag counts entities, the record names the work)
  return work && worldIsWork && !venue && wc.isSet !== true && wc.broadcastOnly !== true && wc.drawn !== true && !(Array.isArray(plan?.slots?.world?.shotSet) && plan.slots.world.shotSet.length > 0);
}
/** The works the maker's words identify, by the resolver's own kind — never a figure the maker also named (workTitlesOf lists every identifying term, Stonks and Jack Torrance included). Pure. */
/** A WORK NAMED AS A LIKENESS OF THE MAKER'S OWN PLACE (owner 2026-09-28: "a person's home is like its in the oddysey or illiad? my point goes further than just dark rides"; "would it
 *  see home as the illiad as appropriation where it takes a home interior and prompts the replacements from illiad or odyssey plate(s)?" — yes): the place is the world and the work
 *  DRESSES it with things of its mosaic, installed on the place's own photograph by replacement. THE RECORD DECIDES (both reviewers, round 5: a word list over the prompt read
 *  "i'd like a man reading moby dick" as a likeness and missed "as if it's in"): the comprehension answers `dresses` per subject — the term of the place this thing lends its things
 *  to, or "" — and a record without the field (a plan from before 2026-09-28) names no likeness. Returns the work's name, or "". Pure. */
export function likenessOf(plan = {}) {
  const subs = (Array.isArray(plan?.world_clearance?.intent?.subjects) ? plan.world_clearance.intent.subjects : []).filter((s) => s && String(s.search_kind || "").toLowerCase() === "work" && (s.search_name || s.term));
  const d = subs.find((s) => String(s.dresses || "").trim());
  return d ? _norm(d.search_name || d.term) : "";
}
/** A LIKENESS PLAN'S WORLD IS THE PLACE (owner 2026-09-28, the Moments run: the planner wrote the world "the Moments 1974 film scene" with the kernel "Moments 1974 film", so the
 *  free index was asked about the film three times — a Beirette camera, baseball games, a Spokane skyline — while the paid index alone was asked for the room). When the record
 *  says a work dresses the place, the world's name, its queries, its kernel and its scope are the place; the work's name leaves them all. Mutates and returns { changed, place }. Pure. */
export function likenessPlanRepair(plan = {}) {
  const lk = likenessOf(plan); if (!lk) return { changed: false, place: "" };
  const subs = Array.isArray(plan?.world_clearance?.intent?.subjects) ? plan.world_clearance.intent.subjects : [];
  const sub = subs.find((s) => s && String(s.dresses || "").trim() && String(s.search_kind || "").toLowerCase() === "work") || {};
  const bare = (x) => String(x || "").toLowerCase().replace(/^(?:the|a|an)\s+/, "").replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
  const names = [...new Set([sub.search_name, sub.term, lk].map(bare).filter(Boolean))];
  const year = (String(sub.term || "").match(/\((\d{4})\)/) || [])[1] || "";
  const esc = (n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const MEDIUM = /\b(?:film|movie|series|show|scene|still|frame|footage)\b/;
  const placeNouns = new Set([plan?.slots?.world?.scope, ...(Array.isArray(plan.form?.places) ? plan.form.places : []), sub.dresses].map(bare).filter(Boolean));   // a title that is an ordinary place word ("Diner") is the PLACE where the planner listed it as one (the reviewer, round 6)
  const hasWord = (b, n) => new RegExp(`(?:^|\\s)${esc(n)}(?=\\s|$)`).test(b);
  // a phrase NAMES the work when it is the bare title (and the title is no place noun), or carries the title as whole words beside its year or a medium word: "Moments 1974 film scene" does, "diner interior" and "kitchen with a window" (the film It) do not
  const namesWork = (x) => { const b = bare(x); if (!b) return false; return names.some((n) => (b === n && !placeNouns.has(n)) || (hasWord(b, n) && ((year && hasWord(b, year)) || MEDIUM.test(b)))); };
  // the year and the medium words leave a phrase; the title leaves it unless it is a place noun; repeats collapse; what remains is the place's own words
  // (the reviewer, round 6: "Cinema Paradiso movie theater scene" must keep "movie theater", "Day for Night film set scene" its "film set"): a medium word leaves only when it IS the medium — followed by a
  // trailing word or the end — and scene/still/frame/footage leave only at the end
  const strip = (x, { keepScene = false } = {}) => {
    const trail = keepScene ? /^(?:still|frame|footage)$/ : /^(?:scene|still|frame|footage)$/, medium = /^(?:film|movie|series|show|tv)$/;
    let b = ` ${bare(x)} `; if (year) b = b.replace(new RegExp(`\\b${year}\\b`, "g"), " \u0000 ");   // the year leaves, its position remembered
    for (const n of names) if (!placeNouns.has(n)) b = b.replace(new RegExp(`(?:^|\\s)${esc(n)}(?=\\s|$)`, "g"), " \u0000 ");   // the title leaves, its position remembered
    const toks = b.split(/\s+/).filter(Boolean); const gone = toks.map((w) => w === "\u0000");
    for (let k = toks.length - 1; k >= 0; k--) if (!gone[k] && medium.test(toks[k]) && (k === toks.length - 1 || gone[k + 1] || trail.test(toks[k + 1]) || medium.test(toks[k + 1]))) gone[k] = true;   // a medium word leaves only when it IS the medium ("tv series scene" leaves whole; the reviewer, round 6)
    for (let k = 0; k < toks.length; k++) if (!gone[k] && trail.test(toks[k]) && (k === toks.length - 1 || gone[k - 1] || toks.slice(k + 1).every((_, m) => gone[k + 1 + m]))) gone[k] = true;   // scene/still/frame/footage leave at the end or beside what left
    const seen = new Set(); return toks.filter((w, k) => !gone[k] && !seen.has(w) && seen.add(w)).join(" ");
  };
  const w = plan.slots = plan.slots || {}; w.world = w.world || {};
  const scope0 = String(w.world.scope || "").trim(), places = Array.isArray(plan.form?.places) ? plan.form.places.map((p) => String(p || "").trim()).filter(Boolean) : [];
  const place = (scope0 && !namesWork(scope0) ? scope0 : "") || places.find((p) => !namesWork(p)) || strip(String(sub.dresses || ""), { keepScene: true }) || strip(String(plan.form?.world || ""));
  if (!place) return { changed: false, place: "" };
  let changed = false;
  plan.form = plan.form || {};
  if (namesWork(plan.form.world || "")) { plan.form.world = place; changed = true; }
  const qs0 = Array.isArray(w.world.queries) ? w.world.queries.map((q) => String(q || "").trim()).filter(Boolean) : [];
  const qs = []; for (const q of qs0) { const s = namesWork(q) ? strip(q) : q; if (s && !qs.some((x) => bare(x) === bare(s))) qs.push(s); }
  if (!qs.some((q) => bare(q) === bare(place) || bare(q).includes(bare(place)))) qs.unshift(place);
  if (JSON.stringify(qs) !== JSON.stringify(qs0)) { w.world.queries = qs; changed = true; }
  if (namesWork(w.world.kernel || "") || !String(w.world.kernel || "").trim() || names.includes(bare(w.world.kernel))) { w.world.kernel = place.split(/\s+/).slice(0, 6).join(" "); changed = true; }   // a kernel that is the title, even one that is a place word, becomes the place in its own words (the reviewer, round 6: "The Office")
  if (namesWork(scope0) || !scope0) { w.world.scope = place; changed = true; }
  return { changed, place };
}
export function workSubjectsOf(plan = {}) {
  const subs = Array.isArray(plan?.world_clearance?.intent?.subjects) ? plan.world_clearance.intent.subjects : [];
  const lk = likenessOf(plan), bare = (x) => String(x || "").toLowerCase().replace(/^(?:the|a|an)\s+/, "").replace(/[^a-z0-9]+/g, " ").trim();
  return [...new Set(subs.filter((s) => s && String(s.search_kind || "").toLowerCase() === "work" && (s.identifies_material === true || (lk && [s.search_name, s.term].some((n) => bare(n) === bare(lk))))).flatMap((s) => [s.search_name, s.term]).map((x) => _norm(x)).filter(Boolean))];
}
const _MEDIUM_WORD = /\b(?:illustrations?|paintings?|drawings?|depictions?|renders?|renderings?|artworks?|images?|pictures?|prints?|sketch(?:es)?)\b/gi;
const _HOUSING = /\s+(?:in|at|from)\s+(?:the\s+)?[^,;]*?\b(?:museum|gallery|galleries|collection|exhibit(?:ion)?|library|archive)\b.*$/i;   // "Homer bust in the British Museum" → "Homer bust" (the reviewer, round 3)
const _PLACE_TAIL = /\s+(?:at|in|near|on)\s+(?:the\s+)?[A-Z][\w'-]*(?:\s+[A-Z][\w'-]*)*\s*$/;   // "…ruins at Pylos" → "…ruins"
const _SITE_HEAD = /(?:^|\s)(?:ruins?|palace|temple|sanctuary|acropolis|island|city|harbou?r|coast|landscape|site)$/i;   // a site is a place by its HEAD noun ("Palace of Nestor ruins"), never a thing; "Cyclops cave diorama" and "bronze temple bell" are things (the reviewer, round 4)
const _BY_ARTIST = /\s+by\s+[A-Z][\w.'-]*(?:\s+[A-Z][\w.'-]*)*\s*$/;
const _OBJECT_WORD = /\b(?:animatronic|statue|sculpture|figure|effigy|puppet|mask|costume|doll|model|replica|prop|bust|relief|mannequin|carving|totem)\b/i;
const _CANON_KINDS = new Set(["pattern", "prop", "fixture", "signage", "architecture", "character"]);
/** THE WORK'S MATERIAL CANON AS THINGS (owner 2026-09-27: "theres always photographs that can be used"): for a named work without frames, the plan's
 *  world_elements are the work's own things — each hunted as a photograph of the object itself: a medium word leaves the name (a "pottery illustration"
 *  is hunted as the pottery), and a character of such a work is hunted as its effigy (a statue) unless its name already says what object it is. Up to
 *  three; the bag decides how many ride. Pure. */
export function canonEntries(plan = {}) {
  if (!isWorkWithoutFrames(plan)) return [];
  const _bareK = (x) => String(x || "").toLowerCase().replace(/^(?:the|a|an)\s+/, "").replace(/[^a-z0-9]+/g, " ").trim();
  const _works = workSubjectsOf(plan);
  const out = [];
  for (const e of (Array.isArray(plan?.world_elements) ? plan.world_elements : [])) {
    const kind = String(e?.kind || "").toLowerCase().trim();
    const raw = String(e?.name || "").replace(/\s+/g, " ").trim();
    let name = raw.replace(_HOUSING, "").replace(_PLACE_TAIL, "").replace(_BY_ARTIST, "").replace(_MEDIUM_WORD, " ").replace(/\s+/g, " ").replace(/\s+(?:of|on|in|with|by)\s*$/i, "").trim();
    if (!name || !_CANON_KINDS.has(kind)) continue;
    if (_SITE_HEAD.test(name)) continue;   // a place of the work is the places channel's, never a thing
    if (_works.some((w) => _bareK(w) === _bareK(name))) continue;   // a picture OF the work ("Odyssey illustration by Flaxman" → "Odyssey") is not an object of it
    if (/\b(?:stills?|posters?|screenshots?|screen ?grabs?|photos?|photographs?|scenes?|clips?|frames?|trailers?)\b/i.test(raw) && _works.some((w) => _bareK(raw).includes(_bareK(w)))) continue;   // a still or a poster OF the work is a picture, not an object, and carries its cast's faces (the reviewer, round 5)
    if (kind === "character" && !_OBJECT_WORD.test(name)) name = `${name} statue`;
    if (!out.some((x) => _key(x.name) === _key(name))) out.push({ name: _norm(name), kind });   // the kind rides with the name: a character's effigy is a figure of the world, never at frame zero
  }
  return out.slice(0, 3);
}
export const canonThings = (plan = {}) => canonEntries(plan).map((e) => e.name);
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
  // …and the material canon of a named work without frames rides as the work's own things (owner 2026-09-27), under the same exclusions
  for (const t of canonThings(plan)) {
    const b = bare(t);
    if (!b || _PERSON.test(b) || places.has(b) || qualified.has(b) || figures.has(b) || vehicle.has(b) || out.some((o) => bare(o) === b)) continue;
    out.push(t);
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
    const kindPair = v.sourceable === false ? shapeKindPair(v, reduction) : null;
    out.push({ subject: s.subject, ...(s.place ? { place: s.place } : {}), role: s.role, required: s.required !== false, sourceable: v.sourceable, reduction, written, inferred: v.inferred === true, confidence: Number.isFinite(c) ? Math.max(0, Math.min(1, c)) : 0, kind: _norm(v.kind || "other"), query: v.query ? _norm(v.query) : null, held_by: v.held_by ? _norm(v.held_by) : null, peopled: v.peopled === true ? true : v.peopled === false ? false : null, ...(kindPair ? { kindPair } : {}), why: _norm(v.why).slice(0, 160) });
  }
  return out;
}
/** THE HOST RULE'S ANSWER, matched onto the reduction's own queries (both reviews, 2026-10-01): the hosting kind, each other kind as a place or a thing,
 *  the one word each kind's queries keep (in the reduction's order), and the single photograph built as both. A host or an entering kind that names no
 *  listed kind is dropped, so a silent or stray answer leaves the lead kind hosting (fails open). Null under two kinds. Pure. */
export function shapeKindPair(v = {}, reduction = []) {
  const kinds = (Array.isArray(reduction) ? reduction : []).map(_norm).filter(Boolean);
  if (kinds.length < 2) return null;
  const match = (q) => { const k = _key(q); if (!k) return ""; return kinds.find((x) => _key(x) === k) || kinds.find((x) => _key(x).includes(k) || k.includes(_key(x))) || ""; };
  const host = match(v?.host) || null;
  const enters = [];
  for (const e of (Array.isArray(v?.enters) ? v.enters : [])) {
    const q = match(typeof e === "string" ? e : e?.query);
    if (!q || q === host || enters.some((x) => x.query === q)) continue;
    enters.push({ query: q, as: String(e?.as || "").toLowerCase().trim() === "thing" ? "thing" : "place" });
  }
  const identity = (Array.isArray(v?.identity) ? v.identity : []).slice(0, kinds.length).map((w) => _norm(w).slice(0, 32));
  const opens = match(v?.opens) || null;   // the place a video model could least draw, when the judge named one (owner 2026-10-02)
  return { host, enters, identity, opens };   // the place built as both is never the judge's (the run words it: kindPairPlan)
}
/** A KIND'S NAME FOR THE WORDS (both build checks): its query without the built-form words a search needs ("UFO interior set or replica" → "UFO
 *  interior"), for a writer or an improviser that is told what a photograph is, never how it was searched. Pure. */
export function kindName(q = "") {
  const BF = "(?:set|replica|exhibit|model|mock[- ]?up)";
  const s = _norm(q), out = s
    .replace(/\b(?:full|life)[- ]size\b/gi, " ")
    .replace(new RegExp(`\\b${BF}\\s+or\\s+${BF}\\b`, "gi"), " ")                 // "set or replica": the search's alternatives
    .replace(/\b(?:replica|exhibit|mock[- ]?up)\b(?:\s+of(?:\s+(?:a|an|the))?)?/gi, " ")   // a built form's own word ("replica of a ...")
    .replace(/^\s*of\s+(?:a|an|the)\s+/i, "").replace(/\s+/g, " ").trim();
  return out || s;
}
/** two words are one word, plural-blind both ways ("house"/"houses", "bus"/"buses", "store"/"stores", "city"/"cities"; the reviewer, build check: a stripped "s" made "hous"). Pure. */
export const sameWord = (a, b) => { const x = String(a || "").toLowerCase(), y = String(b || "").toLowerCase();
  const ies = (p, q) => p.length > 2 && p.endsWith("y") && `${p.slice(0, -1)}ies` === q;   // city/cities, factory/factories (the reviewer, second check)
  return !!x && !!y && (x === y || `${x}s` === y || `${x}es` === y || `${y}s` === x || `${y}es` === x || ies(x, y) || ies(y, x)); };
const _wordsOf = (s) => String(s || "").toLowerCase().match(/[a-z0-9]+/g) || [];
/** TWO SPELLINGS OF ONE WORD, for joining a maker's word to the name a planner gave the same figure, never for a search (both build checks, 2026-10-02):
 *  plural-blind (sameWord, and elf/elves), a shared five-letter root (mantid, mantis), or one vowel apart at the same length (grey, gray). Pure. */
export const likeWord = (a, b) => { const x = String(a || "").toLowerCase(), y = String(b || "").toLowerCase();
  if (!x || !y) return false;
  if (sameWord(x, y)) return true;
  const sing = (w) => [w, ...(w.length > 3 && w.endsWith("s") ? [w.slice(0, -1)] : []), ...(w.length > 4 && w.endsWith("ves") ? [`${w.slice(0, -3)}f`, `${w.slice(0, -3)}fe`] : [])];
  const vowelApart = (p, q) => p.length >= 4 && p.length === q.length && [...p].filter((c, i) => c !== q[i]).length === 1 && [...p].every((c, i) => c === q[i] || (/[aeiouy]/.test(c) && /[aeiouy]/.test(q[i])));
  return sing(x).some((p) => sing(y).some((q) => p === q || (p.length >= 5 && q.length >= 5 && p.slice(0, 5) === q.slice(0, 5)) || vowelApart(p, q))); };
/** every word of `phrase` stands in `text` as a whole word, plural-blind ("barn" and "barbershop" are not the bar). Pure. */
export const saysAll = (text, phrase) => { const t = _wordsOf(text), p = _wordsOf(phrase); return p.length > 0 && p.every((w) => t.some((x) => sameWord(x, w))); };
/** THE MAKER'S WORD IN THE KIND'S OWN FRAME (owner 2026-10-02: "reproduce but not require"; both design checks): when the judge worded a kind without the
 *  maker's own word, one search says it in that word, beside the judge's. The word must be the MAKER'S (it appears in their own words, whole and plural-blind,
 *  so a judge's synonym never passes for it), and the search keeps the kind's own frame: its frame word ("ufo interior"), else the word before the kind, the
 *  kind's own words said once ("moon crater field", "pirate ship deck", "club dance floor": a head noun is the kind, never a frame; the reviewer, build check).
 *  "" when the kind already says it, when the word is generic ("room"), when it is a place the run hunts as named (`named`: the preference ladder leads with
 *  a proper noun; the reviewer, build check), or nothing qualifies. Pure. */
const _FRAME_WORD = new Set(["interior", "exterior", "inside", "outside", "view"]);
const _GENERIC_ID = new Set(["interior", "exterior", "inside", "outside", "view", "room", "place", "area", "space", "scene", "setting", "background", "surface"]);
export function makerWordSearch(query = "", identity = "", makerWords = "", named = []) {
  const q = _norm(query), id = _norm(identity).toLowerCase().replace(/^(?:the|a|an)\s+/, "");
  if (!q || !id || id.split(/\s+/).length > 3) return "";
  const idW = _wordsOf(id);
  if (!idW.length || idW.every((w) => _GENERIC_ID.has(w))) return "";                    // a generic word names no kind (both build checks)
  if (!saysAll(makerWords, id)) return "";                                                 // the maker's own word, never the judge's
  if (saysAll(q, id)) return "";                                                           // the kind already says it
  if ((Array.isArray(named) ? named : []).some((n) => saysAll(n, id))) return "";          // a proper noun is hunted as named
  const frame = [...new Set(_wordsOf(q).filter((w) => _FRAME_WORD.has(w)))];
  if (frame.length) return `${id} ${frame.join(" ")}`;
  const rest = q.split(/\s+/).filter((tok) => !idW.some((w) => sameWord(w, tok.toLowerCase().replace(/[^a-z0-9]/g, ""))));
  return `${id} ${rest.join(" ")}`.trim();
}
/** THE MAKER'S OWN WORDS FOR A PLACE (owner 2026-10-02: "hood is not inner city neighborhood, its the hood or ghetto hood"): the first of `candidates` (the
 *  parse's qualified opening place, then its setting) whose every content word is the maker's, its article or possessive dropped; "" when none is. A
 *  rewording is never the maker's phrase, and one word of the maker's is not enough (both design checks). Pure. */
const _FUNCTION_W = new Set(["the", "a", "an", "of", "in", "on", "at", "to", "and", "or", "with", "by", "for", "from", "into", "my", "our", "your", "his", "her", "their", "its"]);
export function makersPlacePhrase(candidates = [], makerWords = "") {
  for (const c of (Array.isArray(candidates) ? candidates : [])) {
    const p = _norm(c).replace(/^(?:(?:the|a|an|my|our|your|his|her|their|its)\s+)+/i, "");
    const content = _wordsOf(p).filter((w) => !_FUNCTION_W.has(w));
    if (content.length && content.every((w) => saysAll(makerWords, w))) return p;
  }
  return "";
}
/** THE MAKER'S OWN WORDS FOR THE OPENING PLACE, read from the parse's records (owner 2026-10-02; both quick checks): its qualified phrase; else the setting,
 *  when it is about the opening place (it shares a word with it) or the judge's own query for the opening says its head noun; else a qualified phrase whose
 *  head noun that query says, never a later place's (the 10-02 study: the planner renamed the maker's "the hood" to "street corner", and the parse filed it
 *  under its own "neighborhood"; the judge's query "hood street corner" says "hood"). Only a record whose every word is the maker's (makersPlacePhrase). Pure. */
/** a place's matching key, and two places matched by key or inclusion (as placeSpecFor matches one): one reader for the run and this module (the reviewer). Pure. */
export const placeKey = (x) => String(x || "").toLowerCase().replace(/^(?:the|a|an)\s+/, "").replace(/[^a-z0-9]+/g, " ").trim();
export const samePlace = (a, b) => { const x = placeKey(a), y = placeKey(b); return !!x && !!y && (x === y || x.includes(y) || y.includes(x)); };
export function openingPlacePhrase({ places = [], setting = "", qualified = {}, judgeQuery = "", makerWords = "" } = {}) {
  const ps = Array.isArray(places) ? places : [], open = String(ps[0] || ""), later = ps.slice(1), q = (qualified && typeof qualified === "object") ? qualified : {};
  const head = (x) => { const w = placeDescriptors(x, ""); return w[w.length - 1] || ""; };
  const heard = (x) => !!judgeQuery && !!head(x) && saysAll(judgeQuery, head(x));
  const about = !open || placeDescriptors(setting, "").some((w) => saysAll(open, w)) || heard(setting);
  const agrees = (Object.entries(q).find(([k, v]) => heard(v) && !later.some((l) => samePlace(l, k) || samePlace(l, v))) || ["", ""])[1];
  return makersPlacePhrase([q[open], about ? setting : "", agrees], makerWords);
}
/** The maker's descriptors of a place: the words of their phrase the bare kind does not say ("dreamy" of "dreamy forest" for "forest"). Pure. */
export const placeDescriptors = (phrase = "", kind = "") => _wordsOf(phrase).filter((w) => !_FUNCTION_W.has(w) && !saysAll(kind, w));
/** THE MAKER'S PLACE LADDER (owner 2026-10-02: "paid routes get those kinds of search, slang or semi-descriptive (dreamy forest is good). and there should
 *  be fallbacks such that dreamy forest with null results falls back to forest. the free library gets bare location as usual however"): a place's two searches say
 *  the maker's own words for it, then fall back to the same place without their descriptors; the free index keeps the bare place (the run's kernel). Over
 *  the run's two searches `qs`:
 *  - the first must say every content word of `phrase`, else the maker's words (`paid`, the judge's wording, when it says them all: "ghetto hood" for "hood";
 *    else the phrase) lead and the first follows; a first that asks for an actor stays first and the maker's words go second (`actorFirst`: a real subject
 *    already in its place wins, the 09-23 rule; the reviewer, build check);
 *  - a second that needs every descriptor becomes the bare place: the first of `bare` that is the phrase without some of its words (every word of it the
 *    phrase's, and fewer), never a planner's synonym ("urban neighborhood" is no bare form of "hood", which has none; the reviewer, build check).
 *  `wrap` puts a device form's words (and a dark scene's night words) on what it adds. The shape of a named place's ladder (named, then its kind) and a
 *  later place's (its descriptors, then its noun). null when nothing changes. Pure. */
/** The phrase's own bare place: the first of `bare` that is the phrase without some of its words (every word of it the phrase's, and fewer); "" when none
 *  is ("urban neighborhood" is no bare form of "hood", which has none). One reader for the ladder and for what its retries may count as the place (the reviewer,
 *  second check). Pure. */
export function phraseBare(phrase = "", bare = []) {
  const p = _norm(phrase), words = _wordsOf(p).filter((w) => !_FUNCTION_W.has(w));
  return (Array.isArray(bare) ? bare : [bare]).map((x) => _norm(x)).find((x) => {
    const bw = _wordsOf(x).filter((w) => !_FUNCTION_W.has(w));
    return bw.length > 0 && bw.length < words.length && bw.every((w) => saysAll(p, w));
  }) || "";
}
export function makerPlaceLadder(qs = [], { phrase = "", paid = "", bare = [], actorFirst = false, wrap = (x) => x } = {}) {
  const p = _norm(phrase), words = _wordsOf(p).filter((w) => !_FUNCTION_W.has(w));
  if (!words.length) return null;
  const says = (q) => words.every((w) => saysAll(q, w));
  const b0 = phraseBare(p, bare);
  const q0 = String(qs[0] || "").trim(), q1 = String(qs[1] || "").trim();
  let a = q0, b = q1, placed = false;
  if (!says(a)) {
    const lead = wrap(paid && says(paid) ? _norm(paid) : p);
    if (actorFirst && a) { b = lead; placed = true; } else { b = a || b; a = lead; }
  }
  if (!placed && b0 && (!b || says(b))) b = wrap(b0);
  return a === q0 && b === q1 ? null : [a, b];
}
/** THE LOCATION IS NEVER DROPPED (owner 2026-07-30), AND NEVER FORCED IN ONE WORD (owner 2026-10-02: "reproduce but not require"; the reviewer's design check): an
 *  improvised pair that names the place in either search (any one of `words`, whole and plural-blind) stands as written; a pair that names it in neither
 *  keeps its first search and makes its second the place itself, or, once the place itself was searched (`tried`), its second search with the place after
 *  it, so no attempt repeats a search (the 07-31 law: a reordering is the same search; the reviewer, build check). Nothing is glued onto a pair that names it.
 *  One search of the pair says the place's own words and the other stays free ("reproduce but not require"); a pair left as written once the place was
 *  searched would end the net, since every hunt's first attempt already searches the place itself. Pure. */
export function placePair(qs = [], { place = "", words = [], tried = [] } = {}) {
  const live = qs.filter(Boolean);
  if (!place || !words.length || !live.length || live.some((q) => words.some((w) => saysAll(q, w)))) return qs;
  const same = (a, b) => _wordsOf(a).sort().join(" ") === _wordsOf(b).sort().join(" ");
  const ran = (Array.isArray(tried) ? tried : []).some((t) => same(t, place));
  return [qs[0] || place, ran ? `${qs[1] || qs[0]} ${place}`.replace(/\s+/g, " ").trim() : place];
}
/** THE RUN'S PLAN FOR A REDUCED SUBJECT OF TWO KINDS OR MORE (the host rule): the host frame zero hunts, the one kind that enters as a PLACE (its own
 *  photograph: the bag holds one second place, so a further one is written), the kinds that enter as THINGS (thing plates), each kind's identity word and
 *  the place built as both. A judge that named no entering kind leaves every other kind entering as a place: two kinds are two photographs. Null when
 *  nothing enters. `kinds` are the reduction's place kinds (people already struck), `all` the reduction as the judge listed it. Pure. */
export function kindPairPlan({ kinds = [], all = [], host = "", pair = null, subject = "", phrase = "" } = {}) {
  const ks = (Array.isArray(kinds) ? kinds : []).map(_norm).filter(Boolean);
  const h = ks.find((k) => _key(k) === _key(host)) || ks[0] || "";
  if (ks.length < 2 || !h) return null;
  const order = (Array.isArray(all) ? all : []).map(_key);
  const idOf = (k) => { const i = order.indexOf(_key(k)); return i >= 0 ? _norm(pair?.identity?.[i] || "") : ""; };
  // the judge's entering kinds first; a kind it left out still enters as a place, never lost (the reviewer, build check)
  const judged = Array.isArray(pair?.enters) ? pair.enters.filter((e) => e && e.query) : [];
  const omitted = ks.filter((k) => _key(k) !== _key(h) && !judged.some((e) => _key(e.query) === _key(k))).map((k) => ({ query: k, as: "place" }));
  let enters = [...judged, ...omitted].filter((e) => _key(e.query) !== _key(h) && ks.some((k) => _key(k) === _key(e.query)));
  // ⭐⭐ THE OPENING KIND IS THE PLACE THAT ENTERS (owner 2026-10-02): marked opensPlace, so the run tries it as frame zero first and the host enters it as a
  // thing; left out of "enters" by the judge, it is still the place, so the fallback keeps it as the host's shell
  // …never a kind the judge entered as a THING ("a bar with a ufo in it": the craft parked inside is a thing; both build checks), as a view never opens
  const op = pair?.opens ? ks.find((k) => _key(k) === _key(pair.opens)) || "" : "";
  const opensPlace = !!op && _key(op) !== _key(h) && !judged.some((e) => _key(e.query) === _key(op) && e.as === "thing");
  // …and when the opening kind IS the judge's own host ("a ufo with a bar in it": the grammar already stands the camera in it), nothing swaps: the host is
  // hunted as frame zero with its full attempts, marked opensHost so its hunt is asked only for what names it; the everyday kind's furniture arrives with
  // that kind's own photograph (the reviewer, design check). The run never turns another kind into the host (the owner, 2026-10-02: "A kitchen with a fireplace in
  // it could end up hunting the fireplace is an issue"): code cannot tell a room entered as a thing from an object, so it never guesses.
  const opensHost = !!op && _key(op) === _key(h);
  if (opensPlace) enters = [{ query: op, as: "place" }, ...enters.filter((e) => _key(e.query) !== _key(op))];
  if (!enters.length) return null;
  const places = enters.filter((e) => e.as !== "thing"), things = enters.filter((e) => e.as === "thing");
  return { subject: _norm(subject), phrase: _norm(phrase), host: h, hostIdentity: idOf(h),
           place: places[0] ? { query: places[0].query, identity: idOf(places[0].query) } : null,
           things: things.map((e) => ({ query: e.query, identity: idOf(e.query) })),
           written: places.slice(1).map((e) => e.query),
           // the place built as both, the fallback only (owner: "themed version is fallback"), is worded HERE from the two kinds and never asked of the judge:
           // asking for it put "a themed venue exists" in front of the judge, which then called the whole place photographable as itself and never split it
           together: places[0] ? `${idOf(places[0].query) || kindName(places[0].query).replace(/\b(?:interior|exterior|inside|outside|room|view|surface)\b/gi, " ").replace(/\s+/g, " ").trim() || kindName(places[0].query)}-themed ${kindName(h)}` : null,   // the theme's own word, never "interior-themed" (the reviewer)
           judged: !!(pair && pair.host && _key(pair.host) === _key(h)), opensPlace, opensHost };
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
  return (Array.isArray(verdicts) ? verdicts : []).filter((v) => v && v.sourceable === false && Array.isArray(v.reduction) && v.reduction.length).map((v) => ({ subject: v.subject, ...(v.place ? { place: v.place } : {}), role: v.role, kinds: v.reduction.slice(0, 3), written: Array.isArray(v.written) ? v.written : [], inferred: v.inferred === true, kind: v.kind, kindPair: v.kindPair || null }));
}
/** A PHOTOGRAPHABLE THING IS PHOTOGRAPHED; ONLY THE UNPHOTOGRAPHABLE IS WRITTEN (owner 2026-09-18, reversing the same day's
 *  "a thing is written, never hunted": "it must be sourced for sure … the tsunami would replace the prompted tsunami … water replaces
 *  water"). The judge answers a KIND per subject. A thing it calls SOURCEABLE becomes a THING PLATE — a photograph of the thing itself,
 *  hunted on its own, read for its element, installed on the host photograph at frame zero by replacement, and riding in the bag
 *  behind the place plate. A thing it cannot source stays written. Either way a thing leaves form.places and its vantage slot goes with
 *  it: a wave is never the story's second LOCATION and never a cut. Returns the plan's places, public places, qualified places and
 *  vantage slots with every thing removed, the things to write, and the plates to hunt. Pure. */
/** The image query for a thing: the judge's phrasing, with the subject's own head word prefixed when it is missing. Pure. */
const _HOUSING_OR_MEDIUM = /\b(?:museum|gallery|exhibit(?:ion)?|display case|illustrations?|paintings?|drawings?|depictions?|renders?|artworks?|images?|pictures?|prints?)\b/gi;
export function thingQuery(subject = "", query = "") {
  // the judge may add the room that houses a thing or the medium that depicts it; neither is the thing, and the prefilter would read the first as a place (the reviewer, 2026-09-27)
  const s = _norm(subject).replace(/^(?:the|a|an)\s+/i, ""), q = _norm(String(query || subject).replace(_HOUSING_OR_MEDIUM, " ")) || _norm(subject);
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
/** ON A RIDE THE WAY IS THE SEAT'S OWN (owner 2026-09-27, rerun dfb13821: "rollercoaster track", the planner's place for an Odyssey dark ride, was kinded a thing, hunted, and
 *  installed where the mushroom stood — a coaster in a dark ride). `isWay` is the caller's reader of the ride's parts (_gate_rules isRideNoun, the one reader of that idea),
 *  asked only of a RIDDEN ride's own planner place, never of a canon thing or a maker's thing (both reviewers, round 3). */
export function thingVerdicts(verdicts = [], plan = {}, { seat = false, isWay = null } = {}) {
  const bare = (x) => String(x || "").toLowerCase().replace(/^(?:the|a|an)\s+/, "").replace(/\s+/g, " ").trim();
  const places = Array.isArray(plan?.form?.places) ? plan.form.places.slice() : [];
  const things = (Array.isArray(verdicts) ? verdicts : []).filter((v) => v && (/^thing$/i.test(String(v.kind || "").trim()) || String(v.role || "") === "thing"));
  const plates = [], written = [], gone = new Set();
  for (const v of things) {
    const isThing = /^thing$/i.test(String(v.kind || "").trim());
    if (!isThing) {   // a role-"thing" subject the judge read as a place or a work is not a thing…
      const _c = v.place || v.subject;   // …but a canon thing of a work without frames is the work's own: written, never lost (the reviewer, the build check)
      if (canonThings(plan).some((c) => bare(c) === bare(_c)) && !written.some((w) => bare(w) === bare(_c))) written.push(_norm(_c));
      continue;
    }
    const hit = places.find((p) => bare(p) === bare(v.place || v.subject));
    // the seat photograph is the way: on a RIDDEN ride (`way`) the planner's own place that names the way is never a thing plate, never written, and leaves the places held by the seat;
    // a canon thing of a work is never read this way, nor a driven form's things (a dashcam clip's "train tracks" stay a thing) (the reviewer, round 3)
    if (typeof isWay === "function" && hit && isWay(hit) && !canonThings(plan).some((c) => bare(c) === bare(hit))) { gone.add(bare(hit)); continue; }   // the seat photograph is the way: never a thing plate, never written, the place held by the seat
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
