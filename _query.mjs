// ═══ THE QUERY COMPILER — ONE OWNER FOR EVERY SEARCH STRING (owner 2026-09-19) ═══════════════════════════════════════════════
// "'everest-like mountains interior' is a wrong query. i feel like query needs its own architecture. … users can intend on something
// which can be parsed from writing. it would need to be mount everest point blank period if searched on the free library, or mount everest
// iphone footage if paid sites like web. … queries can cause a fail domino effect, and we need to produce something that … reverse
// engineers user inputs and applies the right appendages and the correct rewrites. this is vacuum work. interior is for 'chains' like
// mcdonalds and such, so clearly it tripped up."
//
// The job bc64ff65 that earned this: the place plate for "everest-like mountains" was hunted as "everest-like mountains interior" — a
// venue ladder's word on a mountain — and served a gravel road through green summer hills; the form hunt's lead "trail camera footage
// snowy mountain peak" was stripped of the place's KIND by a repair meant to keep the place's REQUIREMENTS off the form frame. Every
// stage after them (the fit judge, the composition, the writer) walked the wrong way with no way back.
//
// THE CONTRACT: a hunt states WHAT it wants — a subject spec — and this module says HOW each index is asked. Two halves:
//   baseQueries(spec)             the source-neutral rungs, in the order the hunt walks them (what the maker meant, rewritten)
//   shapeForSource(base, source)  the one appendage a source gets (how that index is asked) — the free library gets the bare subject
// No stage composes an appendage of its own; queryLint() is the backstop that names a string built outside this law. Pure, import-free,
// gate-tested in _vacuum_query.mjs with the owner's own inputs as fixtures.

/** THE APPENDAGES, ALL OF THEM, IN ONE PLACE — one per lane; a query gets at most one (scrape.mjs reads this table). */
export const APPENDAGE = Object.freeze({
  candid: "iphone footage",     // a general index answers a bare noun from the commercial layer; this asks for what a person shot
  broadcast: "footage",         // produced material has no civilian layer; the bare medium word still pulls stills-from-video ahead of press photos
  chain: "interior footage",    // the ONE place "interior" belongs: many near-identical sites the public photographs from inside (owner: "interior is for chains")
  scene: "scene",               // a named work's own frames
  form: "footage",              // a capture device is searched as footage OF the device
  built: "",                    // a miniature set has neither layer
  none: "",
});
export const FREE_SOURCES = new Set(["library"]);                               // candid by construction: no appendage, ever
export const PAID_SOURCES = new Set(["web", "index", "scoped", "search", "reddit"]);
/** words that already declare a form — a base carrying one takes no appendage on top (never "… footage footage") */
export const FORM_WORD = /\b(?:footage|video|recording|scene|cctv|surveillance|dash ?cam|body ?cam|trail ?cam(?:era)?|helmet ?cam|chest ?cam|action ?cam(?:era)?|go ?pro|pov|doorbell|webcam|security cam(?:era)?|drone|night ?vision|infra-?red|thermal)\b/i;
/** appendages a stage might have glued on; the free library never sees them */
const TRAILING_APPENDAGE = /\s+(?:iphone footage|interior footage|footage|video|scenery photo|scenery|photograph|photo)$/i;   // "scene" is not an appendage: it is the measured stamp of a work's own frames and stays on every index

/** CAMERA, VANTAGE AND MEDIUM WORDS ARE NEVER THE PLACE, WHEREVER THEY SIT (owner 2026-09-22: "it applies to everything on the free library"). The trailing
 *  strip above could not reach the ride-seat queries that went to the free library verbatim — "dark ride onboard pov footage", "dark ride interior dark ride
 *  pov", "onride dark ride pov". Only words that are never part of a place's own name are listed: "photo", "video", "scene" stay trailing-only
 *  because "photo booth", "video store" and "crime scene" are places. */
export const OV_VANTAGE = /\b(?:iphone|footage|pov|p\.o\.v\.?|onboard|on-board|onride|on-ride|ride-?through|first[- ]person|point[- ]of[- ]view|interior)\b/gi;
// ⭐⭐ …EXCEPT THE INSIDE OF A THING YOU RIDE IN (2026-09-23, remix f99f79a5's place plate): "car interior" reached library as "car", the index answered
// with cars seen whole, the frame was judged against what was asked for it ("a car"), and a silver sedan at a car wash became the take's "car interior".
// A building's inside and its name share their photographs ("laundromat interior" → "laundromat" still stands); a vehicle's do not: photographs of a car
// are its outside, and its inside is a place of its own. So that phrase IS the bare place the free library is asked for, on both roads (the shape here,
// the core in scrape.mjs), and the lint lets it carry its word.
const RIDDEN_THING = "car|cars|truck|van|minivan|bus|coach|train|subway|metro|tram|trolley|streetcar|plane|airplane|aeroplane|aircraft|jet|airliner|helicopter|boat|ship|yacht|ferry|limo|limousine|taxi|cab|rv|camper|motorhome|ambulance|spaceship|spacecraft|rocket|submarine|suv|pickup|jeep|tractor";
const RIDDEN_INTERIOR = new RegExp(`\\b(?:${RIDDEN_THING})\\s+interior\\b`, "i");
/** "car interior", "bus interior": the inside of a thing you ride in, a place of its own. Pure. */
export const isRiddenInterior = (q) => RIDDEN_INTERIOR.test(String(q || ""));
/** The inside-of-a-ridden-thing phrase a query names ("car interior"), lower-cased, or "". Pure. */
export const riddenInteriorOf = (q) => ((String(q || "").match(RIDDEN_INTERIOR) || [""])[0]).toLowerCase();
/** "dark ride dark ride" → "dark ride": a phrase said twice in a row is said once. */
export const collapseRepeats = (s) => String(s || "").replace(/\b(\w+(?:[\s-]+\w+){0,2})(?:\s+\1\b)+/gi, "$1");
const _norm = (s) => String(s || "").replace(/\s+/g, " ").trim();
const _bare = (s) => _norm(s).replace(/^(?:the|a|an)\s+/i, "").trim();
const _uniq = (arr) => { const out = []; for (const x of arr) { const v = _norm(x); if (v && !out.some((o) => o.toLowerCase() === v.toLowerCase())) out.push(v); } return out; };
const KINDS = new Set(["named place", "chain", "kind of place", "broadcast", "work room", "form", "thing"]);

// ⭐⭐ A FORM'S PLATE IS HUNTED BY THE WORDS ITS FOOTAGE IS POSTED UNDER (owner 2026-09-24: "tesla and rideshare show good ones. so those can
// be the form plate queries for car interior cam or whatever we call it. and of course it can bind to appropriation of any vehicles interior
// if a user so wishes"). Measured that day on search scoped to Reddit, twenty rows a query, counted by eye for a real colour frame from the
// dashboard looking back at the seats: "interior dashcam footage" 0 (dashcam installs and night infrared), "tesla cabin camera" about 7 (the
// owners' own name for the camera, mostly app screenshots the chrome crop trims), "rideshare passenger caught on camera" 3 (how incident
// footage is titled). A camera's generic name finds the shop listing and the install; these find the frame. `shows` is the place these
// plates hold and `fits` the place names that are it: any other place the maker asks for (a limousine, a bus, a race car) is hunted as
// itself and bound to the form plate by appropriation. Keyed by the form's class; the class is read by the caller (isInwardCam).
export const FORM_PLATES = Object.freeze({
  "inward car camera": Object.freeze({
    queries: Object.freeze(["tesla cabin camera", "rideshare passenger caught on camera"]),
    shows: "an ordinary car's cabin",
    fits: /^(?:(?:inside|in|within)\s+(?:of\s+)?)?(?:(?:a|an|the|my|our|their|his|her|someone's)\s+)?(?:(?:moving|parked|driving|ordinary|regular|normal|everyday|family|small|compact|modern|rental|friend'?s)\s+)*(?:car|automobile|sedan|suv|hatchback|vehicle|rideshare(?:\s+car)?|uber|lyft|tesla)(?:'s)?(?:\s+(?:interior|cabin|inside|front\s+seats?|back\s+seats?))?(?:\s+(?:on|at|along|down|through|driving|parked|in|during)\b.*)?$/i,   // the place the plate already is: a plain car, where the story takes it included
  }),
});

/** THE SUBJECT OF A HUNT, as the compiler reads it. Pure; unknown kinds read as a kind of place (the plainest rewrite). */
export function subjectSpec(o = {}) {
  const kind = KINDS.has(String(o?.kind || "").toLowerCase()) ? String(o.kind).toLowerCase() : "kind of place";
  return {
    kind,
    name: _norm(o?.name),          // the place as the maker means it: "Mount Everest", "McDonald's", "forest trail"
    kindOf: _norm(o?.kindOf),      // the maker's own fallback for a named place ("everest-like mountains" → "snowy mountains")
    work: _norm(o?.work), room: _norm(o?.room),
    device: _norm(o?.device), placeKind: _norm(o?.placeKind), habitat: _norm(o?.habitat),
    part: _norm(o?.part),          // a chain's PART when the maker named one ("walmart parking lot" → "parking lot"): the customers' photographs of that part, never the interior
    query: _norm(o?.query),        // a thing: the judge's phrasing with the maker's word kept (thingQuery composes it)
    plate: Array.isArray(o?.plate) ? o.plate.map(_norm).filter(Boolean) : [],   // a form's own plate queries (FORM_PLATES), which replace its device rungs
  };
}

/** THE BASE QUERIES — source-neutral, in the order the hunt walks them. The maker's meaning, rewritten for an image index:
 *  a NAMED place is asked for by its name and then by the kind the maker offered as a fallback ("everest-like" = Everest first);
 *  a CHAIN is one of many near-identical sites — its interior is what customers photograph; a KIND of place is the bare kind;
 *  a BROADCAST world and a WORK's room are their own frames ("<show> scene"); a FORM is footage of the device IN the place's kind
 *  first (owner 2026-09-18: "trail cam is better when the form is also the content"), then where its footage is abundant, then bare. */
export function baseQueries(spec = {}) {
  const s = subjectSpec(spec);
  switch (s.kind) {
    case "chain": return s.name ? [s.part && !/\binterior\b/i.test(s.part) ? `${s.name} ${s.part} ${APPENDAGE.form}` : `${s.name} ${APPENDAGE.chain}`] : [];   // "<venue> interior footage": news and incident video is where a chain's casual layer lives, never "iphone" (2026-08-04); a named PART ("parking lot", "drive-thru") is photographed as that part (the 2026-09-19 study: "walmart parking lot" compiled to the interior)
    case "broadcast": return s.name ? [`${s.name} scene`] : [];
    case "work room": return s.work && s.room ? [`${s.work} ${s.room} scene`] : s.work ? [`${s.work} scene`] : [];
    case "form": {
      if (s.plate.length) return _uniq(s.plate);   // the words its footage is posted under (FORM_PLATES), in their own order, and nothing else
      if (!s.device) return [];
      const dev = /footage$/i.test(s.device) ? s.device : `${s.device} footage`;
      const devWord = dev.replace(/\s*footage$/i, "").toLowerCase();
      const withKind = s.placeKind ? `${dev} ${s.placeKind}` : "";
      const withHabitat = s.habitat ? (s.habitat.toLowerCase().includes(devWord) ? s.habitat : `${dev} ${s.habitat}`) : "";
      return _uniq([withKind, withHabitat, dev]);
    }
    case "thing": return _uniq([s.query || s.name]);
    case "named place": return _uniq([s.name, s.kindOf]);
    default: return _uniq([s.name]);
  }
}

/** HOW ONE SOURCE IS ASKED. The free library gets the bare subject — it is a candid tag index and starves on every appendage
 *  (owner 2026-08-11: "footage isnt appended to the free library, because its a candid library itself"). A paid or general index gets
 *  exactly one appendage, by lane, and none when the base already declares a form. Pure. */
export function shapeForSource(base, source, { lane = "candid" } = {}) {
  const b = _norm(base);
  if (!b) return "";
  const src = String(source || "").toLowerCase();
  if (FREE_SOURCES.has(src)) return riddenInteriorOf(b) || _norm(collapseRepeats(b.replace(TRAILING_APPENDAGE, "").replace(/\s+interior$/i, "").replace(OV_VANTAGE, " ").replace(/\s+/g, " ").trim())) || b;
  const app = APPENDAGE[String(lane || "candid").toLowerCase()] ?? "";
  if (!app || FORM_WORD.test(b)) return b;
  return `${b} ${app}`;
}

/** The rungs for one source: the base queries, each shaped for that index. Pure. */
export function compileQueries(spec, source, opts = {}) {
  return _uniq(baseQueries(spec).map((b) => shapeForSource(b, source, opts)));
}

/** THE LINT — what a query must never carry, by the subject it serves. The battery's teeth and a loud line in the run; never a repair
 *  (a query is composed right or its builder is wrong). Returns [] when the string obeys the law. Pure. */
export function queryLint(query, spec = {}, { source = "" } = {}) {
  const q = _norm(query), s = subjectSpec(spec), out = [];
  if (!q) return ["an empty query"];
  const src = String(source || "").toLowerCase();
  if (/\binterior\b/i.test(q) && s.kind !== "chain" && !isRiddenInterior(q)) out.push(`"interior" on a ${s.kind} — that word is for a chain venue only`);
  if (/\b(?:scenery photo|scenery|photograph|stock photo|wallpaper|hd|4k)\b/i.test(q)) out.push(`a stage word an index does not caption by ("${(q.match(/\b(?:scenery photo|scenery|photograph|stock photo|wallpaper|hd|4k)\b/i) || [""])[0]}")`);
  if (/\b(\w+)\s+\1\b/i.test(q)) out.push(`a doubled word ("${(q.match(/\b(\w+)\s+\1\b/i) || ["", ""])[0]}")`);
  if (FREE_SOURCES.has(src) && (TRAILING_APPENDAGE.test(q) || /\biphone\b/i.test(q))) out.push("an appendage on the free library, which is candid by construction");
  if (s.kind === "form" && s.banned && s.banned.length) { /* reserved: the run passes the maker's specific place words */ }
  if (s.kind === "named place" && s.name && !q.toLowerCase().includes(_bare(s.name).toLowerCase()) && !(s.kindOf && q.toLowerCase().includes(_bare(s.kindOf).toLowerCase()))) out.push(`the named place "${s.name}" is missing from its own query`);
  return out;
}
