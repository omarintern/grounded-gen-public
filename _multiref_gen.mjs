// MULTI-REF gen — seedance r2v with N world refs + a figure ref and a VERBATIM cuts prompt. The
// refs go into reference_image_urls as a FLAT array — NO @Image binding (that convention was
// rejected); seedance conditions on all refs together. Array ORDER is not verified to carry weight,
// so don't treat "world-refs first, figure last" as load-bearing. The prompt carries ALL the framing
// (blanket "every shot is wide", subject small) so the recognizable subject never renders tight.
//   node _multiref_gen.mjs <slug> <promptFile.txt> <duration=4s> <aspect=9:16> <ref1> <ref2> ...
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { markInflight, clearInflight } from "./_inflight.mjs";   // an accepted gen is recorded at ACCEPTANCE so a dead container cannot orphan it
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { randomBytes } from "node:crypto";
import sharp from "sharp";
import { padToAspect, ASPECT_DIMS } from "./_padref.mjs";

const PROVIDER = "https://api.provider.example/api/v1";
// ENGINE + RESOLUTION are env-overridable so a direct probe can point at another r2v model without
// forking this file. Defaults are the seedance path unchanged — omit both and nothing differs.
// ⚠ RESOLUTION IS PER-MODEL, NOT UNIVERSAL: seedance takes "480p", another model takes "768P"/"2K" ONLY
// (`/models?type=video` → constraints.resolutions). Sending a resolution the model does not list is an
// input rejection, so read the model's own constraint list rather than assuming this file's default.
const ENDPOINT = process.env.GEN_ENDPOINT || "seedance-2-0-reference-to-video";
const RESOLUTION = process.env.GEN_RES || "480p";
// The 409 consent object is keyed by PROVIDER, so it cannot stay hardcoded to seedance once the
// endpoint is variable — derive it from the model id's own prefix.
const CONSENT_KEY = ENDPOINT.split("-")[0];
const HERE = dirname(fileURLToPath(import.meta.url));
const [slug, promptFile, duration = "4s", aspect = "9:16", ...refs] = process.argv.slice(2);
// ⚠ ZERO REFS IS NOW LEGAL — it means TEXT-TO-VIDEO (owner 2026-08-17: a stylized request "goes straight to
// seedance. no llm treatment or vlm or anything"). A drawn world has no real photograph to ground against,
// so the grounded pipeline has nothing to offer it and the prompt goes to the generator bare.
if (!slug || !promptFile) { console.error('usage: node _multiref_gen.mjs <slug> <promptFile.txt> <duration> <aspect> [ref1 ref2 ...]'); process.exit(1); }

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
console.log(`[multiref] ${slug}: ${refs.length} refs · ${duration} · ${aspect} · ${ENDPOINT} @ ${RESOLUTION}\nPROMPT:\n${promptText}\n`);
for (let i = 0; i < refs.length; i++) refs[i] = await normaliseRef(refs[i]);
// ⚠ THE PLATE IS THE FRAME, NOT A PEER REFERENCE — and the API distinguishes the two.
// `image_url` is documented as "for image-to-video models, THE reference image"; `reference_image_urls`
// is "up to 30 images for character/style CONSISTENCY". another model's *-to-video declares
// model_type=image-to-video, so its plate belongs in image_url and only figure refs belong in the array.
// Sending both together (what seedance wants) demotes the plate to one style vote among many, which is
// the shape that produced a square render from a 9:16 plate and let a 2D cel drag a photographic pool
// into CGI. FRAME_REF=1 promotes refs[0] to image_url; default off leaves the seedance path untouched.
const ELEMENTS = process.env.ELEMENTS === "1";
const FRAME_REF = process.env.FRAME_REF === "1";
// ⚠ ASPECT IS PER-MODEL AND THE VALIDATOR ENFORCES IT. `/models?type=video` publishes an aspect_ratios
// list per model and it is CURATED, not boilerplate: another model's image-to-video publishes an EMPTY list
// and rejects the field outright ("This model does not support aspect_ratio"), because an i2v model takes
// its frame from the image. Send the field only where the model lists it — NO_ASPECT=1 omits it.
// ⚠ THE T2V MODEL ID WAS NOT ASSUMED — IT WAS ASKED. /video/quote is free, exact and validates params before
// any call, so the ref-less route names a model we CONFIRMED exists rather than one we hoped would serve:
// seedance-2-0-text-to-video quoted 200 at 6s/480p/9:16, the same shape as r2v.
// T2V_ENDPOINT still overrides for a deliberate experiment.
const MODEL = refs.length ? ENDPOINT : (process.env.T2V_ENDPOINT || "seedance-2-0-text-to-video");   // VERIFIED 2026-08-17 via the free /video/quote: the id exists and prices identically to r2v ($… @ 6s/480p/9:16), so the ref-less route no longer borrows the reference-to-video endpoint
const payload = { model: MODEL, prompt: promptText, duration };
if (process.env.NO_RES !== "1") payload.resolution = RESOLUTION;   // the fallback video model publishes resolutions:[] — omit
if (process.env.NO_ASPECT !== "1") payload.aspect_ratio = aspect;

// ⚠ ELEMENTS — THE ONLY CONVENTION THAT KEEPS SCENE AND CHARACTER IN SEPARATE SLOTS.
// `scene_image_urls` (bound in-prompt as @Image1..) and `elements` (bound as @Element1..) are named,
// typed slots: the plate is declared AS THE SCENE and a figure AS A CHARACTER, instead of both being
// dropped into one flat `reference_image_urls` bag where they compete as peers. Documented for the fallback video model
// R2V. The header's note that "@Image binding was rejected" refers to SEEDANCE, which does not support
// these fields at all — it is not a verdict on this model. ELEMENTS=1: refs[0] → scene, refs[1..] → elements.
if (!refs.length) {
  console.log(`[multiref] TEXT-TO-VIDEO — no refs (stylized passthrough); model ${MODEL}`);
} else if (ELEMENTS) {
  payload.scene_image_urls = [dataUri(refs[0])];
  if (refs.length > 1) payload.elements = refs.slice(1).map((r) => ({ frontal_image_url: dataUri(r) }));
  console.log(`[multiref] ELEMENTS: plate ${refs[0]} → scene_image_urls (@Image1) · ${refs.length - 1} figure(s) → elements (@Element1..)`);
} else if (FRAME_REF) {
  payload.image_url = dataUri(refs[0]);
  if (refs.length > 1) payload.reference_image_urls = refs.slice(1).map(dataUri);
  console.log(`[multiref] FRAME_REF: plate ${refs[0]} → image_url · ${refs.length - 1} figure ref(s) → reference_image_urls`);
} else {
  payload.reference_image_urls = refs.map(dataUri);
}

const submit = () => fetch(`${PROVIDER}/video/queue`, { method: "POST", headers: { "Content-Type": "application/json", "SIGN-IN-WITH-X": signIn() }, body: JSON.stringify(payload) });
// ⚠ A BUDGET STOP IS NOT A COPYRIGHT VERDICT, AND IT MUST NOT BUY A SECOND ENGINE.
// The ledger throws LedgerCapExceeded from inside the fetch when the cap refuses to queue the video.
// Unhandled at top level that is an unhandled rejection, so node exits 1 — and _run.mjs reads any exit
// that is not 2 or 5 as "seedance tripped the OUTPUT © GATE" and falls through to the fallback video model. So running out
// of lane was reported as a clearance failure and answered by a second call, on the fallback engine,
// at the exact moment the run had established the lane was empty. Measured live: material
// cap refused seedance, and the fallback video model then ran on top.
// _run.mjs ALREADY has the correct guard and says so at length — it keys on exit 4, and nothing here
// ever produced a 4. The reasoning was right; the code that feeds it was missing.
const capGuard = async (fn) => {
  try { return await fn(); }
  catch (e) {
    if (!e?.ledgerCap) throw e;
    console.error(`[multiref] ${slug}: BUDGET CAP — ${e.message}`);
    process.exit(4);
  }
};
let res = await capGuard(submit);
if (res.status === 409) { console.log(`[multiref] 409 consent → attest + resubmit`); payload.consents = { [CONSENT_KEY]: { confirmed_terms_and_privacy: true, confirmed_legal_right: true, confirmed_screening_acknowledged: true } }; res = await capGuard(submit); }
if (!res.ok) { console.log(`[multiref] ${slug}: REJECTED (${res.status})\n${(await res.text()).slice(0, 300)}`); process.exit(2); }
const { queue_id, id } = await res.json(); const qid = queue_id ?? id;
console.log(`[multiref] ${slug}: ACCEPTED queue_id=${qid} — polling…`);
// ⚠ RECORDED BEFORE THE FIRST POLL, DELIBERATELY. The job is already accepted, so from this
// line onward the asset is ours whether or not this process survives to collect it. Writing the
// record after polling began would leave the exact window unprotected that the record exists to cover.
markInflight({ queue_id: qid, model: MODEL, slug, aspect, duration, target: `out/_aspect/gen_${slug}_${aspect.replace(":", "x")}.mp4` });

// ⚠⚠ THE POLL INTERVAL IS A THROUGHPUT DECISION, NOT A LATENCY ONE (measured 2026-08-18). the provider publishes
// a budget of 120 requests on /video/retrieve — observed directly in the response headers mid-run
// (limit_requests 120, remaining 118), which is the same counter the app lane warned about from the outside.
// Every concurrent run polls against that ONE shared budget, so the interval sets a hard ceiling on how many
// runs can exist at all:
//     every  8s → 7.5 polls/min/run → saturates 120 at 16 concurrent runs
//     every 15s → 4.0 polls/min/run → saturates at 30
// Measured throughput is 8.35 min/run under 2-way contention, so 100 gens/hr needs ~14 concurrent — which at
// the old 8s left 12% headroom against a limit shared with everything else. That is not a margin, it is a
// coincidence. Fifteen seconds costs each clip up to 7s of extra delivery latency and roughly doubles the
// number of runs the system can hold.
// ⚠ THE WINDOW IS PRESERVED, NOT THE ITERATION COUNT. Keeping 75 iterations would have stretched the wait to
// 18 minutes; the ceiling is expressed in SECONDS so changing the interval cannot silently change how long a
// run waits before it gives up.
const POLL_MS = Math.max(2000, Number(process.env.VIDEO_POLL_MS || 15000));
const POLL_WINDOW_S = Math.max(60, Number(process.env.VIDEO_POLL_WINDOW_S || 900));   // 15 min, as before-ish
const POLL_N = Math.ceil((POLL_WINDOW_S * 1000) / POLL_MS);
for (let i = 0; i < POLL_N; i++) {
  await new Promise((r) => setTimeout(r, POLL_MS));
  let poll; try { poll = await fetch(`${PROVIDER}/video/retrieve`, { method: "POST", headers: { "Content-Type": "application/json", "SIGN-IN-WITH-X": signIn() }, body: JSON.stringify({ model: ENDPOINT, queue_id: qid }), signal: AbortSignal.timeout(30000) }); }
  catch (e) { if (i % 3 === 0) console.log(`[multiref] ${slug}: poll net err (job still rendering) ${String(e).slice(0, 60)}`); continue; }
  if (poll.status === 402) { console.log(`[multiref] ${slug}: lane exhausted`); process.exit(1); }
  const ctype = (poll.headers.get("content-type") || "").toLowerCase();
  // ⚠⚠ THE BODY IS READ EXACTLY ONCE, AND THAT IS THE WHOLE POINT (measured 2026-08-18, cell G). This branched
  // on content-type and then read json() on one path and arrayBuffer() on the other. A response that reached
  // the else-branch with its body already consumed threw "Body is unusable: Body has already been read" —
  // an UNCAUGHT TypeError that killed the poller AFTER acceptance. The gen itself was perfect: the
  // sweep retrieved a complete 1182KB mp4 by queue_id minutes later. So a delivery bug destroyed a finished asset
  // and then, because _run inferred the verdict from the exit code, reported itself as a COPYRIGHT TRIP on a
  // clip of a raccoon. Read the bytes once, decide afterwards; a parse failure is then just a parse failure.
  let raw = null;
  try { raw = Buffer.from(await poll.arrayBuffer()); }
  catch (e) { if (i % 3 === 0) console.log(`[multiref] ${slug}: poll body unreadable (${String(e?.message || e).slice(0, 70)}) — retrying`); continue; }
  let buf = null, data = null;
  const looksJson = ctype.includes("application/json") || (raw.length > 0 && (raw[0] === 0x7b || raw[0] === 0x5b));
  if (looksJson) {
    try { data = JSON.parse(raw.toString("utf8")); } catch { data = null; }
    if (!data) { if (i % 3 === 0) console.log(`[multiref] ${slug}: poll returned unparseable JSON (${raw.length}B) — retrying`); continue; }
    const s = (data.status || "").toUpperCase();
    if (["PROCESSING", "IN_PROGRESS", "QUEUED", "IN_QUEUE"].includes(s)) { if (i % 3 === 0) console.log(`[multiref] ${slug}: ${s}… (${Math.round(((i + 1) * POLL_MS) / 1000)}s)`); continue; }
    // INFRA ≠ ©-TRIP: a provider concurrency / rate-limit error on the POLL is TRANSIENT (the gen is still
    // running) — back off + retry the poll, NEVER misclassify it as an OUTPUT-GATE trip. That false trip is
    // what recorded bogus per-subject ceilings and triggered needless widen/re-source/fallback this session.
    const errStr = `${data.code || ""} ${data.error || ""}`;
    if (/concurren|rate.?limit|too many|\b429\b/i.test(errStr)) {
      if (i % 2 === 0) console.log(`[multiref] ${slug}: poll provider-concurrency (transient — gen still running), backing off`);
      await new Promise((r) => setTimeout(r, 10000)); continue;
    }
    const url = data.download_url ?? data.url; if (url) buf = Buffer.from(await (await fetch(url)).arrayBuffer());
  } else if (raw.length) buf = raw;
  if (buf && buf.length) {
    const out = join(HERE, "out", "_aspect", `gen_${slug}_${aspect.replace(":", "x")}.mp4`);
    writeFileSync(out, buf); clearInflight(qid);
    // ── GEN-STATE CAPTURE (owner 2026-08-21, the remix substrate): the gen alone knows its exact inputs —
    // the verbatim prompt and the ref bag in order — so it writes the core record HERE, at the only moment
    // both the inputs and the success are facts. Keyed by LEDGER_JOB (the job id), slug-keyed for manual
    // runs. The server enriches with the plan digest at close; the delivery hook archives to the app store.
    try {
      const { assembleGenState } = await import("./_gen_state.mjs");
      const st = assembleGenState({ id: process.env.LEDGER_JOB || slug, slug, prompt_text: promptText, refs, aspect, duration, endpoint: ENDPOINT, queue_id: qid });
      const dir = join(HERE, "out", "_state");
      mkdirSync(dir, { recursive: true });
      // ⚠ REF BYTES ARE COPIED, NEVER POINTED AT (the cinderella clobber, 2026-08-23): out/_aspect files are
      // slug-keyed and rewritten by any same-prompt rerun, so a pointer store dies — or worse, the archive
      // hook (which serves GET /gen/:id/ref/:filename from these paths) ships the RERUN's bytes under the
      // original id. The state owns its bytes from the moment of capture, in a job-scoped directory.
      const refDir = join(dir, st.id);
      mkdirSync(refDir, { recursive: true });
      for (const r of st.refs) {
        copyFileSync(r.file, join(refDir, r.filename));
        // relative, because every reader resolves refs as join(HERE, file) — an absolute path would double up
        r.file = `out/_state/${st.id}/${r.filename}`;
      }
      writeFileSync(join(dir, `${st.id}.json`), JSON.stringify(st, null, 2));
      console.log(`[state] gen-state captured → out/_state/${st.id}.json (${st.refs.length} ref(s), bytes owned)`);
    } catch (e) { console.warn(`[state] ⚠ capture failed (${String(e?.message || e).slice(0, 70)}) — the video stands, this gen is not remixable`); }
    console.log(`[multiref] ${slug}: ✓ COMPLETED ${(buf.length / 1024).toFixed(0)}KB → ${out}\n  queue_id=${qid}`);
    process.exit(0);
  }
  // ⚠ EXIT 7 = A REAL OUTPUT-GATE VERDICT, AND NOTHING ELSE MAY WEAR IT. The genuine trip used to exit 1,
  // which is also what an uncaught crash exits, so _run could not tell a clearance verdict from a bug and
  // called every non-2/4/5 failure a © trip. The text stays byte-identical because _persistent_gen matches
  // on OUTPUT rather than on the code (the right pattern — it never had this bug).
  console.log(`[multiref] ${slug}: ${data ? "failed_during_gen (OUTPUT GATE)" : "empty"} ${data ? JSON.stringify(data).slice(0, 200) : ""}`); process.exit(data ? 7 : 1);
}
console.log(`[multiref] ${slug}: poll timeout — queue_id=${qid} (recover via _poll_one.mjs)`); process.exit(1);
