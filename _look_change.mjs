// A REMIX CHANGED A KEPT FIGURE'S LOOK, AND THE PLANNER DID NOT WRITE IT (owner 2026-10-02: "how does this adapt with remixes that change the figures,
// like lineages that evolve?" · "yes look into that"; the standing ruling, 2026-09-21: THE REMIXER'S WORDS OUTRANK THE KEPT LOOK, "a user should be free
// to instruct against their omission").
// A look change reaches the plan on the kept record (look_change), and the planner is told to write the parent's description "with exactly that change
// applied and nothing else altered". Three ways it did not, each reproduced with no network: the planner left the figure out (the change was dropped with
// the record), it cast the figure with no description, or it copied the parent's description back unchanged. The carry reader never lets the parent's frame
// ride for a changed character (it would pin the look being changed), so the description is the only carrier: the remix drew the old look, and the record
// it saved handed the old look to the next remix.
// One small call does what the planner was asked to do, for the one figure it missed. It is an EDIT, guarded as an edit: this look is never edited again in
// the run (a kept look is settled, 2026-09-21), so the guard here is the only check it gets. When the call fails or the guard refuses, the change is still
// never dropped: it rides behind the parent's look in look-shaped words. Pure but for the edit, which is injectable.
import { textPart, providerJson } from "./provider-llm.mjs";
import { asNounPhrase } from "./_gate_rules.mjs";
import { sameWord } from "./_sourceability.mjs";

export const LOOK_CHANGE_LAW =
  `You edit ONE description of a figure in a video. The maker changed how this figure looks. Rewrite the description with EXACTLY that change applied and ` +
  `nothing else altered: every other detail stays word for word, in the same order, and the description opens with the same word it opens with now. What ` +
  `the change replaces goes (a new colour replaces the old one; "without X" removes X); what it adds is added once, in the plain words a photograph would ` +
  `show. Add nothing the maker did not ask for: no new detail, no name, no action, no place, no mood. ` +
  `Return ONLY JSON {"look":string} — "look" is the edited description as ONE noun phrase (never a sentence, never "This …").`;

const _say = (x) => String(x || "").replace(/\s+/g, " ").trim();
const _key = (x) => _say(x).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const _STOP = new Set(["the", "and", "with", "without", "its", "his", "her", "their", "now", "that", "this", "for", "from", "into", "onto", "over", "under", "has", "have", "who", "which", "not"]);
const _content = (x) => [...new Set((String(x || "").toLowerCase().match(/[a-z0-9]+/g) || []).filter((w) => w.length >= 3 && !_STOP.has(w)))];
const _has = (words, w) => words.some((x) => sameWord(x, w));
const _esc = (x) => String(x).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const _holds = (text, name) => new RegExp(`(?:^|[^a-z0-9])${_esc(String(name).toLowerCase())}(?:[^a-z0-9]|$)`).test(String(text || "").toLowerCase());

/** the same look, however spaced, cased or punctuated. Pure. */
export const sameLook = (a, b) => { const x = _key(a); return !!x && x === _key(b); };

/** a name the parent's look did not hold (the figure's own names and every name the look-up recognised): the first one `text` carries, else "". Pure. */
export const newNameIn = (text, parent, names = []) => (Array.isArray(names) ? names : []).map(_say).filter((n) => n.length >= 3).find((n) => _holds(text, n) && !_holds(parent, n)) || "";

/** THE GUARD THAT KEEPS THE EDIT AN EDIT (both design checks, 2026-10-02; the idea of _beat_edit's editAccepted). Refused: an empty answer, a sentence or
 *  more than one line, the parent's look returned as it was, a name the parent's look did not hold, a rewrite in disguise (fewer than `keep` of the parent's
 *  content words survive), and detail nobody asked for (more than `extra` content words that neither the parent's look nor the change holds: an action, a
 *  place, an invented feature). → { ok, look, why }. Pure. */
export function changedLookAccepted(parent, edited, { change = "", names = [], keep = 0.5, extra = 2, max = 320 } = {}) {
  const p = _say(parent), raw = _say(typeof edited === "string" ? edited : "");
  if (!raw) return { ok: false, look: "", why: "the edit came back empty" };
  const e = asNounPhrase(raw);
  if (/[\n\r]/.test(String(edited)) || /[.!?]\s+\S/.test(e)) return { ok: false, look: "", why: "the edit came back as more than one phrase" };
  if (e.length > max) return { ok: false, look: "", why: `the edit came back ${e.length} characters long` };
  if (sameLook(e, p)) return { ok: false, look: "", why: "the edit changed nothing" };
  const nm = newNameIn(e, p, names);
  if (nm) return { ok: false, look: "", why: `the edit carries a name the look never held ("${nm}")` };
  const w0 = _content(p), w1 = _content(e), wc = _content(change);
  const kept = w0.length ? w0.filter((w) => _has(w1, w)).length / w0.length : 1;
  if (kept < keep) return { ok: false, look: "", why: `the edit kept only ${Math.round(kept * 100)}% of the look's words — a rewrite, not an edit` };
  const added = w1.filter((w) => !_has(w0, w) && !_has(wc, w));
  if (added.length > extra) return { ok: false, look: "", why: `the edit added what the maker never asked for (${added.slice(0, 5).join(", ")})` };
  return { ok: true, look: e, why: "" };
}

/** THE CHANGE IN LOOK-SHAPED WORDS, for the fallback (the reviewer, design check: the name-law repair pastes a kept look into beats, so it is never a meta phrase):
 *  the maker's own words for the change without the order ("make", "give"), without the figure it is said of (its name, a pronoun), and with "with" before
 *  a thing it now has. "make the possum white" → "white"; "give him a red hat" → "with a red hat"; "without the surfboard" stays; "turn it into a robot" →
 *  "a robot". "" when nothing look-shaped is left. Pure. */
export function lookShaped(change, names = []) {
  let s = _say(change).replace(/[.!?]+$/, "");
  if (!s || s.length > 160) return "";
  s = s.replace(/^(?:please\s+)?(?:make|give|turn|change|let|have|put|dress|paint|colou?r|get)\b\s*/i, "");
  for (const n of (Array.isArray(names) ? names : []).map(_say).filter((x) => x.length >= 3).sort((a, b) => b.length - a.length)) s = s.replace(new RegExp(`^(?:the\\s+|a\\s+|an\\s+)?${_esc(n)}(?:'s)?(?=\\s|$)\\s*`, "i"), "");
  s = s.replace(/^(?:him|her|it|them|his|its|their)\b\s*/i, "");
  const became = /^(?:into|to be|be|become|becomes)\b/i.test(s);
  s = _say(s.replace(/^(?:into|to be|be|become|becomes|is|are|look|looks)\b\s*/i, ""));
  if (s.length < 2) return "";
  return !became && /^(?:a|an|the)\s/i.test(s) ? `with ${s}` : s;
}

/** the parent's look with the change behind it, in look-shaped words; "" when the change has no such shape or would carry a name the look never held. Pure. */
export function appendedLook(parent, change, names = []) {
  const p = _say(parent).replace(/[.,;]+$/, ""), c = lookShaped(change, names);
  if (!p || !c) return "";
  const out = `${p}, now ${c}`;
  return newNameIn(out, p, names) ? "" : out;
}

async function defaultEdit({ look, change }) {
  // room to answer: the model reasons before it answers, and a cut-off call is billed and re-asked (see provider-llm)
  return providerJson([textPart(`${LOOK_CHANGE_LAW}\n\nThe change, in the maker's words: ${JSON.stringify(_say(change))}\nThe description to edit: ${JSON.stringify(_say(look))}`)], { tag: "look-change", maxTokens: 3000, temperature: 0.1 });
}

/** → { look, how, why }: how is "edited" (the guarded edit), "appended" (the edit failed or was refused: the change rides behind the parent's look) or
 *  "kept" (neither could be written: the parent's look stands, and the caller says so). Never throws: this step is optional, and an outage or a budget stop
 *  here never ends the run (the next paid call meets the same wall and stops it as itself); the change is still not dropped. */
export async function applyLookChange({ look = "", change = "", names = [] } = {}, { edit = defaultEdit } = {}) {
  const parent = _say(look), ch = _say(change);
  if (!parent || !ch) return { look: parent, how: "kept", why: !parent ? "the figure has no look to change" : "no change was given" };
  let why = "";
  try {
    const raw = await edit({ look: parent, change: ch });
    const v = changedLookAccepted(parent, raw?.look, { change: ch, names });
    if (v.ok) return { look: v.look, how: "edited", why: "" };
    why = v.why;
  } catch (e) { why = e?.ledgerCap ? "the budget could not afford the edit" : `the edit did not run (${String(e?.message || e).slice(0, 80)})`; }
  const tail = appendedLook(parent, ch, names);
  return tail ? { look: tail, how: "appended", why } : { look: parent, how: "kept", why };
}
