// PLATE DRESSING — a READ, never an edit (owner 2026-09-08: "no stand in insert. the replacements or addition is prompted with awareness
// of plate's space"; "we shouldnt have used an image model … insertions are stale code"). A vision read of the REAL photograph says which of the
// world's things this plate can hold, on which of ITS OWN surfaces, by replacement or addition. The answer goes to the WRITER, who places
// each thing as a fact of the take in the prose the video model receives. The plate itself is never touched — it stays candid.
//   node _plate_dressing.mjs <plate.jpg> '<elements json>' "<role>"      → prints one line per thing; writes <plate>.dressing.json
import { readFileSync, writeFileSync } from "node:fs";
import { providerJson, textPart, imagePart } from "./provider-llm.mjs";

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
      `"name" is concrete and short (a carpet's pattern in its colours, a pair of elevator doors, a chandelier, an archway, a hedge wall under snow). A figure is described by clothing and posture only — never a name, never an age word. Skip anything generic (a plain wall, a window, daylight).`),
    imagePart("image/jpeg", rb64),
  ], { maxTokens: 500, temperature: 0.2 });
  const _short = (x) => { const v = String(x || "").replace(/\s+/g, " ").trim(); if (v.length <= 90) return v; const cut = v.slice(0, 90); return cut.slice(0, Math.max(40, cut.lastIndexOf(" "))).trim(); };   // whole words: a thing's name is prose the writer repeats
  const things = (Array.isArray(rr?.things) ? rr.things : []).map((t) => ({ name: _short(t?.name), kind: String(t?.kind || "").toLowerCase().trim(), surface: String(t?.surface || "wall").toLowerCase().trim(), why: String(t?.why || "").slice(0, 120) }))
    .filter((t) => t.name && KINDS.has(t.kind)).map((t) => ({ ...t, surface: SURFACES.has(t.surface) ? t.surface : "wall" })).slice(0, n);
  for (const t of things) console.log(`  ◇ ${t.name} [${t.kind} · ${t.surface}]${t.why ? ` — ${t.why}` : ""}`);
  try { writeFileSync(`${roomPlate}.things.json`, JSON.stringify({ world: worldName, things }, null, 2)); } catch {}
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
const read = await providerJson([
  textPart(`This REAL photograph is ${role}, seen from aboard a ride. A themed world's THINGS will be written into the video as dressing on this photograph's own surfaces and spaces. ` +
    `For each thing below, decide whether THIS photograph has a surface or a space for it. Return ONLY JSON {"dressing":[{"name":string,"op":"replace|add|skip","where":string,"why":string}]}. ` +
    `"where" names the photograph's OWN surface or space in plain words (the floor ahead, the left wall, the arch around the opening, the far end of the corridor, the ceiling, the rails' colouring). ` +
    `op = "replace" when the photograph has a counterpart the thing takes the place of (a floor's pattern, a wall's finish, the rails' colour); "add" when there is open space for it (a character can stand at the far end, a prop can sit on a ledge); "skip" when nothing plausible exists — never invent space. ` +
    `Never place anything ON the rails or the vehicle except a colouring. Things: ${JSON.stringify(elements.map((e) => ({ name: e.name, kind: e.kind, surface: e.surface })))}`),
  imagePart("image/jpeg", b64),
], { maxTokens: 700, temperature: 0.2 });
const dressing = (Array.isArray(read?.dressing) ? read.dressing : []).filter((e) => e && (e.op === "replace" || e.op === "add") && String(e.name || "").trim() && String(e.where || "").trim()).slice(0, 3);
for (const e of (Array.isArray(read?.dressing) ? read.dressing : [])) console.log(`  ◇ ${String(e?.name || "?")}: ${String(e?.op || "?").toUpperCase()}${e?.where ? ` @ ${e.where}` : ""}${e?.why ? ` — ${String(e.why).slice(0, 80)}` : ""}`);
try { writeFileSync(`${plate}.dressing.json`, JSON.stringify({ role, dressing }, null, 2)); } catch {}
if (!dressing.length) { console.log("  ◇ the photograph has no surface or space for the world's things here"); process.exit(2); }
console.log(`  ✓ ${dressing.length} thing(s) placed on the photograph's own space — written into the take, never painted`);
