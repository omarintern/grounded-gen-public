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
  { kinds: ["river rapids", "rapids ride"] }, { kinds: ["boat ride"] }, { kinds: ["water ride"], keep: "water" }, { kinds: ["log flume", "flume ride", "flume"] },   // a flume is its own kind (2026-09-15, the water route)
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
// ── ON A BOAT, THE CAMERA IS A GOPRO (owner 2026-09-14: "anything on a boat should be go pro (pov) unless stated otherwise by input (stating against it)") ──
// A boat is a ride only inside a park (a flume, the rapids, a Jungle Cruise); anywhere else the take is the wearer's own camera on the boat — WORN, with the
// boat's own gopro queries for its plate — unless the words state against a point of view (a drone, a view from the pier, a third person, a news camera).
const BOAT = /\b(?:boats?|speedboats?|motorboats?|rowboats?|kayaks?|kayaking|canoes?|canoeing|ferry|ferries|yachts?|sail(?:boat|boats|ing)|dinghy|dinghies|rafts?|rafting|jet[- ]?skis?|catamarans?|pontoons?|skiffs?|barges?|cruise ships?|paddle ?boards?)\b/i;
const PARK_BOAT = /\b(?:theme park|amusement park|amusement|attractions?|disney\w*|universal|jungle cruise|dark ride|log flume|flumes?|rapids|water ride|show building|ride vehicle|queue line|pirates of the caribbean|splash mountain)\b/i;
const NOT_POV = /\b(?:drone|aerial|helicopter shot|from (?:the |a )?(?:shore|pier|dock|jetty|harbou?r|beach|bank|bridge|cliff|hill|window|balcony)|third[- ]person|watching from|seen from|viewed from|filmed from (?:the |a )?(?:shore|pier|dock|land)|cctv|security camera|dashcam|news|broadcast|documentary)\b/i;
/** the words put the camera on a boat, and nothing in them states against a point of view — the boat's own word comes back, else "" */
// A BOAT WORD IS NOT ALWAYS A VESSEL — the trap the bare word "ride" already has (NON_PARK_RIDE above): a gravy boat, a boat neck and
// the boat race on tv wear the word and carry no camera. A word that owns the bare noun stands it down before the test.
const NOT_A_VESSEL = /\b(?:gravy|sauce|butter|banana|dream|love|show)[- ]?boats?\b|\bboats?[- ](?:neck|race|races|racing|show|shoes?|hook|load|people|yard)\b/i;
// ── THE WATER ROUTE (owner 2026-09-15: "it should also allow for different experiences, like floating on water"; "with fallback queries as well in place") ──
// A water word in the maker's words puts the seat on a boat: a water DARK RIDE (a boat through show scenes) hunts boat phrasings instead of the rails shelf, a flume or
// the rapids hunt their own noun, both on the park ladder with two fallback queries behind the two the run samples. The class's words follow (rideWords: the channel,
// the boat) until the plate's own reading speaks. A boat OUTSIDE a park is still the GoPro form (boatPov, below), never this.
export const WATER_WORDS = /\b(?:boats?|flumes?|log (?:flume|ride)|rapids|water ride|canal|waterway|rafts?|jungle cruise|bayou|splash(?:down)?)\b/i;
export const isWaterRide = (text = "") => { const s = String(text || "").replace(NOT_A_VESSEL, " "); return WATER_WORDS.test(s); };
/** ⭐⭐ THE MAKER'S CRAFT IN THE SEAT JUDGE'S OWN VOCABULARY (2026-09-18, job 6442a7c6). That judge answers `vehicle` from a closed
 *  list — car | boat | omnimover | kart | other | unseen — and the maker writes "speedboat", "jet ski", "log flume". The ranking could
 *  not compare the two, so a frame read as a KART tied with two read as BOATS for a speedboat request and was served. Pure. */
export function craftVehicle(craft = "") {
  const c = String(craft || "").toLowerCase();
  if (!c) return "";
  for (const v of ["omnimover", "boat", "kart", "car"]) if (c.includes(v)) return v;
  return WATER_WORDS.test(c) ? "boat" : "";   // a raft, a flume, a jet ski: the judge has one word for every hull
}
export function boatPov(text = "") { const s = String(text || "").replace(NOT_A_VESSEL, " "); if (!BOAT.test(s) || PARK_BOAT.test(s) || NOT_POV.test(s)) return ""; return (s.match(BOAT) || [""])[0].toLowerCase(); }
const familyOf = (text) => {
  const s = String(text || "").toLowerCase();
  // specific words anywhere in the families win; the bare generic words only when no transport word owns them
  const specific = RIDE_KIND_FAMILIES.find((f) => f.kinds.some((k) => !GENERIC_RIDE_WORDS.has(k) && kindRe(k).test(s)));
  let f = specific;
  if (!f) { if (NON_PARK_RIDE.test(s)) return null; f = RIDE_KIND_FAMILIES.find((x) => x.kinds.some((k) => GENERIC_RIDE_WORDS.has(k) && kindRe(k).test(s))) || null; }
  if (f && f.kinds[0] === "dark ride" && AMBIGUOUS_PARK.test(s) && !EXPLICIT_DARK.test(s) && COASTER_CUES.test(s)) return coasterFamily();
  if (f && f.kinds[0] === "boat ride" && boatPov(s)) return null;   // a boat ride outside a park is a boat (a gopro), not a ride (owner 2026-09-14)
  return f;
};
/** The maker's ride kind ("rollercoaster", "dark ride", "log flume" …) or "" when the text names no kind. @fed the maker's prompt, a subject, a noun. */
export function rideKindOf(text = "") { const f = familyOf(text); return f ? f.kinds[0] : ""; }
/** THE RIDE NOUN AT THE TAIL OF A PHRASE (owner 2026-09-18, job 104e2857: "a simpsons ride" probed whole resolved to the Universal attraction,
 *  a venue with no rooms, and the ride ran through a bare tunnel). The ride word at the end of a phrase is the FORM; what stands before it
 *  is the WORK the ride is of. Returns the tail as written ("ride", "dark ride", "boat ride", "rollercoaster"), or "" when the phrase does
 *  not end in one or a transport word owns it ("car ride"). Pure. */
export function rideNounTail(text = "") {
  const s = String(text || "").replace(/\s+/g, " ").trim();
  if (!s || NON_PARK_RIDE.test(s)) return "";
  const kinds = [...RIDE_KIND_FAMILIES.flatMap((f) => f.kinds), ...GENERIC_RIDE_WORDS].sort((a, b) => b.length - a.length);
  for (const k of kinds) { const m = s.match(new RegExp(`(?:^|\\s)(${k.replace(/[- ]/g, "[- ]?")})$`, "i")); if (m && m[1].length < s.length) return m[1]; }
  return "";
}
/** THE WORK A RIDE PHRASE IS OF: the phrase before its ride noun, with an indefinite article dropped and a definite one KEPT (a title
 *  carries its own "The": "the shining ride" → "the shining", "a simpsons ride" → "simpsons"); "" when the phrase is not a ride of anything
 *  ("a disney ride", "ride") or does not end in a ride noun. Pure. */
export function rideWorkOf(text = "") {
  const s = String(text || "").replace(/\s+/g, " ").trim(); const tail = rideNounTail(s);
  if (!tail) return "";
  const work = s.slice(0, s.length - tail.length).replace(/\s+$/, "").replace(/^(?:a|an)\s+/i, "").trim();
  return work && !rideNounTail(work) && !/^(?:a|an|the)$/i.test(work) ? work : "";
}
/** The ridden family a noun belongs to: "dark ride" | "coaster" | "other ridden" | "" (no ride named). */
export function rideFamilyOf(text = "") { const k = rideKindOf(text); return !k ? "" : k === "rollercoaster" ? "coaster" : k === "dark ride" ? "dark ride" : "other ridden"; }
export const isDarkRideNoun = (noun = "") => rideKindOf(noun) === "dark ride";

// ── THE FORM'S OWN WORDS ──────────────────────────────────────────────────────────────────────────────────
// ⭐⭐ A RIDE IS A CAMERA FORM (owner 2026-09-05). A capture form whose LOOK lives in the frame's own foreground apparatus — a
// ride-cam's restraint bar, a helmet-cam's visor edge, a bike's handlebars, a dashcam's hood — is the MOBILE family's first-person
// branch, and its register CANNOT be conjured from an environment plate: a generator handed an empty room and the word
// "rollercoaster" renders whatever machine it guesses (measured 2026-09-05: a floor polisher pushing down the Overlook corridor).
// The register must be GROUNDED by a real frame OF THAT FORM — the seat plate.
export const APPARATUS_FORM = /\b(?:pov|point[- ]of[- ]view|first[- ]person|front[- ]seat|on-?board|ride[- ]?cam|helmet ?cam|chest ?cam|go ?pro|action[- ]?cam(?:era)?|bodycam|body[- ]?worn|dashcam|dash ?cam|handlebar|rollercoaster|roller coaster|zip[- ]?line|water ?slide|ski[- ]?cam|kart)\b|body camera|helmet camera|chest camera|body-worn camera/i;   // the deconstructor's full spellings count too (2026-09-14)
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
// …WRITTEN OUT IN FULL TOO (layer 2, the bodycam cake raid, 2026-09-14): the app's deconstructor names the device "chest-mounted body camera" and
// "helmet camera", which "body cam" and "helmet cam" with a word boundary never matched — so a bodycam prompt was never a worn form at all: the
// plain photo-swap put the cake in a partygoer's seat and the officer, the camera's wearer, was written as a body.
export const WORN_DEVICE = /\b(helmet ?cam(?:era)?|chest ?cam(?:era)?|body ?cam(?:era)?|bodycam(?:era)?|body[- ]worn(?: camera)?|go ?pro|action[- ]?cam(?:era)?|handlebar(?: cam)?|ski[- ]?cam(?:era)?)\b/i;
/** The worn device's own name as the web tags it ("helmet cam", "bodycam", "gopro"); the activity noun when the form names no device. */
export function wornDevice(form = "") {
  const s = String(form || "").toLowerCase();
  const m = s.match(WORN_DEVICE);
  if (m) return m[1].replace(/\s+/g, " ").replace(/^go ?pro$/, "gopro").replace(/^action[- ]?camera$/, "action cam").replace(/^body ?cam(?:era)?$/, "bodycam").replace(/^bodycamera$/, "bodycam").replace(/^body[- ]worn(?: camera)?$/, "bodycam").replace(/^helmet ?camera$/, "helmet cam").replace(/^chest ?camera$/, "chest cam").replace(/^ski[- ]?camera$/, "ski cam").replace(/^handlebar$/, "handlebar cam").trim();
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
  // THE WATER POOLS (2026-09-15, unmeasured — the first dry run on a water ride measures them): a boat dark ride's four, and a flume's or the rapids' four led by their own noun.
  "water dark ride": ["boat dark ride onride pov", "indoor boat ride pov footage", "dark ride boat ride-through", "theme park boat ride pov"],
  water: (noun) => [`${noun} onride pov`, `${noun} pov footage`, "theme park boat ride onride pov", "water ride onride pov footage"],
};
export function sampleQueries(pool, n = 2, rand = Math.random) {
  const list = [...(Array.isArray(pool) ? pool : [])]; const out = [];
  while (list.length && out.length < n) { const k = Math.min(list.length - 1, Math.max(0, Math.floor(rand() * list.length))); out.push(list.splice(k, 1)[0]); }
  return out;
}
export function seatQueries(form, { context = "", noun: nounOverride = "", indoor = false, rand = Math.random, water = false } = {}) {
  const noun = String(nounOverride || "").trim() || formNoun(form);
  const kind = apparatusKind(form, noun);
  // THE WATER ROUTE: two sampled, the other two behind them as fallbacks (the hunt walks them while nothing is aboard)
  // …and a named venue still leads (2026-09-14: "Jungle Cruise boat ride pov footage" first), the pool's phrasings behind it
  if (kind === "ridden" && (water || WATER_WORDS.test(noun))) { const wctx = String(context || "").replace(/\s+/g, " ").trim(); const pool = isDarkRideNoun(noun) ? SEAT_PHRASINGS["water dark ride"] : SEAT_PHRASINGS.water(noun); const picks = sampleQueries(pool, wctx ? 1 : 2, rand); return [...(wctx ? [`${wctx} ${noun} pov footage`] : []), ...picks, ...pool.filter((q) => !picks.includes(q))]; }
  if (kind === "ridden" && isDarkRideNoun(noun)) { const ctx = String(context || "").replace(/\s+/g, " ").trim(); const picks = sampleQueries(SEAT_PHRASINGS["dark ride"], 2, rand); return ctx ? [picks[0], `${ctx} dark ride pov`] : picks; }
  // A WORN DEVICE GOES WHERE ITS WEARER GOES, AND A CAR WHERE ITS ROAD IS (layer 2 cell l2b-19, 2026-09-14): "helmet cam of a mountain
  // bike trail" hunted "helmet cam pov footage" bare and seated the take in a Formula 1 cockpit — the halo, the wheel's display, a race
  // car ahead — and the writer had to thread a dirt trail off a paved track. The boat branch already leads with the boat's own word and
  // the dark-ride branch with its setting; the setting leads here too, the bare device second.
  const ctx = String(context || "").replace(/\s+/g, " ").trim();
  if (kind === "driven") return /\bkart\b/i.test(`${form} ${noun}`) ? ["go-kart pov footage", "go-kart onboard footage"] : ctx ? [`${ctx} dashcam footage`, "dashcam pov driving footage"] : ["dashcam footage", "dashcam pov driving footage"];
  // …AND THE WEB TAGS A HELMET, CHEST OR ACTION CAM BY ITS BRAND (owner 2026-09-14: "it could have also known these are often go pro so gopro
  // could have been in the query"): the second query asks in that word, on the setting. A bodycam and a dashcam keep their own tags.
  if (kind === "worn") { const dev = wornDevice(form); const gp = dev !== "gopro" && dev !== "bodycam" ? `gopro ${dev}` : dev; return ctx ? [`${ctx} ${dev} pov footage`, `${ctx} ${gp} footage`] : [`${dev} pov footage`, `first person ${dev} footage`]; }
  const pre = indoor ? "indoor " : "";
  if (!noun) { const q = formPlateQuery(form); return [`${pre}${q}`, `${pre}${q.replace(/\bpov\b/i, "onboard")}`]; }
  if (ctx) return [`${ctx} ${noun} pov footage`, `${ctx} ${noun} onride pov footage`];   // a named attraction leads its own seat hunt (2026-09-14)
  return sampleQueries(SEAT_PHRASINGS.coaster(`${pre}${noun}`), 2, rand);
}
/** THE SEAT PLATE'S ENGINE LADDER, BY FAMILY (owner 2026-09-08, on the query study: «the paid index's web search is therefore the leader for this. so web
 *  the paid index then the free library as fallback then lastly [search] for dark ride form»). "web" = the paid index's web search (never the local scraper — owner: «it must
 *  be the paid index because its a deeper pool and truer test»), "library" = the free tier (skipped by its own circuit while down), "scoped" =
 *  search-on-reddit. Every other family takes the form route as it stands (null). scrape.mjs walks the ladder under SEAT_LADDER. */
export function seatLadder(family = "", water = false) { return family === "dark ride" || water ? ["web", "library", "scoped"] : null; }   // a water ride of any family rides the park ladder (2026-09-15)

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
  const makerKind0 = rideKindOf(String(rawPrompt || "").trim()) || rideKindOf(String(prompt || "").trim()) || rideKindOf(String(p.subject || p.form?.subject || ""));
  // ON A BOAT, THE CAMERA IS A GOPRO (owner 2026-09-14) — unless a park names the ride, or the words state against a point of view
  // THE CAMERA THE INPUT NAMES IS THE CAMERA (owner: "unless stated otherwise by input") — the boat's gopro is the DEFAULT, never a
  // replacement: the form the deconstructor or the plan states is read for the against-a-POV cues too, and a device the words name
  // (a helmet cam, a bodycam, a chest cam) rides the boat's own queries in the gopro's place.
  const _stated = String(device || requiredForm || p.form?.mediaForm || p.native_capture || "").trim();
  const boatWord = !makerKind0 ? (boatPov(`${rawPrompt || ""} ${_stated}`.trim()) || boatPov(`${prompt || ""} ${_stated}`.trim())) : "";
  const boatCam = boatWord ? (WORN_DEVICE.test(`${rawPrompt} ${prompt} ${_stated}`) ? wornDevice(`${rawPrompt} ${prompt} ${_stated}`) : "gopro") : "";   // the maker's own word first ("gopro"), the deconstructor's paraphrase ("action camera") after
  const makerKind = boatWord ? "" : makerKind0;
  const form = boatWord ? `${boatCam} pov footage` : (_stated || (makerKind ? `${makerKind} POV footage` : ""));
  const plateForm = boatWord ? `${boatCam} pov footage` : String(p.native_capture || p.form?.mediaForm || requiredForm || form).trim();
  if (!boatWord && !(isApparatusForm(form) || makerKind)) return null;
  // A FORM THAT IS ONLY A DEVICE HAS THE DEVICE FOR ITS NOUN (formNoun answers "" by contract for "helmet cam footage"): the whole form
  // string as a noun reads back to the writer as "ONE continuous take from the helmet cam footage's own camera".
  const noun = boatWord ? boatCam : (makerKind || formNoun(plateForm) || wornDevice(plateForm || form));
  const kind = boatWord ? "worn" : apparatusKind(plateForm || form, noun);
  const family = kind === "driven" ? "driven" : kind === "worn" ? "worn" : (rideFamilyOf(noun) || "other ridden");
  const water = !boatWord && kind === "ridden" && (isWaterRide(rawPrompt) || isWaterRide(prompt) || WATER_WORDS.test(noun));   // the water route (2026-09-15): the maker's words put the seat on a boat
  const setEnt = (Array.isArray(resolved) ? resolved : []).find((e) => e?.is_set === true);
  const named = !!(p.world_clearance?.named || p.world_clearance?.isSet === true || setEnt);
  // THE WORLD'S TITLE IS THE WORK (dry run velocal6, 2026-09-11): the material identifiers are every term the maker's words identify — the work, but also its
  // named figures ("The Shining ride", "jack torrence", "wendy") — and the first of them titled the world "The Shining Ride", which the sourceability judge
  // then called invented. The planner's own statement of the work (world_theme.work) and the resolver's set name come first; the identifiers are the fallback.
  // (velocal7: the planner echoed the ensemble's canonical name — "The Shining cast" — as the work; the clearance's setName is the work itself, "cast" stripped)
  const _stripCast = (t) => String(t || "").replace(/\s+(?:cast|crew|cast members)$/i, "").trim();
  const title = _stripCast(p.world_clearance?.setName) || _stripCast(p.world_theme?.work) || _stripCast(setEnt?.canonical_name || setEnt?.term) || (plan ? workTitlesOf(p)[0] : "");
  const setting = String(p.form?.setting || "").replace(/\s+/g, " ").trim();
  const themedSetting = /\b(?:themed|dark ride|indoor|enclos\w*|show building)\b/i.test(setting);
  const mode = family === "dark ride" && named ? "theme" : family === "coaster" && (named || themedSetting) ? "architecture" : named ? "places" : "setting";
  const interior = plan ? isInteriorWorld(p) : false;
  const places = (Array.isArray(p.form?.places) ? p.form.places : []).map((x) => String(x || "").trim()).filter(Boolean);
  // the seat's second query on a dark ride: the maker's world words when they are a theme, never a work's title (a title in a dark-ride
  // query returns film stills); "indoor" for a coaster or another ridden kind whose places are rooms, never under architecture
  const worldWords = String(p.form?.world || "").replace(/\s+/g, " ").trim();
  // A REAL ATTRACTION IS HUNTED UNDER ITS OWN NAME (layer 2, the Jungle Cruise, 2026-09-14): "jungle cruise boat ride at disneyland" resolved to a
  // venue, the world was named, and the seat was hunted as "boat ride pov footage" bare — open ocean, no river, no jungle. A named WORK stays out of
  // a seat query (film stills); a named VENUE is the ride itself, and its onride footage is on the web under that name. Dark rides keep their own hunt.
  const venueEnt = (Array.isArray(resolved) ? resolved : []).find((e) => e?.kind === "venue" && e?.is_set !== true && (e?.canonical_name || e?.term));
  const venueName = venueEnt ? String(venueEnt.canonical_name || venueEnt.term).replace(/\s+/g, " ").trim() : "";
  const context = !named && worldWords && worldWords.split(" ").length <= 4 && !isRideNoun(worldWords) ? worldWords
    : (family !== "dark ride" && venueName && !isRideNoun(venueName) ? venueName : "");   // …and a car or a wearer on a named street or place hunts there too (the long dashcam: three avenues resolved, a bare "dashcam pov driving footage" served)
  const indoor = kind === "ridden" && family !== "dark ride" && mode !== "architecture" && (interior || (places.length > 0 && isInteriorWorld({ form: { world: places.join(" ") } })));
  const queries = boatWord ? [`${boatWord} ${boatCam} pov footage`, `first person ${boatCam} ${boatWord} footage`] : seatQueries(plateForm, { context, noun: makerKind || "", indoor, rand, water });
  const titles = plan ? workTitlesOf(p) : (title ? [title] : []);
  const rooms = mode === "theme" && Array.isArray(p.slots?.world?.shotSet) ? p.slots.world.shotSet.map((q) => roomNameOf(q, titles)).filter(Boolean) : [];
  // HOW THE ENDING LANDS is the plan's decision (owner 2026-09-11: "climax doesn't need longest span. it all depends, because irony would have it end quick"):
  // held = experienced, the take stays in the event; quick = a button after the build. A ride defaults to held; the plan says otherwise only on the maker's words.
  const ending = String(p.read?.ending || "").trim().toLowerCase() === "quick" ? "quick" : "held";
  return {
    kind, family, noun, form, plateForm, medium: String(p.native_capture || p.form?.mediaForm || ""), interior, ending, water,
    craft: boatWord || "",   // the maker's own word for the hull, kept so the seat ranking can prefer it (2026-09-18)
    // AN EVENT IS A NAMED WORLD (owner 2026-09-14: "even for a plate, 9/11 should be recognized as something sourced"): the probe's event entity
    // is a set whose zones are its most photographed scenes; on a dark ride it is a theme like a work, told to the planner as an EVENT
    world: { named, title, mode, setting, words: worldWords, places, rooms, things: plan ? worldElements(p) : [], kind: setEnt?.kind === "event" ? "event" : (named ? "work" : ""), zones: Array.isArray(setEnt?.set_zones) ? setEnt.set_zones.map((z) => String(z || "").trim()).filter(Boolean) : [] },
    seat: { queries, ladder: seatLadder(family, water), plate: "", reading: null },
    words: { way: "", vehicle: "" },
    dressing: { placements: [], later: [], places: [] },
    worldQueries: plan ? stripWorldMedium(p.slots?.world?.queries || [], p) : [],
  };
}
/** The class's own words for the way and the vehicle: the seat plate's reading when it has one, else the kind's. */
export function rideWords(d) {
  const r = d?.seat?.reading || {};
  // …AND THEY CARRY NO ARTICLE: every reader writes "the ${way}" and "THE ${way.toUpperCase()}", so a plate read that answers "the track
  // bed" — as the dark-ride store's own ice-cave reading does — writes "the the track bed" into the writer's block and into frame zero
  // (shipped in draw 25). The article is stripped once, here, where the class's words are decided.
  const _w = (v) => (typeof v === "string" ? v.trim().replace(/^(?:the|a|an)\s+/i, "").trim() : "");
  const way = String(_w(d?.words?.way) || (_w(r.way) !== "unseen" ? _w(r.way) : "")).trim();
  const vehicle = String(_w(d?.words?.vehicle) || (!["unseen", "other"].includes(_w(r.vehicle)) ? _w(r.vehicle) : "")).trim();
  const watery = d?.water === true || /boat|flume|rapids|water/i.test(String(d?.noun || ""));   // the decision's own water flag first (2026-09-15)
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
  const ev = d.world?.kind === "event", what = ev ? "EVENT" : "WORK";   // an event is themed like a work: its most photographed scenes are its rooms (2026-09-14)
  const zones = ev && !lead.length ? (Array.isArray(d.world?.zones) ? d.world.zones : []).slice(0, 4) : [];
  return `FORM PREAMBLE — decided from the maker's own words BEFORE this plan; it outranks the request's rewrite and your own reading of the story:\n` +
    `• THE FORM IS A THEME PARK DARK RIDE ("${kind}"). The camera is the rider's seat; frame zero is a photograph taken from the seat; the world is what the ride carries past that seat.\n` +
    `• THE WORLD IS THE NAMED ${what} "${w}", AND ON A DARK RIDE A NAMED ${what} IS A THEME, NOT ${ev ? "A RE-ENACTMENT" : "AN ITINERARY"}. The ride never enters the ${ev ? "event's" : "work's"} places; the ${ev ? "event's most photographed scenes supply" : "work supplies"} THINGS that dress the ride's own scenes. Therefore, for THIS plan:\n` +
    `  – form.places = [] and slots.vantage = [] — no place of the work is a stop; execution.cuts = false. (This overrides any instruction below to list the places the request visits: on this form they are not visited, they are read.)\n` +
    `  – world_theme = { work: "${w}", sources: up to 4 image-search queries for the work's rooms or scenes whose THINGS are worth reading, each shaped "${w} ${ev ? "<scene> photograph" : "<room> scene"}"${zones.length ? ` — its most photographed scenes, as the archives tag them: ${zones.join(" · ")}` : ""}${lead.length ? ` — the brief names the places the maker's video visits, and THEY LEAD, in this order: ${lead.map((p) => `"${w} ${p} scene"`).join(", ")}; add another room only after them` : ""} }.\n` +
    `  – world_elements: up to 6 of the work's most transferable THINGS — a pattern, a fixture, a prop, signage, architecture, a figure of the work described by clothing and posture — each with source = the world_theme source it is read from, and the surface it lives on.\n` +
    `  – the story is the ride's own scenes in order, UNNAMED (the next scene, a turn, a blackout), each carrying things; no scene is named after a place of the work, and read.restated says so; each scene is what a photograph of the work shows, ridden through in order, its things beside and ahead of the track and under it (never named after a place of the work, never a flat or a screen with figures before it); when the maker's words ask for a story (read.plot_required or read.drama_required true) the last scene MAY be the story's own turn acting on the ride, imagined from the work, never a stock effect chosen for size; when they ask for a view (both false — a bare ride is a view) no turn is owed: the ride passes its scenes and rests.\n` +
    `  – read.plot_required and read.drama_required are answered from the maker's words as on any form (owner 2026-09-15: a ride may be a view); where there IS a payoff, read.ending DECIDES HOW IT LANDS: "held" (the default — the rider is there to EXPERIENCE the climax: the last stretch of the take stays inside the event) or "quick" (a button — the payoff lands late and clean after the build, when the maker's words ask for irony, deadpan, a wink or a reversal). Deadpan is a register, never a size: quick shortens the landing, never the event.\n` +
    `  – figures: name the work's people as usual so they resolve; how each is written is decided later by the prose law (a lesser figure may be named; the work's face is described, never named).\n` +
    `  – THE RIDE'S OWN VOICE: the plan's Dialogue block carries THE LINES THE RIDE PLAYS — every figure of the work has its turn as the seat passes it: its own words where the work gave it any (the twins their line, the caretaker his), else the sound it would make, written into the story (a giggle, a hiss, a bell, a knock); no figure passes silent; and "Ride narrator" from the speakers only where no figure can carry the words; the speaker label is the figure by clothing and posture (the caretaker in the red plaid jacket, written plainly, never in quotation marks) or Ride narrator, and it ends in a short parenthetical of HOW the line is said — the caretaker in the red plaid jacket (sing-song, mocking) — the character compiled to voice — never a real person's or an actor's name; the figure speaks its OWN line, and the Ride narrator only when no figure of the scene can say it (narration only where necessary); words the ride would play, never a caption; the line speaks from inside the scene and names no place of the work and not the work's title (the places law holds in speech: "Welcome. You will never leave.", never "Welcome to the <hotel>").\n` +
    `  – EVERY figure the plan writes into the beats or the dialogue is also DECLARED in figures, under the name the story gives it (the Grady twins, the caretaker), never the actor's; a lesser figure keeps that name in the prose and the speaker label ("the Grady twins", never "the twin girls"), a lead is described by build, clothing and posture; no figure carries an age or child word (a pair of children is "the twins" or "two identical figures in matching dresses"); the work's face the maker names in the request is the ride's ANIMATRONIC — declared by role and look (the caretaker in the red plaid jacket), never by name, never by the actor's; a figure the maker casts AS THE RIDERS ("X as the riders") is the seat itself — never seen, never declared as a figure of a scene: the ride's voices address it and the ride acts on it.\n`;
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
