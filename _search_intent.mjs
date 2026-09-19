// ═══ THE READING — WHAT THE MAKER MEANT, READ ONCE, BEFORE ANY QUERY IS COMPOSED (owner 2026-09-19) ════════════════════════════════
// "users can intend on something which can be parsed from writing … we need to produce something that … reverse engineers user inputs and
// applies the right appendages and the correct rewrites." The compiler (_query.mjs) is the second half: it turns a SUBJECT into each
// index's own string. This is the first half: it turns the maker's words into the subjects — what each place READS AS (a named place, a
// chain, a kind of place, a work, a broadcast set), the NAME an image index captions it by, the maker's own FALLBACK when their words
// hedge, and the WORDS THAT ARE WRITTEN and never searched. One reading, stored on the plan (plan.search), consumed by every hunt that
// decides a query; no hunt reads the raw words again.
//
// Two voices, one authority: the resolver's comprehension answers per subject (search_name / search_kind / fallback / written — told
// first, in entityResolve.comprehend, no new call), and what can be parsed from the WRITING is read here without one ("X-like Y" is an
// ordered preference; a chain the resolver flagged; a clock time; a mood word). The resolver's answer is taken where it exists; the
// writing fills the rest; a named half is trusted only when a resolved entity or the resolver's reading confirms it ("a kitchen like
// grandma's" leads with the kitchen). Pure over the plan; gate-tested in _vacuum_search_intent.mjs with the owner's inputs as fixtures.
import { likeShape, likePlaceOf } from "./_sourceability.mjs";

const _norm = (s) => String(s || "").replace(/\s+/g, " ").trim();
const _key = (s) => _norm(s).toLowerCase().replace(/^(?:the|a|an)\s+/, "").replace(/[^a-z0-9]+/g, " ").trim();
const _same = (a, b) => { const x = _key(a), y = _key(b); return !!x && !!y && (x === y || x.includes(y) || y.includes(x)); };
const _uniq = (arr) => { const out = []; for (const x of arr) { const v = _norm(x); if (v && !out.some((o) => o.toLowerCase() === v.toLowerCase())) out.push(v); } return out; };

/** WHAT NO PHOTOGRAPH IS CAPTIONED BY — read off the maker's words and written, never searched. Deliberately short: weather and night
 *  ARE captioned ("snowy mountains", "street at night") and stay searchable; a clock time and a mood are not. */
export const CLOCK_WORDS = /\b(?:at|around|by|after|before)\s+\d{1,2}(?::\d{2})?\s*(?:am|pm|a\.m\.|p\.m\.)\b/gi;
export const MOOD_WORDS = /\b(?:cozy|cosy|eerie|creepy|spooky|gloomy|moody|nostalgic|liminal|dreamy|surreal|peaceful|serene|lonely|melancholic|ominous|whimsical|haunting|unsettling)\b/gi;
export function writtenOf(text = "") {
  const t = _norm(text);
  return _uniq([...(t.match(CLOCK_WORDS) || []), ...(t.match(MOOD_WORDS) || [])]);
}
/** The searchable noun of a place phrase: the maker's words minus what is written, minus articles, possessives and pronouns. */
export function searchable(text = "") {
  return _norm(String(text || "")
    .replace(CLOCK_WORDS, " ").replace(MOOD_WORDS, " ")
    .replace(/\b\w+['’]s\b/g, " ")
    .replace(/\b(?:a|an|the|my|your|his|her|their|its|our|some)\b/gi, " ")
    .replace(/\s{2,}/g, " ")).replace(/^[\s,.-]+|[\s,.-]+$/g, "");
}

const KINDS = new Set(["named place", "chain", "kind of place", "work", "broadcast"]);
const _entry = (o) => ({ term: _norm(o.term), reads_as: KINDS.has(o.reads_as) ? o.reads_as : "kind of place", name: _norm(o.name), fallback: _norm(o.fallback), written: _uniq(o.written || []), read_by: o.read_by || "writing" });

/** ONE PLACE, READ. The resolver's flags on the plan's entities come first (a chain, a broadcast set, a named work are the resolver's
 *  facts); then "X-like Y" as the maker's ordered preference when the named half is confirmed; then the resolver's own search reading
 *  of this term; then an unconfirmed like-shape (its KIND leads, the likeness is written); then a resolved venue; else the plain noun. */
export function readPlace(term, { plan = {}, subjects = [] } = {}) {
  const t = _norm(term);
  if (!t) return null;
  const qualified = _norm(plan?.form?.qualifiedPlaces?.[t] || plan?.form?.qualifiedPlaces?.[_key(t)] || "");
  const ents = Array.isArray(plan?.world_clearance?.entities) ? plan.world_clearance.entities : [];
  const sub = (Array.isArray(subjects) ? subjects : []).find((s) => s && s.term && _same(s.term, t)) || null;
  const rk = String(sub?.search_kind || "").toLowerCase().trim(), rn = _norm(sub?.search_name), rf = _norm(sub?.fallback);
  // THE MODEL'S ANSWER STANDS ALONE WHEN IT SPOKE (owner 2026-09-19: "im skeptical of deterministic/functional code when its to do with context
  // dependent material"): the resolver's own list of written words is the authority; the clock-and-mood list below fills only its silence.
  const spoke = !!(sub && (Array.isArray(sub.written) || sub.search_kind || sub.search_name));
  const written = spoke ? _uniq(Array.isArray(sub.written) ? sub.written : []) : _uniq(writtenOf(qualified || t));
  const chain = ents.find((e) => e?.chainVenue === true && e?.name && _same(e.name, t));
  if (chain) return _entry({ term: t, reads_as: "chain", name: chain.name, written, read_by: "resolver" });
  const bcast = ents.find((e) => e?.broadcastOnly === true && e?.name && _same(e.name, t));
  if (bcast) return _entry({ term: t, reads_as: "broadcast", name: bcast.name, written, read_by: "resolver" });
  const setEnt = ents.find((e) => e?.isSet === true && e?.name && _same(e.name, t));
  if (setEnt) return _entry({ term: t, reads_as: "work", name: setEnt.name, written, read_by: "resolver" });
  const pref = likePlaceOf(qualified || t, plan) || likePlaceOf(t, plan);
  const shape = likeShape(qualified || t) || likeShape(t);
  if (pref) return _entry({ term: t, reads_as: "named place", name: pref.named, fallback: rf || searchable(pref.kind), written: [...written, shape?.conditions], read_by: "writing+resolver" });   // the shape's own conditions ("snow-swept"), never its kind — the kind is the fallback
  if (rk === "named place" && rn) return _entry({ term: t, reads_as: "named place", name: rn, fallback: rf || (shape ? searchable(shape.kind) : ""), written, read_by: "resolver" });
  if (rk === "chain" && rn) return _entry({ term: t, reads_as: "chain", name: rn, written, read_by: "resolver" });
  if (rk === "work" && rn) return _entry({ term: t, reads_as: "work", name: rn, written, read_by: "resolver" });
  if (shape) return _entry({ term: t, reads_as: "kind of place", name: searchable(shape.kind), written: [...written, shape.conditions, `like ${shape.named}`], read_by: "writing" });
  const venue = ents.find((e) => e?.name && !e.chainVenue && !e.broadcastOnly && !e.isSet && /venue|landmark|place/i.test(String(e.kind || "")) && _same(e.name, t));
  if (venue) return _entry({ term: t, reads_as: "named place", name: venue.name, fallback: rf, written, read_by: "resolver" });
  return _entry({ term: t, reads_as: "kind of place", name: (rk === "kind of place" && rn) ? rn : searchable(t) || t, written, read_by: rn ? "resolver" : "writing" });
}

/** The rooms of a named work, as the plan's own shot set names them (the title and the stamp word stripped). */
export function roomsOf(plan = {}, title = "") {
  const shots = Array.isArray(plan?.slots?.world?.shotSet) ? plan.slots.world.shotSet : [];
  const strip = (q) => _norm(String(q || "").replace(new RegExp(`\\b${String(title).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "ig"), " ").replace(/\b(?:scene|still|frame)s?\b/gi, " ").replace(/^(?:the|a|an)\s+/i, ""));
  return _uniq(shots.map((q) => (typeof q === "string" ? q : q?.query || q?.name || "")).map(strip).filter(Boolean));
}

/** THE READING OF ONE REQUEST → plan.search. Pure over the plan; a plan with no places reads its world. */
export function readSearchIntent({ plan = {}, device = "", raw = "" } = {}) {
  const subjects = Array.isArray(plan?.world_clearance?.intent?.subjects) ? plan.world_clearance.intent.subjects : [];
  const wc = plan?.world_clearance || {};
  const title = _norm(wc.setName || plan?.world_theme?.work || (Array.isArray(wc.entities) ? wc.entities.find((e) => e?.isSet === true)?.name : "") || "");
  const work = title ? { title, rooms: roomsOf(plan, title) } : null;
  const placeTerms = _uniq(Array.isArray(plan?.form?.places) ? plan.form.places : []);
  const places = placeTerms.map((p) => readPlace(p, { plan, subjects })).filter(Boolean);
  const worldTerm = _norm(plan?.form?.world || plan?.form?.setting || "");
  const world = places[0] || (work ? _entry({ term: title, reads_as: "work", name: title, read_by: "resolver" }) : (worldTerm ? readPlace(worldTerm, { plan, subjects }) : null));
  const dev = _norm(device || plan?.native_capture || "");
  const form = dev ? { device: /footage$/i.test(dev) ? dev : `${dev} footage` } : null;
  const things = _uniq(subjects.filter((s) => s && s.term && s.is_the_event === true && s.renders !== false).map((s) => s.term));
  const read_by = subjects.some((s) => s && (s.search_kind || s.search_name)) ? "resolver+writing" : "writing";
  const written = _uniq([...places.flatMap((p) => p.written), ...(world?.written || [])]);
  return { read_by, world, places, work, form, things, written, raw: _norm(raw).slice(0, 200) };
}

/** An entry of the reading as the compiler's subject spec (a work's room needs the room; a bare work spec asks for the work's own frames). */
export function specOf(entry, { room = "" } = {}) {
  if (!entry) return null;
  switch (entry.reads_as) {
    case "chain": return { kind: "chain", name: entry.name };
    case "broadcast": return { kind: "broadcast", name: entry.name };
    case "work": return room ? { kind: "work room", work: entry.name, room } : { kind: "broadcast", name: entry.name };
    case "named place": return { kind: "named place", name: entry.name, kindOf: entry.fallback };
    default: return { kind: "kind of place", name: entry.name };
  }
}

/** One log line: what the run read, before it spends. */
export function describeSearch(search) {
  if (!search) return "nothing read";
  const one = (e) => `"${e.term}" reads as ${e.reads_as.toUpperCase()} "${e.name}"${e.fallback ? ` (the maker's fallback "${e.fallback}")` : ""}${e.written.length ? ` — written, never searched: ${e.written.join(", ")}` : ""}`;
  const parts = [];
  if (search.places?.length) parts.push(search.places.map(one).join(" · "));
  else if (search.world) parts.push(one(search.world));
  if (search.work) parts.push(`work "${search.work.title}"${search.work.rooms?.length ? ` (rooms: ${search.work.rooms.join(", ")})` : ""}`);
  if (search.form) parts.push(`form "${search.form.device}"`);
  if (search.things?.length) parts.push(`thing(s): ${search.things.join(", ")}`);
  return `${parts.join(" · ") || "no place named"} [read by ${search.read_by}]`;
}
