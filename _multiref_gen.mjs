// MULTI-REF gen — seedance r2v with N world refs + a figure ref and a VERBATIM cuts prompt. The
// refs go into reference_image_urls as a FLAT array — NO @Image binding (that convention was
// rejected); seedance conditions on all refs together. Array ORDER is not verified to carry weight,
// so don't treat "world-refs first, figure last" as load-bearing. The prompt carries ALL the framing
// (blanket "every shot is wide", subject small) so the recognizable subject never renders tight.
//   node _multiref_gen.mjs <slug> <promptFile.txt> <duration=4s> <aspect=9:16> <ref1> <ref2> ...
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { randomBytes } from "node:crypto";
import sharp from "sharp";
import { padToAspect, ASPECT_DIMS } from "./_padref.mjs";

const PROVIDER = "https://api.provider.example/api/v1";
const ENDPOINT = "seedance-2-0-reference-to-video";
const HERE = dirname(fileURLToPath(import.meta.url));
const [slug, promptFile, duration = "4s", aspect = "9:16", ...refs] = process.argv.slice(2);
if (!slug || !promptFile || !refs.length) { console.error('usage: node _multiref_gen.mjs <slug> <promptFile.txt> <duration> <aspect> <ref1> <ref2> ...'); process.exit(1); }

// ⚠ THE DECLARED TYPE MUST MATCH THE BYTES, AND A FILENAME IS NOT EVIDENCE. Scraped candidates are saved with
// a .jpg NAME whatever the host served — measured on one real pool: 8 files, only 4 genuine JPEG (1 AVIF,
// 1 PNG, 2 WebP). Declaring image/jpeg over AVIF bytes made seedance answer "The image file is corrupted or
// unreadable" AFTER accepting the job, so an accepted submit was lost to a label. sharp reads all of those formats,
// which is exactly why the mismatch survives every local step and only fails at the one consumer that cannot.
// Check the magic bytes and re-encode rather than trusting the extension: a local re-encode is free, a rejected
// submit is not. This is the LAST line of defence — the sourcer should already have normalised (see
// _adaptive_source's re-encode) — so a hit here means an upstream write path is still copying raw.
const JPEG_MAGIC = (b) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
/** Re-encode any ref whose BYTES are not JPEG, and return the path to use. Async, so it runs before the payload. */
async function normaliseRef(p) {
  const abs = join(HERE, p);
  if (JPEG_MAGIC(readFileSync(abs))) return p;
  const fixed = p.replace(/\.[a-z0-9]+$/i, "") + "_norm.jpg";
  await sharp(abs).jpeg({ quality: 92 }).toFile(join(HERE, fixed));
  console.log(`[multiref] \u26a0 ${p} is NOT jpeg despite its name \u2014 re-encoded \u2192 ${fixed} (an upstream write path copied raw)`);
  return fixed;
}
const dataUri = (p) => `data:image/jpeg;base64,${readFileSync(join(HERE, p)).toString("base64")}`;

function signIn() { return ""; }   // the provider's signed sign-in header: left out of this public copy

// PAD_WORLD (NON-© branch — GROUNDED_GEN_WORKFLOW.md rule 12): black-pad the WORLD-REF (refs[0] ONLY,
// never figure refs) to the selected output aspect when its native aspect differs → seedance OUTPAINTS
// instead of pan-recomposing. No-op when already matched. Opt-in so the celeb path (crop-to-9:16) is
// untouched. NEVER crop.
if (process.env.PAD_WORLD && ASPECT_DIMS[aspect]) {
  const [W, H] = ASPECT_DIMS[aspect];
  const target = W / H;
  const m = await sharp(join(HERE, refs[0])).metadata();
  const r0 = (m.width || 1) / (m.height || 1);
  if (Math.abs(r0 - target) > 0.02) {
    const padded = refs[0].replace(/\.(jpe?g|png|webp)$/i, "") + `_pad${aspect.replace(":", "x")}.jpg`;
    await padToAspect(join(HERE, refs[0]), join(HERE, padded), W, H);
    console.log(`[multiref] PAD_WORLD: world-ref ${refs[0]} (AR ${r0.toFixed(2)}) ≠ ${aspect} → black-padded → ${padded}`);
    refs[0] = padded;
  } else {
    console.log(`[multiref] PAD_WORLD: world-ref already ${aspect} (AR ${r0.toFixed(2)}) — no pad`);
  }
}

const promptText = readFileSync(join(HERE, promptFile), "utf8").trim();
console.log(`[multiref] ${slug}: ${refs.length} refs · ${duration} · ${aspect}\nPROMPT:\n${promptText}\n`);
for (let i = 0; i < refs.length; i++) refs[i] = await normaliseRef(refs[i]);
const payload = { model: ENDPOINT, prompt: promptText, duration, resolution: "480p", aspect_ratio: aspect, reference_image_urls: refs.map(dataUri) };

const submit = () => fetch(`${PROVIDER}/video/queue`, { method: "POST", headers: { "Content-Type": "application/json", "SIGN-IN-WITH-X": signIn() }, body: JSON.stringify(payload) });
let res = await submit();
if (res.status === 409) { console.log(`[multiref] 409 consent → attest + resubmit`); payload.consents = { seedance: { confirmed_terms_and_privacy: true, confirmed_legal_right: true, confirmed_screening_acknowledged: true } }; res = await submit(); }
if (!res.ok) { console.log(`[multiref] ${slug}: REJECTED (${res.status})\n${(await res.text()).slice(0, 300)}`); process.exit(2); }
const { queue_id, id } = await res.json(); const qid = queue_id ?? id;
console.log(`[multiref] ${slug}: ACCEPTED queue_id=${qid} — polling…`);

for (let i = 0; i < 75; i++) {
  await new Promise((r) => setTimeout(r, 8000));
  let poll; try { poll = await fetch(`${PROVIDER}/video/retrieve`, { method: "POST", headers: { "Content-Type": "application/json", "SIGN-IN-WITH-X": signIn() }, body: JSON.stringify({ model: ENDPOINT, queue_id: qid }), signal: AbortSignal.timeout(30000) }); }
  catch (e) { if (i % 3 === 0) console.log(`[multiref] ${slug}: poll net err (job still rendering) ${String(e).slice(0, 60)}`); continue; }
  if (poll.status === 402) { console.log(`[multiref] ${slug}: lane exhausted`); process.exit(1); }
  const ctype = (poll.headers.get("content-type") || "").toLowerCase();
  let buf = null, data = null;
  if (ctype.includes("application/json")) {
    data = await poll.json();
    const s = (data.status || "").toUpperCase();
    if (["PROCESSING", "IN_PROGRESS", "QUEUED", "IN_QUEUE"].includes(s)) { if (i % 3 === 0) console.log(`[multiref] ${slug}: ${s}… (${(i + 1) * 8}s)`); continue; }
    // INFRA ≠ ©-TRIP: a provider concurrency / rate-limit error on the POLL is TRANSIENT (the gen is still
    // running) — back off + retry the poll, NEVER misclassify it as an OUTPUT-GATE trip. That false trip is
    // what recorded bogus per-subject ceilings and triggered needless widen/re-source/fallback this session.
    const errStr = `${data.code || ""} ${data.error || ""}`;
    if (/concurren|rate.?limit|too many|\b429\b/i.test(errStr)) {
      if (i % 2 === 0) console.log(`[multiref] ${slug}: poll provider-concurrency (transient — gen still running), backing off`);
      await new Promise((r) => setTimeout(r, 10000)); continue;
    }
    const url = data.download_url ?? data.url; if (url) buf = Buffer.from(await (await fetch(url)).arrayBuffer());
  } else buf = Buffer.from(await poll.arrayBuffer());
  if (buf && buf.length) { const out = join(HERE, "out", "_aspect", `gen_${slug}_${aspect.replace(":", "x")}.mp4`); writeFileSync(out, buf); console.log(`[multiref] ${slug}: ✓ COMPLETED ${(buf.length / 1024).toFixed(0)}KB → ${out}\n  queue_id=${qid}`); process.exit(0); }
  console.log(`[multiref] ${slug}: ${data ? "failed_during_gen (OUTPUT GATE)" : "empty"} ${data ? JSON.stringify(data).slice(0, 200) : ""}`); process.exit(1);
}
console.log(`[multiref] ${slug}: poll timeout — queue_id=${qid} (recover via _poll_one.mjs)`); process.exit(1);
