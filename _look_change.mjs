// A REMIX CHANGED A KEPT FIGURE'S LOOK, AND THE PLANNER DID NOT WRITE IT (owner 2026-10-02: "how does this adapt with remixes that change the figures,
// like lineages that evolve?" · "yes look into that"; the standing ruling, 2026-09-21: THE REMIXER'S WORDS OUTRANK THE KEPT LOOK, "a user should be free
// to instruct against their omission").
// A look change reaches the plan on the kept record (look_change), and the planner is told to write the parent's description "with exactly that change
// applied and nothing else altered". Three ways it did not, each reproduced with no network: the planner left the figure out (the change was dropped with
// the record), it cast the figure with no description, or it handed the parent's description back (as it was, reordered, or trivially reworded). The carry
// reader never lets the parent's frame ride for a changed character (it would pin the look being changed), so the description is the only carrier: the
// remix drew the old look, and the record it saved handed the old look to the next remix.
// One small call does what the planner was asked to do, for the one figure it missed. It is an EDIT, guarded as an edit: this look is never edited again in
// the run (a kept look is settled, 2026-09-21), so the guard here is the only check it gets. When the call fails or the guard refuses, the change is still
// not dropped where it can be said as a look: it rides behind the parent's look in look-shaped words. Pure but for the edit, which is injectable.
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
// the words of a look: three letters or more, never the glue between them
const _GLUE = new Set(["the", "and", "with", "without", "its", "his", "her", "their", "now", "that", "this", "for", "from", "into", "onto", "over", "under", "has", "have", "who", "which", "not", "instead",
  "wearing", "holding", "carrying", "riding"]);   // the connectives that introduce a thing: an added hat's "wearing" is nobody's invention (the reviewer, confirm check)
const _content = (x) => [...new Set((String(x || "").toLowerCase().match(/[a-z0-9]+/g) || []).filter((w) => w.length >= 3 && !_GLUE.has(w)))];
// the words of a change that order it or stand for the figure: never part of a look
const _ORDER = new Set(["make", "makes", "give", "gives", "turn", "turns", "change", "changes", "let", "put", "get", "gets", "dress", "paint", "color", "colour", "please", "him", "she", "they", "them", "look", "looks", "should",
  "must", "will", "remove", "take", "lose", "add", "become", "becomes", "wear"]);
// one word in two forms: plural-blind, or the same base after -s, -es, -ed, -ing or -y, a doubled consonant undone (wear, wearing; paint, painted; ride,
// riding; spot, spotted; spike, spiky; hair, hairy). Never a shared stem: "surfer" is not "surfboard" and "bear" is not "beard" (the reviewer, confirm check: a
// planner that removed the surfboard read as not having, and "a bear in a suit" passed for "give him a beard"). And never without the doubling and the
// -y (the reviewer, second confirm: "a spotted dog" + "remove the spots", done right, read as pending, and the right edit was refused).
const _undoubled = (x) => (/([b-df-hj-np-tv-z])\1$/.test(x) ? [x, x.slice(0, -1)] : [x]);
const _bases = (w) => [...new Set([w, ...(w.length > 3 && w.endsWith("s") ? [w.slice(0, -1)] : []), ...(w.length > 4 && w.endsWith("es") ? [w.slice(0, -2)] : []),
  ...(w.length > 4 && w.endsWith("ed") ? [..._undoubled(w.slice(0, -2)), w.slice(0, -1)] : []), ...(w.length > 5 && w.endsWith("ing") ? [..._undoubled(w.slice(0, -3)), `${w.slice(0, -3)}e`] : []),
  ...(w.length > 4 && w.endsWith("y") ? [..._undoubled(w.slice(0, -1)), `${w.slice(0, -1)}e`] : [])])].filter((x) => x.length >= 3);
const _like = (a, b) => sameWord(a, b) || _bases(a).some((x) => _bases(b).includes(x));
const _in = (words, w) => words.some((x) => _like(x, w));
// a look's clauses: what stands between its commas and connectives, each with the connective that opens it and its content words
const _clauses = (x) => { const parts = String(x || "").toLowerCase().split(/(,|\b(?:and|with|in|on|under|wearing|holding|carrying|riding)\b)/), out = []; let lead = "";
  parts.forEach((p, i) => { if (i % 2) { lead = p.trim(); return; } const words = _content(p); if (words.length) out.push({ lead, words, raw: p.trim() }); });
  return out; };
const _esc = (x) => String(x).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const _holds = (text, name) => new RegExp(`(?:^|[^a-z0-9])${_esc(String(name).toLowerCase())}(?:[^a-z0-9]|$)`).test(String(text || "").toLowerCase());

/** THE SAME LOOK: the same content words, in any order, however spaced, cased, punctuated or articled (both build checks, 2026-10-02: a planner that
 *  reordered the parent's description, or dropped an article from it, read as having written the change). Pure. */
export const sameLook = (a, b) => {
  const x = _content(a).sort().join(" "), y = _content(b).sort().join(" ");
  return x || y ? x === y : (!!_key(a) && _key(a) === _key(b));
};

/** WHAT A LOOK SHOWS OF A CHANGE, against the parent's look (the reviewer, build check: the change must show, and what else leaves may not outnumber it):
 *  `entered` the change's own words that are now in the look, `left` the words the change names that are gone from it, `lost` what else is gone (never
 *  the rest of a clause whose thing the change took away), `extra` what entered that neither the parent's look nor the change holds. `shows` when a word of
 *  the change entered or a word it names left. An edit may lose as many other words as entered: a new colour replaces the old one. Pure. */
export function shownChange(look, parent, change) {
  // the change's own words decide what it SHOWS (never its order or the pronoun it is said of); every word of it, the order's too, may stand in the look
  // ("he should wear a hat" → "…, wearing a hat")
  const w0 = _content(parent), w1 = _content(look), all = _content(change), wc = all.filter((w) => !_ORDER.has(w));
  const entered = wc.filter((w) => _in(w1, w) && !_in(w0, w)), left = wc.filter((w) => _in(w0, w) && !_in(w1, w));
  // a thing the change names takes its own clause of the parent's look with it ("…, wearing a tiny red hat" leaves whole when the hat goes), and nothing
  // else: the crest is in another clause than the surfboard (the reviewer, confirm check)
  // …and the clause that says where it sat goes with it ("a tiny red hat on its head"; the reviewer, second confirm): one that opens on the figure's own part
  // (its, his, her, their, the, one), never another thing the figure has ("round glasses in a brown suit": the suit stays; the reviewer, third confirm)
  const cl = _clauses(parent), gone = [];
  cl.forEach((c, i) => { if (!left.some((w) => _in(c.words, w))) return; gone.push(...c.words); const nx = cl[i + 1];
    if (nx && ["in", "on", "under"].includes(nx.lead) && /^(?:its|his|her|their|the|one)\b/.test(nx.raw)) gone.push(...nx.words); });
  return { shows: entered.length + left.length > 0, entered, left, lost: w0.filter((w) => !_in(w1, w) && !_in(all, w) && !_in(gone, w)), extra: w1.filter((w) => !_in(w0, w) && !_in(all, w)) };
}

/** a name the parent's look did not hold: the first of `names` that `text` carries, else "". The caller hands the names that are banned from a look (an
 *  owned figure's own, and every name the look-up recognised), never a common-noun figure's own word. Pure. */
export const newNameIn = (text, parent, names = []) => (Array.isArray(names) ? names : []).map(_say).filter((n) => n.length >= 3).find((n) => _holds(text, n) && !_holds(parent, n)) || "";

/** THE GUARD THAT KEEPS THE EDIT AN EDIT (both design checks and both build checks, 2026-10-02). Refused, each with its reason: an empty answer; more than
 *  one phrase; the parent's look handed back; a name the look never held; an edit that does not show the change; anything that entered which neither the
 *  look nor the change holds (an action, a place, an invented feature); and an edit that lost more of the look than the change accounts for (job d6921814
 *  again: "without the surfboard" answered without the crest). A change of kind on a bare look passes ("possum" → "a raccoon"). → { ok, look, why }. Pure. */
export function changedLookAccepted(parent, edited, { change = "", names = [], max = 320 } = {}) {
  const p = _say(parent), raw = _say(typeof edited === "string" ? edited : "");
  if (!raw) return { ok: false, look: "", why: "the edit came back empty" };
  const e = asNounPhrase(raw);
  if (/[\n\r]/.test(String(edited)) || /[.!?]\s+\S/.test(e)) return { ok: false, look: "", why: "the edit came back as more than one phrase" };
  if (e.length > max) return { ok: false, look: "", why: `the edit came back ${e.length} characters long` };
  if (sameLook(e, p)) return { ok: false, look: "", why: "the edit changed nothing" };
  const nm = newNameIn(e, p, names);
  if (nm) return { ok: false, look: "", why: `the edit carries a name the look never held ("${nm}")` };
  const s = shownChange(e, p, change);
  if (!s.shows) return { ok: false, look: "", why: "the edit does not show the change" };
  if (s.extra.length) return { ok: false, look: "", why: `the edit added what the maker never asked for (${s.extra.slice(0, 5).join(", ")})` };
  if (s.lost.length > s.entered.length) return { ok: false, look: "", why: `the edit lost what the change never named (${s.lost.slice(0, 5).join(", ")})` };
  return { ok: true, look: e, why: "" };
}

/** THE CHANGE IN LOOK-SHAPED WORDS, for the fallback (both design checks: the name-law repair pastes a kept look into beats, so the tail is never an order,
 *  a clause or a meta phrase). The maker's own words for the change, without the order ("make", "give"), without the figure it is said of (its name, a
 *  pronoun) and without "now"; a thing the words say it now has takes "with", a thing taken away "without". "" when the change has no such shape, and the
 *  caller keeps the look and says so: an order to BECOME another thing or a bare thing that may be one (a change of kind never rides behind the old look), a
 *  clause, a modal, a second order, a comparison.
 *    "white fur" → "white fur" · "make the possum white" → "white" · "give him a red hat" → "with a red hat" · "remove the hat" → "without the hat" ·
 *    "he is bald now" → "bald" · "it has wings now" → "with wings" · "make it a raccoon", "a raccoon", "turn it into a robot", "he should wear a hat",
 *    "swap the hat for a crown", "taller and give him a hat", "red hat instead of blue" → "". Pure. */
export function lookShaped(change, names = []) {
  let s = _say(change).replace(/[.!?]+$/, "");
  if (!s || s.length > 160) return "";
  const strip = (re) => { const t = _say(s.replace(re, "")); const hit = t !== s; s = t; return hit; };
  const figure = () => {
    for (const n of (Array.isArray(names) ? names : []).map(_say).filter((x) => x.length >= 3).sort((a, b) => b.length - a.length)) strip(new RegExp(`^(?:the\\s+|a\\s+|an\\s+)?${_esc(n)}(?:'s)?(?=\\s|$)\\s*`, "i"));
    strip(/^(?:him|her|it|them)\b\s*/i);
  };
  strip(/^please\b[\s,]*/i); strip(/^now\b[\s,]*/i); strip(/[\s,]*\bnow$/i);
  // what is left must be a look: never a clause (a verb of being or having, a modal, anywhere in it) and never one that opens on a subject, an order or a
  // possessive ("his hat is red")
  const verbed = (t) => /\b(?:is|are|was|were|has|have|had|should|must|will|would|can|could)\b/i.test(t);
  const opens = (t) => /^(?:he|she|it|they|him|her|them|his|hers|its|their|i|you|we|may|might|do|does|did|make|give|turn|change|swap|replace|switch|exchange|remove|take|lose|drop|add|put|wear|let|get|please)\b/i.test(t);
  // …and never one that still holds an order, a becoming or a comparison anywhere ("taller and give him a hat", "red hat instead of blue", "same but blue")
  const orders = (t) => /\b(?:make|give|turn|change|swap|replace|switch|exchange|remove|take|lose|drop|add|put|let|get|into|instead|rather|but|same)\b/i.test(t);
  // a tail that points at something (an article, a pronoun, a possessive) is a look only when it opens as one: "with …", "without …", "in …", "wearing …"
  const refs = (t) => /\b(?:a|an|the|some|he|she|it|they|him|her|them|his|hers|its|their)\b/i.test(t);
  const led = (t) => /^(?:with|without|in|wearing|holding|carrying)\b/i.test(t);
  // a THING taken away (it opens on an article or a possessive): "lose weight" is no thing, and "without weight" no look (the reviewer, third confirm)
  const gone = s.match(/^(?:remove|take off|take away|lose|get rid of)\s+((?:the|a|an|his|her|its|their|that|those|all)\b.+)$/i);
  if (gone) { s = _say(gone[1]); return s.length >= 2 && !verbed(s) && !orders(s) ? `without ${s}` : ""; }
  const having = strip(/^(?:give|add|put on|put)\b\s*/i);
  if (!having) strip(/^(?:make|turn|change|let|get|paint|colou?r|dress)\b\s*/i);   // "get older" is how it now is, never a thing it has (the reviewer, third confirm)
  figure();
  strip(/^(?:he|she|it|they)\b\s*/i);
  const has = strip(/^(?:has|have|gets)\b\s*/i);
  const became = strip(/^(?:into|to be|to|be|become|becomes)\b\s*/i);
  strip(/^(?:is|are|look|looks)\b\s*/i); strip(/^now\b[\s,]*/i);
  if (s.length < 2 || opens(s) || verbed(s) || orders(s)) return "";
  // a thing rides behind the look only when the words say the figure now HAS it ("give him a red hat", "it has wings"): a bare "a raccoon" may be what it
  // BECOMES, and a change of kind never rides behind the old look (the reviewer, confirm check: "the possum is now a raccoon" → "now with a raccoon")
  if (/^(?:a|an|the|some)\s/i.test(s)) return (having || has) && !became ? `with ${s}` : "";
  if (having || has) return led(s) ? s : `with ${s}`;
  return led(s) || !refs(s) ? s : "";
}

/** the parent's look with the change behind it, in look-shaped words; "" when the change has no such shape or would carry a name the look never held.
 *  `figure` are the words the change may call the figure by (stripped from the tail), `names` the names banned from a look. Pure. */
export function appendedLook(parent, change, { figure = [], names = [] } = {}) {
  const p = _say(parent).replace(/[.,;]+$/, ""), c = lookShaped(change, [...figure, ...names]);
  if (!p || !c) return "";
  const out = `${p}, now ${c}`;
  return newNameIn(out, p, names) ? "" : out;
}

async function defaultEdit({ look, change }) {
  // room to answer: the model reasons before it answers, and a cut-off call is billed and re-asked (see provider-llm)
  return providerJson([textPart(`${LOOK_CHANGE_LAW}\n\nThe change, in the maker's words: ${JSON.stringify(_say(change))}\nThe description to edit: ${JSON.stringify(_say(look))}`)], { tag: "look-change", maxTokens: 3000, temperature: 0.1 });
}

/** → { look, how, why }: how is "edited" (the guarded edit), "appended" (the edit failed or was refused: the change rides behind the parent's look) or
 *  "kept" (neither could be written: the parent's look stands, and the caller says so). `names` are the names banned from the look; `figure` the words the
 *  change may call the figure by (stripped from the tail). Never throws: this step is optional, and an outage or a budget stop here never ends the run
 *  (the next paid call meets the same wall and stops it as itself). */
export async function applyLookChange({ look = "", change = "", names = [], figure = [] } = {}, { edit = defaultEdit } = {}) {
  const parent = _say(look), ch = _say(change);
  if (!parent || !ch) return { look: parent, how: "kept", why: !parent ? "the figure has no look to change" : "no change was given" };
  let why = "";
  try {
    const raw = await edit({ look: parent, change: ch });
    const v = changedLookAccepted(parent, raw?.look, { change: ch, names });
    if (v.ok) return { look: v.look, how: "edited", why: "" };
    why = v.why;
  } catch (e) { why = e?.ledgerCap ? "the budget could not afford the edit" : `the edit did not run (${String(e?.message || e).slice(0, 80)})`; }
  const tail = appendedLook(parent, ch, { figure, names });
  if (tail) return { look: tail, how: "appended", why };
  return { look: parent, how: "kept", why: why ? `${why}; and the change has no look shape to ride behind the look` : "the change has no look shape to ride behind the look" };
}
