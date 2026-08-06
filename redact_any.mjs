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

console.log(`form=${form}  refs=${FILES.length}: ${FILES.join(", ")}\n`);
const results = [];
for (const f of FILES) {
  const b64 = readFileSync(join(refsDir, f)).toString("base64");
  const mime = f.endsWith(".png") ? "image/png" : "image/jpeg";
  process.stdout.write(`[redact] ${f} … `);
  try {
    const out = await providerJson([textPart(PROMPT), imagePart(mime, b64)], { maxTokens: 6000, temperature: 0.1 });
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
