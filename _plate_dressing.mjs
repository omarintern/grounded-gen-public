// PLATE DRESSING — a READ, never an edit (owner 2026-09-08: "no stand in insert. the replacements or addition is prompted with awareness
// of plate's space"; "we shouldnt have used an image model … insertions are stale code"). A vision read of the REAL photograph says which of the
// world's things this plate can hold, on which of ITS OWN surfaces, by replacement or addition. The answer goes to the WRITER, who places
// each thing as a fact of the take in the prose the video model receives. The plate itself is never touched — it stays candid.
//   node _plate_dressing.mjs <plate.jpg> '<elements json>' "<role>"      → prints one line per thing; writes <plate>.dressing.json
import { readFileSync, writeFileSync } from "node:fs";
import { providerJson, textPart, imagePart } from "./provider-llm.mjs";

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
