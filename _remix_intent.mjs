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
import { providerJson, textPart } from "./provider-llm.mjs";

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
/** The surgical contract text — the parent's beats plus ONLY the listed changes, everything else verbatim. */
export function surgeryContract(parentPrompt, diff) {
  const changes = [];
  if (diff.action?.op === "rewrite") changes.push(`ACTION: ${diff.action.instruction}`);
  for (const pr of diff.props || []) changes.push(`PROP: ${pr.op === "add" ? `add ${pr.to}` : pr.op === "remove" ? `remove ${pr.target}` : `${pr.target} becomes ${pr.to}`}`);
  if (diff.dialogue?.op === "rewrite") changes.push(`DIALOGUE: ${diff.dialogue.instruction}`);
  if (diff.dialogue?.op === "remove") changes.push(`DIALOGUE: remove it`);
  return (
    `A finished video's beat script follows. A REMIX changes ONLY what is listed under CHANGES — every ` +
    `unchanged beat must survive WORD-FOR-WORD, at the SAME [Ns] stamps, the same count. Beat [0s] is ` +
    `grounded on a photograph that is being KEPT: never alter it. The Dialogue and Sound sections survive ` +
    `unchanged unless a change names them.\n\nSCRIPT:\n${parentPrompt}\n\nCHANGES:\n${changes.map((c) => `- ${c}`).join("\n")}\n\n` +
    `Apply the changes with the smallest possible edit. The final beat still lands the story. ` +
    `Return the full script — beats, then Dialogue (if any), then the Sound line — and nothing else.`
  );
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
