// REMIX INTENT — the diff parser (owner 2026-08-21: «the input box being their intent … we parse intent
// and rewrite the prompt of the remixed video accordingly … the key is correctly changing the prompt of
// that which is remixed, and parsing user intent»).
//
// A remix is a TYPED DIFF against the parent's stored gen-state, never a fresh prompt. The governing law,
// owner-ruled: A REMIX CHANGES ONLY WHAT THE USER NAMES — EVERYTHING ELSE KEEPS. Ambiguity resolves to
// preservation, never reinvention (the dont-narrow doctrine, mirrored onto remixes). The parse is ONE
// dedicated call asking one question (the crowding law); normalizeDiff then applies default-KEEP
// mechanically, drops ops against targets the state does not contain (loudly), and computes the derived
// routing flags. clearance_delta carries every NEW proper name or brand the intent introduces — the ONLY
// part of the © doctrine a remix re-runs (owner: scoped, kept elements inherit the parent's verdicts).
//
// ⚠ A FAILED PARSE FAILS LOUDLY, NEVER GUESSES. An unparsed intent silently treated as "keep everything"
// would bill the user for a copy of their parent; treated as a fresh prompt it would destroy what they
// meant to keep. Neither is a remix. The caller surfaces the failure and no money moves.
import { providerJson, providerText, textPart } from "./provider-llm.mjs";
import { danglingSpeakerLabels, referenceNameFindings, sameCharacter } from "./_gate_rules.mjs";
import { incompleteBeatLines, genericSpeakerLabels, referenceVoices, referenceVoicesLaw } from "./_beat_law.mjs";

/** Compact state summary the parser sees — names and places, never internals. */
export function stateSummary(state) {
  const p = state?.plan || {};
  const figures = (p.figures || []).map((f) => `${f.name}${f.promptRef ? ` (${f.promptRef})` : ""}`).join(" · ") || (p.subject || "the subject");
  const beats = String(state?.prompt_text || "").split("\n").filter((l) => /^\[\d/.test(l.trim())).join("\n");
  return {
    figures,
    places: Array.isArray(p.places) ? p.places : [],
    beats,
    dialogue: /(^|\n)\s*Dialogue\s*:/i.test(String(state?.prompt_text || "")),
  };
}

/** THE DIALOGUE DIMENSION, ONE SHAPE FOR BOTH READERS OF A REMIX (2026-09-25, the reviewer's consultation; the owner: "confirm on 1 2 and 3"): the standard reader
 *  and the escalation planner answer it in the same words, and the executor reads both through dialogueOf. An escalated surgery forced "keep" and copied
 *  the parent's block verbatim, so a line the maker asked for could never reach the take and the quoted-words check had nothing to read. */
export const DIALOGUE_FIELD = `"dialogue":{"op":"keep|rewrite|remove","instruction":null|"..."}`;
export const dialogueOf = (raw) => (raw?.op === "remove" ? { op: "remove", instruction: raw?.instruction ? String(raw.instruction) : null }
  : raw?.op === "rewrite" && String(raw?.instruction || "").trim() ? { op: "rewrite", instruction: String(raw.instruction) }
  : { op: "keep", instruction: null });   // a rewrite with no words is no change (both third build checks: it sent "DIALOGUE: null" to surgery, which refused)
export async function parseRemixIntent(state, intentText) {
  const s = stateSummary(state);
  const ask =
    `A video exists. Its state:\n` +
    `FIGURES: ${s.figures}\n` +
    `PLACES: opening "${s.places[0] || "?"}"${s.places.length > 1 ? `; later: ${s.places.slice(1).map((x) => `"${x}"`).join(", ")}` : ""}\n` +
    `STORY:\n${s.beats}\n\n` +
    `A user wants to REMIX it. Their words: """${String(intentText || "").slice(0, 500)}"""\n\n` +
    `LAW: a remix changes ONLY what the user names — everything else KEEPS. Never invent a change the words do not ask for.\n` +
    `Return ONLY JSON {\n` +
    ` "figures":[{"target":"<existing figure name>","op":"keep|swap|remove","to":"<replacement as the user named it, or null>","look":"<on a keep ONLY: when the user changes how THIS figure looks or what it wears or holds, that change in the user's own words; else null>"}] (one entry per EXISTING figure; append {"target":null,"op":"add","to":"..."} only for a genuinely new figure),\n` +
    ` "world":{"op":"keep|change","to":"<new opening place or null>","keep_explicit":true|false} (keep_explicit = the user's OWN WORDS keep the place — "same kitchen", "keep the room", "still in this hallway", "in the same place"; false when the words merely say nothing about the place),\n` +
    ` "cuts":[{"target":"<later place>","op":"keep|change|remove","to":null|"..."}] (one per later place),\n` +
    ` "action":{"op":"keep|rewrite","instruction":"<precisely what now happens, in the user's own words completed minimally — null when keep>"},\n` +
    ` ${DIALOGUE_FIELD},\n` +
    ` "props":[{"target":"<existing prop>","op":"swap|remove","to":null|"..."} or {"target":null,"op":"add","to":"..."}],\n` +
    ` "clearance_delta":["<every NEW proper name, character, or brand the intent introduces — empty when none>"],\n` +
    ` "vague": true|false (true when the words name NOTHING concrete to change)\n}`;
  const j = await providerJson([textPart(ask)], { maxTokens: 3000, temperature: 0.1 });   // ROOM (2026-09-23, see provider-llm): cut off at 700 on live remixes, answers at 1300-1400+
  return normalizeDiff(j, state);
}

/** Mechanical half: default-KEEP fill, unknown-target drops (loud), routing flags. Pure, gate-testable. */
export function normalizeDiff(raw, state) {
  if (!raw || typeof raw !== "object") throw new Error("intent parse returned nothing — a remix never guesses");
  const p = state?.plan || {};
  const knownFigures = new Set((p.figures || []).map((f) => String(f.name || "").toLowerCase()).filter(Boolean));
  const places = Array.isArray(p.places) ? p.places : [];
  const laterPlaces = new Set(places.slice(1).map((x) => String(x).toLowerCase()));
  const d = {
    figures: [], world: { op: "keep", to: null, keepExplicit: false }, cuts: [], action: { op: "keep", instruction: null },
    dialogue: { op: "keep", instruction: null }, props: [], clearance_delta: [], vague: raw.vague === true, dropped: [],
  };
  for (const f of Array.isArray(raw.figures) ? raw.figures : []) {
    const op = ["keep", "swap", "remove", "add"].includes(f?.op) ? f.op : "keep";
    if (op === "add") { if (f?.to) d.figures.push({ target: null, op, to: String(f.to) }); continue; }
    if (!knownFigures.has(String(f?.target || "").toLowerCase())) { if (op !== "keep") d.dropped.push(`figure "${f?.target}" not in the parent`); continue; }
    // ⭐⭐ THE REMIXER'S WORDS OUTRANK A KEPT LOOK (owner 2026-09-21: "a user should be free to instruct against their omission"): a keep may carry
    // the user's change to that figure's look; it rides to the planner with the kept record and routes as a figure change (the deep path realizes it)
    d.figures.push({ target: String(f.target), op, to: f?.to ? String(f.to) : null, look: op === "keep" && typeof f?.look === "string" && f.look.trim() ? f.look.trim() : null });
  }
  for (const name of knownFigures) if (!d.figures.some((f) => String(f.target || "").toLowerCase() === name)) d.figures.push({ target: name, op: "keep", to: null, look: null });
  if (raw.world?.op === "change" && raw.world?.to) d.world = { op: "change", to: String(raw.world.to) };
  else if (raw.world?.keep_explicit === true) d.world.keepExplicit = true;   // the words keep the place → the parent's plate rides (WORLD_PIN); otherwise the environment is RE-SOURCED
  for (const c of Array.isArray(raw.cuts) ? raw.cuts : []) {
    const op = ["keep", "change", "remove"].includes(c?.op) ? c.op : "keep";
    if (!laterPlaces.has(String(c?.target || "").toLowerCase())) { if (op !== "keep") d.dropped.push(`cut place "${c?.target}" not in the parent`); continue; }
    d.cuts.push({ target: String(c.target), op, to: c?.to ? String(c.to) : null });
  }
  for (const pl of laterPlaces) if (!d.cuts.some((c) => String(c.target).toLowerCase() === pl)) d.cuts.push({ target: pl, op: "keep", to: null });
  if (raw.action?.op === "rewrite" && raw.action?.instruction) d.action = { op: "rewrite", instruction: String(raw.action.instruction) };
  d.dialogue = dialogueOf(raw.dialogue);
  for (const pr of Array.isArray(raw.props) ? raw.props : []) {
    const op = ["swap", "remove", "add"].includes(pr?.op) ? pr.op : null;
    if (op) d.props.push({ target: pr?.target ? String(pr.target) : null, op, to: pr?.to ? String(pr.to) : null });
  }
  // ⚠⚠ THE CLEARANCE DELTA IS DERIVED MECHANICALLY, NEVER TRUSTED TO THE MODEL. Measured on the lab's
  // first run: "make it the nihilist penguin instead" came back clearance_delta:[] — the model judged a
  // lowercase coinage not-a-proper-name, the SAME coinage blindness the extraction fix closed, reappearing
  // one layer up. The truth needs no judgment: every swap/add/change TARGET the intent introduces IS the
  // delta — the resolver downstream (whose coinage law now works) decides what each one actually is. The
  // model's own list is unioned in as advisory, never load-bearing.
  const mech = [
    ...d.figures.filter((f) => (f.op === "swap" || f.op === "add") && f.to).map((f) => f.to),
    ...d.props.filter((p) => (p.op === "swap" || p.op === "add") && p.to).map((p) => p.to),
    ...(d.world.op === "change" && d.world.to ? [d.world.to] : []),
    ...d.cuts.filter((c) => c.op === "change" && c.to).map((c) => c.to),
  ];
  d.clearance_delta = [...new Set([...mech, ...(Array.isArray(raw.clearance_delta) ? raw.clearance_delta : [])].map((x) => String(x).trim()).filter(Boolean))];
  return d;
}

// ── BEAT SURGERY, the pure halves (the executor's writer stage) ──────────────────────────────────────────
/** The stamp sets of two beat texts — the action-swap rhythm law (owner, provisional ruling 4): an
 *  action-only remix PRESERVES the parent's rhythm; the surgery must return the same stamps. */
export function stampsOf(text) {
  return (String(text || "").match(/^\[(\d+(?:\.\d+)?)s\]/gm) || []).map((s) => s.replace(/[^\d.]/g, ""));
}
export function sameStamps(a, b) {
  const x = stampsOf(a), y = stampsOf(b);
  return x.length === y.length && x.every((v, i) => v === y[i]);
}
/** ⚠ FRAME ZERO IS PLATE-GROUNDED LAW: when the world KEEPS, beat 0 must survive VERBATIM — it was written
 *  FROM the kept photograph (write-after-plate) and a rewritten opening fights the plate exactly like the
 *  hand-run diffusions did. Returns the surgered text with beat 0 mechanically restored when needed. */
export function restoreBeatZero(parentText, surgeredText) {
  const p0 = String(parentText || "").split("\n").find((l) => /^\[0(?:\.0)?s\]/.test(l.trim()));
  if (!p0) return surgeredText;
  const lines = String(surgeredText || "").split("\n");
  const i = lines.findIndex((l) => /^\[0(?:\.0)?s\]/.test(l.trim()));
  if (i === -1) return `${p0}\n${surgeredText}`;
  if (lines[i].trim() !== p0.trim()) lines[i] = p0;
  return lines.join("\n");
}
/** Split a script into its beat region and its terminal blocks — the tail the model never touches. */
export function splitScript(text) {
  const lines = String(text || "").split("\n");
  const i = lines.findIndex((l) => /^\s*(?:Dialogue|Sound)\s*:/i.test(l.trim()));
  if (i === -1) return { beats: String(text || "").trimEnd(), dialogue: "", sound: "" };
  const tail = lines.slice(i);
  const si = tail.findIndex((l) => /^\s*Sound\s*:/i.test(l.trim()));
  const dlg = tail.filter((_, k) => si === -1 || k < si).join("\n").trim();
  const snd = si === -1 ? "" : tail.slice(si).join("\n").trim();
  return { beats: lines.slice(0, i).join("\n").trimEnd(), dialogue: /^\s*Dialogue\s*:/i.test(dlg) ? dlg : "", sound: snd };
}

/** The surgical contract — BEATS ONLY (measured in the lab: handed the whole script, the model reformats
 *  the tail it was told to keep — so the tail is never handed over; kept sections reattach BY CODE). */
export function surgeryContract(parentBeats, diff) {
  const changes = [];
  if (diff.action?.op === "rewrite") changes.push(`ACTION: ${diff.action.instruction}`);
  for (const pr of diff.props || []) changes.push(`PROP: ${pr.op === "add" ? `add ${pr.to}` : pr.op === "remove" ? `remove ${pr.target}` : `${pr.target} becomes ${pr.to}`}`);
  const dlgRewrite = diff.dialogue?.op === "rewrite";
  if (dlgRewrite) changes.push(`DIALOGUE: ${diff.dialogue.instruction}`);
  return (
    `A finished video's beats follow. A REMIX changes ONLY what is listed under CHANGES — every unchanged ` +
    `beat must survive WORD-FOR-WORD, at the SAME [Ns] stamps, the same count. Beat [0s] is grounded on a ` +
    `photograph that is being KEPT: never alter it.\n\nBEATS:\n${parentBeats}\n\nCHANGES:\n${changes.map((c) => `- ${c}`).join("\n")}\n\n` +
    `Apply the changes with the smallest possible edit. The final beat still lands the story at a CLIMAX ` +
    `of the feeling in motion — deadpan counts, flat does not. ` +
    // a name the remixer used only for a manner: the surgery knows whose, the words never say it (owner 2026-09-24, "manner only")
    (referenceVoicesLaw() ? `\n\n${referenceVoicesLaw()}\n` : "") +
    (dlgRewrite
      ? `Return the beat lines, then a Dialogue: section applying the dialogue change (speaker labels with quoted words), and nothing else.`
      : `Return ONLY the beat lines and nothing else.`)
  );
}

/** ⭐ THE SURGERY, ONE IMPLEMENTATION (ruling C, 2026-08-21): the shallow-remix writer stage — the lab
 *  tests exactly what the executor ships because both call THIS. Model work bounded by mechanical law:
 *  beat 0 restored verbatim (frame-zero is plate law), the parent's rhythm enforced with one corrective
 *  retry then refusal, dangling speaker labels refused. Throws on any refusal — a broken remix never
 *  ships silently. Returns { surgered, retried, beatZeroRestored }. */
export async function performBeatSurgery(parentPrompt, diff) {
  const parent = splitScript(parentPrompt);
  const contract = surgeryContract(parent.beats, diff);
  const dlgOp = diff.dialogue?.op || "keep";
  const p0 = parent.beats.split("\n").find((l) => /^\[0/.test(l.trim()))?.trim();
  let beatZeroRestored = false;
  const attempt = async (extra, temp) => {
    const { text: raw } = await providerText(contract + extra, { maxTokens: 1200, temperature: temp });
    const got = splitScript(String(raw).trim());
    const g0 = got.beats.split("\n").find((l) => /^\[0/.test(l.trim()))?.trim();
    if (p0 && g0 !== p0) beatZeroRestored = true;
    return { beats: restoreBeatZero(parent.beats, got.beats), modelDialogue: got.dialogue };
  };
  let a = await attempt("", 0.3);
  let retried = false;
  if (!sameStamps(parent.beats, a.beats)) {
    retried = true;
    a = await attempt(`\n\n⚠ YOUR PREVIOUS ATTEMPT CHANGED THE STAMPS. Same beats, SAME [Ns] stamps, smallest edit.`, 0.2);
    if (!sameStamps(parent.beats, a.beats)) throw new Error("surgery could not keep the parent's rhythm — refusing to ship a broken remix");
  }
  // ⚠ THE TAIL COMPOSES BY CODE, NEVER BY THE MODEL (lab-measured: handed the whole script, the model
  // reformatted the very tail it was told to keep — `Sound:` split across lines). Kept dialogue is the
  // PARENT'S, character-for-character; a rewrite takes the model's Dialogue section (validated); removal
  // takes none; the Sound line is ALWAYS the parent's — shallow remixes never touch audio (owner's
  // standing sound ruling).
  const compose = (x) => {
    let dialogue = "";
    if (dlgOp === "keep") dialogue = parent.dialogue;
    else if (dlgOp === "rewrite") {
      if (!x.modelDialogue || !/["“”]/.test(x.modelDialogue)) throw new Error("dialogue rewrite returned no quoted words — refusing");
      dialogue = x.modelDialogue;
    }
    return [x.beats, dialogue, parent.sound].filter(Boolean).join("\n\n");
  };
  let surgered = compose(a);
  // A NAME THE REMIXER USED ONLY FOR A MANNER never ships (owner 2026-09-24, "manner only"): one corrective retry, then refusal, like the rhythm
  const _refNames = referenceVoices().flatMap((r) => r.names), _refHits = (t) => referenceNameFindings(t, _refNames, { words: process.env.RAW_USER_PROMPT || "" });
  if (_refNames.length && _refHits(surgered).length) {
    retried = true;
    a = await attempt(`\n\n⚠ YOUR PREVIOUS ATTEMPT WROTE A NAME THE MAKER USED ONLY FOR A MANNER (${_refHits(surgered)[0].figure.split(" is written")[0]}). Same beats, SAME [Ns] stamps; carry the manner in new words of your own and never write the name.`, 0.2);
    if (!sameStamps(parent.beats, a.beats)) throw new Error("surgery could not keep the parent's rhythm — refusing to ship a broken remix");
    surgered = compose(a);
    if (_refHits(surgered).length) throw new Error("surgery kept writing a name the maker used only for a manner — refusing");
  }
  const dangling = danglingSpeakerLabels(surgered);
  if (dangling.length) throw new Error(`surgery produced a speaker label with no words (${dangling[0].figure?.slice(0, 40)}) — refusing`);
  // the completeness + label laws hold in surgery too (owner: the laws persist across the non-IP lane)
  const inc = incompleteBeatLines(surgered);
  if (inc.length) throw new Error(`surgery produced a beat ending mid-sentence ("…${inc[0].slice(-40)}") — refusing`);
  const gen = genericSpeakerLabels(surgered);
  if (gen.length) throw new Error(`surgery produced an anonymous dialogue label (${gen[0].trim().slice(0, 30)}) — refusing`);
  return { surgered, retried, beatZeroRestored };
}

// ── DEEP REFRAME (ruling C, owner 2026-08-21): a world/figure/cut change invalidates the parent's
// plate-grounded script — surgery cannot help, because frame zero must be authored FROM the new plate
// (write-after-plate law). So a deep remix re-runs the pipeline END TO END on a compiled EFFECTIVE
// PROMPT, with what survives pinned MECHANICALLY: a kept world rides WORLD_PIN into _run's reuse seam
// (sourcing skipped, $0); kept figures ride the ref-cache (free on a warm name). The effective prompt is
// also stamped as the child's own user_prompt, so a chain of remixes always compiles from its OWN state —
// never a walk to the root.

/** Pure: what the deep path pins. A kept world pins the parent's order-0 plate; kept figures are named
 *  for the cache. Falsy-safe on a refless state.
 *  ⚠ KEPT BELONGINGS PIN THE OLD FIGURE'S REF (owner 2026-08-21: «keeping plush would mean maintaining
 *  the punch character-ref and referencing the plush from the image») — when the intent EXEMPTS a swept
 *  figure's belonging (the user asked to keep the plush), the mechanism is REF-LEVEL, not prose: the
 *  parent's figure ref — whose pixels carry the belonging — rides into the reframe as a reference, the
 *  beats name the belonging FROM it, and the swap grammar keeps the old figure itself from rendering. */
export function keepPins(state, diff, intentText = "") {
  const refs = Array.isArray(state?.refs) ? state.refs : [];
  const world = diff.world?.op !== "change" ? (refs.find((r) => r.role === "world") || null) : null;
  const lcIntent = String(intentText || "").toLowerCase();
  const belongings = [];
  for (const f of diff.figures || []) {
    if (f.op !== "swap" && f.op !== "remove") continue;
    const fig = (state?.plan?.figures || []).find((x) => String(x?.name || "").toLowerCase() === String(f.target || "").toLowerCase());
    const att = fig?.canon?.attachment;
    if (!att) continue;
    const nouns = String(att).toLowerCase().match(/[a-z]{4,}/g) || [];
    if (!nouns.some((n) => lcIntent.includes(n))) continue;   // nothing kept → the sweep alone governs
    // the figure's OWN PHOTO, found by the characters it shows (recorded with every picture from 2026-09-25; both reviews of the kept-character fix: a portrait
    // is "figure.jpg" with role "ref", so the filename convention never found a portrait's belongings), never a parent's frame (the reviewer's build check: after
    // one small remix a frame was the only named picture, and it was taken for the photo). A picture recorded before names existed is found the old way,
    // one picture at a time, by naming convention (entity_/refs_redacted/ipref_ → role "figure"; a multi-figure parent's carry the slug). While every video
    // on the site predates names, that old way is the one that runs.
    const who = String(f.target || "").toLowerCase().replace(/\s+/g, " ").trim();
    const unnamed = refs.filter((r) => !(Array.isArray(r.names) && r.names.length));
    const slugish = String(f.target).replace(/[^a-z0-9]+/gi, "").slice(0, 14).toLowerCase();
    const ref = refs.find((r) => r.frame !== true && Array.isArray(r.names) && r.names.length === 1 && String(r.names[0]).toLowerCase().replace(/\s+/g, " ").trim() === who)
      || unnamed.find((r) => r.role === "figure" && (unnamed.filter((x) => x.role === "figure").length === 1 || String(r.filename).toLowerCase().includes(slugish))) || null;
    if (ref) belongings.push({ figure: f.target, attachment: String(att), ref, replacement: f.to || null });
  }
  // ⚠ KEPT CUTS PIN THEIR PLATES (owner 2026-08-22): when every later place KEEPS, the parent's cut
  // plates ride CUT_PIN in order — re-buying a plate the parent already owns is «definitely wrong».
  // Any cut CHANGING drops all cut pins (order-matching to the changed set is a finer build; V1 never
  // pins a plate that might belong to a replaced place).
  const cutsAllKeep = (diff.cuts || []).length > 0 && (diff.cuts || []).every((c) => c.op === "keep");
  const cuts = cutsAllKeep ? refs.filter((r) => r.role === "cut") : [];
  // the user's changes to kept figures' looks, by figure (owner 2026-09-21) — the runner hands each to its kept record as look_change
  const looks = Object.fromEntries((diff.figures || []).filter((f) => f.op === "keep" && f.look).map((f) => [f.target, f.look]));
  return { world, figures: (diff.figures || []).filter((f) => f.op === "keep").map((f) => f.target), looks, belongings, cuts };
}

/** The load-bearing noun of a phrase — first-longest word ≥4 letters, for mechanical contains-checks.
 *  ("the nihilist penguin" → "nihilist"; a rephrase that keeps the noun passes, one that drops it fails.) */
export function anchorOf(phrase) {
  const tokens = String(phrase || "").toLowerCase().match(/[a-z][a-z'-]{3,}/g) || [];
  return tokens.reduce((m, t) => (t.length > (m?.length || 0) ? t : m), null);
}

/** Every op in the diff as one typed line — the compiler's CHANGES list. */
export function describeDiff(diff) {
  const lines = [];
  for (const f of diff.figures || []) {
    if (f.op === "swap") lines.push(`FIGURE: ${f.target} is REPLACED by ${f.to}`);
    else if (f.op === "remove") lines.push(`FIGURE: ${f.target} is REMOVED`);
    else if (f.op === "add") lines.push(`FIGURE: ${f.to} is ADDED`);
    else if (f.op === "keep" && f.look) lines.push(`FIGURE: ${f.target} stays the same figure, its look changed: ${f.look}`);
  }
  if (diff.world?.op === "change") lines.push(`OPENING PLACE: becomes ${diff.world.to}`);
  for (const c of diff.cuts || []) {
    if (c.op === "change") lines.push(`LATER PLACE: ${c.target} becomes ${c.to}`);
    else if (c.op === "remove") lines.push(`LATER PLACE: ${c.target} is REMOVED`);
  }
  if (diff.action?.op === "rewrite") lines.push(`ACTION: ${diff.action.instruction}`);
  for (const pr of diff.props || []) lines.push(`PROP: ${pr.op === "add" ? `add ${pr.to}` : pr.op === "remove" ? `remove ${pr.target}` : `${pr.target} becomes ${pr.to}`}`);
  if (diff.dialogue?.op === "rewrite") lines.push(`DIALOGUE: ${diff.dialogue.instruction}`);
  else if (diff.dialogue?.op === "remove") lines.push(`DIALOGUE: removed — nobody speaks`);
  return lines;
}

/** ⚠ A SWAPPED FIGURE'S BELONGINGS LEAVE WITH IT (owner 2026-08-21, on the penguin deep remix: «if it
 *  said to replace punch with the nihilistic penguin, would it keep the plush? it shouldnt, unless
 *  prompted for the plush or a different one»). Measured: default-KEEP treated Punch's plush as scene
 *  material, so the compiled prompt marched the penguin in dragging "his plush toy" — which the gen then
 *  mutated into a penguin plush. The state's own canon says what belongs to whom (canon.attachment), so
 *  the sweep is MECHANICAL: for each swapped/removed figure, its attachment nouns leave the compile —
 *  EXCEPT any noun the intent itself speaks (the user asked for the plush, or a different one). Pure. */
export function sweptBelongings(state, diff, intentText) {
  const lcIntent = String(intentText || "").toLowerCase();
  const out = [];
  for (const f of diff.figures || []) {
    if (f.op !== "swap" && f.op !== "remove") continue;
    const fig = (state?.plan?.figures || []).find((x) => String(x?.name || "").toLowerCase() === String(f.target || "").toLowerCase());
    const att = fig?.canon?.attachment;
    if (!att) continue;
    for (const noun of String(att).toLowerCase().match(/[a-z]{4,}/g) || []) {
      if (!lcIntent.includes(noun)) out.push({ figure: f.target, noun });
    }
  }
  return out;
}

/** ⚠ THE KEEP-LAW, ENFORCED MECHANICALLY (the dont-narrow doctrine mirrored onto the compile): kept
 *  figures keep their nouns, new elements must actually appear, replaced/removed figures must be gone —
 *  along with their swept belongings — and a user prompt is BARE — no stamps, no script sections, one
 *  line. Pure, gate-testable. */
export function reframeViolations(compiled, diff, sweeps = [], base = "") {
  const c = String(compiled || "").trim();
  if (!c) return ["empty prompt"];
  const lc = c.toLowerCase(), v = [];
  // ⭐⭐ A KEPT FIGURE THE ORIGINAL DESCRIBED STAYS DESCRIBED (job 3032613f, 2026-09-20). The diff names figures by the parent's RESOLVED plan
  // names ("Cody Maverick" for "a surfs up character"); demanding that name's noun in the compiled prompt pushed the writer to NAME an owned
  // character the original only described, and the pre-gate refused a name no user wrote. So the noun check reads the ORIGINAL: a figure the
  // original names keeps its noun; a figure the original only described must NOT be named in the compiled prompt (its words carry it).
  const baseLc = String(base || "").toLowerCase();
  if (/\[\d+(?:\.\d+)?s\]/.test(c)) v.push("carries beat stamps — a user prompt is bare");
  if (/(^|\n)\s*(?:Dialogue|Sound)\s*:/i.test(c)) v.push("carries script sections — a user prompt is bare");
  if (/\n/.test(c)) v.push("more than one line");
  if (c.length > 420) v.push("longer than a user prompt has any right to be");
  for (const f of diff.figures || []) {
    const a = anchorOf(f.target), an = anchorOf(f.to);
    if (f.op === "keep" && a) {
      if (baseLc && !baseLc.includes(a)) { if (lc.includes(a)) v.push(`the original described "${f.target}" without naming it — keep the original's words, never introduce the name`); }
      else if (!lc.includes(a)) v.push(`kept figure "${f.target}" lost its noun`);
    }
    if ((f.op === "swap" || f.op === "add") && an && !lc.includes(an)) v.push(`the new figure "${f.to}" is missing`);
    if ((f.op === "swap" || f.op === "remove") && a && lc.includes(a)) v.push(`the ${f.op === "swap" ? "replaced" : "removed"} figure "${f.target}" is still named`);
  }
  if (diff.world?.op === "change") { const a = anchorOf(diff.world.to); if (a && !lc.includes(a)) v.push(`the new opening place "${diff.world.to}" is missing`); }
  for (const cu of diff.cuts || []) if (cu.op === "change") { const a = anchorOf(cu.to); if (a && !lc.includes(a)) v.push(`the new later place "${cu.to}" is missing`); }
  for (const pr of diff.props || []) if ((pr.op === "swap" || pr.op === "add") && pr.to) { const a = anchorOf(pr.to); if (a && !lc.includes(a)) v.push(`the new prop "${pr.to}" is missing`); }
  for (const s of sweeps) if (lc.includes(s.noun)) v.push(`"${s.noun}" belonged to the replaced figure "${s.figure}" and must leave with it`);
  return v;
}

/** The compile ask. Base is the parent's own user prompt when the state carries one (every post-substrate
 *  gen does); a pre-stamp parent falls back to its beat script, declared as such. */
export function reframeContract(base, baseKind, diff, intentText, sweeps = []) {
  const sweepLines = sweeps.length
    ? `\n${[...new Set(sweeps.map((s) => s.figure))].map((f) => `- BELONGINGS: ${f} takes its own things with it (${sweeps.filter((s) => s.figure === f).map((s) => s.noun).join(", ")}) — the replacement arrives with ITS OWN, not the old figure's`).join("\n")}`
    : "";
  return (
    `A video was generated from this ${baseKind === "prompt" ? "prompt" : "beat script"}:\n"""${base}"""\n\n` +
    `A user remixes it. Their words: """${String(intentText || "").slice(0, 500)}"""\n` +
    `The typed changes (LAW: everything not listed KEEPS exactly as it was):\n${describeDiff(diff).map((l) => `- ${l}`).join("\n")}${sweepLines}\n\n` +
    `Write the remixed video's generation prompt: ONE bare line in the same plain register as the original — ` +
    `unchanged elements kept in the original's own nouns, the changes applied, nothing else altered, no new ` +
    `detail invented. An element the original DESCRIBED rather than named stays described in the original's words: never ` +
    `introduce a name the original did not use, whatever the typed changes call it. No timestamps, no Dialogue or Sound ` +
    `sections, no camera or style language. Return ONLY the prompt line.`
  );
}

/** The compiler — one small call, mechanically validated, one corrective retry, then loud refusal.
 *  Returns { effective, retried }. Throws when the keep-law cannot be satisfied. */
export async function compileEffectivePrompt(state, diff, intentText) {
  const base = state?.plan?.user_prompt || null;
  const sweeps = sweptBelongings(state, diff, intentText);
  const contract = reframeContract(base || String(state?.prompt_text || ""), base ? "prompt" : "script", diff, intentText, sweeps);
  const attempt = async (extra, temp) =>
    String((await providerText(contract + extra, { maxTokens: 4000, temperature: temp })).text || "").trim().replace(/^["'“”\s]+|["'“”\s]+$/g, "");
  const baseText = base || String(state?.prompt_text || "");
  let effective = await attempt("", 0.2);
  let v = reframeViolations(effective, diff, sweeps, baseText);
  let retried = false;
  if (v.length) {
    retried = true;
    effective = await attempt(`\n\n⚠ YOUR PREVIOUS ATTEMPT BROKE THE LAW: ${v.join("; ")}. Fix exactly these and return ONLY the prompt line.`, 0.1);
    v = reframeViolations(effective, diff, sweeps, baseText);
    if (v.length) throw new Error(`reframe compile broke the keep-law twice (${v[0]}) — refusing`);
  }
  return { effective, retried };
}

// ── ESCALATION (owner ruling "3", 2026-08-21: «demands have variance and our model needs to satisfy
// this variance» → escalation hybrid): the typed ontology stays the fast path; a demand it cannot type
// (noop/vague/dropped on a non-empty intent) escalates to a REASONING PLANNER that emits a typed
// EXECUTION PLAN — and the mechanical laws become VALIDATORS of the plan instead of the decision.
// The planner may only ask for what the executor can actually do: surgery under the rhythm laws, or a
// reframe from a bare effective prompt with parent refs kept by name. A plan that abandons the parent
// is not a remix (solvable:false). Nothing here is trusted raw: validateRemixPlan is the mechanical
// gate, and clearance probes every new term the plan introduces (union of the planner's own list and a
// mechanically-derived one — the coinage-blindness lesson applied forward).

export async function planRemixEscalation(state, intentText) {
  const p = state?.plan || {};
  const figures = (p.figures || []).map((f) => `${f.name}${f.canon?.attachment ? ` (attachment: ${f.canon.attachment})` : ""}`).join(" · ") || String(p.subject || "the subject");
  const bag = (state?.refs || []).map((r) => `${r.filename} · ${r.role}`).join("\n") || "(none)";
  const ask =
    `A finished video exists. Its state:\n` +
    `USER PROMPT: ${p.user_prompt || "(unknown)"}\n` +
    `FIGURES: ${figures}\nPLACES: ${(p.places || []).join(", ") || "?"}\n` +
    `DURATION ${state?.duration || "?"} · ASPECT ${state?.aspect || "?"}\nREF BAG (each ref's pixels are real material from this video):\n${bag}\n` +
    `SCRIPT:\n${String(state?.prompt_text || "").slice(0, 1500)}\n\n` +
    `A user asks for a remix that the standard dimensions (figure/world/cut/action/prop/dialogue swaps) could ` +
    `not type. Their words: """${String(intentText || "").slice(0, 500)}"""\n\n` +
    `You are the ESCALATION PLANNER. LAW: a remix preserves everything the words do not change — ambiguity ` +
    `resolves to preservation. A plan that abandons the parent is not a remix: answer solvable:false.\n` +
    `The executor can do EXACTLY two things:\n` +
    `· "surgery" — rewrite the beats per your script_instruction, under the parent's rhythm (same [Ns] stamps, ` +
    `same count, beat 0 verbatim) with every ref reused. For changes the existing footage's structure can carry.\n` +
    `· "reframe" — regenerate end-to-end from your effective_prompt (ONE bare line, no timestamps, no Dialogue/` +
    `Sound sections, no camera language), keeping any parent refs you list: keeping the world ref means the SAME ` +
    `opening photograph; keeping a figure ref means its pixels ride as a reference, bound by your note.\n` +
    `Return ONLY JSON {"solvable":bool,"why":"one plain sentence","path":"surgery|reframe",` +
    `"script_instruction":"for surgery, precisely what changes — else null",${DIALOGUE_FIELD},` +
    `"effective_prompt":"for reframe, the new one-line prompt — else null",` +
    `"refs":[{"filename":"<exactly as in the bag>","keep":bool,"note":"how the kept ref binds — null when dropped"}],` +
    `"resource":["<anything new that must be sourced — advisory>"],` +
    `"clearance_delta":["<every NEW proper name or brand introduced — empty when none>"],` +
    `"duration":null|"<Ns> only when the demand needs a different length"}`;
  return await providerJson([textPart(ask)], { temperature: 0.15 });   // ROOM is the helper's, sized for the thinking (2026-09-25, the reviewer's consultation: at 800 an answer cut off was paid again)
}

/** The mechanical gate on the plan — the laws as validators. Pure, gate-testable. Returns violations. */
export function validateRemixPlan(plan, state) {
  const v = [];
  if (!plan || typeof plan !== "object") return ["planner returned nothing"];
  if (plan.solvable !== true) return [];   // an honest refusal validates trivially — the caller exits clean
  if (!["surgery", "reframe"].includes(plan.path)) v.push(`unknown path "${plan.path}" — the executor does surgery or reframe, nothing else`);
  if (plan.path === "surgery" && !String(plan.script_instruction || "").trim()) v.push("surgery with no script_instruction");
  if (plan.path === "reframe") {
    const ep = String(plan.effective_prompt || "").trim();
    if (!ep) v.push("reframe with no effective_prompt");
    if (/\[\d+(?:\.\d+)?s\]/.test(ep)) v.push("effective_prompt carries beat stamps — a user prompt is bare");
    if (/(^|\n)\s*(?:Dialogue|Sound)\s*:/i.test(ep)) v.push("effective_prompt carries script sections");
    if (/\n/.test(ep)) v.push("effective_prompt is more than one line");
    if (ep.length > 420) v.push("effective_prompt longer than a user prompt has any right to be");
  }
  const bagNames = new Set((state?.refs || []).map((r) => r.filename));
  for (const r of Array.isArray(plan.refs) ? plan.refs : []) {
    if (!bagNames.has(r?.filename)) v.push(`plan names a ref the parent does not have ("${r?.filename}")`);
  }
  if (plan.duration != null && !/^\d{1,2}s$/.test(String(plan.duration))) v.push(`illegal duration "${plan.duration}"`);
  return v;
}

/** Every new content word the plan introduces, mechanically — union this with the planner's own delta
 *  before probing (the model's list is advisory, never load-bearing). Bounded, stopword-pruned. */
const _ESC_STOP = new Set(["that", "with", "into", "from", "then", "this", "their", "there", "where", "while", "over", "under", "same", "more", "less", "very", "slow", "fast", "night", "morning", "instead", "still", "just", "only", "them", "they", "when", "what", "make", "makes", "walks", "walk", "goes", "gets", "have", "keeps", "keep"]);
/** THE ORIGINAL'S CAST IS CLEARED (2026-09-24, engine review C1; the owner's plan: "the parent's cast counts as cleared"). The original's figure a
 *  new term names — sameCharacter over its name, its canonical name and the resolver's term, either way round — or null. Every figure in a finished
 *  original's plan passed that run's gates. Matched on the CAST only, never on the original's free words: "a jack russell terrier" must not make
 *  Jack Torrance "not new". Pure. */
/** THE NAME A CHANGE-LIST TERM IS LOOKED UP BY (owner 2026-09-25: plain words are never looked up). `names` is the planner's own name reader's answer over the
 *  original's words and the remix's. A term is a name when a name's words are all in it (a word matches its plural or a longer form: "lil caesars mascot" holds
 *  "Lil Caesar"; the work a name is written with, "Jack (The Shining)", is not its words, so "jack" holds it); the name is returned as the reader wrote it,
 *  the one the term matches exactly first. A name is never found in ONE of its own words: "man" is not "Iron Man", "mascot" is not "lil caesars mascot",
 *  "rock" is not "The Rock". null = plain words. A reader that failed (names.failed) returns the term itself: everything is looked up, as before. Pure. */
const _DELTA_STOP = new Set(["in", "on", "at", "of", "to", "by", "an", "as", "is", "it", "or", "and", "with", "for", "from", "into", "onto", "that", "this", "his", "her", "its", "their"]);
const _deltaToks = (x) => String(x || "").toLowerCase().replace(/\([^)]*\)/g, " ").split(/[^a-z0-9']+/).filter((w) => w.length >= 2 && !_DELTA_STOP.has(w));
const _covers = (a, b) => a.length > 0 && a.every((x) => b.some((y) => y === x || (x.length >= 4 && y.length >= 4 && (y.startsWith(x) || x.startsWith(y)))));
export function nameForDelta(term, names = []) {
  if (names?.failed) return term;
  const tt = _deltaToks(term);
  const fits = (Array.isArray(names) ? names : []).map((n) => ({ n, nt: _deltaToks(n) })).filter(({ nt }) => _covers(nt, tt));
  fits.sort((a, b) => Number(_covers(tt, b.nt)) - Number(_covers(tt, a.nt)) || b.nt.length - a.nt.length);
  return fits[0]?.n || null;
}
export function originalFigureFor(term, state) {
  const figs = Array.isArray(state?.plan?.figures) ? state.plan.figures : [];
  return figs.find((f) => { const names = [f?.name, f?.canonical_name, f?.term].filter(Boolean); return sameCharacter(term, names) || names.some((n) => sameCharacter(n, [term])); }) || null;
}
export function escalationTerms(plan, state, intentText) {
  const known = ` ${String(state?.prompt_text || "").toLowerCase()} ${String(state?.plan?.user_prompt || "").toLowerCase()} ${(state?.plan?.figures || []).map((f) => String(f?.name || "").toLowerCase()).join(" ")} `;
  // …and the speakers its dialogue change adds (the reviewer's third build check: an escalated surgery can now add a line, and nothing after it checks names);
  // the quoted words are speech, never a speaker, so they are not looked up
  const said = String(plan?.dialogue?.instruction || "").replace(/["\u201c][^"\u201c\u201d]*["\u201d]/g, " ");
  const text = `${plan?.effective_prompt || ""} ${plan?.script_instruction || ""} ${said}`.toLowerCase();
  const fresh = [...new Set((text.match(/[a-z][a-z'-]{3,}/g) || []).filter((w) => !_ESC_STOP.has(w) && !known.includes(w)))].slice(0, 8);
  return [...new Set([...(Array.isArray(plan?.clearance_delta) ? plan.clearance_delta : []).map((x) => String(x).trim()).filter(Boolean), ...fresh])];
}

/** Pure: an escalation plan's kept refs → the deep path's pin shape (world pin + reference-riding refs
 *  with the plan's own binding notes). The same executor machinery serves both origins. */
export function pinsFromPlan(plan, state) {
  const refs = Array.isArray(state?.refs) ? state.refs : [];
  const kept = new Map((Array.isArray(plan?.refs) ? plan.refs : []).filter((r) => r?.keep === true).map((r) => [r.filename, r]));
  const world = refs.find((r) => r.role === "world" && kept.has(r.filename)) || null;
  const cuts = refs.filter((r) => r.role === "cut" && kept.has(r.filename));
  const belongings = refs.filter((r) => r.role !== "world" && r.role !== "cut" && kept.has(r.filename))
    .map((r) => ({ figure: null, attachment: null, ref: r, note: kept.get(r.filename)?.note || null, replacement: null }));
  return { world, figures: [], belongings, cuts };
}


/** The router's pure brain: which stages re-run, which artifacts are reused. The executor spends this. */
export function routeStages(diff) {
  const figureChange = (diff.figures || []).some((f) => f.op !== "keep" || !!f.look);   // a kept figure whose look the user changed is a figure change (owner 2026-09-21)
  const worldChange = diff.world?.op === "change";
  // A REMIX RE-SOURCES ITS ENVIRONMENT UNLESS THE WORDS KEEP IT (owner 2026-09-09: "reusing environments, which we can do if prompted (else not),
  // produces something repetitive"). A kept-by-silence world is hunted afresh (deep path; the parent's plate excluded from the pool and held as the
  // free fallback); REMIX_REUSE_WORLD=1 restores the old reuse for a test.
  const worldResource = diff.world?.op === "keep" && diff.world?.keepExplicit !== true && process.env.REMIX_REUSE_WORLD !== "1";
  const cutChange = (diff.cuts || []).some((c) => c.op !== "keep");
  const textChange = diff.action?.op === "rewrite" || diff.dialogue?.op !== "keep" || (diff.props || []).length > 0;
  const rerun = [];
  if (figureChange) rerun.push("entity");
  if (worldChange || worldResource) rerun.push("world");
  if (cutChange) rerun.push("cuts");
  // beats rewrite whenever ANYTHING changes — the prompt must speak the new truth — and gen always re-runs
  if (figureChange || worldChange || worldResource || cutChange || textChange) rerun.push("writer");
  rerun.push("gen");
  return {
    rerun,
    reuse: {
      world: !worldChange,
      cuts: (diff.cuts || []).filter((c) => c.op === "keep").map((c) => c.target),
      figures: (diff.figures || []).filter((f) => f.op === "keep").map((f) => f.target),
    },
    noop: rerun.length === 1,   // only "gen" would re-run = nothing changed — the executor refuses to bill a copy
  };
}
