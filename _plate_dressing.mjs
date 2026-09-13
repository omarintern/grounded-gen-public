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
      `Name up to ${n} things from THIS photograph that a set designer would transfer onto a ride scene, most distinctive first. Return ONLY JSON {"things":[{"name":string,"kind":"pattern|prop|fixture|signage|architecture|character","surface":"floor|wall|ceiling|portal|object|exterior|space","why":string}],"surfaces":[{"kind":"wall|ceiling|floor|light","name":string}]}. ` +
      `"surfaces" names this room's OWN wall finish, ceiling, floor and light in a few concrete words each (cream walls with dark wood panelling; a white ceiling with pendant lamps; a hexagonal carpet in orange and brown; warm incandescent light) — one per kind, only those the photograph shows. ` +
      `"name" is concrete and short (a carpet's pattern in its colours, a pair of elevator doors, a chandelier, an archway, a hedge wall under snow). A figure is described by clothing and posture only — never a name, never an age word. Skip anything generic (a plain wall, a window, daylight).`),
    imagePart("image/jpeg", rb64),
  ], { maxTokens: 700, temperature: 0.2, tag: "read" });
  const _short = (x) => { const v = String(x || "").replace(/\s+/g, " ").trim(); if (v.length <= 90) return v; const cut = v.slice(0, 90); return cut.slice(0, Math.max(40, cut.lastIndexOf(" "))).trim(); };   // whole words: a thing's name is prose the writer repeats
  const things = (Array.isArray(rr?.things) ? rr.things : []).map((t) => ({ name: _short(t?.name), kind: String(t?.kind || "").toLowerCase().trim(), surface: String(t?.surface || "wall").toLowerCase().trim(), why: String(t?.why || "").slice(0, 120) }))
    .filter((t) => t.name && KINDS.has(t.kind)).map((t) => ({ ...t, surface: SURFACES.has(t.surface) ? t.surface : "wall" })).slice(0, n);
  for (const t of things) console.log(`  ◇ ${t.name} [${t.kind} · ${t.surface}]${t.why ? ` — ${t.why}` : ""}`);
  // THE ROOM'S OWN SURFACES (owner 2026-09-11: the cave's rock walls, ceiling and blacklight seeped into the Shining ride because a surface was never a set
  // piece and so never replaced; the golden take's plate had neutral black walls, so neglecting them cost nothing). A themed surface of the seat plate becomes
  // the world's surface of the same kind — read here, one per kind, in the room's own words.
  const SKINDS = new Set(["wall", "ceiling", "floor", "light"]);
  const surfaces = (Array.isArray(rr?.surfaces) ? rr.surfaces : []).map((s) => ({ kind: String(s?.kind || "").toLowerCase().trim(), name: _short(s?.name) })).filter((s) => s.name && SKINDS.has(s.kind)).filter((s, i, a) => a.findIndex((x) => x.kind === s.kind) === i).slice(0, 4);
  for (const s of surfaces) console.log(`  ◇ surface · ${s.kind}: ${s.name}`);
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
      ? `This is a DARK RIDE, and this photograph is a scene of ANOTHER ride: everything it shows beside or ahead of the ${wayWord} that is not the ${wayWord} and not the vehicle — its props, figures, plants, tableaux, signs, AND its THEMED SURFACES (rock or cave walls, a rock ceiling, painted scenery, a themed floor beside the ${wayWord}, coloured or blacklight lighting) — is the OTHER ride's set dressing; a NEUTRAL surface (a plain dark show-building wall, a bare floor, plain darkness) is not, and is never listed. First list those set pieces in "plate_things", MOST FOREIGN AND MOST PROMINENT FIRST (the biggest prop of the other ride's own theme leads; a themed wall or ceiling counts; a bare stand comes last), up to 8, each in the photograph's own words ("the giant mushroom on the right", "the rock ceiling"). Then WORK DOWN THAT LIST: for each set piece in order choose the world's thing that TAKES ITS PLACE — in kind when one fits (a figure for a figure, a prop or tableau for a prop, a pattern for a wall or for the ground beside the ${wayWord}; a THEMED SURFACE takes the world's surface of the same kind from "World surfaces" below — a wall the world's wall, a ceiling its ceiling, the floor beside the ${wayWord} its floor, the light its light — emitted as a replace entry like any other) and otherwise the most prominent thing still unplaced — and emit {"name":<the world's thing>,"op":"replace","where":<that set piece, in the photograph's own words>}. A set piece keeps itself ONLY when no thing of the world is left to give (owner 2026-09-10: the mushroom is the first to go, never the one left standing); a thing of the world is placed at most once; "add" only for a thing left over after every set piece has a taker, in open space beside the ${wayWord}. `
      : `"where" names the photograph's OWN surface or space in plain words (the floor ahead, the left wall, the arch around the opening, the far end of the corridor, the ceiling, the rails' colouring). `) +
    `op = "replace" when the photograph has a counterpart the thing takes the place of (a floor's pattern, a wall's finish, the rails' colour); "add" when there is open space for it (a character can stand at the far end, a prop can sit on a ledge); "skip" when nothing plausible exists — never invent space. ` +
    `Never place anything ON the rails or the vehicle except a colouring. Things: ${JSON.stringify(elements.map((e) => ({ name: e.name, kind: e.kind, surface: e.surface })))}` +
    (DARK && process.env.WORLD_SURFACES ? ` World surfaces (the world's own, read off its photographs — for this photograph's themed surfaces to become): ${process.env.WORLD_SURFACES}` : "")),
  imagePart("image/jpeg", b64),
], { maxTokens: 900, temperature: 0.2, tag: "dressing" });   // placement is a judgement on an image — low, not minimal
const dressing = (Array.isArray(read?.dressing) ? read.dressing : []).filter((e) => e && (e.op === "replace" || e.op === "add") && String(e.name || "").trim() && String(e.where || "").trim())
  .filter((e) => { if (DARK && dressesTheWay(String(e.where))) { console.log(`  ◇ ${e.name}: skipped — "${e.where}" is the way or the vehicle, never dressed on a dark ride`); return false; } return true; }).slice(0, DARK ? 8 : 5);   // a themed plate may owe a replacement per surface as well as per prop
for (const e of (Array.isArray(read?.dressing) ? read.dressing : [])) console.log(`  ◇ ${String(e?.name || "?")}: ${String(e?.op || "?").toUpperCase()}${e?.where ? ` @ ${e.where}` : ""}${e?.why ? ` — ${String(e.why).slice(0, 80)}` : ""}`);
// A NEUTRAL surface is never a set piece (dry-shining-4: "the floor beside the rails", "the dark background walls"); a THEMED one is (owner 2026-09-11: the cave's rock
// walls, rock ceiling and blacklight seeped into the Shining ride because nothing named them as replaced). Neutral = a plain qualifier, or a bare surface noun with
// nothing but a position; the way itself is never a set piece.
const NEUTRAL_SURFACE = /^(?:the |a |an )?(?:(?:dark|bare|flat|plain|black|grey|gray|dim|unlit|empty|blank|neutral)\s+)+(?:floor|ground|walls?|ceiling|background|backdrop|sky|platform|stage floor)\b|^(?:the |a |an )?(?:floor|ground|walls?|ceiling|background|backdrop|sky|platform)(?:\s+(?:on the left|on the right|ahead|overhead|above|below|behind|beside the \w+|next to the \w+))?$|^(?:the |a |an )?(?:rails?|tracks?|track ?bed)\b/i;
const plateThings = (Array.isArray(read?.plate_things) ? read.plate_things : []).map((x) => String(x || "").replace(/\s+/g, " ").trim()).filter((x) => x && x.length <= 60 && !NEUTRAL_SURFACE.test(x)).slice(0, 8);
if (DARK && plateThings.length) console.log(`  ◇ the photograph's own set pieces, most foreign first (each named at frame zero as what it becomes, or as itself only when the world has nothing left to give): ${plateThings.join(" · ")}`);
try { writeFileSync(`${plate}.dressing.json`, JSON.stringify({ role, dressing, plate_things: plateThings }, null, 2)); } catch {}
if (!dressing.length) { console.log("  ◇ the photograph has no surface or space for the world's things here"); process.exit(2); }
console.log(`  ✓ ${dressing.length} thing(s) placed on the photograph's own space — written into the take, never painted`);
