// PLATE DRESSING — a READ, never an edit (owner 2026-09-08: "no stand in insert. the replacements or addition is prompted with awareness
// of plate's space"; "we shouldnt have used an image model … insertions are stale code"). A vision read of the REAL photograph says which of the
// world's things this plate can hold, on which of ITS OWN surfaces, by replacement or addition. The answer goes to the WRITER, who places
// each thing as a fact of the take in the prose the video model receives. The plate itself is never touched — it stays candid.
//   node _plate_dressing.mjs <plate.jpg> '<elements json>' "<role>"      → prints one line per thing; writes <plate>.dressing.json
import { readFileSync, writeFileSync } from "node:fs";
import { providerJson, textPart, imagePart } from "./provider-llm.mjs";
import { dressesTheWay } from "./_ride_world.mjs";   // the way guard, shared and testable (beside the rails is a surface, not the way)

// ── --things: READ A ROOM FOR ITS THINGS (owner 2026-09-08, the technicality: "it should state what in the dark ride ref gets added
// or replaced with what from the world room (non-dark ride image)"). The world's room photographs never ride as references on a
// dark ride; they are read here for the things a set designer would transfer onto the ride's own scenes — a pattern, a fixture, a
// prop, signage, architecture, a figure described by clothing and posture (never a name, never an age). Writes <plate>.things.json.
//   node _plate_dressing.mjs --things <room.jpg> "<world name>" [n=2]
if (process.argv[2] === "--things") {
  const [, , , roomPlate, worldName = "a themed world", nStr = "2"] = process.argv;
  if (!roomPlate) { console.error('usage: node _plate_dressing.mjs --things <room.jpg> "<world name>" [n]'); process.exit(1); }
  const n = Math.max(1, Math.min(3, Number(nStr) || 2));
  const KINDS = new Set(["pattern", "prop", "fixture", "signage", "architecture", "character"]), SURFACES = new Set(["floor", "wall", "ceiling", "portal", "object", "exterior", "space"]);
  const rb64 = readFileSync(roomPlate).toString("base64");
  const rr = await providerJson([
    textPart(`This REAL photograph shows a room or scene of ${worldName}. A theme park DARK RIDE is being built to carry this world: the ride keeps its own vehicle, rails and show-building architecture, and its scenes are SET-DRESSED with this room's distinctive things. ` +
      `Name up to ${n} things from THIS photograph that a set designer would transfer onto a ride scene, most distinctive first. Return ONLY JSON {"things":[{"name":string,"kind":"pattern|prop|fixture|signage|architecture|character","surface":"floor|wall|ceiling|portal|object|exterior|space","why":string}]}. ` +
      `The room's ceiling, floor and light are NOT things — the ride keeps its own; a wall's finish IS one (wallpaper, wood panelling, hedge) and so is a floor's PATTERN (a hexagonal carpet). NAME THE THING, NEVER THE PLACE it makes or belongs to: "tall green hedge walls", never "hedge walls forming a maze"; "a pair of red elevator doors", never "the lobby's doors" (owner 2026-09-15). ` +
      `"name" is concrete and short (a carpet's pattern in its colours, a pair of elevator doors, a chandelier, an archway, a hedge wall under snow). A figure is described by clothing and posture only — never a name, never an age word. Skip anything generic (a plain wall, a window, daylight).`),
    imagePart("image/jpeg", rb64),
  ], { maxTokens: 2600, temperature: 0.2, tag: "read" });
  const _short = (x) => { const v = String(x || "").replace(/\s+/g, " ").trim(); if (v.length <= 90) return v; const cut = v.slice(0, 90); return cut.slice(0, Math.max(40, cut.lastIndexOf(" "))).trim(); };   // whole words: a thing's name is prose the writer repeats
  const things = (Array.isArray(rr?.things) ? rr.things : []).map((t) => ({ name: _short(t?.name), kind: String(t?.kind || "").toLowerCase().trim(), surface: String(t?.surface || "wall").toLowerCase().trim(), why: String(t?.why || "").slice(0, 120) }))
    .filter((t) => t.name && KINDS.has(t.kind)).map((t) => ({ ...t, surface: SURFACES.has(t.surface) ? t.surface : "wall" })).slice(0, n);
  for (const t of things) console.log(`  ◇ ${t.name} [${t.kind} · ${t.surface}]${t.why ? ` — ${t.why}` : ""}`);
  // THE ROOM'S SURFACES ARE NO LONGER READ (owner 2026-09-15, the set test re-read: "the fact it doesnt replace everything is what keeps it in the world"). The 09-11
  // rule made the plate's wall, ceiling, floor and light into set pieces that became the world's, and every take since left the ride for the world's room. The
  // plate's construction is the ride's own and stands for the whole take; the world arrives as things. The key stays in the file, empty, for shape.
  const surfaces = [];
  try { writeFileSync(`${roomPlate}.things.json`, JSON.stringify({ world: worldName, things, surfaces }, null, 2)); } catch {}
  if (!things.length) { console.log("  ◇ the room offered nothing distinctive to transfer"); process.exit(2); }
  console.log(`  ✓ ${things.length} thing(s) read off the room — to be written onto the ride, never painted`);
  process.exit(0);
}
const [plate, elementsJson, role = "a photograph the ride passes through"] = process.argv.slice(2);
if (!plate || !elementsJson) { console.error('usage: node _plate_dressing.mjs <plate.jpg> \'<elements json>\' "<role>"'); process.exit(1); }
let elements = [];
try { elements = JSON.parse(elementsJson); } catch { console.error("  ✗ elements json unreadable"); process.exit(1); }
elements = (Array.isArray(elements) ? elements : []).slice(0, 3);
if (!elements.length) { console.log("  ◇ no world things to place"); process.exit(2); }

const b64 = readFileSync(plate).toString("base64");
// THE DARK RIDE'S SURFACE LAW (owner 2026-09-08: «usually these designs sit on the sides of a ride on walls and platforms or ahead where
// the vehicle veers away from said spectacle» · «sometimes its not rails you see, sometimes its on water as well … form and content
// awareness»): the spectacle sits BESIDE the way (walls, raised platforms, banks) or AHEAD of it (a tableau the vehicle approaches
// and veers away from); the way itself — rails, a water channel, a groove, the floor the ride travels on — and the vehicle are never
// dressed. The way's own word comes from the seat plate's reading (SEAT_WAY), never from a list of ours.
const DARK = process.env.DARK_RIDE_DRESSING === "1";
const WAY = String(process.env.SEAT_WAY || "").trim(); const wayWord = DARK ? (WAY && WAY !== "unseen" ? WAY : "way the ride travels on") : "rails";
// the guard names the WAY ITSELF — the ground BESIDE the way is a surface the world's things may take (owner 2026-09-09: "that should have
// been replaced with relevant elements" — job 9127e915 skipped the carpet as "organic dirt surface", and the plate's mushroom stayed).
// (The previous line carried literal backspace bytes where \b was meant and never matched at all.)
const WAY_RE = /(?:\brails?\b|\btracks?\b|track ?bed|\bchannel\b|\bwater(?:way)?\b|\bflume\b|\bgroove\b|path(?:way)? ahead|floor ahead|ground ahead|\bbed\b|\bvehicle\b|\bcar\b|\bboat\b|\bpod\b|lap ?bar|restraint)/i;
const read = await providerJson([
  textPart(`This REAL photograph is ${role}, seen from aboard a ride. A themed world's THINGS will be written into the video as dressing on this photograph's own surfaces and spaces. ` +
    `For each thing below, decide whether THIS photograph has a surface or a space for it. Return ONLY JSON {"plate_things":[string],"dressing":[{"name":string,"op":"replace|add|skip","where":string,"why":string}]}. ` +
    (DARK
      ? `This is a DARK RIDE, and this photograph is a scene of ANOTHER ride. Two kinds of thing are in it. ITS BUILDING — plain or dark walls, the ceiling, the floor beside the ${wayWord}, the track bed, and its lighting of any colour — is the ride's own and stays: never listed, never replaced (owner 2026-09-15). ITS SET DRESSING is everything else: every free-standing figure, prop, plant, sign, tableau or piece of furniture, INCLUDING a figure on a stand or platform (listed with its stand), AND its THEMED SCENERY — rock work, a painted backdrop, forest or foliage walls, murals, the other ride's theme on any wall (owner 2026-09-15: the forest is not kept). First list ALL of it in "plate_things", MOST FOREIGN AND MOST PROMINENT FIRST, up to 8, each in the photograph's own words ("the giant mushroom on the right", "the character on the high stand", "the painted forest backdrop"); the list is complete only when nothing free-standing and nothing themed is left. Then WORK DOWN THAT LIST: for each set piece in order choose the world's thing that TAKES ITS PLACE — in kind when one fits (a figure for a figure, a prop or tableau for a prop, the world's wall — hedge walls, wallpaper, panelling — for themed scenery on a wall, a pattern for the ground beside the ${wayWord}) and otherwise the most prominent thing still unplaced — and emit {"name":<the world's thing>,"op":"replace","where":<that set piece, in the photograph's own words>}. A thing of the world with no set piece left to take is ADDED beside the ${wayWord} on open floor when it can stand free — doors, a doorway, a facade, a fireplace, furniture, a figure (dark rides build free-standing facades and tableaux) — {"op":"add","where":<the open space, in the photograph's own words>}; "skip" ONLY a thing that needs a surface the photograph lacks (a ceiling fixture with no ceiling in view) and otherwise the most prominent thing still unplaced — and emit {"name":<the world's thing>,"op":"replace","where":<that set piece, in the photograph's own words>}. A set piece keeps itself ONLY when no thing of the world is left to give (owner 2026-09-10: the mushroom is the first to go, never the one left standing); a thing of the world is placed at most once; "add" only for a thing left over after every set piece has a taker, in open space beside the ${wayWord}. `
      : `"where" names the photograph's OWN surface or space in plain words (the floor ahead, the left wall, the arch around the opening, the far end of the corridor, the ceiling, the rails' colouring). `) +
    `op = "replace" when the photograph has a counterpart the thing takes the place of (a floor's pattern, a wall's finish, the rails' colour); "add" when there is open space for it (a character can stand at the far end, a prop can sit on a ledge); "skip" when nothing plausible exists — never invent space. ` +
    `Never place anything ON the rails or the vehicle except a colouring. Things: ${JSON.stringify(elements.map((e) => ({ name: e.name, kind: e.kind, surface: e.surface })))}` +
    ""),
  imagePart("image/jpeg", b64),
], { maxTokens: 4000, temperature: 0, tag: "dressing" });   // the plate's list must be the same list every run (2026-09-15: two rolls missed the figure on the stand, a third found it)   // placement is a judgement on an image — low, not minimal
const dressing = (Array.isArray(read?.dressing) ? read.dressing : []).filter((e) => e && (e.op === "replace" || e.op === "add") && String(e.name || "").trim() && String(e.where || "").trim())
  .filter((e) => { if (DARK && dressesTheWay(String(e.where))) { console.log(`  ◇ ${e.name}: skipped — "${e.where}" is the way or the vehicle, never dressed on a dark ride`); return false; } return true; }).slice(0, DARK ? 8 : 5);   // a themed plate may owe a replacement per surface as well as per prop
for (const e of (Array.isArray(read?.dressing) ? read.dressing : [])) console.log(`  ◇ ${String(e?.name || "?")}: ${String(e?.op || "?").toUpperCase()}${e?.where ? ` @ ${e.where}` : ""}${e?.why ? ` — ${String(e.why).slice(0, 80)}` : ""}`);
// A NEUTRAL surface is never a set piece (dry-shining-4: "the floor beside the rails", "the dark background walls"); a THEMED one is (owner 2026-09-11: the cave's rock
// walls, rock ceiling and blacklight seeped into the Shining ride because nothing named them as replaced). Neutral = a plain qualifier, or a bare surface noun with
// nothing but a position; the way itself is never a set piece.
const NEUTRAL_SURFACE = /^(?:the |a |an )?(?:(?:dark|bare|flat|plain|black|grey|gray|dim|unlit|empty|blank|neutral)\s+)+(?:floor|ground|walls?|ceiling|background|backdrop|sky|platform|stage floor)\b|^(?:the |a |an )?(?:floor|ground|walls?|ceiling|background|backdrop|sky|platform)(?:\s+(?:on the left|on the right|ahead|overhead|above|below|behind|beside the \w+|next to the \w+))?$|^(?:the |a |an )?(?:rails?|tracks?|track ?bed)\b/i;
// THE CONSTRUCTION IS NEVER A SET PIECE (owner 2026-09-15): a piece whose head noun is a wall, ceiling, floor, backdrop, scenery, sky or light of any colour is the ride's own
// building — kept, never replaced — whatever its theme (the cave's rock ceiling, the painted jungle backdrop, the blue blacklight). A prop keeps its head noun and stays a set piece.
// …narrowed the same night (owner: "i dont want to keep the forest"): a themed WALL, backdrop or scenery is set dressing again — replaced by the world's wall, never by the world's room; the building
// that stays is the ceiling, the floor and track bed, the platforms and the light. A plain or dark wall is neutral (NEUTRAL_SURFACE) and stays too.
const CONSTRUCTION = /^(?:the |a |an )?(?:[\w'-]+\s){0,4}(?:ceilings?|floors?|grounds?|lighting|lights?|blacklights?|glow|roofs?|platforms?|stage floor|track ?bed)(?:\s+(?:on the left|on the right|ahead|overhead|above|below|behind|in the background|in the distance|beside the \w+|next to the \w+|to the (?:left|right)|around the \w+))?$/i;
export const isConstruction = (x) => CONSTRUCTION.test(String(x || "").replace(/\s+/g, " ").trim());
const _rawPlate = (Array.isArray(read?.plate_things) ? read.plate_things : []).map((x) => String(x || "").replace(/\s+/g, " ").trim()).filter(Boolean);
if (DARK) console.log(`  ◇ the read listed as the photograph's own set pieces (before the construction filter): ${_rawPlate.join(" · ") || "nothing"}`);   // transparency: what the read saw, before what the filter kept (2026-09-15)
const plateThings = (Array.isArray(read?.plate_things) ? read.plate_things : []).map((x) => String(x || "").replace(/\s+/g, " ").trim()).filter((x) => x && x.length <= 60 && !NEUTRAL_SURFACE.test(x) && !isConstruction(x)).slice(0, 8);
const _kindOf = (nm) => String((elements.find((x) => String(x?.name || "").toLowerCase() === String(nm || "").toLowerCase()) || {}).kind || "").toLowerCase();
for (const e of dressing.slice()) if (e.op === "replace" && isConstruction(e.where) && !(_kindOf(e.name) === "pattern" && /\b(?:floor|ground)\b/i.test(String(e.where)))) { console.log(`  ◇ ${e.name}: dropped — "${e.where}" is the photograph's building, never replaced (a floor takes only a pattern)`); dressing.splice(dressing.indexOf(e), 1); }
// NO SET PIECE IS LEFT WITHOUT A TAKER WHILE A THING IS LEFT TO GIVE (owner 2026-09-15: "we edit A to ensure all elements of the plate are replaced" — the read at temperature 0
// placed the doors, the hedge walls and the dials and left the character on the high stand standing, with the wainscoting unplaced). The law above says it; this is its
// fallback, in the read's own order — the next unplaced set piece takes the next unplaced thing — logged loudly, never silent.
if (DARK && plateThings.length) {
  const _norm = (x) => String(x || "").toLowerCase().replace(/^(?:the|a|an)\s+/, "").replace(/\s+/g, " ").trim();
  const _taken = new Set(dressing.filter((e) => e.op === "replace").map((e) => _norm(e.where)));
  const _placedNames = new Set(dressing.map((e) => _norm(e.name)));
  const _freePieces = plateThings.filter((p) => !_taken.has(_norm(p)) && ![..._taken].some((w) => w.includes(_norm(p)) || _norm(p).includes(w)));
  const _freeThings = elements.map((e) => e?.name).filter((n) => n && !_placedNames.has(_norm(n)));
  const _paired = [];
  while (_freePieces.length && _freeThings.length && dressing.length < 8) { const piece = _freePieces.shift(), thing = _freeThings.shift(); dressing.push({ name: thing, op: "replace", where: piece, why: "paired by the read's fallback: a set piece is never left standing while a thing of the world is left to give" }); _paired.push(`${piece} ← ${thing}`); }
  if (_paired.length) console.log(`  ◇ paired by the read's fallback (the law: a set piece keeps itself only when nothing is left to give): ${_paired.join(" · ")}`);
}
if (DARK && plateThings.length) console.log(`  ◇ the photograph's own set pieces, most foreign first (each named at frame zero as what it becomes, or as itself only when the world has nothing left to give): ${plateThings.join(" · ")}`);
try { writeFileSync(`${plate}.dressing.json`, JSON.stringify({ role, dressing, plate_things: plateThings }, null, 2)); } catch {}
if (!dressing.length) { console.log("  ◇ the photograph has no surface or space for the world's things here"); process.exit(2); }
console.log(`  ✓ ${dressing.length} thing(s) placed on the photograph's own space — written into the take, never painted`);
