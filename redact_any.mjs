// Generic reference redaction — STAGE 1 (VLM detection), globs a form's refs/ dir
// instead of a hardcoded file list. Same detection prompt as redact.mjs (ARCHITECTURE §5c).
// Usage: node redact_any.mjs <form>
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { providerJson, textPart, imagePart } from "./provider-llm.mjs";
import { OUT } from "./lib.mjs";

const form = process.argv[2] || "trump_nascar_v2plan";
const refsDir = join(OUT, form, "refs");
const FILES = readdirSync(refsDir).filter((f) => /\.(jpe?g|png)$/i.test(f)).sort();

// Shared with detect_bench.mjs / draw_boxes.mjs — face = eyes-nose-mouth core only
// (tightened after the cathvar over-box: the old "whole face region" let flash grab the
// head+chest at 42% h, erasing body albedo → black-silhouette gens). Validated on the
// detection bench (out/_probe/detect_bench.json): flash + this prompt boxes the face only.
const PROMPT = readFileSync(new URL("./detect_prompt.txt", import.meta.url), "utf8");

// ── SCENE CONTEXT: THE ONE VLM CALL IN THIS PIPELINE THAT WAS ASKED TO GUESS ──────────────────────────────
// judgeIdentity gets subjectStr + SCENE_INTENT + REQUIRED_FORM; judgeKillshot gets subjectStr + sceneIntent.
// This detector got a static prompt and a picture, and nothing else — so on every call it had to rediscover
// from pixels alone whether the frame belongs to an owned property at all, and which figures in it carry the
// design. That is why it swung between ZERO regions and nine anonymous brigade-diagram staff on the same
// plate: not a badly tuned rubric, a call with no presupposition.
// The information already exists one stage earlier. resolveEntities() runs at PLAN time and returns the work
// ("a 2007 Disney-Pixar animated comedy film"), and world_clearance.entities carries the resolved list — then
// it is dropped before this runs. Threading it turns the question from "find anything ownable" into "this
// frame is from <work>; box the owned characters in it", which also makes the anonymous-staff case decidable
// instead of a judgement call: a NAMED character is boxed, generic staff are not.
// ⚠ ADDITIVE, NEVER NARROWING. The context says what IS known to be here; it must not become a whitelist that
// suppresses an owned character the resolver happened not to name. Absent context ⇒ the original behaviour.
// ── WORLD-REF MODE: BOX THE WHOLE FIGURE, NOT THE FACE CORE ──────────────────────────────────────────────
// The base prompt boxes the FACE and preserves the character's signatures — costume, markings, silhouette —
// because on a CHARACTER-REF the model diffuses a transformative version FROM those signatures, and covering
// them leaves it nothing to work from (it then reproduces the character from its NAME and trips anyway).
// A WORLD-REF is the opposite surface. There the character is being REPLACED, not diffused from: the rabbit
// takes the chef's place, so the chef's signatures are not an asset, they are the copyrighted design itself.
// Measured 2026-08-10 on a Ratatouille plate: face-core boxes on Remy and Gusteau TRIPPED seedance, while two
// earlier hand blurs covering the WHOLE figures both passed. Owner: "it has to be whole figure then."
// So the same detector serves both surfaces with opposite box sizes, and the reason is what the reference is
// FOR — the same distinction that governs blur everywhere else in this pipeline.
// ⚠ Still not the body of a REAL PERSON: their likeness is hedged by the tight face core and by SIZE, and
// blurring a real person's whole body would destroy the stand-in pose the plate exists to provide.
const WORLD_MODE = process.env.REDACT_MODE === "world";
const worldBlock = WORLD_MODE
  ? `\n\n⚠⚠ WORLD-REF MODE — THIS IMAGE IS SCENERY, AND ANY OWNED CHARACTER IN IT IS BEING REPLACED, NOT COPIED FROM.\n`
    + `For a PROMINENT owned character, OVERRIDE the face-core instruction above and box the ENTIRE FIGURE — head, `
    + `body, costume, markings, tail, limbs, everything that makes the design identifiable, to its outline. Do NOT `
    + `preserve its signatures here: on this surface the signatures ARE the copyrighted design, and nothing `
    + `downstream needs them, because a different character is being written into that position.\n`
    + `⚠⚠ ASK FLAT-OR-DIMENSIONAL FIRST, AND ONLY THEN ASK PROMINENCE. A figure qualifies for a box ONLY if it is `
    + `rendered DIMENSIONALLY IN THE SCENE'S OWN SPACE — a body occupying the room, lit by the room's light, `
    + `castable in shadow. A figure that is FLAT ARTWORK ON A SURFACE — printed on a page, poster, screen, label, `
    + `packaging, mural or fabric — is NEVER boxed, and this holds NO MATTER HOW LARGE IT IS OR HOW MUCH OF THE `
    + `FRAME IT FILLS. Do not reason "it is big and in front, so it must be the figure the shot is of": when the `
    + `plate is a photograph OF a printed surface, the artwork on it is large and foreground BY CONSTRUCTION, and `
    + `it is still artwork. Flatness DECIDES; size and position do not get a vote.\n`
    + `⚠⚠ AMONG DIMENSIONAL FIGURES ONLY, prominent means the one the shot is of — a large or foreground occupant `
    + `a viewer would name as being in this picture. Leave every other owned figure COMPLETELY UNTOUCHED: small `
    + `background characters, figures in a diagram, a secondary or tertiary character the shot is not about.\n`
    + `⚠ THE REASON IS NOT COST, IT IS THAT COVERING THEM DESTROYS THE SHOT. Flat printed art on a surface is the `
    + `PLANE the replacement character inherits — blur it and the generator has no flat occupant to diffuse into, `
    + `so it renders a dimensional creature standing in the scene instead of artwork on the page. Measured: with `
    + `the page art left sharp the substitute rendered FLAT and the gate passed; with it blurred the gate also `
    + `passed but the substitute came out three-dimensional. Blurring more is not safer here, it is worse.\n`
    + `⚠ REAL HUMANS ARE UNCHANGED — keep their TIGHT face core only. A real person's likeness is hedged by the face `
    + `and by size, and blurring their body would destroy the pose and scale this plate exists to supply.`
  : "";

const SCENE_WORK = process.env.REDACT_WORK || "";
const SCENE_CHARS = process.env.REDACT_CHARACTERS || "";
const contextBlock = (SCENE_WORK || SCENE_CHARS)
  ? `\n\nSCENE CONTEXT — established upstream, authoritative over your own reading of the pixels:\n`
    + (SCENE_WORK ? `• This frame is taken from: ${SCENE_WORK}. Its characters and designs are OWNED, so any of them appearing here is a copyright match at any size or sharpness.\n` : "")
    + (SCENE_CHARS ? `• Owned characters known to be in this scene: ${SCENE_CHARS}. Box the face of every one you can find.\n` : "")
    + `⚠ This context is ADDITIVE, not a whitelist. If you can identify an owned character that is NOT listed, box it too. If a figure is generic and unnamed — an anonymous extra, a background worker, a role in a diagram — it is not an owned character and you must NOT box it.`
  : "";

console.log(`form=${form}  refs=${FILES.length}: ${FILES.join(", ")}\n`);
const results = [];
for (const f of FILES) {
  const b64 = readFileSync(join(refsDir, f)).toString("base64");
  const mime = f.endsWith(".png") ? "image/png" : "image/jpeg";
  process.stdout.write(`[redact] ${f} … `);
  try {
    const out = await providerJson([textPart(PROMPT + worldBlock + contextBlock), imagePart(mime, b64)], { maxTokens: 6000, temperature: 0.1 });
    const regions = Array.isArray(out.regions) ? out.regions : [];
    results.push({ file: f, regions });
    const nS = regions.filter((r) => r.kind === "symbol").length;
    const nF = regions.filter((r) => r.kind === "face").length;
    console.log(`${regions.length} region(s) — ${nS} symbol, ${nF} face`);
    for (const r of regions) console.log(`         ${r.kind.padEnd(7)} ${r.label} [${r.box_2d?.join(",")}] c=${r.confidence ?? "?"}`);
  } catch (e) {
    results.push({ file: f, regions: [], error: String(e).slice(0, 160) });
    console.log(`ERROR ${String(e).slice(0, 120)}`);
  }
}

const manifestPath = join(OUT, form, "redact_manifest.json");
writeFileSync(manifestPath, JSON.stringify({ form, coordSpace: "detector_0_1000_ymin_xmin_ymax_xmax", ranAt: new Date().toISOString(), results }, null, 2));
console.log(`\nmanifest: ${manifestPath}`);
