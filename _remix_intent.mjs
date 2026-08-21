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
import { danglingSpeakerLabels } from "./_gate_rules.mjs";

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
    ` "figures":[{"target":"<existing figure name>","op":"keep|swap|remove","to":"<replacement as the user named it, or null>"}] (one entry per EXISTING figure; append {"target":null,"op":"add","to":"..."} only for a genuinely new figure),\n` +
    ` "world":{"op":"keep|change","to":"<new opening place or null>"},\n` +
    ` "cuts":[{"target":"<later place>","op":"keep|change|remove","to":null|"..."}] (one per later place),\n` +
    ` "action":{"op":"keep|rewrite","instruction":"<precisely what now happens, in the user's own words completed minimally — null when keep>"},\n` +
    ` "dialogue":{"op":"keep|rewrite|remove","instruction":null|"..."},\n` +
    ` "props":[{"target":"<existing prop>","op":"swap|remove","to":null|"..."} or {"target":null,"op":"add","to":"..."}],\n` +
    ` "clearance_delta":["<every NEW proper name, character, or brand the intent introduces — empty when none>"],\n` +
    ` "vague": true|false (true when the words name NOTHING concrete to change)\n}`;
  const j = await providerJson([textPart(ask)], { maxTokens: 700, temperature: 0.1 });
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
    figures: [], world: { op: "keep", to: null }, cuts: [], action: { op: "keep", instruction: null },
    dialogue: { op: "keep", instruction: null }, props: [], clearance_delta: [], vague: raw.vague === true, dropped: [],
  };
  for (const f of Array.isArray(raw.figures) ? raw.figures : []) {
    const op = ["keep", "swap", "remove", "add"].includes(f?.op) ? f.op : "keep";
    if (op === "add") { if (f?.to) d.figures.push({ target: null, op, to: String(f.to) }); continue; }
    if (!knownFigures.has(String(f?.target || "").toLowerCase())) { if (op !== "keep") d.dropped.push(`figure "${f?.target}" not in the parent`); continue; }
    d.figures.push({ target: String(f.target), op, to: f?.to ? String(f.to) : null });
  }
  for (const name of knownFigures) if (!d.figures.some((f) => String(f.target || "").toLowerCase() === name)) d.figures.push({ target: name, op: "keep", to: null });
  if (raw.world?.op === "change" && raw.world?.to) d.world = { op: "change", to: String(raw.world.to) };
  for (const c of Array.isArray(raw.cuts) ? raw.cuts : []) {
    const op = ["keep", "change", "remove"].includes(c?.op) ? c.op : "keep";
    if (!laterPlaces.has(String(c?.target || "").toLowerCase())) { if (op !== "keep") d.dropped.push(`cut place "${c?.target}" not in the parent`); continue; }
    d.cuts.push({ target: String(c.target), op, to: c?.to ? String(c.to) : null });
  }
  for (const pl of laterPlaces) if (!d.cuts.some((c) => String(c.target).toLowerCase() === pl)) d.cuts.push({ target: pl, op: "keep", to: null });
  if (raw.action?.op === "rewrite" && raw.action?.instruction) d.action = { op: "rewrite", instruction: String(raw.action.instruction) };
  if (["rewrite", "remove"].includes(raw.dialogue?.op)) d.dialogue = { op: raw.dialogue.op, instruction: raw.dialogue?.instruction ? String(raw.dialogue.instruction) : null };
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
  let dialogue = "";
  if (dlgOp === "keep") dialogue = parent.dialogue;
  else if (dlgOp === "rewrite") {
    if (!a.modelDialogue || !/["“”]/.test(a.modelDialogue)) throw new Error("dialogue rewrite returned no quoted words — refusing");
    dialogue = a.modelDialogue;
  }
  const surgered = [a.beats, dialogue, parent.sound].filter(Boolean).join("\n\n");
  const dangling = danglingSpeakerLabels(surgered);
  if (dangling.length) throw new Error(`surgery produced a speaker label with no words (${dangling[0].figure?.slice(0, 40)}) — refusing`);
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
 *  for the cache. Falsy-safe on a refless state. */
export function keepPins(state, diff) {
  const refs = Array.isArray(state?.refs) ? state.refs : [];
  const world = diff.world?.op !== "change" ? (refs.find((r) => r.role === "world") || null) : null;
  return { world, figures: (diff.figures || []).filter((f) => f.op === "keep").map((f) => f.target) };
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
export function reframeViolations(compiled, diff, sweeps = []) {
  const c = String(compiled || "").trim();
  if (!c) return ["empty prompt"];
  const lc = c.toLowerCase(), v = [];
  if (/\[\d+(?:\.\d+)?s\]/.test(c)) v.push("carries beat stamps — a user prompt is bare");
  if (/(^|\n)\s*(?:Dialogue|Sound)\s*:/i.test(c)) v.push("carries script sections — a user prompt is bare");
  if (/\n/.test(c)) v.push("more than one line");
  if (c.length > 420) v.push("longer than a user prompt has any right to be");
  for (const f of diff.figures || []) {
    const a = anchorOf(f.target), an = anchorOf(f.to);
    if (f.op === "keep" && a && !lc.includes(a)) v.push(`kept figure "${f.target}" lost its noun`);
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
    `detail invented. No timestamps, no Dialogue or Sound sections, no camera or style language. Return ONLY the prompt line.`
  );
}

/** The compiler — one small call, mechanically validated, one corrective retry, then loud refusal.
 *  Returns { effective, retried }. Throws when the keep-law cannot be satisfied. */
export async function compileEffectivePrompt(state, diff, intentText) {
  const base = state?.plan?.user_prompt || null;
  const sweeps = sweptBelongings(state, diff, intentText);
  const contract = reframeContract(base || String(state?.prompt_text || ""), base ? "prompt" : "script", diff, intentText, sweeps);
  const attempt = async (extra, temp) =>
    String((await providerText(contract + extra, { maxTokens: 300, temperature: temp })).text || "").trim().replace(/^["'“”\s]+|["'“”\s]+$/g, "");
  let effective = await attempt("", 0.2);
  let v = reframeViolations(effective, diff, sweeps);
  let retried = false;
  if (v.length) {
    retried = true;
    effective = await attempt(`\n\n⚠ YOUR PREVIOUS ATTEMPT BROKE THE LAW: ${v.join("; ")}. Fix exactly these and return ONLY the prompt line.`, 0.1);
    v = reframeViolations(effective, diff, sweeps);
    if (v.length) throw new Error(`reframe compile broke the keep-law twice (${v[0]}) — refusing`);
  }
  return { effective, retried };
}

/** The router's pure brain: which stages re-run, which artifacts are reused. The executor spends this. */
export function routeStages(diff) {
  const figureChange = (diff.figures || []).some((f) => f.op !== "keep");
  const worldChange = diff.world?.op === "change";
  const cutChange = (diff.cuts || []).some((c) => c.op !== "keep");
  const textChange = diff.action?.op === "rewrite" || diff.dialogue?.op !== "keep" || (diff.props || []).length > 0;
  const rerun = [];
  if (figureChange) rerun.push("entity");
  if (worldChange) rerun.push("world");
  if (cutChange) rerun.push("cuts");
  // beats rewrite whenever ANYTHING changes — the prompt must speak the new truth — and gen always re-runs
  if (figureChange || worldChange || cutChange || textChange) rerun.push("writer");
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
