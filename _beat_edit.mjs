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
import { normalizeDraftLayout, scriptParts, isSpokenLine, isBeatLine, TAIL_HEAD } from "./_gate_rules.mjs";   // the one reader of a script's parts (2026-09-25)

/** The findings that are wrong WORDS on the page — the staging is sound. A name the maker used only for a manner is one (owner 2026-09-24, R6). */
export const EDIT_RULES = new Set(["ip-name", "source-citation", "world-room", "plate-thing", "meta", "reference-name"]);
/** THE TAKE ITSELF (owner 2026-09-22: "a rewrite should only be done … for what is required, such as timestamps needing alterations and hence actions
 *  accordingly"). A fault of the staging or the timing is the writer's to think again; every other finding is a few words, edited in place. */
export const STORY_RULES = new Set(["apparatus", "frame-zero", "unphotographed-cut", "early", "world-leak", "cut-resume", "prop-from-nowhere", "subject-missing-in-cut", "unparseable"]);
const TIMING_FLAW = /the climax opens at|the beats sit on a grid|a line begins in the take's last second|a line outruns its beat|a riding photograph is never arrived at/;
export const needsRewrite = (x) => STORY_RULES.has(x?.rule) || (x?.rule === "ride" && TIMING_FLAW.test(String(x?.figure || "")));

/** True when EVERY finding in hand can be edited (a list with a staging or timing fault is the writer's: the take has to change anyway). */
export const editable = (list) => Array.isArray(list) && list.length > 0 && list.every((x) => x && x.rule && !needsRewrite(x));

const _esc = (x) => String(x).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const _stamps = (t) => scriptParts(t).beats.map((l) => (l.match(/^\[\d+(?:\.\d+)?s\]/) || [""])[0]);   // the BEATS' stamps, read by the one reader: a spoken line is never a beat (2026-09-25)
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
// ⭐⭐ NO RAW REQUEST RIDES AN EDIT (owner 2026-09-23): an edit that exists to take a name out was handed the maker's words with the name in them
// ("lil caesars mascot …"). Every action already stays in its beat by the rules above; the request adds nothing but the names.
export function editInstruction(violations = [], modes = []) {
  const list = Array.isArray(violations) ? violations : [];
  const line = (v) => `- ${String(v?.figure || "").replace(/\s+/g, " ").trim()}${Number.isFinite(Number(v?.at)) ? ` [${Number(v.at)}s]` : ""}`;
  const faults = list.filter((v) => EDIT_RULES.has(v?.rule)).map(line), soft = list.filter((v) => !EDIT_RULES.has(v?.rule) && v?.rule !== "provider").map(line);
  const provider = list.filter((v) => v?.rule === "provider").map((v) => `- ${String(v?.figure || "").replace(/\s+/g, " ").trim()}`);
  const manner = list.some((v) => v?.rule === "reference-name");
  const dn = denameMap(modes);
  const swaps = dn.filter((d) => d.mode === "dename" && d.phrase).map((d) => `- ${d.names.map((n) => `"${n}"`).join(" / ")} → write the figure as: ${d.phrase}`);
  const gone = dn.filter((d) => d.mode === "omit").map((d) => `- ${d.names.map((n) => `"${n}"`).join(" / ")} → this figure does not appear: take it out of the line it is in and leave the rest of that line standing`);
  return [
    `EDIT these beats. This is an EDIT, not a rewrite: the story, the staging and the timing are RIGHT and stay exactly as they are.`,
    `Change ONLY ${soft.length || provider.length ? "what is" : "the words"} listed below. Keep every beat, keep every [Ns] stamp exactly as written, keep the same number of beats in the same order,`,
    `keep every action, every placement and every figure doing what it does, and keep the Dialogue, Sound, Set and Telling lines as they are except where ${soft.length || provider.length ? "the list below reaches" : "a word below sits in"} one.`,
    `Do NOT add or remove a beat. Do NOT change a stamp. Do NOT re-stage, re-order, re-time or improve anything. Do NOT rewrite a sentence ${soft.length || provider.length ? "the list below does not reach" : "that has no listed word in it"} — copy it through unchanged.`,
    ``,
    ...(faults.length ? [`THE WORDS THAT MUST GO:`, ...faults] : []),
    ...(swaps.length ? [``, `WRITE THESE INSTEAD (the figure stays in the frame doing exactly what it does — only its name goes, replaced by how it looks):`, ...swaps] : []),
    ...(gone.length ? [``, ...gone] : []),
    // A SOFT FINDING IS EDITED, NEVER REWRITTEN (owner 2026-09-22; engine review 2026-09-24, D2): the fix is the fewest words in the beat the finding names
    ...(soft.length ? [...(faults.length ? [``] : []), `FIX THESE, each with the fewest words that fix it, in the beat it names — a clause taken out, a word changed, a few words or one Dialogue line added — never by adding, moving or re-timing a beat:`, ...soft] : []),
    // THE PROVIDER'S REFUSAL IS EDITED (owner 2026-09-24, R10): its note reaches every line, and only the words that break it change
    ...(provider.length ? [...(faults.length || soft.length ? [``] : []), `THE VIDEO PROVIDER REFUSED THESE BEATS. Change only the words that break this note, wherever they stand — in a beat, a speaker label, a spoken line or the Sound line — and copy every other word through:`, ...provider] : []),
    ``,
    ...(manner ? [`A name the maker used only for a manner is never written, not even inside a spoken line: write that manner in plain words of your own where the name stood.`] : []),
    ...(provider.length ? [] : [`${manner ? "Any other name" : "A name"} is free INSIDE a spoken line in the Dialogue block — a speaker may say it; a beat and a speaker label may not.`]),   // the provider's note overrides the name licence
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
  // ⭐ NO SPOKEN LINE IS LOST (2026-09-25, the reviewer's review of job 7c2de649): "block kept" meant "header kept", so an answer that kept "Dialogue:" and emptied
  // it passed. An edit may add a line (a finding can ask for one); it never takes one away.
  const sp0 = scriptParts(before).dialogue.length, sp1 = scriptParts(a).dialogue.length;
  if (sp1 < sp0) return { ok: false, why: `the edit dropped ${sp0 - sp1} spoken line${sp0 - sp1 === 1 ? "" : "s"} of ${sp0}` };
  const w0 = _content(before), w1 = _content(a);
  const kept = w0.size ? [...w0].filter((w) => w1.has(w)).length / w0.size : 1;
  if (kept < keep) return { ok: false, why: `the edit kept only ${Math.round(kept * 100)}% of the draft's words — a rewrite, not an edit` };
  return { ok: true, why: "" };
}

/**
 * ⭐⭐ A REPAIR'S ANSWER IS TAKEN WHOLE OR NOT AT ALL (owner 2026-09-25: "im afraid of glues and mechanical solutions"; the two reviews of job 7c2de649).
 * The fine-detail, anchor and payoff re-asks each had their answer cut apart by code and joined to pieces of the old draft, and job 7c2de649's model
 * returned a whole, correct script whose Dialogue block the join threw away. The answer is laid out the way the first draft was (beats, the Dialogue
 * block, the Sound line) and taken as it came when it is an edit of the script in hand: the same beats at the same stamps, every block, every spoken
 * line, most of the words. Otherwise the caller ships the script it already has. Pure.
 */
export function acceptWhole(before, answer, opts) {
  // What the model wrapped AROUND the script is not the script (the stamped-line filter this replaces threw it away by construction): a code fence, a
  // preface above the beats where the draft's beats are stamped, a remark in the block that is no spoken line (it carries no colon). The script's own
  // lines are never touched.
  // ⭐ THE BEATS ARE THE ONE READER'S (2026-09-25, the reviewer's review of the kept-character fix: a cut script counted as stamped, this kept only stamped lines,
  // and every edit of a multi-cut script was refused as a re-timing); and a line the draft already had is script, never judged here, wherever it stands
  // (both plan checks; the reviewer's build check: a small remix's binding line stands unstamped before the block, and an edit that dropped it was refused).
  const lines = normalizeDraftLayout(String(answer || "").replace(/^\s*```[a-z]*\s*$/gim, "")).split("\n");
  const was = scriptParts(before), flat = (l) => String(l).replace(/\s+/g, " ").trim();
  const hi = lines.findIndex((l) => /^\s*\**\s*Dialogue\s*\**\s*[:\u2014\u2013-]/i.test(l)), stamped = was.beats.length > 0;
  const had = new Set(normalizeDraftLayout(String(before || "")).split("\n").map(flat).filter(Boolean));
  const dropped = [];
  const text = lines.filter((l, i) => {
    if (!l.trim() || /^\s*\**\s*Dialogue\s*\**\s*[:\u2014\u2013-]/i.test(l) || TAIL_HEAD.test(l)) return true;
    const keep = had.has(flat(l)) || (hi >= 0 && i > hi ? isSpokenLine(l) : !stamped || isBeatLine(l));   // a remark ("Note: …") is no spoken line
    if (!keep) dropped.push(l.trim());
    return keep;
  }).join("\n").trim();
  const v = editAccepted(before, text, opts);
  return v.ok ? { ok: true, text, why: "", dropped } : { ok: false, text: null, why: v.why, dropped };
}

/**
 * One cheap corrective EDIT of the beats in hand. Returns the edited text, or null when there is nothing safe to take
 * (an outage and the ledger cap still throw — an edit never swallows either).
 */
/** ⭐ A REPAIR IS JUDGED BY WHAT ITS FAULT CALLS FOR (the edit-not-rewrite law; 2026-09-25, both reviews of the kept-character fix: an unphotographed cut
 *  repaired by merging two cuts into one carry was refused as "re-timed", and the take exited 3). A fault of the story's shape (needsRewrite, and no-cuts,
 *  too-long) earns a restage: accepted by the writer's own cut count, with every spoken line and the Sound line kept. A word fault is an EDIT and passes the
 *  one guard. `next`/`now`: the scripts as lines; `faults`: the findings the repair was asked to fix; `cutsOk(lines)`: the writer's cut test. Pure. */
export function repairAccepted(next, now, faults = [], { cutsOk = () => true } = {}) {
  if (!Array.isArray(next) || !next.length) return false;
  const restage = (Array.isArray(faults) ? faults : []).some((s) => { const rule = String(s).split(/[\s([]/)[0]; return needsRewrite({ rule }) || rule === "no-cuts" || rule === "too-long"; });
  if (!restage) return editAccepted(now.join("\n"), next.join("\n")).ok;
  const a = scriptParts(next.join("\n")), b = scriptParts(now.join("\n"));
  return !!cutsOk(next) && a.dialogue.length >= b.dialogue.length && (!b.sound || !!a.sound);
}
export async function editBeats(text, { violations = [], modes = [], model = null, log = console.log, call = null } = {}) {
  const before = String(text || "");
  if (!before.trim() || !editable(violations)) return null;
  const instruction = editInstruction(violations, modes);
  // ⭐⭐ THE EDIT THINKS LOW (owner 2026-09-25, "go for low", after the fixed-input test: 8 real drafts, the same findings and instruction at each level).
  // Default and low alike: 7 of 8 edits accepted, 20 of 23 findings fixed, 97% of the draft's words kept. Default: $… and 103 s an edit, and half the
  // edits ran out of room and were paid 2 to 5 times; low: $… and 17 s, one call each. Read side by side, the fixes were the same.
  const ask = call || ((prompt) => providerText(prompt, { maxTokens: 12000, temperature: 0.1, model: model || undefined, reasoning: "low", tag: "writer-retry" }));
  const out = await ask(`${instruction}\n\n${before}`);
  const after = String(out?.text || "").trim();
  // ⭐ ONE ACCEPTANCE FOR EVERY EDIT (2026-09-25, the reviewer's review of the follow-up): this checked the raw answer, so a preface and a code fence around it
  // were accepted and shipped as the script. acceptWhole lays the answer out and drops what was wrapped around it, then applies the same guard.
  const verdict = acceptWhole(before, after);
  if (verdict.dropped?.length) log(`  \u2298 the edit's answer carried ${verdict.dropped.length} line(s) that are not script, left out: ${verdict.dropped.map((x) => `"${x.slice(0, 70)}"`).join(" · ")}`);
  if (!verdict.ok) { log(`  ⊘ the edit was refused: ${verdict.why} — the writer is re-asked instead`); return null; }
  return `${verdict.text}\n`;
}
