// ⭐⭐ A WORDS FAULT IS EDITED, A STORY FAULT IS REWRITTEN (owner 2026-09-22, on the three drafts of job a4d543aa: "why is it doing full
// rewrites, thats wrong. a rewrite should only be done, in the sense of a full rearrangement or edit, for what is required, such as
// timestamps needing alterations and hence actions accordingly. else it should know how to simply edit, and in that instance rid of the
// word mascot and if needed to engage the denaming if its not engaged.")
//
// WHAT THIS IS FOR. The validator's findings are of two kinds. A STORY fault — the ride is dismounted, a cut has no photograph, beat zero
// dropped the ground the stage composed — is a fault of the staging: the take has to be thought again, and the writer is re-asked. A WORDS
// fault — a name written where the law forbids the name, a place of the world named, a plate's own set piece named, a sentence about the
// video — is a fault of the WORDS ON THE PAGE. Nothing about the staging is wrong. Re-asking the writer for it throws away a draft that was
// right and buys a fresh one from the prose model at $…–$… a pass, and the fresh draft is a different take: job a4d543aa's first draft opened
// on the figure in the window, its third (bought over the maker's own word "mascot") had lost the window entirely, and job ee5535ea bought
// three drafts over one name and refused at $…. THE SAME COMPLAINT, EDITED: the draft in hand goes back with the offending words named,
// every stamp and every placement held, and the fast model changes those words and nothing else — one cheap call, the take intact.
//
// The deterministic redaction in _run still runs FIRST and reaches every name it can (a name → its de-named guise, in place, free). This is
// for what the regex cannot reach: the name in a shape the substitution misses, a place named in the writer's own words, a sentence about
// the video. The guard below is what makes it an EDIT and not a rewrite in disguise — an answer that re-times, re-counts or re-stages the
// take is REFUSED here and the run falls back to the re-ask it would have made anyway.
import { providerText } from "./provider-llm.mjs";

/** The findings an edit can fix: the wrong WORDS are on the page, the staging is sound. Everything else is the writer's to think again. */
export const EDIT_RULES = new Set(["ip-name", "source-citation", "world-room", "plate-thing", "meta"]);

/** True when EVERY finding in hand is a words fault (a mixed list is the writer's: the staging has to change anyway). */
export const editable = (list) => Array.isArray(list) && list.length > 0 && list.every((x) => EDIT_RULES.has(x?.rule));

const _esc = (x) => String(x).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const _stamps = (t) => (String(t || "").match(/^[ \t>*]*\[\d+(?:\.\d+)?s\]/gm) || []).map((s) => s.trim());
const _blocks = (t) => ["Dialogue", "Sound", "Set", "Telling", "Music"].filter((h) => new RegExp(String.raw`^\s*\**\s*${h}\s*\**\s*[:—–-]`, "im").test(String(t || "")));
const _content = (t) => new Set(String(t || "").toLowerCase().match(/[a-z][a-z'-]{3,}/g) || []);

/** The words the edit must write instead of a name: "Little Caesars" → "the toga-wearing Roman man …". Pure. */
export function denameMap(modes = [], phraseOf = (m) => m?.guise || m?.prose || "") {
  const out = [];
  for (const m of Array.isArray(modes) ? modes : []) {
    if (!m || (m.mode !== "dename" && m.mode !== "omit")) continue;
    const names = [...new Set((m.names || [m.name]).filter(Boolean).map((n) => String(n).replace(/\s+/g, " ").trim()))].filter((n) => n.length >= 3);
    if (!names.length) continue;
    out.push({ mode: m.mode, names, phrase: String(phraseOf(m) || "").replace(/\s+/g, " ").trim() });
  }
  return out;
}

/** The edit instruction — pure, so the vacuum can read it. The findings' own words ride it, the way the writer's feedback does. */
export function editInstruction(violations = [], modes = [], { userPrompt = "" } = {}) {
  const faults = (Array.isArray(violations) ? violations : []).map((v) => `- ${String(v?.figure || "").replace(/\s+/g, " ").trim()}${Number.isFinite(Number(v?.at)) ? ` [${Number(v.at)}s]` : ""}`);
  const dn = denameMap(modes);
  const swaps = dn.filter((d) => d.mode === "dename" && d.phrase).map((d) => `- ${d.names.map((n) => `"${n}"`).join(" / ")} → write the figure as: ${d.phrase}`);
  const gone = dn.filter((d) => d.mode === "omit").map((d) => `- ${d.names.map((n) => `"${n}"`).join(" / ")} → this figure does not appear: take it out of the line it is in and leave the rest of that line standing`);
  return [
    `EDIT these beats. This is an EDIT, not a rewrite: the story, the staging and the timing are RIGHT and stay exactly as they are.`,
    `Change ONLY the words listed below. Keep every beat, keep every [Ns] stamp exactly as written, keep the same number of beats in the same order,`,
    `keep every action, every placement and every figure doing what it does, and keep the Dialogue, Sound, Set and Telling lines as they are except where a word below sits in one.`,
    `Do NOT add or remove a beat. Do NOT change a stamp. Do NOT re-stage, re-order, re-time or improve anything. Do NOT rewrite a sentence that has no listed word in it — copy it through unchanged.`,
    ``,
    `THE WORDS THAT MUST GO:`,
    ...faults,
    ...(swaps.length ? [``, `WRITE THESE INSTEAD (the figure stays in the frame doing exactly what it does — only its name goes, replaced by how it looks):`, ...swaps] : []),
    ...(gone.length ? [``, ...gone] : []),
    ``,
    `A name is free INSIDE a spoken line in the Dialogue block — a speaker may say it; a beat and a speaker label may not.`,
    userPrompt ? `The request was "${String(userPrompt).replace(/\s+/g, " ").trim()}" — what it asks for must still happen, in the same beat it happens in now.` : ``,
    `Return ONLY the edited lines — the whole list, every beat and every block, nothing else, no commentary.`,
  ].filter((x) => x !== undefined).join("\n");
}

/**
 * The guard that keeps an edit an edit: same stamps, same blocks, the same words but for the fix.
 * Returns { ok, why } — why is the reason to refuse, said out loud by the caller.
 */
export function editAccepted(before, after, { keep = 0.6 } = {}) {
  const a = String(after || "").trim();
  if (!a) return { ok: false, why: "the edit came back empty" };
  if (a === String(before || "").trim()) return { ok: false, why: "the edit changed nothing" };
  const s0 = _stamps(before), s1 = _stamps(a);
  if (s0.length && s1.join("|") !== s0.join("|")) return { ok: false, why: `the edit re-timed the take (${s0.join(",") || "—"} → ${s1.join(",") || "—"}) — a rewrite, not an edit` };
  const b0 = _blocks(before), b1 = _blocks(a);
  const lost = b0.filter((h) => !b1.includes(h));
  if (lost.length) return { ok: false, why: `the edit dropped the ${lost.join(" and ")} block` };
  const w0 = _content(before), w1 = _content(a);
  const kept = w0.size ? [...w0].filter((w) => w1.has(w)).length / w0.size : 1;
  if (kept < keep) return { ok: false, why: `the edit kept only ${Math.round(kept * 100)}% of the draft's words — a rewrite, not an edit` };
  return { ok: true, why: "" };
}

/**
 * One cheap corrective EDIT of the beats in hand. Returns the edited text, or null when there is nothing safe to take
 * (an outage and the ledger cap still throw — an edit never swallows either).
 */
export async function editBeats(text, { violations = [], modes = [], userPrompt = "", model = null, log = console.log, call = null } = {}) {
  const before = String(text || "");
  if (!before.trim() || !editable(violations)) return null;
  const instruction = editInstruction(violations, modes, { userPrompt });
  const ask = call || ((prompt) => providerText(prompt, { maxTokens: 12000, temperature: 0.1, model: model || undefined, tag: "writer-retry" }));
  const out = await ask(`${instruction}\n\n${before}`);
  const after = String(out?.text || "").trim();
  const verdict = editAccepted(before, after);
  if (!verdict.ok) { log(`  ⊘ the edit was refused: ${verdict.why} — the writer is re-asked instead`); return null; }
  return after.endsWith("\n") ? after : `${after}\n`;
}
