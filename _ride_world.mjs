// ═══ THE WORLD, BY MODE (owner 2026-09-09: one decision, four ways the world reaches the ride) ═════════════════════════════════
//   theme        — a dark ride of a named work: the work's rooms are SOURCES, read for their things (--things); the seat plate is
//                  read for where the first things sit BESIDE or AHEAD of its way (frame zero's replacements); the rest arrive
//                  later along the take, in order. No room rides as a reference; no place of the work is named.
//   architecture — a coaster of a named work or a themed setting: the seat plate is a legit coaster; ONE tunnel mouth at most is the
//                  second photograph (the cut hunt photographs the stop as the section it would be built as — archSectionFor);
//                  the world's things are colouring on the coaster's own architecture, placed by a read on each plate.
//   places       — another travelling form of a named world: the world's photographs ride behind the seat in story order.
//   setting      — an unnamed world: the seat plate carries its world; the maker's places are informant plates hunted as places
//                  and the things the planner named are placed by a read on each plate.
// The reads shell _plate_dressing.mjs (a READ, never an edit): the plates stay candid; the answer is prose for the writer.
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

// COASTER ARCHITECTURE (owner 2026-09-07: "a coaster is architecture; a world is dressing"). Each story stop is photographed as the piece
// of ride it would be BUILT as — an entrance as a TUNNEL MOUTH, a room as an indoor SHOW SCENE, a passage as a TUNNEL RUN, an outdoor
// place as an OPEN-AIR RUN — hunted free and bare on the civilian route; the stop itself dresses that section in the prose. The tunnel
// mouth is ALWAYS the first section: the ride's own portal from the legit coaster into the world (owner: "the starting point is
// supposed to be a legit roller coaster, just like the golden gen"). Two plates at most: the seat and one section.
export const ARCH_ENTRY = "ride entrance";
const ARCH_OUTDOOR = /\b(?:maze|garden|forest|woods|field|meadow|beach|street|road|mountain|hill|lake|river|yard|park|exterior|outside|outdoors?|rooftop|desert|snow|courtyard)\b/i;
const ARCH_ENTRYWORDS = /\b(?:entrance|entry|portal|facade|gateway|mouth)\b/i;
const ARCH_PASSAGE = /\b(?:corridor|hallway|hall|passage|tunnel|doorway|gate|stairs?|staircase|elevator|lift|arch|archway|bridge|vestibule)\b/i;
export function archSectionFor(place = "") {
  const p = String(place || "").trim();
  if (p.toLowerCase() === ARCH_ENTRY || ARCH_ENTRYWORDS.test(p)) return { section: "tunnel mouth", queries: ["rollercoaster ride tunnel", "rollercoaster pov tunnel entrance"], intent: "a tunnel mouth ahead on a rollercoaster track seen from the ride, the rails running into it and the interior beyond the opening visible", requirement: "seen from the track: the rails running ahead into the tunnel mouth, with the interior beyond it visible" };
  if (ARCH_OUTDOOR.test(p)) return { section: "open-air run", queries: ["rollercoaster through the trees", "outdoor rollercoaster track ahead"], intent: "an open-air run of rollercoaster track seen from the ride, hedges, trees or scenery close beside the rails", requirement: "seen from the track: the rails running ahead through the open air" };
  if (ARCH_PASSAGE.test(p)) return { section: "tunnel run", queries: ["rollercoaster tunnel interior", "dark ride tunnel"], intent: "an enclosed tunnel run on a rollercoaster track seen from the ride: close walls, the rails running on through it under sparse theatrical light", requirement: "seen from the track: the rails running ahead through the enclosed tunnel" };
  return { section: "show scene", queries: ["indoor rollercoaster show scene", "dark ride show scene set"], intent: "an indoor show scene a ride runs through: themed walls and set pieces at track scale under theatrical light, a dark enclosure around them", requirement: "seen from the track: the rails running ahead through the show scene" };
}

const _sh = (args, { cwd, env }) => { try { execFileSync("node", args, { cwd, stdio: "inherit", env }); return 0; } catch (e) { return e?.status ?? 1; } };
const _json = (p) => { try { return JSON.parse(readFileSync(p, "utf8")); } catch { return null; } };
/** READ THE WORLD'S ROOMS FOR THEIR THINGS (theme): a vision read per room photograph, most distinctive first, deduplicated by name. */
// THE SAME THING TWICE IS ONE THING; A PHOTOGRAPH'S VIEWPOINT IS NOT A THING'S NAME (job 4aa764e1: "hexagonal patterned carpet in orange, brown,
// and red" AND "orange and brown hexagon carpet pattern" both rode the take; "a figure … viewed from behind" named how the room photo saw him).
const VIEWPOINT = /,?\s*(?:viewed|seen|photographed|shot|captured|pictured) from (?:behind|the back|the side|above|below|the front|a distance|afar)\b/gi;
export const cleanThingName = (s) => String(s || "").replace(VIEWPOINT, "").replace(/\s{2,}/g, " ").replace(/\s+,/g, ",").trim();
const _STOP = new Set(["with", "from", "that", "this", "into", "onto", "over", "under", "their", "there", "which", "where", "pattern", "patterned", "patterns", "color", "colour", "colored", "coloured", "matching", "wearing"]);
const _cw = (s) => new Set(String(s || "").toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length >= 4 && !_STOP.has(w)));
export function dedupeThings(list) {
  const out = [];
  for (const e of Array.isArray(list) ? list : []) {
    const name = cleanThingName(e?.name); if (!name) continue;
    const a = _cw(name);
    const dup = out.some((o) => { const b = _cw(o.name); const inter = [...a].filter((w) => b.has(w)).length; return inter > 0 && inter / Math.max(1, Math.min(a.size, b.size)) >= 0.5; });
    if (!dup) out.push({ ...e, name });
  }
  return out;
}
// A 9-second take holds frame zero and a few stops, not a procession (job 4aa764e1: five later things → six scenes in nine seconds, nothing dwelt on)
export const LATER_CAP = 3;
export function readRoomThings({ roomPlates = [], worldName = "a themed world", perRoom = 2, cwd = process.cwd(), env = process.env, log = console.log } = {}) {
  const read = [];
  for (const wp of roomPlates) {
    const abs = join(cwd, wp);
    if (!existsSync(abs)) continue;
    const code = _sh(["_plate_dressing.mjs", "--things", wp, worldName, String(perRoom)], { cwd, env });
    if (code !== 0 && code !== 2) log(`  ◇ room read failed for ${wp.split("/").pop()} (exit ${code})`);
    const d = _json(`${abs}.things.json`);
    for (const x of (d?.things || [])) if (x?.name && !read.some((r) => r.name.toLowerCase() === String(x.name).toLowerCase())) read.push({ name: x.name, kind: x.kind, surface: x.surface, plate: wp });
  }
  return read;
}
/** PLACE THINGS ON A PLATE (a read of the real photograph's own surfaces): lines for the writer — "<where> becomes <name>" (a
 *  replacement) or "<name> at <where>" (an addition). On a dark ride the things sit BESIDE the way or AHEAD and veered from; the
 *  way and the vehicle are never dressed (_plate_dressing's surface law, told through env). */
export function placeOnPlate({ plate, things = [], role = "a photograph the ride passes through", dark = false, way = "", cwd = process.cwd(), env = process.env, log = console.log } = {}) {
  const abs = join(cwd, plate);
  if (!plate || !existsSync(abs) || !things.length) return [];
  const code = _sh(["_plate_dressing.mjs", plate, JSON.stringify(things.slice(0, 3)), role], { cwd, env: { ...env, DARK_RIDE_DRESSING: dark ? "1" : "", SEAT_WAY: dark ? String(way || "") : "" } });
  if (code !== 0 && code !== 2) log(`  ◇ placement read failed for ${role} (exit ${code})`);
  const d = _json(`${abs}.dressing.json`);
  const lines = (d?.dressing || []).map((x) => x.op === "replace" ? `${x.where} becomes ${x.name}` : `${x.name} at ${x.where}`);
  lines.plateThings = Array.isArray(d?.plate_things) ? d.plate_things.map((x) => String(x || "").trim()).filter(Boolean) : [];
  return lines;
}
/** THE WORLD BY MODE — pure in shape (reads happen through the two helpers above). Returns the dressing the writer hears:
 *  placements at frame zero (the seat plate) and on any later plate, the later things in order (theme), and the photographed
 *  places behind the seat in story order (places / setting / architecture). Never a room's name. */
// A FIGURE AMONG THE WORLD'S THINGS (owner 2026-09-09: "whats with the trouble differentiating between things and figures" — the reading
// labelled the twins a character; the writer heard a set piece). A thing the reading or the plan typed as a character, or whose name is a
// person-noun, is a FIGURE: written like a thing (never inserted), performed like an animatronic (_ride_writer).
const FIGURE_KIND = /^(?:character|characters|figure|figures|person|people|creature|animal|animatronic)$/i;
const FIGURE_NOUN = /\b(?:figures?|twins?|girls?|boys?|man|men|woman|women|child(?:ren)?|bride|groom|ghost|butler|clown|witch|skeleton|creature|monster|beast|animatronic|doll|puppet|mannequin|guard|soldier|pirate|king|queen|maid|waiter|dancer|singer|couple|family|caretaker|bartender)\b/i;
export const isFigureThing = (e) => FIGURE_KIND.test(String(e?.kind || "").trim()) || FIGURE_NOUN.test(String(e?.name || ""));
export function worldByMode(d, { seatPlate = "", roomPlates = [], laterPlates = [], worldName = "", cwd = process.cwd(), env = process.env, log = console.log } = {}) {
  const mode = d?.world?.mode || "setting";
  const way = d?.words?.way || d?.seat?.reading?.way || "";
  const planThings = (Array.isArray(d?.world?.things) ? d.world.things : []).map((e) => ({ name: e.name, kind: e.kind, surface: e.surface }));
  const out = { placements: [], later: [], places: laterPlates.map((x) => x.name).filter(Boolean), things: [], plateThings: [], figures: [], photographed: [] };
  const seatRole = "the seat photograph (frame zero, the ride's own vantage)";
  if (mode === "theme") {
    const read = readRoomThings({ roomPlates, worldName: worldName || d?.world?.title || "the world", perRoom: 2, cwd, env, log });
    const things = dedupeThings([...read, ...planThings]).slice(0, 6);
    if (read.length) log(`  ✎ read off the world's rooms (things only): ${read.map((r) => r.name).join(" · ")}`);
    out.things = things;
    out.figures = things.filter(isFigureThing).map((e) => e.name);
    if (out.figures.length) log(`  ◇ figures among them (animatronics on this ride): ${out.figures.join(" · ")}`);
    const placedLines = placeOnPlate({ plate: seatPlate, things: things.slice(0, 3), role: seatRole, dark: true, way, cwd, env, log });
    out.plateThings = placedLines.plateThings || [];
    out.placements = placedLines.map((l) => `${seatRole}: ${l}`);
    if (out.placements.length) log(`  ✓ frame zero's replacements, beside or ahead of the way: ${out.placements.map((l) => l.replace(`${seatRole}: `, "")).join(" | ").slice(0, 300)}`);
    else if (things.length) log(`  ◇ the seat photograph offered no surface beside or ahead of its way — every thing arrives later along the take`);
    const placed = out.placements.join(" | ").toLowerCase();
    // PHOTOGRAPHS OF THE WORLD THAT RIDE WITH THE SEAT (owner 2026-09-09: "on a themed dark ride they are sent, not just read for their things"):
    // each sent room rides as a reference and is written as its qualities — the things read off it — never by name; its things do not
    // double as later things (they arrive with their photograph).
    const sent = new Set(laterPlates.map((x) => x.plate).filter(Boolean));
    out.photographed = laterPlates.filter((x) => x.plate && x.name).map((x) => ({ name: x.name, plate: x.plate, qualities: read.filter((r) => r.plate === x.plate).map((r) => r.name).slice(0, 4) }));
    if (out.photographed.length) log(`  ◉ photographs of the world ride with the seat, in story order: ${out.photographed.map((p) => `${p.name} (${p.qualities.join(" · ") || "its own room"})`).join("; ")}`);
    const laterAll = things.filter((e) => !placed.includes(String(e.name).toLowerCase()) && !(e.plate && sent.has(e.plate))).map((e) => e.name);
    out.later = laterAll.slice(0, LATER_CAP);
    if (laterAll.length > LATER_CAP) log(`  ◇ ${laterAll.length - LATER_CAP} later thing(s) left out — a take holds frame zero and ${LATER_CAP} stops, not a procession: ${laterAll.slice(LATER_CAP).join(" · ")}`);
    if (out.later.length) log(`  ◉ later along the take, in order: ${out.later.join(" → ")}`);
    if (!things.length) log(`  ◇ the rooms and the planner offered no things — the world arrives in the maker's words alone`);
    return out;
  }
  // architecture / places / setting: the planner's things, placed by a read on the seat plate and on each photographed place
  const things = dedupeThings(planThings).slice(0, 3);
  out.things = things;
  if (!things.length) { log(`  ◇ the planner named no world things — the dressing is the maker's words`); return out; }
  log(`  ✎ dressing: ${things.length} of the world's things to place by prompt — ${things.map((e) => e.name).join(" · ")}`);
  const plates = [[seatPlate, seatRole], ...laterPlates.map((x) => [x.plate, x.role || `the photograph of ${x.name}`])];
  for (const [p, role] of plates) for (const l of placeOnPlate({ plate: p, things, role, dark: false, cwd, env, log })) out.placements.push(`${role}: ${l}`);
  if (out.placements.length) log(`  ✓ dressing written for the take: ${out.placements.join(" | ").slice(0, 300)}`);
  else log(`  ◇ no photograph offered a surface for the world's things — they are written without a placement`);
  return out;
}
