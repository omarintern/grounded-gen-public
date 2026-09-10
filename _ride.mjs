// ═══ THE RIDE — ONE DECISION, TOLD FIRST (owner 2026-09-09: "correct on open where strict and strict where open … so lets erase
// and rewrite ride architecture") ══════════════════════════════════════════════════════════════════════════════════════════════
// Two days of laws had been laid one on top of another across five files — coaster architecture, the dark-ride relaxation, two
// seat looks, a standing rule, name bans, redactions, a learning loop, a preamble. Each answered the run in front of us; together
// they contradicted and shadowed one another. This module is the ONE place the ride is decided: the travelling class's kinds and
// families, the form's own words, the seat's queries and its engine ladder, the world's role (theme / architecture / places /
// setting), and the preamble the planner is told before it plans. Everything downstream — the seat hunt (_ride_seat), the world
// by mode (_ride_world), the writer's block and its findings (_ride_writer) — reads THIS object, never a flag of its own.
//
// Rulings this is built on (owner, verbatim where it matters):
//   · Form first: the rules that shape the work are told BEFORE the process that shapes it (the plan, the hunt, the writer).
//   · The seat is frame zero: a real photograph from the rider's own vantage. "pov prefers the vehicle in foreground and such
//     signs, but even without is fine because we prompt it" — the vehicle is a RANK, never a requirement.
//   · A named world on a dark ride is a THEME, not an itinerary: rooms are READ for things, things are attached to the seat plate
//     at frame zero, the rest arrive along one continuous take; no place of the work is named.
//   · A coaster keeps its measured behaviour: the seat plate first, the world as dressing on the coaster's own architecture, one
//     tunnel-mouth plate at most, the rails never end on screen.
//   · The maker's ride noun is the form: a ride the maker named is RIDDEN whatever device phrase the planner or the deconstructor
//     wrote; a bare "ride" or "attraction" is a park ride, resolved by the maker's other words (coaster physics → coaster).
import { isInteriorWorld, workTitlesOf, stripWorldMedium, isRideNoun, worldElements } from "./_gate_rules.mjs";

// ── THE TRAVELLING CLASS HAS THREE KINDS (owner 2026-09-07: "class-wide"). RIDDEN — a ride vehicle carries the camera (coaster, dark
// ride, flume, boat, tram, zipline, water slide); DRIVEN — the participant drives (dashcam, kart); WORN — the camera is on the
// participant (helmet, chest, body, GoPro, action cam, handlebar, ski cam, a walk). A ridden kind has a FAMILY: dark ride, coaster,
// or another ridden kind — the family chooses the seat's queries, its engine ladder and what "outside" means at the seat judge.
const RIDE_KIND_FAMILIES = [
  { kinds: ["rollercoaster", "roller coaster", "coaster", "wild mouse", "mine train"] },
  // DARK RIDES (owner 2026-09-08: "bare ride should get dark ride treatment. so should 'disney ride' or such, we should make sure to cover our
  // bases here"). The specific families above and below are matched FIRST; these words are the dark-ride family, and the bare "ride" /
  // "attraction" belong to it too — except beside a non-park transport word ("car ride", "bike ride", "horse ride": NON_PARK_RIDE below).
  { kinds: ["dark ride", "theme park ride", "theme park dark ride", "disney ride", "disneyland ride", "disney world ride", "universal ride", "universal studios ride", "amusement park ride", "amusement ride", "fairground ride", "fair ride", "park ride", "theme park attraction", "haunted mansion ride", "ghost ride", "attraction", "ride"], keep: "dark" }, { kinds: ["ghost train"] }, { kinds: ["log flume", "flume ride", "flume"] },
  { kinds: ["river rapids", "rapids ride"] }, { kinds: ["boat ride"] }, { kinds: ["water ride"], keep: "water" },
  { kinds: ["shooter ride", "interactive ride"] }, { kinds: ["trackless ride"] }, { kinds: ["monorail"] }, { kinds: ["tram ride", "tram"] },
  { kinds: ["trolley"] }, { kinds: ["train ride"] }, { kinds: ["carousel", "merry-go-round"] }, { kinds: ["ferris wheel"] },
  { kinds: ["drop tower"] }, { kinds: ["bumper cars"] }, { kinds: ["gondola"] }, { kinds: ["chairlift"] }, { kinds: ["cable car"] }, { kinds: ["go-kart"] },
];
const kindRe = (k, flags = "i") => new RegExp(`\\b${k.replace(/[- ]/g, "[- ]?")}\\b`, flags);
// a bare "ride"/"attraction" is a park ride unless a transport word owns it ("car ride", "bike ride", "horse ride", "uber ride", "elevator ride")
const NON_PARK_RIDE = /\b(?:car|cars|bike|bicycle|motor(?:bike|cycle)|horse|pony|camel|donkey|taxi|cab|bus|uber|lyft|subway|metro|elevator|lift|sleigh|jeep|truck|tractor|scooter|skateboard|board|surf|wave|boat|ferry|helicopter|plane|balloon|rocket|space)\s+(?:ride|attraction)\b|\bride[- ]?(?:share|sharing|hailing|along|out|off|on)\b|\b(?:take|took|takes|taking|catch|hitch|give|gave|gives|hail|hailed) (?:a|the|him|her|them|me|us) ride\b/i;
const GENERIC_RIDE_WORDS = new Set(["attraction", "ride"]);
// AMBIGUOUS PARK WORDS (owner 2026-09-08: "theme park attraction can mean rollercoaster cant it?"): attraction, ride, park ride, amusement
// ride and the like name the VENUE, not the vehicle. They resolve by the maker's OTHER words — coaster physics (a loop, a drop, a lift hill,
// a launch, inversions, airtime) makes them a coaster; otherwise the park default is the dark ride. Explicit dark-ride words (dark ride,
// disney, universal, haunted mansion, ghost ride) are never overridden.
const AMBIGUOUS_PARK = /\b(?:attraction|theme park attraction|park ride|amusement(?: park)? ride|fair(?:ground)? ride|theme park ride|ride)\b/i;
const EXPLICIT_DARK = /\b(?:dark ride|disney|disneyland|universal|haunted mansion|ghost ride|omnimover|boat ride)\b/i;
const COASTER_CUES = /\b(?:loops?|looping|inversions?|corkscrews?|drops?|plunges?|lift hill|chain lift|launch(?:es|ed)?|airtime|g-?forces?|banked turns?|speeds? (?:down|through|along)|hurtl\w+)\b/i;
const coasterFamily = () => RIDE_KIND_FAMILIES.find((f) => f.kinds[0] === "rollercoaster");
const familyOf = (text) => {
  const s = String(text || "").toLowerCase();
  // specific words anywhere in the families win; the bare generic words only when no transport word owns them
  const specific = RIDE_KIND_FAMILIES.find((f) => f.kinds.some((k) => !GENERIC_RIDE_WORDS.has(k) && kindRe(k).test(s)));
  let f = specific;
  if (!f) { if (NON_PARK_RIDE.test(s)) return null; f = RIDE_KIND_FAMILIES.find((x) => x.kinds.some((k) => GENERIC_RIDE_WORDS.has(k) && kindRe(k).test(s))) || null; }
  if (f && f.kinds[0] === "dark ride" && AMBIGUOUS_PARK.test(s) && !EXPLICIT_DARK.test(s) && COASTER_CUES.test(s)) return coasterFamily();
  return f;
};
/** The maker's ride kind ("rollercoaster", "dark ride", "log flume" …) or "" when the text names no kind. @fed the maker's prompt, a subject, a noun. */
export function rideKindOf(text = "") { const f = familyOf(text); return f ? f.kinds[0] : ""; }
/** The ridden family a noun belongs to: "dark ride" | "coaster" | "other ridden" | "" (no ride named). */
export function rideFamilyOf(text = "") { const k = rideKindOf(text); return !k ? "" : k === "rollercoaster" ? "coaster" : k === "dark ride" ? "dark ride" : "other ridden"; }
export const isDarkRideNoun = (noun = "") => rideKindOf(noun) === "dark ride";

// ── THE FORM'S OWN WORDS ──────────────────────────────────────────────────────────────────────────────────
// ⭐⭐ A RIDE IS A CAMERA FORM (owner 2026-09-05). A capture form whose LOOK lives in the frame's own foreground apparatus — a
// ride-cam's restraint bar, a helmet-cam's visor edge, a bike's handlebars, a dashcam's hood — is the MOBILE family's first-person
// branch, and its register CANNOT be conjured from an environment plate: a generator handed an empty room and the word
// "rollercoaster" renders whatever machine it guesses (measured 2026-09-05: a floor polisher pushing down the Overlook corridor).
// The register must be GROUNDED by a real frame OF THAT FORM — the seat plate.
export const APPARATUS_FORM = /\b(?:pov|point[- ]of[- ]view|first[- ]person|front[- ]seat|on-?board|ride[- ]?cam|helmet ?cam|chest ?cam|go ?pro|action[- ]?cam(?:era)?|bodycam|body[- ]?worn|dashcam|dash ?cam|handlebar|rollercoaster|roller coaster|zip[- ]?line|water ?slide|ski[- ]?cam|kart)\b/i;
/** @fed a capture-form string (the deconstructor's device / REQUIRED_FORM / mediaForm), never a prompt. */
export function isApparatusForm(form) { return APPARATUS_FORM.test(String(form || "")); }
/** The scrape query that reaches real footage OF THE FORM, place-free: the ride/device nouns in pov footage register. */
export function formPlateQuery(form) {
  const base = String(form || "").toLowerCase().replace(/\b(?:camera|cam|footage)\b/g, " ").replace(/[-_]/g, " ").replace(/\s{2,}/g, " ").trim();
  const pov = /\bpov\b/.test(base) ? "" : " pov";
  return `${base}${pov} footage`.replace(/\s{2,}/g, " ").trim();
}
/** The form's OWN noun, every capture/vantage/device word removed: "rollercoaster POV footage" → "rollercoaster",
 *  "coaster mounted action camera" → "coaster". Empty when the form is only a device ("helmet cam footage"). */
export function formNoun(form) {
  return String(form || "").toLowerCase()
    .replace(/\b(?:pov|point[- ]of[- ]view|first[- ]person|front[- ]seat|on-?board|on-?ride|ride[- ]?cam|helmet ?cam|chest ?cam|go ?pro|action[- ]?cam(?:era)?|mounted|camera|cam|footage|video|clip|shot)\b/g, " ")
    .replace(/[-_]/g, " ").replace(/\s{2,}/g, " ").trim();
}
/** The worn device's own name as the web tags it ("helmet cam", "bodycam", "gopro"); the activity noun when the form names no device. */
export function wornDevice(form = "") {
  const s = String(form || "").toLowerCase();
  const m = s.match(/\b(helmet ?cam|chest ?cam|body ?cam|bodycam|body[- ]worn|go ?pro|action[- ]?cam(?:era)?|handlebar(?: cam)?|ski[- ]?cam)\b/);
  if (m) return m[1].replace(/\s+/g, " ").replace(/^go ?pro$/, "gopro").replace(/^action[- ]?camera$/, "action cam").replace(/^body ?cam$/, "bodycam").replace(/^body[- ]worn$/, "bodycam").replace(/^handlebar$/, "handlebar cam").trim();
  return formNoun(form) || "pov";
}
/** ridden | driven | worn — the class's kind, read from the form's words and the maker's noun. */
export function apparatusKind(form = "", noun = "") {
  const s = `${form} ${noun}`.toLowerCase();
  if (/\b(?:dash ?cam|dashboard|go-?kart|kart|driving)\b/.test(s)) return "driven";
  if (rideKindOf(noun) || rideKindOf(form) || /\b(?:ride|zip[- ]?line|water ?slide|slide|front[- ]seat|on-?ride)\b/.test(s)) return "ridden";
  return "worn";
}

// ── THE SEAT'S QUERIES, BY FAMILY ─────────────────────────────────────────────────────────────────────────
// DARK RIDES (owner 2026-09-08): the usual query is "theme park dark ride pov"; a context variant rides beside it when the prompt has
// particular context ("bygone past dark ride pov"), else the clean no-pov alternate. MEASURED 2026-09-08 (query study, 8 judged per
// cell, the vision model; the free library down throughout) — the paid index's web search real/aboard/vehicle: theme park dark ride pov 6/6/6 · dark ride onboard pov
// footage 7/6/3 · disney dark ride pov 7/6/3 · dark ride ride-through 7/5/5 · dark ride vehicle interior scene 6/5/5 · haunted mansion
// ride pov 8/5/2 · theme park dark ride 6/3/3 · onride dark ride 6/3/3. search-on-reddit on the same queries: 1/0/0 · 4/3/3 · 0 rows ·
// 2/0/0 · 1/0/0 · 8/4/3 · 3/1/1 · 4/2/1. "pov" earns its place; "<name> ride pov" shapes pull YouTube thumbnails with burned-in titles.
// COASTERS keep their measured words ("<noun> front seat pov" / "<noun> onride pov footage") — owner: "its easier to find amongst the
// search engines so lets leave as is". An interior world prefixes "indoor " for a coaster or another ridden kind, never for a dark ride
// (its query is the owner's own) and never under coaster architecture (the coaster starts legit, indoors or out).
// QUERY-LEVEL DIFFUSION (owner 2026-09-10: one web search is ~35 rows and never pages — depth is more PHRASINGS): the seat's phrasings are a
// pool per kind (the measured ones above, brand-free), and every run samples two of them, so different runs draw from different pools before
// the seat diffusion (_judge_seat.diffuseSeat) picks among equals. `rand` is injectable (the batteries pass a constant).
export const SEAT_PHRASINGS = {
  "dark ride": ["theme park dark ride pov", "dark ride ride-through", "dark ride onboard pov footage", "dark ride vehicle interior scene", "onride dark ride pov"],
  coaster: (noun) => [`${noun} front seat pov`, `${noun} onride pov footage`, `${noun} pov footage`, `${noun} first person ride`],
};
export function sampleQueries(pool, n = 2, rand = Math.random) {
  const list = [...(Array.isArray(pool) ? pool : [])]; const out = [];
  while (list.length && out.length < n) { const k = Math.min(list.length - 1, Math.max(0, Math.floor(rand() * list.length))); out.push(list.splice(k, 1)[0]); }
  return out;
}
export function seatQueries(form, { context = "", noun: nounOverride = "", indoor = false, rand = Math.random } = {}) {
  const noun = String(nounOverride || "").trim() || formNoun(form);
  const kind = apparatusKind(form, noun);
  if (kind === "ridden" && isDarkRideNoun(noun)) { const ctx = String(context || "").replace(/\s+/g, " ").trim(); const picks = sampleQueries(SEAT_PHRASINGS["dark ride"], 2, rand); return ctx ? [picks[0], `${ctx} dark ride pov`] : picks; }
  if (kind === "driven") return /\bkart\b/i.test(`${form} ${noun}`) ? ["go-kart pov footage", "go-kart onboard footage"] : ["dashcam footage", "dashcam pov driving footage"];
  if (kind === "worn") { const dev = wornDevice(form); return [`${dev} pov footage`, `first person ${dev} footage`]; }
  const pre = indoor ? "indoor " : "";
  if (!noun) { const q = formPlateQuery(form); return [`${pre}${q}`, `${pre}${q.replace(/\bpov\b/i, "onboard")}`]; }
  return sampleQueries(SEAT_PHRASINGS.coaster(`${pre}${noun}`), 2, rand);
}
/** THE SEAT PLATE'S ENGINE LADDER, BY FAMILY (owner 2026-09-08, on the query study: «the paid index's web search is therefore the leader for this. so web
 *  the paid index then the free library as fallback then lastly [search] for dark ride form»). "web" = the paid index's web search (never the local scraper — owner: «it must
 *  be the paid index because its a deeper pool and truer test»), "library" = the free tier (skipped by its own circuit while down), "scoped" =
 *  search-on-reddit. Every other family takes the form route as it stands (null). scrape.mjs walks the ladder under SEAT_LADDER. */
export function seatLadder(family = "") { return family === "dark ride" ? ["web", "library", "scoped"] : null; }

// ── THE DECISION ──────────────────────────────────────────────────────────────────────────────────────────
/** ONE object, computed from facts known before the plan (the maker's words, the resolved entities) and completed after it (the
 *  planner's form and world). null when the run is not a travelling form. Pure: no env, no files — the run mirrors it into env
 *  (rideEnv) for its children, and every child reads it back (rideFromEnv).
 *    { kind: ridden|driven|worn, family: dark ride|coaster|other ridden|driven|worn, noun, form, plateForm, medium, interior,
 *      world: { named, title, mode: theme|architecture|places|setting, setting, rooms[], things[] },
 *      seat: { queries: [q0, q1], ladder, plate: "", reading: null },
 *      words: { way, vehicle }   — filled from the seat plate's reading after the hunt
 *      dressing: { placements[], later[], places[] }   — filled by the world by mode
 *      worldQueries }
 *  THE WORLD'S MODE: a dark ride of a named work = THEME (rooms read for things, never ridden or named); a coaster of a named work or
 *  a themed setting = ARCHITECTURE (the seat plate, one tunnel mouth at most, the world's things as colouring); any other ridden,
 *  driven or worn form of a named world = PLACES (the world's photographs ride behind the seat in story order); an unnamed world =
 *  SETTING (the seat plate carries its world; the maker's places are informant plates hunted as places). */
export function rideDecision({ rawPrompt = "", prompt = "", resolved = [], plan = null, device = "", requiredForm = "", rand = Math.random } = {}) {
  const p = plan && typeof plan === "object" ? plan : {};
  // THE MAKER'S RIDE KIND IS THE NOUN (owner 2026-09-08, job fa203849: "The Shining theme park dark ride" planned as "onboard ride footage",
  // so the noun fell to "ride" and every dark-ride rule stood aside). The planner's device phrase never outranks the maker's word.
  // On a REMIX the raw words are the remix's own change ("its a T-rex instead of a bear"), which may name no ride at all — the reframed
  // request (prompt) is read next, before the plan's subject (2026-09-09).
  const makerKind = rideKindOf(String(rawPrompt || "").trim()) || rideKindOf(String(prompt || "").trim()) || rideKindOf(String(p.subject || p.form?.subject || ""));
  const form = String(device || requiredForm || p.form?.mediaForm || p.native_capture || "").trim() || (makerKind ? `${makerKind} POV footage` : "");
  const plateForm = String(p.native_capture || p.form?.mediaForm || requiredForm || form).trim();
  if (!(isApparatusForm(form) || makerKind)) return null;
  const noun = makerKind || formNoun(plateForm) || form.replace(/\s+camera$/i, "");
  const kind = apparatusKind(plateForm || form, noun);
  const family = kind === "driven" ? "driven" : kind === "worn" ? "worn" : (rideFamilyOf(noun) || "other ridden");
  const setEnt = (Array.isArray(resolved) ? resolved : []).find((e) => e?.is_set === true);
  const named = !!(p.world_clearance?.named || p.world_clearance?.isSet === true || setEnt);
  const title = (plan ? workTitlesOf(p)[0] : "") || String(setEnt?.canonical_name || setEnt?.term || p.world_clearance?.setName || "").trim();
  const setting = String(p.form?.setting || "").replace(/\s+/g, " ").trim();
  const themedSetting = /\b(?:themed|dark ride|indoor|enclos\w*|show building)\b/i.test(setting);
  const mode = family === "dark ride" && named ? "theme" : family === "coaster" && (named || themedSetting) ? "architecture" : named ? "places" : "setting";
  const interior = plan ? isInteriorWorld(p) : false;
  const places = (Array.isArray(p.form?.places) ? p.form.places : []).map((x) => String(x || "").trim()).filter(Boolean);
  // the seat's second query on a dark ride: the maker's world words when they are a theme, never a work's title (a title in a dark-ride
  // query returns film stills); "indoor" for a coaster or another ridden kind whose places are rooms, never under architecture
  const worldWords = String(p.form?.world || "").replace(/\s+/g, " ").trim();
  const context = !named && worldWords && worldWords.split(" ").length <= 4 && !isRideNoun(worldWords) ? worldWords : "";
  const indoor = kind === "ridden" && family !== "dark ride" && mode !== "architecture" && (interior || (places.length > 0 && isInteriorWorld({ form: { world: places.join(" ") } })));
  const queries = seatQueries(plateForm, { context, noun: makerKind || "", indoor, rand });
  const titles = plan ? workTitlesOf(p) : (title ? [title] : []);
  const rooms = mode === "theme" && Array.isArray(p.slots?.world?.shotSet) ? p.slots.world.shotSet.map((q) => roomNameOf(q, titles)).filter(Boolean) : [];
  return {
    kind, family, noun, form, plateForm, medium: String(p.native_capture || p.form?.mediaForm || ""), interior,
    world: { named, title, mode, setting, places, rooms, things: plan ? worldElements(p) : [] },
    seat: { queries, ladder: seatLadder(family), plate: "", reading: null },
    words: { way: "", vehicle: "" },
    dressing: { placements: [], later: [], places: [] },
    worldQueries: plan ? stripWorldMedium(p.slots?.world?.queries || [], p) : [],
  };
}
/** The class's own words for the way and the vehicle: the seat plate's reading when it has one, else the kind's. */
export function rideWords(d) {
  const r = d?.seat?.reading || {};
  const way = String(d?.words?.way || (r.way && r.way !== "unseen" ? r.way : "")).trim();
  const vehicle = String(d?.words?.vehicle || (r.vehicle && r.vehicle !== "unseen" && r.vehicle !== "other" ? r.vehicle : "")).trim();
  const watery = /boat|flume|rapids|water/i.test(String(d?.noun || ""));
  return {
    way: way || (d?.kind === "driven" ? "road" : d?.kind === "worn" ? "way ahead" : watery ? "water channel" : d?.family === "coaster" ? "rails" : "way ahead"),
    vehicle: vehicle || (d?.kind === "driven" ? "vehicle" : d?.kind === "worn" ? "wearer's own apparatus" : watery ? "boat" : d?.family === "coaster" ? "car" : "vehicle"),
  };
}

// ── THE PREAMBLE — TOLD TO THE PLANNER BEFORE IT PLANS (owner 2026-09-08) ─────────────────────────────────
// «my intuition is that were applying rules in the wrong places, perhaps too low in hierarchy when they should be told before
// certain processes so they take reign more … whatever problem we encounter is often nested in something when it should sit
// outside.» The facts the rule needs are known BEFORE the plan: the ride kind from the maker's own words, the named work from the
// resolved entities (is_set). So the planner is told first, and the shape is right from the top.
export function preambleFor(d, { places = [] } = {}) {
  if (!d || d.family !== "dark ride" || !d.world?.named || !d.world?.title) return "";
  const lead = (Array.isArray(places) ? places : []).map((p) => String(p || "").trim()).filter(Boolean).slice(0, 4);
  const kind = d.noun, w = d.world.title;
  return `FORM PREAMBLE — decided from the maker's own words BEFORE this plan; it outranks the request's rewrite and your own reading of the story:\n` +
    `• THE FORM IS A THEME PARK DARK RIDE ("${kind}"). The camera is the rider's seat; frame zero is a photograph taken from the seat; the world is what the ride carries past that seat.\n` +
    `• THE WORLD IS THE NAMED WORK "${w}", AND ON A DARK RIDE A NAMED WORK IS A THEME, NOT AN ITINERARY. The ride never enters the work's places; the work supplies THINGS that dress the ride's own scenes. Therefore, for THIS plan:\n` +
    `  – form.places = [] and slots.vantage = [] — no place of the work is a stop; execution.cuts = false. (This overrides any instruction below to list the places the request visits: on this form they are not visited, they are read.)\n` +
    `  – world_theme = { work: "${w}", sources: up to 4 image-search queries for the work's rooms or scenes whose THINGS are worth reading, each shaped "${w} <room> scene"${lead.length ? ` — the brief names the places the maker's video visits, and THEY LEAD, in this order: ${lead.map((p) => `"${w} ${p} scene"`).join(", ")}; add another room only after them` : ""} }.\n` +
    `  – world_elements: up to 6 of the work's most transferable THINGS — a pattern, a fixture, a prop, signage, architecture, a figure of the work described by clothing and posture — each with source = the world_theme source it is read from, and the surface it lives on.\n` +
    `  – the story is the ride's own scenes in order, UNNAMED (the next scene, a turn, a blackout), each carrying things; no scene is named after a place of the work, and read.restated says so.\n` +
    `  – figures: name the work's people as usual so they resolve; how each is written is decided later by the prose law (a lesser figure may be named; the work's face is described, never named).\n` +
    `  – THE RIDE'S OWN VOICE: the plan's Dialogue block carries ONE line the ride itself plays — a figure of the work speaking as the seat passes it, or "Ride narrator" from the speakers; the speaker label is the figure by clothing and posture (the caretaker in the red plaid jacket, written plainly, never in quotation marks) or Ride narrator — never a real person's or an actor's name; the figure speaks its OWN line, and the Ride narrator only when no figure of the scene can say it (narration only where necessary); words the ride would play, never a caption; the line speaks from inside the scene and names no place of the work and not the work's title (the places law holds in speech: "Welcome. You will never leave.", never "Welcome to the <hotel>").\n` +
    `  – figures name the work's CHARACTERS (the name the story gives them), never the actors who played them.\n`;
}
/** A zone or source query reduced to the room's own name for the prose ban and the writer's log: the work's title and a query
 *  suffix (scene / interior / footage / set) stripped. "The Shining Overlook Hotel lobby scene" → "Overlook Hotel lobby". */
export function roomNameOf(query, titles = []) {
  let z = String(query || "").replace(/\s+/g, " ").trim();
  for (const t of Array.isArray(titles) ? titles : []) if (t) z = z.replace(new RegExp(`^\\s*${String(t).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s+`, "i"), "");
  return z.replace(/\s+(?:scene|interior|footage|set|still|frame)$/i, "").trim();
}

// ── THE ENV MIRROR — the one channel to the run's children (hunts, the writer) ────────────────────────────
// APPARATUS_FORM / APPARATUS_KIND / APPARATUS_NOUN stay as the compact booleans other modules read (the register law, the scrape
// route's log, the frame-zero body rule); RIDE carries the whole decision. Nothing else about the ride rides in env.
export function rideEnv(d) {
  return d ? { APPARATUS_FORM: "1", APPARATUS_KIND: String(d.kind || "ridden"), APPARATUS_NOUN: String(d.noun || ""), RIDE: JSON.stringify(d) }
           : { APPARATUS_FORM: "", APPARATUS_KIND: "", APPARATUS_NOUN: "", RIDE: "" };
}
/** @fed process.env — the decision the run mirrored; null when this process is not a ride's. */
export function rideFromEnv(env = process.env) {
  try { const j = JSON.parse(String(env.RIDE || "")); return j && typeof j === "object" && j.kind ? j : null; } catch { return null; }
}
