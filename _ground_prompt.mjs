// GROUND-THE-PROMPT (form follows function) — author the seedance beats AFTER the scrape, to the scrape's
// ACTUAL conditions. The LLM does NOT write the final prompt before the scrape; it works WITHIN what was
// sourced. A VLM READS the picked world-ref, names the real STAND-IN occupant at the action spot, and the
// beats then DIRECT the swap: replace <stand-in> with <target creature>, taking its exact place/pose. If the
// stand-in IS ALREADY the target (the scene's own animal — stand-in == character), NO swap: normal beats for
// the subject's action (+ any conjured 2nd subject). Runs between the sourcer pick and the gen.
//   node _ground_prompt.mjs <worldRef.jpg> "<user prompt>" <slug>
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { providerJson, providerText, textPart, imagePart } from "./provider-llm.mjs";
import { sha, fileSha, pinKeys, pinHit, pinPut, readPin, writePin } from "./_read_pin.mjs";   // one job, one reading (owner 2026-09-22)
import { ELEMENTS_FIELD, invokeClause, worldSimClause, specDensity } from "./_invoke.mjs";
import { speechReach, SPEECH_REACH_FLOOR, redactWorldNames, seatCastSubject, DIALOGUE_HEAD, normalizeDraftLayout, moveInlineSpeech } from "./_gate_rules.mjs";
import { splitSingleBeat, CHROME_WORDS, stripChromeClauses } from "./_gate_rules.mjs";
import { speechHusk, standinIsABody } from "./_gate_rules.mjs";   // a beat that was only a line becomes the act of speaking (2026-09-22)   // a one-beat script is split across legal stamps, never shipped as one (owner 2026-09-07)
import { castFrameClause } from "./_beat_law.mjs";   // the kept cast rides the parent's own frame (owner 2026-09-23)
import { ipFiguresLaw, frameZeroRegisterClause, appropriationBlock, thingBlock, DIALOGUE_STAMPS, dialogueClause, addresseeClause, renditionClause, FINE_DETAIL, buildDialogueBlock, denameSpeakers, legalBeatCounts, stampsLegal, stampsWhy, clampStamps, restampBeats, telling, viewLaw, singleBlock, charContextBlock, anthropomorphismClause, vocalizationClause, voiceClause, belongingClause, workTitlesClause, incompleteBeatLines, genericSpeakerLabels, genMood } from "./_beat_law.mjs";   // beatStamps deliberately NOT imported since 2026-08-20 — the grid is celeb-only now
import { rideBlock, dialogueLines, saysHow, linesOutrun } from "./_ride_writer.mjs";
import { rideFromEnv } from "./_ride.mjs";
import { COMEDY_LAW } from "./_writer_contract.mjs";   // the six comedy rules — construction, not placement
import { recastLaw, RECAST_CAP, spanHeader, goalBlock, framingConcessionBlock, proseFiguresBlock, plateQuestionerBlock, reconcileLaw, beatZeroLaw, trappingsLaw, charSigBlock, soundLaw, asWhileCheck, cutLaw, causalOrder, payoffLaw, seesawLaw, situationArc, outputShape, hardConstraints, finalChecklist } from "./_beat_law.mjs";   // the import-safe beat-law home (owner 2026-08-14: both writers consume the SAME BYTES — import, never paste)   // INVOKE + world-sim bar (seesaw half inline below; dedupe post-test)
// THE WRITER IS THE PROSE MODEL (owner 2026-09-14: "the prose model has always been a better writer than the fast model, which is why we had it"). The world-build writer
// has written on it since 08-11; this single-take writer never did, and on 09-07 the ride was routed here for the seat plate, so the ride's
// writer changed model with the route and nobody decided it. Now the draft and every rewrite below write on the prose model; the intent extraction,
// the plate read and the judges stay on the default model (mechanics). PROVIDER_PROSE_MODEL overrides, as on the world-build writer.
const WRITE_MODEL = process.env.PROVIDER_PROSE_MODEL || "prose-model";
// THE PROSE MODEL DRAFTS, THE FAST MODEL REPAIRS (owner 2026-09-14, after the two prose-model dry runs shipped illegal stamps and outrun lines through retries that "did not
// improve"): the four corrective rewrites below are mechanics — stamps, counts, a line's length, a placement — and run on the default model, which kept
// them on every earlier draw; the draft, its voice and its words stay the prose model's. PROVIDER_REPAIR_MODEL overrides.
const REPAIR_MODEL = process.env.PROVIDER_REPAIR_MODEL || process.env.PROVIDER_LLM_MODEL || "fast-model";

const HERE = dirname(fileURLToPath(import.meta.url));
const [worldRef, userPrompt, slug = "scene", ...charRefs] = process.argv.slice(2);
// CHARACTER REFS (owner 2026-07-30): the beat writer used to see ONLY the world-ref, so it knew the subject
// as WORDS while the delivered clip carried a sourced character IMAGE it had never seen. Consequence: it wrote
// the "all roads lead to Rome" rabbit without the POCKET WATCH — the meme's whole signature — because nothing
// told it there was one. "The vlm might need to see the character ref, see the watch and write effectively …
// we need to consider not just world-ref post-scrape for the prompt, but also character-ref."
if (!worldRef || !userPrompt) { console.error('usage: node _ground_prompt.mjs <worldRef.jpg> "<prompt>" <slug>'); process.exit(1); }

// FRAMING CONCESSION (ii) — the sourcer folds an action-detail check into action_spot_room. When the finally-
// picked plate is framed too WIDE for this action's fine detail (a nearer view could not be sourced), the
// adaptive loop flags framing_conceded in adapt_<slug>.json. Then author every beat at the plate's ACTUAL scale
// — group / whole-body motion only, never per-actor detail — or the render CUTS IN to show detail the frame
// can't hold (validated: a wide bedroom + a per-cat choir → invented cuts). FRAMING_CONCEDED=1 forces it
// (manual / REUSE_REF testing, where the sidecar is stale or absent).
let framingConceded = process.env.FRAMING_CONCEDED === "1";
if (!framingConceded) {
  try { framingConceded = JSON.parse(readFileSync(join(HERE, "out/_aspect", `adapt_${slug}.json`), "utf8"))?.framing_conceded === true; } catch {}
}
if (framingConceded) console.log("framing: CONCEDED → beats pitched to the plate's scale (no per-actor detail)");

// 1. INTENT (text-only) — the target creature + its action, extracted from the user's prompt.
// ⭐⭐ THE SUBJECT IS EXTRACTED FROM THE USER'S OWN WORDS (owner 2026-08-29, the mechanical-monkeys gen):
// the app door rewrites prompts and its added adjectives were RENAMING the subject — 'cymbal monkeys'
// arrived as 'vintage mechanical cymbal monkeys' and the beats rendered clockwork machines. Same law,
// same mechanism as resolveEntities and inferNativeCapture: WHO IS IN THE VIDEO is the user's call, and
// the raw words rule whenever the door supplied them. The rewrite stays visible as narrative context.
// ⭐⭐ ONE JOB, ONE READING (owner 2026-09-22). Every pass below used to derive its own facts: the request read again, the
// plate looked at again, the character looked at again — and on job a4d543aa the third look at the SAME photograph said
// there was nobody in the window, which flipped the writer from SWAP to CONJURE and lost the figure the first draft had put
// there. The first pass of a job writes what it read; every later pass reads it back. The keys are in _read_pin: a reading
// outlives nothing that produced it, and a re-hunt that changes the photograph is looked at afresh. PLATE_READ_PIN=0 forces
// a fresh look on every pass.
const PIN_FILE = join(HERE, "out/_aspect", `${slug}_read.json`);
const PIN_ON = process.env.PLATE_READ_PIN !== "0";
let _pin = PIN_ON ? readPin(PIN_FILE) : null;
const _promptSha = sha(String(userPrompt || ""));
const _plateSha = fileSha(worldRef);
const _keepRead = (kind, keys, value) => { if (!PIN_ON) return; _pin = pinPut(_pin, kind, keys, value); writePin(PIN_FILE, _pin); };

const _intentKeys = pinKeys("intent", { promptSha: _promptSha });
const _intentPinned = PIN_ON ? pinHit(_pin, "intent", _intentKeys) : null;
if (_intentPinned) console.log("  \u25c7 the request reading is this job's own — the words have not changed, so it is not read again");
let intent = _intentPinned || await providerJson([textPart(
  `Return ONLY JSON {"target":"the single main creature/subject the video should feature, as a plain visual noun phrase e.g. 'a large brown bear'","action":"EVERY action the request names, in order, as one phrase - NOT a summary. The request is a SEQUENCE and each verb is a beat: 'enter a room and perform a choir, waking her up' has THREE (entering, performing, waking) and all three must survive. Compressing it to 'singing in a choir' DELETED the entry and the payoff (validated failure 2026-07-31)","secondary":"any OTHER creatures/props to CONJURE INTO the scene, else ''. ⚠ THE PLACE ITSELF IS NEVER LISTED HERE. This field names only what must be ADDED to a photograph that already exists; the location and its fixed furnishings are supplied BY THAT PHOTOGRAPH, so they are not things to conjure. If the request names a place, that place belongs in the action, never in this field."}. Prompt: "${String(process.env.RAW_USER_PROMPT || "").trim() || userPrompt}".${["worn", "driven"].includes(String(process.env.APPARATUS_KIND || "")) ? " \u26a0 THE CAMERA IS WORN OR DRIVEN (a helmet cam, a bodycam, a dashcam): the wearer or driver is not in the video and is nobody's subject, and the camera's own motion — riding, driving, walking — is NEVER the target's action. The target's action is what IT does where the camera finds it: a bear on the switchback stands, turns or moves on the switchback as the camera approaches; it does not ride." : ""}`
)], { maxTokens: 2400, temperature: 0.2, tag: "intent" });   // budget bounds, never spends: the fast model reasons inside max_tokens (see WRITER BUDGETS below)
if (!_intentPinned) _keepRead("intent", _intentKeys, intent);   // pinned RAW, before the seat-cast cut below re-applies itself on every pass
// ⭐⭐ ENTITY NAMING IS NEVER RE-DERIVED FROM PROMPT TEXT — RAW OR REWRITE (owner 2026-08-29). The raw
// words rule the subject ONLY when no resolved entity covers it (the cymbal-monkeys law). When the
// plan's cast covers the extracted subject, the plan's OWN string replaces it: that string is already
// correctly NAMED (public domain — "Dracula" is the better prompt) or DE-NAMED (owned IP and ref-led
// instances like Punch — the ref leads, prose never names) by the resolver's class laws. One source of
// truth; the writer never re-litigates a name.
try {
  const _entries = JSON.parse(process.env.CAST_ENTRIES || "[]");
  const _tokset = (t) => String(t || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 2);
  const _covers = (entry, text) => {
    const toks = _tokset(text);
    const need = Math.min(2, Math.max(1, (entry.tokens || []).length));
    return (entry.tokens || []).filter((t) => toks.includes(t)).length >= need && (entry.tokens || []).length > 0;
  };
  for (const key of ["target", "secondary"]) {
    const cur = intent && intent[key];
    if (!cur || typeof cur !== "string") continue;
    const hit = _entries.find((e) => e && e.name && _covers(e, cur));
    const form = hit && (hit.prose || hit.name);
    if (hit && form && form.toLowerCase() !== cur.toLowerCase()) {
      console.log(`  [cast] intent.${key} "${String(cur).slice(0, 40)}" → plan's own form "${String(form).slice(0, 48)}" (entity naming is the branch law's, never re-derived)`);
      intent[key] = form;
    }
  }
} catch { /* no entries or unparseable — raw extraction stands (the generic-subject case) */ }
// THE SEAT-CAST FIGURE IS NEVER THE SUBJECT'S LOOK (job 69bb989b, 2026-09-13: "wendy as the riders" was extracted as "riders dressed as Wendy Torrance" and
// that SUBJECT line rode into every draft beside the law that says she is the seat, never seen — the dressed row, by instruction). A clause that dresses,
// likens or casts the subject as a seat-cast figure is cut; a bare name left over reads as the riders. $0, before the plate is read against the subject.
try {
  const _seatModes = JSON.parse(process.env.IP_FIGURES || "[]").filter((m) => m && m.seat);
  if (_seatModes.length) for (const key of ["target", "secondary", "action"]) {
    const cur = intent && intent[key]; if (!cur || typeof cur !== "string") continue;
    const next = seatCastSubject(cur, _seatModes);
    if (next !== cur) { console.log(`  [seat] intent.${key} "${String(cur).slice(0, 60)}" \u2192 "${String(next).slice(0, 60)}" (a seat-cast figure is never a look)`); intent[key] = next || (key === "target" ? "the riders" : next); }
  }
} catch { /* no modes — nothing to cut */ }

// 2. READ THE SCRAPE (VLM) — what real STAND-IN is actually in the picked world-ref, and is it already the target?
const b64 = readFileSync(worldRef).toString("base64");
// ⚠ NO WORKED EXAMPLES IN THIS FIELD (owner's standing rule: general rules avoid pushing biases in
// specificity; enforced across the engine in 9650c7d / 68f787b / 4c1796f, which this site escaped).
// A/B MEASURED 2026-08-19 on six stored plates, the shipped wording against the same wording minus its three
// examples ('the person driving' / 'the clerk at the counter' / 'the raccoon on the table'):
//   · DETECTION is unaffected — 6/6 identical on whether a stand-in exists and where it sits.
//   · DESCRIPTION is pulled toward the examples. The ski-counter plate answered "the clerk behind the
//     counter" WITH them — nearly the example verbatim — and "the female worker wearing a blue beanie"
//     without. The sidewalk plate: "the person walking with a backpack" vs "woman with a backpack walking away".
// That matters because seen.standin is interpolated VERBATIM into the swap clause the beat writer obeys, and a
// generic role-noun is a weaker positional anchor than a description that identifies WHICH body in the frame.
// Small sample: only 2 of the 6 plates held an occupant, so the wording effect rests on two observations —
// but detection is unchanged, so removing them costs nothing.
const _seenKeys = pinKeys("seen", { promptSha: _promptSha, plateSha: _plateSha });
const _seenPinned = PIN_ON ? pinHit(_pin, "seen", _seenKeys) : null;
if (_seenPinned) console.log("  \u25c7 the plate reading is this job's own — the same photograph and the same request, so it is not looked at again");
const seen = _seenPinned || await providerJson([
  textPart(`You are looking at the WORLD-REF photo a video model will animate. The video should feature: ${intent.target} (${intent.action}). Return ONLY JSON {"scene":"brief description of the real place/scene as photographed","standin":"the SINGLE real occupant/subject currently AT THE ACTION SPOT that the target should REPLACE — the body the model swaps. Describe the ACTUAL body in THIS photograph closely enough to pick it out from any other — what it is doing, where it is, what it is wearing or carrying. If the action spot is empty say 'none'","standin_is_target":boolean (TRUE only if that occupant is ALREADY a ${intent.target} — the same kind of creature — so NO swap is needed),"standin_placement":"foreground | side | background | none","other_occupants":[{"body":"…","position":"…","doing":"…"}] (0-2 OTHER prominent REAL occupants — a person or animal — elsewhere in the frame, each described closely enough to pick it out; [] when there are none),${ELEMENTS_FIELD}}.`),
  imagePart("image/jpeg", b64),
], { maxTokens: 2400, temperature: 0.2 });
if (!_seenPinned) _keepRead("seen", _seenKeys, seen);

// 2b. READ THE CHARACTER REFS (VLM) — what does the sourced character actually LOOK like, and what does it
// CARRY or WEAR that the beats can put to work? A signature the beats never touch is a signature the action
// cannot use; naming it in a beat is how the identity gets performed rather than merely rendered.
let charSig = "";
// char refs arrive as "Name=path" so the VLM can be told WHO it is looking at (see _run.mjs)
// Beat stamps DERIVED from the duration. This line used to hardcode `[0s] [2s] [4s]` and "2-3 beats", so a
// 7-second clip was explicitly instructed to stop at 4 seconds — no amount of "span the full duration" elsewhere
// could win against a literal format spec. Every 2s, last stamp at least 2s before the end.
const BEAT_SECS = Math.max(2, Math.round(Number(process.env.BEAT_DURATION || 4)));
// ── THE GRID IS RETIRED ON THIS WRITER (owner 2026-08-20, the depth ruling): the writer CHOOSES its count
// from the legal set (density floor: ≥1.5s/beat) and places its own stamps. A legacy duration below 4.5s has
// no legal count — it falls back to the old arithmetic count, free-placed under the same stamp rules.
const LEGAL = legalBeatCounts(BEAT_SECS);
const COUNTS = LEGAL.length ? LEGAL : [Math.max(2, Math.ceil(BEAT_SECS / 2))];
// Canon rides in from _run (the resolver's derivation over a CONFIRMED figure) — absent for John Does.
// ON A DARK RIDE OF A NAMED WORLD (owner 2026-09-08, job bd19152d): the brief still gives the story's ORDER, but its place names never
// reach the writer (redacted to "scene"), and its verbs do not bind — "enters a lavish Gold Room" was demanded by the checklist and
// forbidden by the name law in the same instruction. The maker's own words are the request the laws are checked against.
// INFRASTRUCTURE IS EXIT 5 (owner 2026-09-12, velocal9: the provider unreachable — DNS — crashed the writer with a bare exit 1 and the run "fell back to draft"):
// a transport failure is never a verdict on the words; it is named as infra so the run can fail clean instead of shipping the pre-scrape draft.
const _infraExit = (e) => { if (e && (e.name === "ProviderInfraError" || /transport failure|ENOTFOUND|ETIMEDOUT|ECONNRESET|EAI_AGAIN|the provider could not be reached/i.test(String(e.message || "")))) { console.error(`\n✗ INFRASTRUCTURE UNAVAILABLE in the writer (${String(e.message || e).split("\n")[0].slice(0, 160)}) — exit 5, not a verdict on the words`); process.exit(5); } };
process.on("unhandledRejection", (e) => { _infraExit(e); throw e; });
// A BUDGET STOP IS OURS, NOT A BUG (2026-09-14): a LedgerCapExceeded reached this handler and exited 1, which the server reads as
// "generation failed" and the worker bills as a real failure. Every sourcing child already exits 4; the writer does too.
const _capExit = (e) => { if (e?.ledgerCap) { console.error(`\n✗ BUDGET CAP in the writer (${String(e.message || e).split("\n")[0].slice(0, 160)}) — exit 4, not a verdict on the words`); process.exit(4); } };
process.on("uncaughtException", (e) => { _infraExit(e); _capExit(e); console.error(e); process.exit(1); });
const RIDE = rideFromEnv();   // the run's ride decision, or null (2026-09-09)
const _roomNames = () => [...(RIDE?.world?.rooms || []), RIDE?.world?.title || "", ...String(process.env.WORK_TITLES || "").split(/\s*(?:,|·|\|)\s*/)].map((s) => String(s || "").trim()).filter(Boolean);
const narrativeForWriter = (p) => RIDE?.world?.mode === "theme" ? redactWorldNames(p, _roomNames()) : p;
const requestForLaws = (p) => RIDE?.world?.mode === "theme" ? (process.env.RAW_USER_PROMPT || p) : p;
const CHAR_CANON = (() => { try { const j = JSON.parse(process.env.CHAR_CANON || ""); return j && typeof j === "object" ? j : null; } catch { return null; } })();
const charNames = charRefs.map((r) => (r.includes("=") ? r.split("=")[0] : "")).filter(Boolean);
const charPaths = charRefs.map((r) => (r.includes("=") ? r.split("=").slice(1).join("=") : r));
if (charPaths.length) {
  const parts = [textPart(
    `You are looking at the CHARACTER reference image(s) for: ${charNames.join(", ") || intent.target}. ` +
    `⚠ These images depict THAT character — NOT the scene's main subject. Describe ONLY what you see of the named ` +
    `character; ignore any other creature, animal or background element in the picture (a Santa illustration may ` +
    `contain reindeer — the reindeer are NOT the character). ` +
    `Return ONLY JSON {"signatures":["the 2-5 most DISTINCTIVE visible things about this character — what it WEARS, ` +
    `CARRIES or HOLDS, and any object that is part of its identity"],"carried":"the single most usable object it ` +
    `holds or carries for an action, or '' if none"}. Name only what is VISIBLE in the image.`)];
  for (const r of charPaths) {
    try { parts.push(imagePart("image/jpeg", readFileSync(r).toString("base64"))); } catch {}
  }
  // THE CHARACTER IS READ ONCE TOO (owner 2026-09-22, job ee5535ea): draft 1 gave him "thin-rimmed glasses; light blue dress
  // shirt" and draft 3 gave him "wire-rimmed glasses; gold wrist watch" — the same reference file, the same question, the
  // figure's own signatures drifting between drafts of one video. Keyed on the reference FILES' bytes.
  const _refsKeys = pinKeys("charsig", { refsSha: sha(charPaths.map((r) => `${r}:${fileSha(r)}`).join("|")) });
  const _csPinned = PIN_ON ? pinHit(_pin, "charsig", _refsKeys) : null;
  if (_csPinned) console.log("  \u25c7 the character reading is this job's own — the same reference, so it is not looked at again");
  try {
    const cs = _csPinned || await providerJson(parts, { maxTokens: 2000, temperature: 0.2 });
    if (!_csPinned) _keepRead("charsig", _refsKeys, cs);
    const sig = (cs?.signatures || []).filter(Boolean);
    if (sig.length) charSig = sig.join("; ");
    if (cs?.carried && !/^none$/i.test(cs.carried)) {
      charSig += `${charSig ? " | " : ""}CARRIES: ${cs.carried}`;
      // sidecar for the parent's prop-continuity validator (owner 2026-08-13): a carried item must be
      // visible from its carrier's first beat or arrive by staged retrieval — never materialize mid-story
      try { writeFileSync(join(HERE, "out/_aspect", `${slug}_carried.txt`), String(cs.carried)); } catch {}
    }
    if (charSig) console.log(`charref : ${charSig}`);
  } catch {}
}

// 3. AUTHOR THE BEATS — MINIMAL (form follows function). For a SWAP, keep it to the BARE instruction
// "replace <stand-in> with <target>": the REFERENCE already carries the motion + scale, so OVER-describing
// size/pose/motion FIGHTS it and breaks physics (validated: a verbose "takes the exact size … rides upward"
// made the penguin GROW up the escalator). Templated (not LLM-elaborated) to guarantee minimalism.
const has = (s) => { const v = (Array.isArray(s) ? s.map((x) => String(x ?? "").trim()).filter(Boolean).join(", ") : typeof s === "string" ? s : "").trim(); return !!v && !/^none$/i.test(v); };
let beatLine, mode;
// ⚠ MODULE-SCOPED ON PURPOSE (2026-08-29). ACCEPTED_N was a const inside the fine-detail guard's block
// (closed ~40 lines later), while BOTH later repairs — swap-anchor and payoff-escalation — read it from
// outside that scope. The payoff repair crashed with a ReferenceError on EVERY firing ("ACCEPTED_N is not
// defined — shipping the original"), silently flattening every climax that needed the escalation re-ask;
// the swap repair carried the identical crash, unexercised only because its verdicts kept coming back
// anchored. Declared here, assigned where the accepted draft's count is known.
// ⭐⭐ AN IMAGE OF THE SUBJECT IS NOT THE SUBJECT (owner 2026-09-22). With the stand-in law gone nothing is replaced, so a cutout or a
// poster in the frame is simply part of the world and stays as photographed — no guard is needed for that. ONE branch still cares: the
// photograph may ALREADY hold the subject, and then it is animated rather than conjured. A flat cardboard cutout of the character, a
// poster of it or a statue of it is a picture of the subject, not the subject, and animating it is how job 32e26ad3 delivered a figure
// wearing the cutout's flat white face. The reader's own words decide; nothing new is asked.
if (seen.standin_is_target && !standinIsABody(seen.standin)) {
  console.log(`  \u25c7 the photograph holds an IMAGE of the subject, not the subject ("${String(seen.standin).slice(0, 80)}") \u2014 it stays as photographed and the subject is conjured`);
  seen.standin_is_target = false;
}
let ACCEPTED_N = Math.max(...COUNTS);
let writerInstruction = "";   // the writer contract, captured at _dump so the payoff repair can re-ask with it
// ⭐⭐ THE STAND-IN LAW IS REMOVED (owner 2026-09-22: "the standin law is stale, so it and anything bouncing off of it should be
// corrected. it should be removed"). It was built when a take was one instruction over one photograph and a creature took a human's
// place in it. The engine grounds differently now: the plate is frame zero, figures are CONJURED into it, and what the photograph
// holds stays as photographed. The law survived as five modes, and the cost was visible on job 32e26ad3 — the plate's only body-like
// thing was a flat cardboard cutout of a character, the swap put the mascot into it, and the delivered figure wore the cutout's flat
// white face. The owner's question is the whole argument: if the other figure is simply inserted, why does this one replace anything.
//
// TWO CASES REMAIN, and neither replaces a body. The photograph may ALREADY hold the subject, in which case it is animated rather than
// conjured a second time; otherwise the subject is introduced into the scene and everything the photograph holds stays as it is. The
// VACATE mode for a ridden form went with the rest: a rider is no longer written out of the frame to seat the camera, because the seat
// plate IS the camera's vantage and its occupants are the world's, which is the plain law every other apparatus form already followed.
if (seen.standin_is_target) {
  mode = "animate (the subject is already the creature in the photograph)";
  // the clean TARGET noun + action (NOT the verbose VLM string, which already embeds an article + the action → doubled words)
  const T = String(intent.target).charAt(0).toUpperCase() + String(intent.target).slice(1);
  beatLine = `[0s] ${T} ${intent.action}${has(intent.secondary) ? `, with ${intent.secondary} in the scene` : ""}.`;
} else {
  mode = has(seen.standin) ? `conjure (the photograph's own occupants stay: ${seen.standin})` : "conjure (an empty action spot)";
  beatLine = `[0s] ${intent.target} appears in the scene ${intent.action}; ${has(seen.standin) ? `${seen.standin} and ` : ""}everything else stays exactly as photographed.`;
}
// ── NARRATIVE BEATS (BEAT_STYLE=narrative) — the "narrative way": the user's prompt rewritten into a short
// TEMPORAL script rather than one flat instruction. Owner 2026-07-29: "we need to test with the narrative-dense
// beats, of course taking in user demands / prompts but rewriting for beats."
//
// ⚠ THE PHYSICS TRAP THIS MUST AVOID: an earlier verbose beat ("takes the exact size … rides upward") made a
// penguin GROW as it moved, because re-describing SIZE / SCALE / MOTION fights what the reference photo
// already encodes. The reference owns geometry; the beat owns TIME. So narrative mode may elaborate WHAT
// HAPPENS and WHEN, and is forbidden from describing subject size, distance, camera movement, lens, framing,
// or image quality — all of which come from the sourced frame and must not be contradicted.
// ⚠⚠ NARRATIVE IS THE DEFAULT (2026-08-01). This was opt-in behind BEAT_STYLE=narrative, which only the hand-
// written experiment scripts ever set — so every DEFAULT run, including the autonomous ones, shipped the
// minimal template above and nobody saw it, because the template still produces a working clip whenever the
// ref is strong and the action is simple.
// What it costs when the story is not simple: on a 7s TWO-LOCATION prompt with cuts explicitly PERMITTED, the
// planner authored a proper temporal script and this stage replaced it with the raw user sentence plus a
// mechanical requirements list — one beat, no time blocks, no cut. The template names WHAT THE SUBJECT IS and
// never WHAT IT DOES OVER TIME, so it structurally cannot express a story that moves, a payoff that lands
// last, or the anthropomorphic-competence joke that is the whole point of the non-© branch.
// The minimal template REMAINS, in two roles that both still matter: it is the automatic fallback when the
// narrative beats fail to parse (see the tail of this block), and BEAT_STYLE=minimal selects it deliberately
// for a pure SWAP, where over-describing motion fights the reference's own geometry.
// ⚠⚠ THE STYLE IS MEASURED FROM THE REQUEST, NOT FIXED. A single default is wrong in both directions: it
// either invents a story over a user who already wrote one, or withholds one from a user who wrote a bare
// situation. The seesaw law governs the STYLE too — broad prompts get populated, heavily detailed prompts get
// nothing they didn't invite — so the pole is computed per request and the env var only OVERRIDES it.
//   spectacle — the request is a situation. Invent the turn, write the speech, build the comedy.
//   minimal   — the request already carries its own turn, speech or genre. Deliver THEIRS; add little.
// Both poles write NARRATIVE beats with time blocks. "minimal" does NOT mean the flat template — the template
// loses the time blocks that make a beat a beat, and it is reachable only as BEAT_STYLE=template or as the
// automatic fallback when narrative beats fail to parse.
// ⚠ THIS IS A PRIOR, NOT A VERDICT. It is a cheap deterministic read of the request, passed to the beat writer
// as a tilt; the writer still judges turn and dialogue separately against what was actually supplied, because
// a request can state the turn and omit the speech or the reverse.
// SPEECH/GENRE/TURN + specDensity: DEDUPED to the shared _invoke.mjs (the "dedupe post-test" this file planned at its import line — import, never paste)
// ⚠ NO VERB COUNT. "several distinct actions" sounds like the right signal and cannot be measured honestly
// here: a word-shape regex counts every plural noun as a verb (it scored "streetlamps" as an action), so it
// fired on plain situations and tilted them away from invention — the exact opposite of the intent. Length
// already proxies elaboration. Prefer three signals that mean what they say over four where one is noise.

const SPEC_DENSE = Number(process.env.SPEC_DENSE ?? 3);
const _density = specDensity(userPrompt);
// dialogueClause: MOVED VERBATIM to _beat_law.mjs (shared by both writers — import, never paste)

// addresseeClause: MOVED VERBATIM to _beat_law.mjs

// renditionClause: MOVED VERBATIM to _beat_law.mjs

const BEAT_STYLE = process.env.BEAT_STYLE || (_density >= SPEC_DENSE ? "minimal" : "spectacle");
console.log(`seesaw : spec-density ${_density} (dense at ${SPEC_DENSE}) → ${BEAT_STYLE}${process.env.BEAT_STYLE ? " (env override)" : ""}`);
if (BEAT_STYLE !== "template") {
  // THE SAME LAW IN THE WRITER'S OWN WORDS: nothing is ever replaced, and what the photograph holds is the world's.
  const swapClause = seen.standin_is_target
    ? `The ${intent.target} is ALREADY the creature in the photograph — do not introduce another, just animate it.`
    : has(seen.standin)
      ? `⚠ ${seen.standin} in the photograph stays exactly as photographed — the world's own, never replaced, never vacated and never written out; ${intent.target} is introduced into the scene where the words put it (${intent.action}).`
      : `Beat 1 MUST introduce ${intent.target} into the scene at the natural action spot.`;
  // ANTHROPOMORPHIC COMEDY — the point of the whole non-© branch, and the thing the minimal swap beat structurally
  // cannot deliver. Owner 2026-07-30, on a pigeon that replaced a laundromat clerk: "the pigeon didnt work the
  // register, it acted like a pigeon. comedy, the narrative way, is to overstep the usual and have the bird actually
  // work the register in hilarous fashion."
  // The swap template says WHAT the creature IS and never WHAT IT DOES, so the model renders a plausible animal
  // standing in a human's place — which is the un-funny reading. The joke is COMPETENCE: the creature performing
  // the human job deliberately and well, with specific physical business, not chaos and not animal behaviour.
  // ⚠ CONTEXT-CARRIED (owner 2026-08-21): the human role is the sidecar's ACTUAL occupant being replaced —
  // never invented. A creature already the scene's own animal (standin_is_target) or entering an empty
  // natural spot gets the context law instead: a fox in snow behaves as a fox. The competence text for the
  // real-role branch is UNCHANGED (the pigeon-register ruling) — it moved VERBATIM to _beat_law.
  // SECONDARY RECASTS (owner 2026-08-29): every role-bearing occupant the story re-casts, cap 3
  // bodies total. The plate-reader lists other occupants; the WRITER does the role matching (it
  // holds the story); unmatched occupants stay real. Observability: the count is logged every run.
  const _others = (Array.isArray(seen.other_occupants) ? seen.other_occupants : []).filter((o) => o && o.body && !/^none$/i.test(String(o.body))).slice(0, RECAST_CAP - 1);
  if (_others.length) console.log(`  [recast] ${_others.length} secondary occupant(s) offered to the writer (cap ${RECAST_CAP} incl subject): ${_others.map((o) => String(o.body).slice(0, 40)).join(" | ")}`);
  const humanRole = has(seen.standin) && !seen.standin_is_target ? seen.standin : null;
  const comedyClause = anthropomorphismClause(intent.target, humanRole);
  // FULL OBSERVABILITY: dump the ENTIRE instruction the beat writer receives. Until now only its OUTPUT (the
  // beats) was inspectable, so the ruling that produced them — hundreds of lines of accumulated doctrine — was
  // invisible to review. Written every run to out/_aspect/<slug>_instruction.txt.
  // Captured for the PAYOFF REPAIR below, which lives outside this block: a re-ask must carry the same
  // contract the first ask did, or the retry answers a different question than the one that failed.
  const _dump = (t) => { writerInstruction = t; try { writeFileSync(join(HERE, "out/_aspect", `${slug}_instruction.txt`), t); } catch {} return t; };
  const instruction = _dump(
    spanHeader() +
    `SCENE AS PHOTOGRAPHED: ${seen.scene}\n` +
    // ON A REMIX (2026-09-09): the reframed request is the user's request applied to the parent's video, and the remix words are the CHANGE —
    // never the other way round (job 6280175e: the change was presented as the request and the parent's register, place and camera reference
    // rode as demoted context; the beats lost them). The parent's request stands wherever the change is silent.
    (String(process.env.REMIX_CHANGE || "").trim()
      ? `WHAT THE USER ASKED FOR (their request, applied to the parent's video): "${userPrompt}"\n` +
        `THE CHANGE THIS REMIX MAKES (the user's remix words): "${String(process.env.REMIX_CHANGE).trim()}" — everything the parent's request established and this change does not touch stays exactly as it was: what the footage is, the place as photographed, the cast it keeps, where the subject looks.\n` +
        // THE PARENT'S SCRIPT RIDES A REFRAME (owner 2026-09-21, job daeee1b4: the surf character spoke English in the parent and squawked in the
        // remix — a full rewrite had never heard the parent's voices). Everything the change does not touch keeps them.
        (String(process.env.REMIX_PARENT_SCRIPT || "").trim()
          ? `THE PARENT'S SCRIPT (its beats, its Dialogue, its Sound):\n${String(process.env.REMIX_PARENT_SCRIPT).trim()}\n— everything the change does not touch keeps this script's voices, the language they speak, their register and its sound exactly: a figure who spoke in words speaks in words here too. Only the change is written new.\n`
          : "")
      : `WHAT THE USER ASKED FOR (their own words): "${String(process.env.RAW_USER_PROMPT || "").trim() || userPrompt}"\n`) +
    (!String(process.env.REMIX_CHANGE || "").trim() && String(process.env.RAW_USER_PROMPT || "").trim() && String(process.env.RAW_USER_PROMPT || "").trim() !== userPrompt
      ? `APP NARRATIVE (context only — its added adjectives and renamings NEVER override the user\'s own subject nouns${RIDE?.world?.mode === "theme" ? "; on this ride the world's places are redacted to \"scene\" on purpose — they are never named, their things are listed below" : ""}): "${narrativeForWriter(userPrompt)}"\n`
      : "") +
    `SUBJECT: ${intent.target} — ${intent.action}${has(intent.secondary) ? ` (also present: ${intent.secondary})` : ""}\n` +
    `${swapClause}${recastLaw(_others)}\n${comedyClause}\n${vocalizationClause()}\n${voiceClause()}\n${belongingClause()}\n${castFrameClause()}\n${rideBlock(RIDE)}${workTitlesClause()}${ipFiguresLaw()}${frameZeroRegisterClause()}${appropriationBlock()}${thingBlock()}\n${worldSimClause()}\n${invokeClause(BEAT_STYLE, seen.elements)}\n${addresseeClause()}\n${renditionClause()}\n${dialogueClause()}\n\n` +
    goalBlock() +
    framingConcessionBlock(framingConceded) +
    proseFiguresBlock() +
    plateQuestionerBlock() +
    reconcileLaw() +
    beatZeroLaw() +
    trappingsLaw() +
    charSigBlock(charSig) +
    charContextBlock(CHAR_CANON) +
    soundLaw() +
    asWhileCheck() +
    cutLaw() +
    causalOrder() +
    // ⚠⚠ THE SINGLE-REF WRITER WAS TOLD WHERE A PAYOFF GOES AND NEVER WHAT ONE IS (owner 2026-08-18: the
    // clips "come across as stale videos, stale comedy / narrative"). payoffLaw governs PLACEMENT — the
    // consequence lands last, the camera stays unstaged — while COMEDY_LAW governs CONSTRUCTION, and rule 4
    // is the missing sentence: "the payoff is the same material one step further — the commitment deepens".
    // ⚠ MEASURED ON FOUR SHIPPED CLIPS. Three decomposed the prompt chronologically — paw on plant, push,
    // look at dog; stands at counter, gestures at menu, barista turns away — with the payoff being whatever
    // the prompt's last clause already said. The fourth ESCALATED (a self-checkout rejects Robin Hood's gold,
    // so he draws his bow on it) and it used the SAME writer, so the difference was not the writer: his
    // signatures handed it material to escalate WITH. A raccoon in a shed has none, and with no rule to
    // escalate the material it had, it described the scene instead. Rule 2 is the other half — the venue's
    // own things in PARTICULARS, never the general item.
    // ⚠ NOTHING IN THE SIX RULES IS CELEB-SPECIFIC; it reached only the assembly writer by history, not design.
    (telling() === "observational" ? viewLaw() : COMEDY_LAW) + "\n\n" +   // a view held takes the view law in the comedy law's seat (owner 2026-09-07)
    payoffLaw() +
    seesawLaw(BEAT_STYLE) +
    situationArc() +
    // ── OUTPUT SHAPE ──────────────────────────────────────────────────────────────────────────────────────
    // TIME BLOCKS ARE ON BY DEFAULT (owner 2026-07-30, REVISED same day — an earlier version of this comment had
    // them off, and that was wrong). The montage worry was real but the cause was misattributed: the block-free
    // wins were ALSO the low-DETAIL ones, so density and timing moved together and timing took the blame.
    // Separated by controlled test — minimal prose WITH blocks: owner "time blocks work fine", and the 8s
    // doorbell story (7 elements, blocks, near-zero detail) came back "this is great … this is perfect".
    // Timestamps supply PACING the model otherwise invents; without them events land off-beat. BEAT_BLOCKS=0
    // restores continuous prose.
    outputShape(BEAT_SECS, COUNTS) +
    hardConstraints() +
    // FINAL CHECKLIST, LAST ON PURPOSE. This instruction passed 10,000 characters of accumulated doctrine and new
    // rules buried mid-text stopped landing: a 7-second clip kept returning beats that stopped at [4s], and the
    // payoff verb kept vanishing, though both were stated above. Same law as the judges - ISOLATE WHAT YOU GATE ON.
    finalChecklist(requestForLaws(userPrompt)) );
  // ⚠ WRITER BUDGETS (measured 2026-09-07, job 32fc6c35): the fast model counts its REASONING against max_tokens, so a
  // 700-token budget was consumed before the first beat line; provider-llm then retried at 1400 → 2800 → 5600. The ledger
  // shows 26 physical calls for six logical steps and $… — the same writer at the budgets below is one call per step.
  // A budget BOUNDS the answer, it never spends it: over-provisioning costs nothing, under-provisioning pays every rung.
  // (2026-09-14: the budgets were measured on the fast model, whose reasoning rides inside max_tokens. the prose model spends no reasoning tokens there, so the
  // same ceilings bound it loosely at no cost; a prose-model pass on this ~12k-token instruction prices at roughly half a fast-model pass.)
  let { text } = await providerText(instruction, { maxTokens: 16000, temperature: 0.5, model: WRITE_MODEL, reasoning: process.env.WRITER_REASONING || "default", tag: "writer" });

  // ⚠ THE VALIDATOR MUST MATCH THE REQUESTED SHAPE. It filtered for /^\[\d+s\]/ unconditionally, so the moment
  // timestamps were switched off it rejected perfectly good continuous prose and silently fell back to the
  // one-line minimal beat — the model was writing what we asked for and we were throwing it away.
  // ⚠ VERIFY AND RETRY, DO NOT JUST ASK AGAIN. The instruction is >11,000 chars of accumulated doctrine and the
  // model stopped complying with parts of it: a 7s clip explicitly told to return 4 beats stamped [0s][2s][4s][6s]
  // came back with 3, and the payoff verb kept vanishing - both stated tersely at the very end. Restating a rule a
  // fifth time does not fix a compliance problem at that length; CHECKING THE OUTPUT does.
  // ⚠ LEGALITY, NOT A GRID (owner 2026-08-20). The enforcement mechanism survives exactly — a validator that
  // RE-ASKS, which the density lesson proved is the half that works — but "wrong" no longer means
  // disagreement with a prescribed list: it means an illegal COUNT (outside {${...}}), a DECIMAL stamp, an
  // opening that is not [0s], disorder, or a stamp past the duration. Vacuum-lab measured 7/7 legal under
  // this contract with counts varying by material — the variance is the point of the ruling.
  const stampList = (t) => ((normalizeDraftLayout(String(t)).split(/^\s*Dialogue\s*:/im)[0]).match(/^[ \t]*\[(\d+(?:\.\d+)?)s\]/gm) || []).map((x) => Number(x.replace(/[^\d.]/g, "")));   // the beats only — a Dialogue block written "[3s] Speaker: …" is not a beat (dry-cave-local-2)
  // ⚠ COMPLETENESS + LABEL LAWS RIDE THE SAME VALIDATOR (owner 2026-08-21, penguin deep remix: beat [4s]
  // shipped ending "lets out a flat" and a line labeled "Speaker" — both are output defects the check-the-
  // output pattern owns; a fifth restatement in the ask is not the fix).
  const _lawFails = (t) => {
    const fails = [];
    if (process.env.BEAT_BLOCKS !== "0" && !stampsLegal(stampList(t), BEAT_SECS, COUNTS)) fails.push(`stamps [${stampList(t).join(",")}] are illegal: ${stampsWhy(stampList(t), BEAT_SECS, COUNTS).join("; ")}`);   // the clause that BROKE, never the constraint the draft already met (2026-09-18)
    // THE HELD CLIMAX LEFT THE FORMAT RETRY (owner 2026-09-15: the climax owns at least four seconds and is not the last stamp — it may run over more than one beat, so a
    // last stamp says nothing about where it opens); the 09-12 clause (a last stamp later than [secs−3], corrected in this cheap retry) is gone — where the climax opens is
    // a judge question in _run (_judge_climax), its finding a re-ask. stampsLegal still refuses a stamp at or past the duration.
    // A DARK RIDE HAS VOICES (draw 17: the planner wrote no lines, the writer wrote none, and the voice check fired only after the wall had closed): no Dialogue block
    // on a dark ride is a format fail — the cheap retry writes it: each figure passed speaks its own line in character (the work's words are free in speech), with its manner, at its beat
    if (RIDE && RIDE.family === "dark ride" && !/(^|\n)\s*Dialogue\s*:/i.test(t)) fails.push(`a dark ride has voices — add the Dialogue block: each figure passed speaks its own line in character (the work's own words are free inside a spoken line), with its manner in the label — (sing-song, mocking) — at the stamp of the beat that passes it`);
    // EVERY LINE SAYS HOW IT IS SAID (owner 2026-09-11/12, every form): a spoken line whose label carries no manner is a law fail — one corrective retry
    { const over = linesOutrun(t, BEAT_SECS); if (over.length) fails.push(`a spoken line outruns its beat or begins in the last second ("${over[0].label}" at [${over[0].at}s]: ${over[0].words} words, ${over[0].window}s until the next beat of a ${BEAT_SECS}s take) — a line never outruns the beat that carries it: shorten it, move its stamp earlier, or give its beat the seconds it needs`); }
    { const bare = dialogueLines(t).filter((l) => !saysHow(l.line)); if (bare.length) fails.push(`a Dialogue line does not say how it is said ("${bare[0].label}") — end the speaker label with a short parenthetical of manner, two or three words: (sing-song, mocking)`); }
    // THE RIDER IS NEVER WRITTEN (owner 2026-09-07/08: frozen plaid hands, frozen boots) — on a RIDDEN one-take the rider's clothing or body is a law fail.
    // ⭐⭐ A RIDDEN LAW, NEVER A DRIVEN OR WORN ONE (owner 2026-09-22, job fd59c76a). This fired on a dashcam take because the appropriation makes any
    // two-photograph apparatus take a single block, and the gate read only singleBlock(). The clown's "sleeves" were the STORY'S figure, not a
    // rider; the corrective retry was then told "the vehicle is the bar, the nose, the bow, the rails" and the fast model obeyed — the car became the nose,
    // the window the bow, the man sat "in the bar", the road ran "on the rails" — and it re-emitted the banned name while it was at it. On a
    // driven or worn form the story's own figures wear clothes and are described; the rows ahead exist only on a ridden one.
    if (singleBlock() && RIDE?.kind === "ridden") {
      const body = (t.split("\n").find((l) => /^\s*\[\d+s\]/.test(l)) || "").replace(/^\s*\[\d+s\]\s*/, "");
      const _rider = body.match(/\b(?:shirt|sleeves?|plaid|gloves?|jacket|hoodie|wrist|watch|knuckles?|fingers?|boots?|sneakers?|trousers|jeans|legs?|knees?)\b/i);
      if (_rider) fails.push(`the rider is written ("${_rider[0]}") — the rider is never described: no hands, clothing, legs or body; the vehicle is the bar, the nose, the bow, the rails`);
    }
    const inc = incompleteBeatLines(t);
    if (inc.length) fails.push(`a beat ends mid-sentence ("…${inc[0].slice(-40)}")`);
    const gen = genericSpeakerLabels(t);
    if (gen.length) fails.push(`a dialogue label names nobody (${gen[0].trim().slice(0, 30)}) — name the figure`);
    // ⚠ THE CAMERA IS NEVER WRITTEN — ANY REGISTER (owner 2026-09-01, punch-monkey postmortem: a candid
    // beat shipped "and the camera tracks with it"; this check lived only inside the cinematic guard below).
    if (/\bthe camera\b/i.test(t))
      fails.push(`a beat names the camera ("the camera tracks with it") — the camera is never a character: delete the camera clause and write only what the subject does${genMood() === "cinematic" ? ' (for a cut, write "Hard cut to …")' : ""}`);
    // ⚠ THE CAMERA'S CHROME IS NEVER WRITTEN — ANY REGISTER (owner 2026-09-21, job d6921814: "under the trail camera's washed overlay and corner
    // marks" drew a camcorder viewfinder — brackets and battery icons — over a take whose frame zero was a real fixed camera's own frame; the
    // photograph carries the device's look, and written chrome is invented chrome). Beats only: the Dialogue block may say what it likes.
    { const _chrome = String(t).split(/^\s*Dialogue\s*:/im)[0].match(CHROME_WORDS);
      if (_chrome) fails.push(`a beat writes the camera's own chrome ("${_chrome[0]}") — the photograph carries the device's look: delete the chrome words and write only what happens in the scene`); }
    // CINEMATIC (owner 2026-08-25: «ensure dream mode produces cuts in prompt without refs»): the register's
    // signature move is MANDATED in the contract; this is the backstop — a cinematic script with no hard cut
    // gets the one corrective re-ask like any other law break.
    if (genMood() === "cinematic") {
      if (!/hard cut(?:s)? to /i.test(t)) fails.push("the cinematic register carries at least one hard cut to an unphotographed place — write one");
      // fisherman c1 residues (owner 2026-08-25: fix WITHOUT touching candid) — both checks live only
      // inside this guard, so the candid branch's behavior is byte-identical:
      // 1. "Speaker [2s]:" slipped the shared label check because the stamp sat between label and colon.
      if (/^\s*(?:Speaker|Voice|Narrator|Someone|Man|Woman|Person)\s*(?:\[\d+s\])?\s*:/mi.test(t))
        fails.push("a dialogue label names nobody (a stamp between the label and the colon does not excuse it) — name the figure");
      // 2. "…with both hands. Fisherman, to the water" — an attribution fragment riding the beat line.
      if (/\.\s+[A-Z][a-z]+,\s+to\s+[^.\n]{1,40}$/m.test(t))
        fails.push('an attribution fragment rides a beat line ("Name, to …") — attribution lives in the Dialogue block, never in a beat');
      // c2 residues (owner 2026-08-25, the UFC fan clip):
      if (/unphotographed/i.test(t))
        fails.push('contract language leaked into a beat ("unphotographed") — name the place plainly');
    }
    return fails;
  };
  // THE CHROME CLAUSE IS A REPAIR, NOT A RETRY (owner 2026-09-21, job d6921814): "Under the trail camera's washed overlay and corner marks, …" and
  // "… under the trail camera's flickering overlay and corner marks" lose the clause mechanically (_gate_rules.stripChromeClauses); the beat's own
  // event stands; anything that survives still fails the chrome law, and the one corrective re-ask fixes it.
  { const before = text; text = stripChromeClauses(text, { apparatus: process.env.APPARATUS_NOUN || "" });
    if (text !== before) console.error(` (repair: a chrome clause deleted — the photograph carries the device's look; no retry spent)`); }
  // THE CAMERA CLAUSE IS A REPAIR, NOT A RETRY (owner 2026-09-12: "23 is much too long"): every writer pass wrote "the camera tracks with it" and paid a full
  // corrective call to delete it. A clause that only names the camera is deleted mechanically; anything that survives still fails the law below.
  { const before = text;
    const _camV = "(?:tracks?|tracking|follows?|following|pans?|panning|holds?|holding|stays?|staying|moves?|moving|glides?|gliding|pushes?|pushing|pulls?|pulling|swings?|swinging|drifts?|drifting|tilts?|tilting|turns?|turning|looks?|looking|swivels?|swivell?ing|veers?|veering|peers?|peering|whips?|whipping|sweeps?|sweeping|settles?|settling|lingers?|lingering|rises?|rising|drops?|dropping|dips?|dipping)";
    text = text.replace(new RegExp(`,?\\s*(?:and|as|while)\\s+the camera\\s+${_camV}\\b(?:\\s+(?:to|toward|towards|the|a|an|its|his|her|left|right|up|down|back|ahead|slowly|sharply)\\b)*`, "gi"), "")
               .replace(new RegExp(`\\bthe camera\\s+${_camV}\\b[^.;,]{0,60}(?:,\\s*(?:and\\s+)?|\\s+and\\s+)`, "gi"), "");
    if (text !== before) console.error(` (repair: a camera clause deleted — the camera is never a character; no retry spent)`); }
  // A TERMINAL STAMP IS CLAMPED, NOT BOUGHT (2026-09-18, the trailcam cost audit). All three of that job’s drafts broke one
  // clause: a beat stamped AT the clip’s own duration. The count was legal, the order was legal, the opening was [0s]. Each
  // repair was a paid reasoning call (5571, 7129 and 6091 output tokens for $…, $… and $…: $…, 47% of the
  // writer’s whole spend) to move one integer by one, and each returned a FRESH draft rather than an edit, which is how the
  // penguin’s canon reached draft 1 and was gone by draft 3. When moving the late stamps inside the take makes the list legal,
  // and only then, the stamps are clamped here in the writer’s own words and nothing is spent. Anything else still re-asks.
  if (process.env.BEAT_BLOCKS !== "0") {
    const _st = stampList(text);
    if (_st.length && !stampsLegal(_st, BEAT_SECS, COUNTS)) {
      const _cl = clampStamps(_st, BEAT_SECS);
      if (_cl && stampsLegal(_cl, BEAT_SECS, COUNTS)) {
        const _map = new Map(_st.map((v, i) => [v, _cl[i]]).filter(([a, b]) => a !== b));
        text = restampBeats(text, _map);
        console.error(` (repair: stamps [${_st.join(",")}] clamped to [${_cl.join(",")}]; a stamp at or past the ${BEAT_SECS}s duration was the only fault, no retry spent)`);
      }
    }
  }
  const _fails1 = _lawFails(text);
  if (_fails1.length) {
    console.error(` (writer output broke the law: ${_fails1.join("; ")} - one corrective retry)`);
    const fix = await providerText(
      `Rewrite these beats fixing EXACTLY these violations: ${_fails1.join("; ")}. ` +
      `Beat COUNT one of {${COUNTS.join(", ")}}, every stamp a WHOLE second, first beat [0s], stamps ascending, all under ${BEAT_SECS}s. ` +
      `Every beat a COMPLETE sentence. Dialogue labels name their speaker. ` +
      `Keep the same story and wording as far as possible. ` +
      `The request was "${userPrompt}" - EVERY verb in it must still appear. Return ONLY the beat lines (and the Dialogue/Sound blocks if present).\n\n${text}`,
      { maxTokens: 12000, temperature: 0.3, model: REPAIR_MODEL, tag: "writer-retry" }
    ).catch((e) => {   // an OUTAGE is exit 5 (never a verdict on the words); our own CEILING firing is said out loud and the original ships — the ceiling degrades, it never hides (2026-09-14)
      if (e?.name === "ProviderInfraError") throw e;
      if (e?.ledgerCap) console.error(`\n⊘ BUDGET CAP in the corrective repair (${String(e.message || e).split("\n")[0].slice(0, 120)}) — the original draft ships; the wall stopped the repair, not the words`);
      return null;
    });
    if (fix?.text && _lawFails(fix.text).length === 0) { text = fix.text; console.error(` (retry OK)`); }
    else if (fix?.text && _lawFails(fix.text).length < _fails1.length) { text = fix.text; console.error(` (retry improved: ${_lawFails(fix.text).join("; ")} — shipping with the residue, loudly)`); }
    else console.error(` (retry did not improve — shipping the original, loudly: ${_fails1.join("; ")})`);
    // ONE BEAT IS NEVER SHIPPED AS ONE (owner 2026-09-07): if what survives is a single stamped paragraph, deal its sentences
    // across the legal count — deterministic, the writer's own words, a clock the model would otherwise invent
    if (process.env.BEAT_BLOCKS !== "0" && stampList(text).length === 1 && !singleBlock()) {   // a multi-world one-take is WRITTEN as one block (owner 2026-09-07)
      const split = splitSingleBeat(text, BEAT_SECS, COUNTS);
      if (split !== text) { text = split; console.error(` (one-beat script split across ${stampList(text).length} legal stamps: [${stampList(text).join(",")}])`); }
    }
  }

  let lines;
  // ⚠ MUST MATCH THE PROMPT SELECTOR ABOVE (`!== "0"`). This read `=== "1"` while the prompt asked for blocks
  // by default, so on the first end-to-end run the model DID emit "[0s] …" and the parser silently STRIPPED
  // every timestamp. Exactly the bug fixed earlier the same day, reintroduced in the opposite direction: when a
  // format flag gates two places, a change to one is a change to both.
  if (process.env.BEAT_BLOCKS !== "0") {
    // ⚠ CAP AT THE REQUESTED STAMP COUNT, NOT A LITERAL 3. This was `.slice(0, 3)`, a leftover from the hardcoded
    // "2-3 beats" era. Once stamps became duration-derived (a 7s/8s clip asks for 4), the model correctly returned
    // 4 beats and this line silently DELETED the 4th — the PAYOFF beat, which by doctrine lands LAST. That is the
    // whole "payoff survives some runs, not others": it survived only when the model happened to pack it into beat 3.
    // The retry validator never fired because it inspects `text` (4 stamps, matched) BEFORE this slice cut it to 3.
    // Cap at the LARGEST legal count so parser, instruction and validator agree on one ceiling.
    // ⚠ THE FILTER AND THE VALIDATOR READ THE SAME THING (2026-09-14). stampList above already cuts at the Dialogue
    // header ("a Dialogue block written \"[3s] Speaker: …\" is not a beat") and already accepts a decimal stamp; this
    // filter did neither — so a stamp-first block shipped its speech as BEAT PROSE on top of the block re-attached
    // below (the same words twice), and a [2.5s] beat, legally re-asked and then shipped when the retry did not
    // improve, was deleted here without a word. One spelling, one ceiling.
    text = normalizeDraftLayout(text);   // beats · Dialogue · Sound, wherever the writer put them (a header mid-beats swallowed the beats after it)
    lines = text.split(new RegExp(String.raw`^\s*${DIALOGUE_HEAD}`, "im"))[0].split("\n").map((l) => l.trim()).filter((l) => /^\[\d+(?:\.\d+)?s\]/.test(l)).slice(0, Math.max(...COUNTS));
  } else {
    // Continuous prose: keep every non-empty line, but strip any timestamps the model emits out of habit.
    lines = text.split("\n").map((l) => l.trim().replace(/^\[\d+s\]\s*/, ""))
      .filter((l) => l && !/^(beats?|shot script|prose)\s*:?\s*$/i.test(l));
  }
  // ⚠⚠ THE DIALOGUE BLOCK SURVIVES THE BEAT FILTER. Both branches above keep only lines the parser recognises
  // as BEATS — the timestamped branch requires /^\[\d+s\]/ outright. A "Dialogue:" section matches neither, so
  // the writer was told to "EMIT IT AS THE FINAL BLOCK" and the block was then DELETED by construction, on every
  // run, silently. That is the root cause of three separate carried-voice failures chased across two days: the
  // clause was present in the instruction every time and its output could never reach the file. It also explains
  // why the model kept narrating speech INLINE inside beat lines — inline is the only place speech survived, so
  // the model was right and the parser was wrong.
  // Captured from the RAW text before filtering and re-attached after, so the beat parser keeps its strict
  // contract and the speech stops being thrown away. _run re-attaches the plan's block only when none is
  // present, so a surviving block now correctly suppresses that fallback instead of duplicating against it.
  // ⚠ DUMP THE WRITER'S RAW OUTPUT, FOR THE SAME REASON THE INSTRUCTION IS DUMPED. Until now only the PARSED
  // beats were inspectable, so when a Dialogue block failed to appear there was no way to tell whether the
  // writer never wrote one or the parser threw it away — two very different bugs with one symptom, and two days
  // were spent fixing the wrong layer because of it. The instruction dump answers "what did we ask for"; this
  // answers "what did it actually say". Cheap, written every run, next to its instruction.
  try { writeFileSync(join(HERE, "out/_aspect", `${slug}_raw.txt`), text); } catch {}

  // ⚠ THE `\n` MUST NOT BIND TO THE END-OF-STRING ALTERNATIVE. Written as `(?=\n\s*(?:Sound\s*:|$))`, BOTH
  // branches required a preceding newline — so a block that runs to the very end of the model's output, with no
  // trailing newline, never matched. That is the normal case: the raw dump shows the writer emitting a correct
  // timed, carried Dialogue block as its LAST line, and this regex silently returned "". One layer down from
  // the beat filter, same symptom, and it is the third bug in this family today (`$` under /m in slop_meter,
  // the `[\d+s]` beat filter, now this) — an end-of-input assumption that holds for every input except the
  // real one. Lift the `\n` into the Sound branch only.
  const emittedDialogue = (text.match(/(^|\n)\s*Dialogue\s*:[\s\S]*?(?=\n\s*Sound\s*:|$)/i) || text.match(new RegExp(String.raw`(^|\n)\s*${DIALOGUE_HEAD}[\s\S]*?(?=\n\s*Sound\s*[:\u2014\u2013-]|$)`, "i")) || [""])[0].trim();
  // ⚠⚠ THE SOUND LINE SURVIVES THE BEAT FILTER TOO — THE SAME BUG, ONE BLOCK OVER. soundLaw() tells the writer in
  // capitals to "End the beats with a Sound: line naming the DIEGETIC ambience of each world the clip visits", and
  // the filter above then deleted exactly that line on every run and every form (measured 2026-09-14: 7 of 7 stored
  // drafts and 6 of 6 live prose-model draws wrote one, 0 reached the beats file). _run's applyAudioFill then found no
  // Sound directive and appended the fallback — "Natural ambient room tone of the scene; no music." over a ride the
  // writer had scored with ringing phones and show music — which is the very fallback the law says not to leave it
  // to. Captured beside the block and re-attached after it: the writer's audio is the writer's.
  const emittedSound = (text.match(/(^|\n)\s*Sound\s*[:\u2014\u2013-][^\n]*/i) || [""])[0].trim();
  // … AND ON A ONE-BLOCK FORM THE WRITER WRITES IT INSIDE THE BEAT (measured 2026-09-14: 5 of 5 driven-form drafts —
  // "…the road ahead clears as it clears the lane. Sound: tires on asphalt, … no music." is ONE line, so no header
  // starts a line, applyAudioFill sees no Sound directive and appends a SECOND one, and the first rides into the
  // render as scene prose. The sentence is MOVED, never rewritten — the same deterministic split the inline-quote
  // guard below makes for speech: a Sound: sentence that ENDS a beat line is the terminal line in the wrong place.
  const INLINE_SOUND = /(?<=[.!?]\s)Sound\s*[:\u2014\u2013-]\s*[^\n]*$/i;
  let inlineSound = "";
  if (!emittedSound) lines = lines.map((l) => l.replace(INLINE_SOUND, (m) => { inlineSound = m.trim(); return ""; }).trimEnd());
  if (lines.length) {
    beatLine = lines.join("\n");
    if (emittedDialogue) {
      // THE WRITER'S OWN BLOCK PASSES THE NAME LAW'S DE-NAMER TOO (job 69bb989b, 2026-09-13: "the twins in matching blue dresses to Wendy (creepy, unison) [3s]:"
      // — a seat-cast name as the addressee — reached the check twice and spent both re-asks; the two synthesised blocks below have had this pass since
      // velocal8, the kept block never did). A block left with only an omitted figure's lines ships no Dialogue, never a crash.
      const _kept = denameSpeakers(emittedDialogue);
      if (_kept) {
        beatLine += "\n\n" + _kept;
        console.log(`  ♪ dialogue block kept from the writer (${_kept.split("\n").length - 1} line(s))${_kept !== emittedDialogue ? " — a figure's name in a label written as its word" : ""}`);
      } else console.log(`  ♪ the writer's dialogue block carried only an omitted figure's line(s) — dropped`);
    }
    const _sound = emittedSound || inlineSound;
    if (_sound) { beatLine += `${/(^|\n)\s*Dialogue\s*:/i.test(beatLine) ? "\n" : "\n\n"}${_sound}`; console.log(`  ♪ sound line kept from the writer${inlineSound && !emittedSound ? " (split out of the beat it was written inside)" : ""}: "${_sound.slice(0, 56)}…"`); }
    mode += " + NARRATIVE";
    // ⚠ VALIDATE THE ASSEMBLY, NOT JUST THE DRAFT (owner 2026-08-22, the walrus): the law validator ran on
    // the writer's RAW text, then THIS assembly moved an inline quote into the Dialogue block — stranding
    // "…and barks" mid-sentence and (via the old buildDialogueBlock default) labeling the line "Speaker".
    // Anonymous labels REPAIR mechanically to the subject; a stranded beat is warned LOUDLY (a re-ask at
    // this stage would re-open the whole draft — the residue ships visible, never silent).
    const _subj = String(intent?.target || "").toUpperCase().trim();
    if (_subj && genericSpeakerLabels(beatLine).length) {
      beatLine = beatLine.replace(/^(\s*)(?:Speaker|Voice|Narrator|Someone)(\s*\d*\s*(?:\([^)]*\))?\s*(?:\[\d+(?:\.\d+)?s\]\s*)?:)/gim, `$1${_subj}$2`);
      console.error(`  ⚠ anonymous dialogue label REPAIRED to ${_subj} (the label law, post-assembly)`);
    }
    const _postInc = incompleteBeatLines(beatLine);
    if (_postInc.length) console.error(`  ⚠ POST-ASSEMBLY: a beat ends mid-sentence ("…${_postInc[0].slice(-40)}") — shipping visible, never silent`);
  }
  else console.error(" (narrative beats failed to parse — keeping the minimal beat)");
  // ⚠ REPAIRS KEY ON THE ACCEPTED DRAFT, NEVER ON A GRID (2026-08-20). Every downstream re-ask (fine-detail,
  // swap, payoff) verifies "same count as before" — and "before" is whatever count the writer legally CHOSE,
  // which no constant can know ahead of the draft.
  ACCEPTED_N = lines.length || Math.max(...COUNTS);

  // ⚠⚠ DETERMINISTIC GUARD — POST-CUT BEATS MAY NOT NAME FINE DETAIL.
  // The doctrine above already forbids this, and the doctrine is an LLM instruction, which makes it a
  // TENDENCY rather than a constraint: measured 3/3 clean immediately after the clause was reconciled, then
  // a later run shipped "flips open the lid of the pizza box WITH ITS FRONT PAWS". Naming the limb or the
  // small object in the grip is only showable from CLOSE, so the generator invents a nearer vantage — and
  // after a cut there is no photograph behind that vantage, so it synthesises one and the shot turns
  // artificial exactly at the payoff.
  // A guard is not a second instruction. It reads what came back, and when the rule was broken it says so and
  // asks once more, naming the offending words. Same pattern as the [GUARD] lines in manifest.mjs, and for the
  // same reason: prompt rules slip, code does not. The [GUARD] line is also the only way to SEE how often the
  // doctrine is being ignored, which until now was invisible.
  // ⚠ IT NEVER EDITS THE BEAT ITSELF. Silently deleting a clause could delete the payoff the user asked for;
  // re-asking keeps authorship with the writer. If the retry also breaks the rule, the beats SHIP anyway with
  // a loud warning — a working clip with a close payoff beats no clip.
  // ⚠ MATCH THE LIMB, NOT A POSSESSIVE. The first version keyed on "with its/his/her/their <limb>" and the very
  // first live run slipped straight past it with "with BOTH paws" — the determiner varies far more than the
  // body part does, so anchor on the body part and accept any determiner or none.
  // FINE_DETAIL: MOVED VERBATIM to _beat_law.mjs (imported above)
  const cutIdx = lines.findIndex((l) => /\bhard cut\b/i.test(l));
  const offending = cutIdx >= 0 ? lines.slice(cutIdx).filter((l) => FINE_DETAIL.test(l)) : [];
  if (offending.length) {
    const hit = offending.map((l) => (l.match(FINE_DETAIL) || [""])[0]).filter(Boolean);
    console.warn(`[GUARD] beats: post-cut beat named fine detail (${hit.join(" · ")}) — re-asking once (doctrine drifting; fix the root).`);
    try {
      const { text: t2 } = await providerText(
        instruction +
        `\n\n⚠ YOUR PREVIOUS ATTEMPT BROKE ONE RULE AND IS OTHERWISE FINE. In a beat AFTER the cut you wrote ` +
        `${hit.map((h) => `"${h}"`).join(" and ")}. After a cut there is no photograph behind the camera, so a beat ` +
        `pitched at something that small can only be shown by moving CLOSER, and the model then invents that ` +
        `vantage with nothing to ground it. Rewrite the SAME beats, keeping every event and the payoff exactly ` +
        `as they are, but describe the post-cut action by what the WHOLE BODY does at the distance the ` +
        `photograph was taken from. Do not name the limb or the object in the grip. Change nothing else.`,
        { maxTokens: 12000, temperature: 0.2, model: REPAIR_MODEL, tag: "writer-retry" });   // ROOM (2026-09-23, see provider-llm): cut off at 4000 on live jobs, answers at 3600-8000
      const relines = t2.split("\n").map((l) => l.trim()).filter((l) => /^\[\d+s\]/.test(l)).slice(0, ACCEPTED_N);
      const stillBad = relines.filter((l) => FINE_DETAIL.test(l)).length;
      if (relines.length && !stillBad) { beatLine = relines.join("\n"); console.log(`[GUARD] beats: repaired on retry`); }
      else console.warn(`[GUARD] beats: retry ${relines.length ? "STILL names fine detail" : "failed to parse"} — shipping the original (expect a close payoff)`);
    } catch (e) {
      if (e?.name === "ProviderInfraError") throw e;
      console.warn(`[GUARD] beats: retry errored (${String(e.message).slice(0, 60)}) — shipping the original`);
    }
  }
}

// ── SPEECH THAT ENDED UP IN THE BEATS IS A DUPLICATION BUG, NOT A STYLE CHOICE ────────────────────────────
// The dialogue contract is: words live in ONE terminal "Dialogue:" block, beats describe only what is SEEN.
// Asking for carried voice pushed the writer to narrate speech inline instead ("...as the Rabbit, continuing
// over the cuts, says: '...'"), which reads naturally and breaks three things at once:
//   · slop_meter's spokenWords() returns NULL — there is no block, so density cannot be measured at all;
//   · applyAudioFill sees no Dialogue:/Sound: line and appends ROOM TONE over a scene that has speech;
//   · worst, _run.mjs re-attaches the PLAN's dialogue block only when the beats carry none — so the same
//     line ships TWICE, once inline and once appended, and the generator is asked to say it two ways.
// A rule in a prompt is a probability; this is the mechanical backstop, in the same spirit as the
// fine-detail guard above. Deterministic repair rather than a re-ask: the words are MOVED, never rewritten,
// so the keep-the-words rule is preserved exactly and it costs nothing.
{
  // The guard itself lives in _gate_rules.mjs (moveInlineSpeech, owner 2026-09-22) so the gate RUNS it on the strings that broke,
  // instead of reading this file's source. The terminal block is the canonical location — it carries the timings, and it is what
  // applyAudioFill and the slop meter read — so a line found in the beats moves INTO it, and a copy the block already holds comes out.
  const _moved = moveInlineSpeech(beatLine, { planDialogue: process.env.PLAN_DIALOGUE || "", proseFigures: process.env.PROSE_FIGURES || "", workTitles: process.env.WORK_TITLES || "", dename: denameSpeakers });
  beatLine = _moved.beatLine;
  if (_moved.mode === "moved") {
    console.warn(`[GUARD] dialogue: ${_moved.moved} spoken line(s) were narrated INSIDE the beats and no Dialogue block existed — MOVED into one terminal block, timings preserved (doctrine drifting; fix the root).`);
    console.warn(`[GUARD] dialogue: left in place they would have shipped TWICE — _run re-attaches the plan's block whenever the beats carry none.`);
  } else if (_moved.mode === "stripped") {
    console.warn(`[GUARD] dialogue: ${_moved.moved} quoted line(s) appeared in the beats ALONGSIDE a Dialogue block — STRIPPED from the beats, block kept (it holds the timings). Left in place the generator would have been told the same speech twice.`);
  }
}

// ── IF THE WRITER OMITTED THE SPEECH, BUILD THE BLOCK OURSELVES ───────────────────────────────────────────
// ⚠⚠ MEASURED REGRESSION, AND THE REASON THIS IS DETERMINISTIC. Handing the writer a literal stamp list made
// things WORSE, not better: no-speech went from 3-of-11 to 4-of-6, and the two runs that did write dialogue
// ignored the given stamps entirely (one reused the BEAT stamps, one wrote a single [0s]). More instruction
// text bought less compliance — the crowding effect, one field over from where it is already documented.
// The mistake was diagnostic. BEAT_STAMPS does not work because it is a literal spec; it works because a
// VALIDATOR RE-ASKS when the stamps come back wrong. Copying the spec without the enforcement copied the half
// that was never doing the work.
// So stop asking. The plan's dialogue already exists, dialogueStamps() already knows where the fragments
// belong, and splitting a sentence at clause boundaries is arithmetic. Build it. This cannot fail to comply,
// costs nothing, and makes every prior "writer dropped the speech" outcome impossible rather than unlikely.
// The writer's own block still wins whenever it produces one — this is a floor, not a replacement.
if (!/(^|\n)\s*Dialogue\s*:/i.test(beatLine) && (process.env.PLAN_DIALOGUE || "").trim()) {
  // fallback speaker = the subject as the writer knows it (never "Speaker" — the label law's own bug site)
  // A FIGURE'S LINE IS TIMED TO THE BEAT THAT PASSES THE FIGURE (owner 2026-09-11: "let me come in" played as narration at 0s and 7s while the caretaker
  // was passed at 6s): the plan's speaker is looked for in the beats; its line lands on that beat's stamp (and two seconds on for a split), not the defaults.
  const _figStamps = (() => {
    try {
      const who = ((process.env.PLAN_DIALOGUE || "").match(/\n\s*([^:\n]{1,80}?)\s*:/) || [])[1] || "";
      if (!who || /^ride narrator$/i.test(who.trim())) return undefined;
      const keys = [...new Set(String(who).toLowerCase().replace(/^["'“”‘’]+|["'“”‘’]+$/g, "").split(/[^a-z0-9'-]+/).filter((k) => k.length >= 4 && !["with", "from", "that", "this", "their", "figure", "animatronic"].includes(k)))];
      if (!keys.length) return undefined;
      const lines = beatLine.split("\n").map((l) => l.match(/^\s*\[(\d+(?:\.\d+)?)s\]\s*(.*)$/)).filter(Boolean);
      const hit = lines.find((m) => keys.filter((k) => new RegExp(`\\b${k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i").test(m[2])).length >= Math.min(2, Math.ceil(keys.length / 2)));
      if (!hit) return undefined;
      const at = Number(hit[1]); const end = Number(process.env.BEAT_DURATION) || (Math.max(...lines.map((m) => Number(m[1]))) + 1);
      console.log(`  \u266a the plan's speaker (${who.trim()}) is passed at [${at}s] \u2014 its line lands there, not at the defaults`);
      return [at, Math.min(at + 2, Math.max(at, end - 1))];
    } catch { return undefined; }
  })();
  // denameSpeakers reads the block TEXT (dry-cave-local-1, 2026-09-11: the built OBJECT was passed, came back null under IP_FIGURES, and the
  // writer process crashed on `.block` — two re-asks lost); a null block (no speaker, or the figure omitted) ships no Dialogue, never a crash.
  const _built = buildDialogueBlock(process.env.PLAN_DIALOGUE, _figStamps, String(intent?.target || "").toUpperCase() || null);
  const _blk = _built ? denameSpeakers(_built.block) : null;
  if (_blk) {
    beatLine += "\n\n" + _blk;
    console.warn(`[GUARD] dialogue: the writer emitted no speech — SYNTHESISED a timed block from the plan's line across ${_built.stamps.map((x) => `${x}s`).join(", ")} (deterministic; the writer's own block always wins when it produces one).`);
  } else console.warn(`[GUARD] dialogue: the writer emitted no speech and the plan's line carries no speaker (or its figure is omitted) — no Dialogue block`);
}

// ── AND MEASURE WHETHER THE SPEECH ACTUALLY REACHES THE END ───────────────────────────────────────────────
// The clip-length rule lives in the instruction above, which makes it a probability. This reports the fact.
// Advisory ONLY: plot placement legitimately silences parts of a clip, so a gate here would delete correct
// dialogue. It exists so "the narration cuts early" is measured at write time instead of noticed on playback.
{
  const r = speechReach(beatLine, Number(process.env.BEAT_DURATION) || null);
  if (r.verdict === "cuts-early")
    console.warn(`[GUARD] speech: last line begins at ${r.last}s of ${process.env.BEAT_DURATION}s (reach ${r.reach.toFixed(2)} < ${SPEECH_REACH_FLOOR}) — the back half of this clip has no voice in it. Legitimate only if the PLOT places the speech there.`);
  else if (r.verdict === "untimed")
    console.warn(`[GUARD] speech: the dialogue block carries no [Ns] timings, so its reach cannot be measured — one untimed line is delivered wherever the generator puts it, usually at the top.`);
  else if (r.verdict === "reaches")
    console.log(`  \u266a speech reaches ${r.last}s of ${process.env.BEAT_DURATION}s (${(r.reach * 100).toFixed(0)}% in)`);
}

const outFile = join(HERE, "out/_aspect", `${slug}_beats.txt`);
// ⚠ SHADOW: records what the payoff check WOULD say and changes nothing. COMEDY_LAW rule 4 reaches this
// writer now and the beats stayed chronological anyway — cat: paw, push, accusing stare; heron: stands over
// sandwich, grips, swallows — so this is the check half. It is calibrated on only THREE owner-judged
// examples, and a comedy verdict is exactly what a model is confidently wrong about, so it watches until its
// agreement can be read across real traffic. PAYOFF_CHECK=1 lets it act; "0" disables it.
// ── SWAP CHECK + REPAIR — runs BEFORE the payoff repair, deliberately: this one is about GROUNDING beat zero
// on the photograph, and there is no point escalating a payoff on a shot whose first frame the generator is
// still free to invent. Only fires when a swap was actually instructed (a stand-in exists and is not already
// the target); a plate with an empty action spot has nothing to take the position of.
try {
  // ON A RIDE THERE IS NO SUBJECT TO SWAP IN (draw 21, 2026-09-13: the seat plate's own passenger was vacated and the swap check re-asked the writer to seat a
  // subject that does not exist — a writer pass bought for nothing). The seat is the vantage; hostability already steps aside; so does this.
  // ⭐⭐ THE ANCHOR SURVIVES THE STAND-IN LAW (owner 2026-09-22). This check never asked about the body: it asks whether beat zero
  // states WHERE in the frame the subject is and WHICH WAY it faces, because a beat that says neither lets the first frame drift. That
  // is as true of a conjured figure as it was of a swapped one. What went is the repair's old argument — that the generator has to know
  // which body it is replacing — and with it the instruction to write that body out. The subject is now placed at the action spot.
  if (!RIDE && !seen.standin_is_target) {
    const { swapVerdict, swapActs } = await import("./_swap_check.mjs");
    const sv = await swapVerdict(seen.standin || String(seen.scene || "the scene"), seen.standin_placement, intent.target, beatLine);
    if (sv.verdict) console.error(`  [swap:${swapActs() ? "live" : "shadow"}] beat zero ${sv.verdict.toUpperCase()} — position ${JSON.stringify(sv.position)} · facing ${JSON.stringify(sv.facing)}${swapActs() ? "" : "  (recorded only)"}`);
    if (swapActs() && sv.verdict === "unanchored" && writerInstruction) {
      const _bl = beatLine.split("\n");
      const _i0 = _bl.findIndex((l) => /^\[\d+(?:\.\d+)?s\]/.test(l.trim()));
      console.warn(`  [anchor] beat zero states neither position nor facing — re-asking once so the subject is placed in the frame.`);
      try {
        const { text: t4 } = await providerText(
          writerInstruction +
          `\n\n⚠ YOUR PREVIOUS ATTEMPT IS FINE EXCEPT FOR ITS OPENING BEAT, WHICH DOES NOT PLACE THE SUBJECT. ` +
          `Your opening beat named the place in general but said nothing about WHERE in the picture the subject is ` +
          `or WHICH WAY it faces, and a first frame with neither drifts. Rewrite the SAME beats at the SAME ` +
          `timestamps, changing ONLY the opening beat so it states the subject's position in the frame and its ` +
          `facing.${has(seen.standin) ? ` Everything the photograph already holds — ${seen.standin} among it — stays exactly as photographed and is never replaced or written out.` : ""} ` +
          `Return the full beat list and nothing else.`,
          { maxTokens: 12000, temperature: 0.3, model: REPAIR_MODEL, tag: "writer-retry" });   // ROOM (2026-09-23, see provider-llm): cut off at 4000 on live jobs, answers at 3600-8000
        const rl = t4.split("\n").map((l) => l.trim()).filter((l) => /^\[\d+(?:\.\d+)?s\]/.test(l)).slice(0, ACCEPTED_N);
        if (rl.length !== ACCEPTED_N) console.warn(`  [swap] retry returned ${rl.length}/${ACCEPTED_N} beats — shipping the original.`);
        else {
          const rebuilt = rl.join("\n");
          const sv2 = await swapVerdict(seen.standin || String(seen.scene || "the scene"), seen.standin_placement, intent.target, rebuilt);
          if (sv2.verdict === "anchored") {
            beatLine = rebuilt + (_i0 >= 0 && _bl.slice(_i0 + rl.length).length ? "\n" + _bl.slice(_i0 + rl.length).join("\n") : "");
            console.log(`  [swap] repaired — beat zero now states position ${JSON.stringify(sv2.position)} · facing ${JSON.stringify(sv2.facing)}`);
          } else console.warn(`  [swap] retry still ${String(sv2.verdict || "unjudged").toUpperCase()} — shipping the original (expect a loose first frame).`);
        }
      } catch (e) {
        if (e?.name === "ProviderInfraError") throw e;
        console.warn(`  [swap] repair errored (${String(e.message).slice(0, 60)}) — shipping the original`);
      }
    }
  }
} catch { /* a check that cannot run is not a verdict */ }

try {
  const { payoffVerdict, payoffActs } = await import("./_payoff_check.mjs");
  if (telling() === "observational") console.error("  [payoff] view held \u2014 no payoff is owed; the check and its re-ask are skipped");
  const pv = (RIDE || telling() === "observational") ? { verdict: null } : await payoffVerdict(requestForLaws(process.env.USER_PROMPT || userPrompt || ""), beatLine);   // a ride's ending is the ride's own law (held|quick by the plan): the payoff judge is never called for it (velocal10: a paid call per pass, then ignored)
  if (pv.verdict) console.error(`  [payoff:${payoffActs() ? "live" : "shadow"}] last beat ${pv.verdict.toUpperCase()}${pv.why ? ` — ${pv.why}` : ""}${payoffActs() ? "" : "  (recorded only)"}`);
  // ── THE REPAIR (owner 2026-08-19: "i dont see payoff") ──────────────────────────────────────────────────
  // ⚠⚠ THE CHECK WAS RIGHT AND DID NOTHING. payoffActs() existed but was read ONLY to change the word in the
  // log line — there was no repair behind it, so "live" meant "print live". Measured on both runs of
  // 2026-08-19: the check returned COMPLETES for each ("matches described celebration directly"; "Matches
  // request, no extra action") and the owner independently said "i dont see payoff" — 2 more agreements on
  // top of the 3 it was calibrated on. A verdict nothing acts on is a log line.
  // Same shape as the fine-detail repair above, and for the same reasons: RE-ASK, never edit the beat
  // ourselves (deleting a clause could delete the payoff the user asked for); carry the ORIGINAL contract so
  // the retry answers the question that failed; VERIFY the retry actually escalates; and ship the original
  // with a loud warning if it does not — a working clip with a flat payoff beats no clip.
  if (RIDE && payoffActs() && pv.verdict === "completes" && writerInstruction) console.warn(`  [payoff] a ride: the ride's own finale laws own the ending (the story's turn, held or quick by the plan) — no escalation re-ask spent`);
  if (!RIDE && payoffActs() && pv.verdict === "completes" && writerInstruction) {
    // The dialogue block is APPENDED as a trailing section, so beats and block separate cleanly and the
    // block's [Ns] stamps still line up as long as the retry keeps the same stamps (it is told to).
    const _bl = beatLine.split("\n");
    const _lastBeatIdx = _bl.map((l) => /^\[\d+(?:\.\d+)?s\]/.test(l.trim())).lastIndexOf(true);
    const _tail = _lastBeatIdx >= 0 ? _bl.slice(_lastBeatIdx + 1).join("\n") : "";
    console.warn(`  [payoff] last beat only COMPLETES the request — re-asking once for a beat that ESCALATES.`);
    try {
      const { text: t3 } = await providerText(
        writerInstruction +
        `\n\n⚠ YOUR PREVIOUS ATTEMPT IS FINE EXCEPT FOR ITS LAST BEAT, WHICH ONLY COMPLETES THE REQUEST. ` +
        `It delivers what the request already described, or the obvious next step of the action, so the clip ` +
        `stops rather than lands. Rewrite the SAME beats at the SAME timestamps, keeping every earlier beat ` +
        `exactly as it is, and change ONLY the last beat so it ESCALATES: take the same material one step ` +
        `further — commit harder, or answer the situation with something THE SCENE'S OWN WORLD already ` +
        `supplies that the request never named. Do not introduce a new place, a new character, or a prop the ` +
        `frame cannot afford. If an earlier beat set up a turn that nothing answered, ANSWERING IT is the ` +
        `escalation. Return the full beat list and nothing else.`,
        { maxTokens: 12000, temperature: 0.3, model: REPAIR_MODEL, tag: "writer-retry" });   // ROOM (2026-09-23, see provider-llm): cut off at 4000 on live jobs, answers at 3600-8000
      const rl = t3.split("\n").map((l) => l.trim()).filter((l) => /^\[\d+(?:\.\d+)?s\]/.test(l)).slice(0, ACCEPTED_N);
      if (rl.length !== ACCEPTED_N) {
        console.warn(`  [payoff] retry returned ${rl.length}/${ACCEPTED_N} beats — shipping the original.`);
      } else {
        // ⚠ VERIFY, DO NOT ASSUME. The retry is judged by the SAME check that failed it; a retry that still
        // only completes is not an improvement worth the risk of a worse-written beat.
        const rebuilt = rl.join("\n");
        const pv2 = await payoffVerdict(requestForLaws(process.env.USER_PROMPT || userPrompt || ""), rebuilt);
        if (pv2.verdict === "escalates") {
          beatLine = rebuilt + (_tail ? "\n" + _tail : "");
          console.log(`  [payoff] repaired — last beat now ESCALATES${pv2.why ? ` (${pv2.why})` : ""}`);
        } else console.warn(`  [payoff] retry still ${String(pv2.verdict || "unjudged").toUpperCase()} — shipping the original (expect a flat payoff).`);
      }
    } catch (e) {
      if (e?.name === "ProviderInfraError") throw e;
      console.warn(`  [payoff] repair errored (${String(e.message).slice(0, 60)}) — shipping the original`);
    }
  }
} catch { /* a check that cannot run is not a verdict */ }
writeFileSync(outFile, beatLine + "\n");
console.log(`target : ${intent.target} · action: ${intent.action}${intent.secondary ? ` · +${intent.secondary}` : ""}`);
console.log(`scene : ${seen.scene}`);
console.log(`standin: "${seen.standin}" [${seen.standin_placement}] → ${mode}`);
console.log(`\nBEATS → ${outFile}\n ${beatLine}`);
