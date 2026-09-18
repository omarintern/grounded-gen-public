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
// ⭐⭐ TWO TRANSFERS, ONE READ (owner 2026-09-18). A RIDE keeps its building: its walls, its ceiling, its floor and its
// light are the ride's own and only its SET PIECES take the world's things (owner 2026-09-15, and the Mushrooms and
// Elevator Surprises gen is the standard). A CAPTURE FORM has no building of its own to keep: what is constant is the
// apparatus, its vantage, its overlay and its wash, and everything the frame shows belongs to the other place. So capture
// mode reads the world's SURFACES as well as its things and offers the photograph's own construction as a target, while
// ride mode is byte-identical to what it was. TRANSFER_MODE defaults to the ride, so nothing moves unless it is asked for.
const CAPTURE = process.env.TRANSFER_MODE === "capture";

if (process.argv[2] === "--things") {
  const [, , , roomPlate, worldName = "a themed world", nStr = "2"] = process.argv;
  if (!roomPlate) { console.error('usage: node _plate_dressing.mjs --things <room.jpg> "<world name>" [n]'); process.exit(1); }
  const n = Math.max(1, Math.min(4, Number(nStr) || 2));   // up to four (B5, 2026-09-15: six plate pieces against four things from two frames)
  const KINDS = new Set(["pattern", "prop", "fixture", "signage", "architecture", "character"]), SURFACES = new Set(["floor", "wall", "ceiling", "portal", "object", "exterior", "space"]);
  const SURF_KINDS = new Set(["wall", "ceiling", "floor", "light"]);
  const rb64 = readFileSync(roomPlate).toString("base64");
  const rr = await providerJson([
    textPart((CAPTURE
      ? `This REAL photograph shows ${worldName}. A video of this place is being made from a DIFFERENT photograph, one a fixed recording device made somewhere else: that frame keeps its own vantage, its overlay and its colour, and everything else in it becomes THIS place. ` +
        `Name up to ${n} things from THIS photograph that carry this place's identity, most distinctive first, AND the place's own surfaces. `
      : `This REAL photograph shows a room or scene of ${worldName}. A theme park DARK RIDE is being built to carry this world: the ride keeps its own vehicle, rails and show-building architecture, and its scenes are SET-DRESSED with this room's distinctive things. `) +
      (CAPTURE
        ? `Return ONLY JSON {"things":[{"name":string,"kind":"pattern|prop|fixture|signage|architecture|character","surface":"floor|wall|ceiling|portal|object|exterior|space","why":string}],"surfaces":[{"kind":"wall|ceiling|floor|light","name":string}]}. ` +
          `"surfaces" names this place's OWN wall finish, ceiling, floor and light in a short phrase each ("yellow and cream striped wallpaper with white wainscoting", "herringbone wood flooring", "bright even light"), because the other frame's construction becomes this one's. `
        : `Name up to ${n} things from THIS photograph that a set designer would transfer onto a ride scene, most distinctive first. Return ONLY JSON {"things":[{"name":string,"kind":"pattern|prop|fixture|signage|architecture|character","surface":"floor|wall|ceiling|portal|object|exterior|space","why":string}]}. `) +
      `A wall's finish is a thing (wallpaper, wood panelling, hedge), so is a floor's PATTERN (a hexagonal carpet) and a ceiling's fixture (a chandelier); the room's light is not a thing — the take's light follows the photographs. NAME THE THING, NEVER THE PLACE it makes or belongs to: "tall green hedge walls", never "hedge walls forming a maze"; "a pair of red elevator doors", never "the lobby's doors" (owner 2026-09-15). ` +
      `"name" is concrete and short (a carpet's pattern in its colours, a pair of elevator doors, a chandelier, an archway, a hedge wall under snow). A PERSON in the photograph is named by WHO THEY ARE IN THE WORK'S OWN TERMS — a role phrase, or the name the story gives a lesser figure — and then by clothing and posture: "the caretaker in a green jacket walking away", "the caretaker's wife and their son in winter jackets, hand in hand", "the bartender behind the bar in a burgundy jacket", "the Grady twins in matching blue dresses" (owner 2026-09-15: the writer never sees the photograph, only this line — a pair in the maze was written as the twins because nothing said who they were); never an actor's name, never an age word; when you cannot tell who they are, the role their clothing and posture show (a guest, a waiter). Skip anything generic (a plain wall, a window, daylight).`),
    imagePart("image/jpeg", rb64),
  ], { maxTokens: 2600, temperature: 0.2, tag: "read" });
  const _short = (x) => { const v = String(x || "").replace(/\s+/g, " ").trim(); if (v.length <= 90) return v; const cut = v.slice(0, 90); return cut.slice(0, Math.max(40, cut.lastIndexOf(" "))).trim(); };   // whole words: a thing's name is prose the writer repeats
  const things = (Array.isArray(rr?.things) ? rr.things : []).map((t) => ({ name: _short(t?.name), kind: String(t?.kind || "").toLowerCase().trim(), surface: String(t?.surface || "wall").toLowerCase().trim(), why: String(t?.why || "").slice(0, 120) }))
    .filter((t) => t.name && KINDS.has(t.kind)).map((t) => ({ ...t, surface: SURFACES.has(t.surface) ? t.surface : "wall" })).slice(0, n);
  for (const t of things) console.log(`  ◇ ${t.name} [${t.kind} · ${t.surface}]${t.why ? ` — ${t.why}` : ""}`);
  // THE ROOM'S SURFACES ARE NO LONGER READ ON A RIDE (owner 2026-09-15, the set test re-read: "the fact it doesnt replace everything is what keeps it in the world"). The
  // 09-11 rule made the plate's wall, ceiling, floor and light into set pieces that became the world's, and every take since left the ride for the world's room. The
  // plate's construction is the ride's own and stands for the whole take; the world arrives as things. That ruling is about a RIDE and it is untouched: the owner
  // re-read it on 2026-09-18 against the Mushrooms and Elevator Surprises gen and it stands. A CAPTURE FORM has no building of its own, only an apparatus, so there
  // the surfaces ARE read and the other frame's construction becomes this place's (the Oval Office render: the study room's brown wall became the striped wallpaper).
  const surfaces = CAPTURE
    ? (Array.isArray(rr?.surfaces) ? rr.surfaces : []).map((x) => ({ kind: String(x?.kind || "").toLowerCase().trim(), name: _short(x?.name) }))
        .filter((x) => x.name && SURF_KINDS.has(x.kind)).filter((x, i, a) => a.findIndex((y) => y.kind === x.kind) === i)
    : [];
  if (CAPTURE && surfaces.length) console.log(`  ◇ and its construction: ${surfaces.map((x) => `${x.kind} ${x.name}`).join("; ")}`);
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
const TRANSFER = DARK || CAPTURE;   // both transfers work down the plate's own list until every piece has a taker; an ordinary dressing read still only answers per thing
const WAY = String(process.env.SEAT_WAY || "").trim(); const wayWord = DARK ? (WAY && WAY !== "unseen" ? WAY : "way the ride travels on") : "rails";
// the guard names the WAY ITSELF — the ground BESIDE the way is a surface the world's things may take (owner 2026-09-09: "that should have
// been replaced with relevant elements" — job 9127e915 skipped the carpet as "organic dirt surface", and the plate's mushroom stayed).
// (The previous line carried literal backspace bytes where \b was meant and never matched at all.)
const WAY_RE = /(?:\brails?\b|\btracks?\b|track ?bed|\bchannel\b|\bwater(?:way)?\b|\bflume\b|\bgroove\b|path(?:way)? ahead|floor ahead|ground ahead|\bbed\b|\bvehicle\b|\bcar\b|\bboat\b|\bpod\b|lap ?bar|restraint)/i;
const read = await providerJson([
  textPart((CAPTURE
    ? `This REAL photograph is ${role}: it is what a recording device made, and it is the video's FIRST FRAME. Its vantage, its overlay (a timestamp, a camera number, corner marks) and its washed colour are the constants of the whole take and are never listed. EVERYTHING ELSE the frame shows belongs to a different place and becomes this video's place: its furniture, its props, its signs, AND its construction (the wall finish, the ceiling, the floor). ` +
      `A PERSON in the frame is NEVER a set piece and is never replaced by a thing: list each one separately under "plate_people", in the photograph's own words and by where they are, because the story's own figures will stand where they stood. `
    : `This REAL photograph is ${role}, seen from aboard a ride. A themed world's THINGS will be written into the video as dressing on this photograph's own surfaces and spaces. `) +
    `For each thing below, decide whether THIS photograph has a surface or a space for it. Return ONLY JSON {"plate_things":[string],"dressing":[{"name":string,"op":"replace|add|skip","where":string,"why":string}]${CAPTURE ? ',"plate_people":[string]' : ""}}. ` +
    (DARK
      ? `This is a DARK RIDE, and this photograph is a scene of ANOTHER ride: everything it shows that is not the ${wayWord}, the vehicle or the seat is the OTHER ride's set dressing and is listed — every free-standing figure, prop, plant, sign, tableau or piece of furniture, INCLUDING a figure on a stand or platform (listed with its stand), AND its THEMED SCENERY — rock work, a painted backdrop, forest or foliage walls, murals, a themed ceiling, a themed floor beside the ${wayWord} (owner 2026-09-15: nothing of the photograph's dressing survives; A' is the standard). Its LIGHT is never listed — the take's light follows the world. First list ALL of it in "plate_things", MOST FOREIGN AND MOST PROMINENT FIRST, up to 8, each in the photograph's own words ("the giant mushroom on the right", "the character on the high stand", "the painted forest backdrop"); the list is complete only when nothing free-standing and nothing themed is left. Then WORK DOWN THAT LIST: for each set piece in order choose the world's thing that TAKES ITS PLACE — in kind when one fits (a figure for a figure, a prop or tableau for a prop, the world's wall — hedge walls, wallpaper, panelling — for themed scenery on a wall, a pattern for the ground beside the ${wayWord}) and otherwise the most prominent thing still unplaced — and emit {"name":<the world's thing>,"op":"replace","where":<that set piece, in the photograph's own words>}. A thing of the world with no set piece left to take is ADDED beside the ${wayWord} on open floor when it can stand free — doors, a doorway, a facade, a fireplace, furniture, a figure (dark rides build free-standing facades and tableaux) — {"op":"add","where":<the open space, in the photograph's own words>}; "skip" ONLY a thing that needs a surface the photograph lacks (a ceiling fixture with no ceiling in view); a world's wall finish (wainscoting, wallpaper, panelling) may take a themed wall, a world's floor pattern a themed floor and otherwise the most prominent thing still unplaced — and emit {"name":<the world's thing>,"op":"replace","where":<that set piece, in the photograph's own words>}. A set piece keeps itself ONLY when no thing of the world is left to give (owner 2026-09-10: the mushroom is the first to go, never the one left standing); a thing of the world is placed at most once; "add" only for a thing left over after every set piece has a taker, in open space beside the ${wayWord}. `
      : CAPTURE
      ? `First list in "plate_things", MOST FOREIGN AND MOST PROMINENT FIRST, up to 8, everything the frame shows that is not the apparatus itself, each in the photograph's own words ("the long study desk with white cubicle dividers", "the brown painted wall", "the grey concrete floor") — its construction included, because the constant here is the camera and not a building. Then WORK DOWN THAT LIST: for each piece in order choose the thing or surface of the world that TAKES ITS PLACE, in kind when one fits (a desk for a desk, a wall finish for a wall, a floor for a floor, a light for a light), and emit {"name":<the world's thing>,"op":"replace","where":<that piece, in the photograph's own words>}. "add" only for a thing left over once every piece has a taker; "skip" only where the photograph lacks the surface entirely. A person is never a piece and never appears here. `
      : `"where" names the photograph's OWN surface or space in plain words (the floor ahead, the left wall, the arch around the opening, the far end of the corridor, the ceiling, the rails' colouring). `) +
    `op = "replace" when the photograph has a counterpart the thing takes the place of (a floor's pattern, a wall's finish, the rails' colour); "add" when there is open space for it (a character can stand at the far end, a prop can sit on a ledge); "skip" when nothing plausible exists — never invent space. ` +
    `Never place anything ON the rails or the vehicle except a colouring. Things: ${JSON.stringify(elements.map((e) => ({ name: e.name, kind: e.kind, surface: e.surface })))}` +
    ""),
  imagePart("image/jpeg", b64),
], { maxTokens: 4000, temperature: 0, tag: "dressing" });   // the plate's list must be the same list every run (2026-09-15: two rolls missed the figure on the stand, a third found it)   // placement is a judgement on an image — low, not minimal
const dressing = (Array.isArray(read?.dressing) ? read.dressing : []).filter((e) => e && (e.op === "replace" || e.op === "add") && String(e.name || "").trim() && String(e.where || "").trim())
  .filter((e) => { if (DARK && dressesTheWay(String(e.where))) { console.log(`  ◇ ${e.name}: skipped — "${e.where}" is the way or the vehicle, never dressed on a dark ride`); return false; } return true; }).slice(0, TRANSFER ? 8 : 5);   // a themed plate may owe a replacement per surface as well as per prop
for (const e of (Array.isArray(read?.dressing) ? read.dressing : [])) console.log(`  ◇ ${String(e?.name || "?")}: ${String(e?.op || "?").toUpperCase()}${e?.where ? ` @ ${e.where}` : ""}${e?.why ? ` — ${String(e.why).slice(0, 80)}` : ""}`);
// A NEUTRAL surface is never a set piece (dry-shining-4: "the floor beside the rails", "the dark background walls"); a THEMED one is (owner 2026-09-11: the cave's rock
// walls, rock ceiling and blacklight seeped into the Shining ride because nothing named them as replaced). Neutral = a plain qualifier, or a bare surface noun with
// nothing but a position; the way itself is never a set piece.
const NEUTRAL_SURFACE = /^(?:the |a |an )?(?:(?:dark|bare|flat|plain|black|grey|gray|dim|unlit|empty|blank|neutral)\s+)+(?:floor|ground|walls?|ceiling|background|backdrop|sky|platform|stage floor)\b|^(?:the |a |an )?(?:floor|ground|walls?|ceiling|background|backdrop|sky|platform)(?:\s+(?:on the left|on the right|ahead|overhead|above|below|behind|beside the \w+|next to the \w+))?$|^(?:the |a |an )?(?:rails?|tracks?|track ?bed)\b/i;
// THE CONSTRUCTION IS NEVER A SET PIECE (owner 2026-09-15): a piece whose head noun is a wall, ceiling, floor, backdrop, scenery, sky or light of any colour is the ride's own
// building — kept, never replaced — whatever its theme (the cave's rock ceiling, the painted jungle backdrop, the blue blacklight). A prop keeps its head noun and stays a set piece.
// …and narrowed again the same night to the LIGHT, the track bed and a bare platform (owner 2026-09-15: A' is the standard — A' replaced every set piece, themed ceiling
// and floor included, and the light followed the world; the plate's coloured wash is never a set piece and never named, so the world's photographs decide the light).
const CONSTRUCTION = /^(?:the |a |an )?(?:[\w'-]+\s){0,4}(?:lighting|lights?|blacklights?|glow|platforms?|track ?bed)(?:\s+(?:on the left|on the right|ahead|overhead|above|below|behind|in the background|in the distance|beside the \w+|next to the \w+|to the (?:left|right)|around the \w+))?$/i;
export const isConstruction = (x) => CONSTRUCTION.test(String(x || "").replace(/\s+/g, " ").trim());
const _rawPlate = (Array.isArray(read?.plate_things) ? read.plate_things : []).map((x) => String(x || "").replace(/\s+/g, " ").trim()).filter(Boolean);
if (TRANSFER) console.log(`  ◇ the read listed as the photograph's own pieces (before the construction filter): ${_rawPlate.join(", ") || "nothing"}`);   // transparency: what the read saw, before what the filter kept (2026-09-15)
// ⚠ THE CONSTRUCTION FILTER IS THE RIDE'S (2026-09-18). It exists because a ride keeps its own building; a capture form has no
// building, only an apparatus, so under capture mode a wall, a ceiling or a floor IS a piece and the filter narrows to the neutral
// test alone. The light stays out either way: it follows the world's photographs and is never named as a piece.
const plateThings = (Array.isArray(read?.plate_things) ? read.plate_things : []).map((x) => String(x || "").replace(/\s+/g, " ").trim()).filter((x) => x && x.length <= 60 && !NEUTRAL_SURFACE.test(x) && (CAPTURE ? !/\blight(?:ing|s)?\b/i.test(x) : !isConstruction(x))).slice(0, 8);
// ⭐⭐ A PERSON IS NEVER A SET PIECE (owner 2026-09-18, "as in the successful nordic oval office gen"): the read lists the people
// the frame holds and nothing of the world replaces them. Their positions go to the writer, who stands the story's own figures
// where they stood ("a tall nordic stands guard beside the desk where the person at the laptop sat").
const platePeople = CAPTURE ? (Array.isArray(read?.plate_people) ? read.plate_people : []).map((x) => String(x || "").replace(/\s+/g, " ").trim()).filter(Boolean).slice(0, 4) : [];
if (platePeople.length) console.log(`  ◇ people in the frame, never replaced, their places offered to the story's figures: ${platePeople.join(", ")}`);
const _kindOf = (nm) => String((elements.find((x) => String(x?.name || "").toLowerCase() === String(nm || "").toLowerCase()) || {}).kind || "").toLowerCase();
for (const e of dressing.slice()) if (e.op === "replace" && isConstruction(e.where)) { console.log(`  ◇ ${e.name}: dropped — "${e.where}" is the light, the track bed or a bare platform, never replaced (the light follows the world)`); dressing.splice(dressing.indexOf(e), 1); }
// A PIECE IS REPLACED BEFORE ANYTHING IS ADDED — simple arithmetic (owner 2026-09-15: "it should be simple math that a piece is replaced before anything is added";
// B4: the pumpkin figures and the themed floor survived while the dials, the hedge walls and the maze marker had been spent as additions and later stops). While a set
// piece has no taker, the next thing goes to it — first a thing the read left unplaced, then a thing it had ADDED (the addition becomes the replacement) — in the read's
// own order; "add" is only ever what is left after every piece has a taker. Logged loudly, never silent.
if (TRANSFER && plateThings.length) {
  const _norm = (x) => String(x || "").toLowerCase().replace(/^(?:the|a|an)\s+/, "").replace(/\s+/g, " ").trim();
  const _taken = () => new Set(dressing.filter((e) => e.op === "replace").map((e) => _norm(e.where)));
  const _isTaken = (p) => { const t = _taken(), n = _norm(p); return t.has(n) || [...t].some((w) => w.includes(n) || n.includes(w)); };
  const _freePieces = () => plateThings.filter((p) => !_isTaken(p));
  const _placedNames = () => new Set(dressing.map((e) => _norm(e.name)));
  const _paired = [];
  for (const piece of plateThings) {
    if (!_freePieces().includes(piece) || dressing.length >= 8) continue;
    const unplaced = elements.map((e) => e?.name).find((n) => n && !_placedNames().has(_norm(n)));
    if (unplaced) { dressing.push({ name: unplaced, op: "replace", where: piece, why: "arithmetic: a piece is replaced before anything is added" }); _paired.push(`${piece} ← ${unplaced}`); continue; }
    const addIdx = dressing.findIndex((e) => e.op === "add");
    if (addIdx >= 0) { const e = dressing[addIdx]; dressing[addIdx] = { name: e.name, op: "replace", where: piece, why: `arithmetic: the addition at "${e.where}" becomes this piece's replacement` }; _paired.push(`${piece} ← ${e.name} (was added)`); continue; }
    // NOTHING LEFT TO GIVE — THE PIECE IS STRUCK (owner 2026-09-15: nothing of the photograph's own set dressing survives; B5 left the jack-o'-lanterns, the wooden stand and
    // the forest floor standing in the Shining ride when the world had only four things): a piece with no taker becomes the show building's own — a black wall where a
    // prop, a figure or scenery stood, the bare floor beside the way where a floor piece lay — the ride's building, which stays by law, and nothing of the other ride's theme.
    const floorish = /\b(?:floor|ground|carpet|rug|path|steps?|stairs?)\b/i.test(piece);
    dressing.push({ name: floorish ? `the bare floor beside the ${wayWord}` : "the show building's own black wall", op: "replace", where: piece, why: "struck: nothing of the photograph's dressing survives; no thing of the world was left to give" }); _paired.push(`${piece} ← struck (${floorish ? "bare floor" : "black wall"})`);
  }
  if (_paired.length) console.log(`  ◇ replaced before added (arithmetic — every set piece has a taker while a thing is left; a piece with none is struck): ${_paired.join(" · ")}`);
}
if (TRANSFER && plateThings.length) console.log(`  ◇ the photograph's own set pieces, most foreign first (each named at frame zero as what it becomes, or as itself only when the world has nothing left to give): ${plateThings.join(", ")}`);
try { writeFileSync(`${plate}.dressing.json`, JSON.stringify({ role, dressing, plate_things: plateThings, plate_people: platePeople }, null, 2)); } catch {}
if (!dressing.length) { console.log("  ◇ the photograph has no surface or space for the world's things here"); process.exit(2); }
console.log(`  ✓ ${dressing.length} thing(s) placed on the photograph's own space — written into the take, never painted`);
