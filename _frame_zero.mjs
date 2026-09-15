// FRAME ZERO IS A STAGE OF ITS OWN (owner 2026-09-14: "isnt a string repair like … a bandage on a gushing wound?" — "yes It should be a stage of its own").
//
// Until now the appropriation — the world's things taking the seat photograph's set pieces at frame zero — was one instruction among sixty to the
// story writer, and a string repair (repairFrameZero) taped the missing facts onto beat zero when the writer ignored it. With the fast model writing, the
// writer mostly wrote it; with the prose model writing it never did on a first pass (dry-cave-local-25/26), the tape held beat zero legal, and the beats
// after zero rode the photograph's own ice cave. A recovery tool that always succeeds is a bug report (the owner's law).
//
// Now frame zero is composed FIRST, before the story is written, from the placements the plate read produced: one small call by the model that
// has composed this well on every draw (the fast model by default), validated by code — every replacement's both sides present, the way named first, no
// change-verb, no place or work named — with the mechanical facts as the fallback when the composition fails validation (loudly). The story
// writer receives it as the GROUND it writes from, plus the world's standing state and one negative rule: after frame zero the photograph's own
// scenery is never named again. The old repair stands down where the stage ran; its work becomes a FINDING (rule "frame-zero") the run hears,
// and only after the re-asks does the stage's own paragraph take beat zero's opening — logged, never silent.
//
// The later-beat check that let draw 25's ice through (pieceKeys drops words under four letters and every surface noun, so "the icy wall on
// the right" had no policeable key) is answered here by looseKeys: a set piece's distinctive words include its short material words (icy, ice,
// snowy) and keep the surface noun as the second half of the whole; a key that is also one of the world's own words (snow in a maze under snow)
// is never policed, because it is ambiguous by construction.
import { providerJson, textPart } from "./provider-llm.mjs";
import { replacementFact } from "./_ride_writer.mjs";
import { rideWords } from "./_ride.mjs";
import { worldNameFindings, CAMERA_WORD_RE, isRideNoun } from "./_gate_rules.mjs";

const _re = (s) => String(s || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const STOP = new Set(["the", "and", "with", "from", "that", "this", "into", "onto", "over", "under", "through", "their", "there", "where", "which", "while", "then", "than", "them", "they", "your", "have", "been", "were", "also", "just", "only", "very", "some", "each", "same", "like", "near", "left", "right", "side", "sides", "ahead", "behind", "beside", "above", "below", "its", "his", "her", "for", "off", "out", "all", "one", "two", "far", "way", "top", "end"]);
const SURFACE_NOUNS = /^(?:walls?|ceilings?|floors?|grounds?|arch(?:es|way|ways)?|backgrounds?|backdrops?|lighting|lights?|glow|paths?|beds?|roofs?|tunnels?|passages?|corridors?|surfaces?)$/;
const TRANSFORM = /\b(?:becomes?|becoming|became|turns? into|turning into|transforms?(?: into)?|transforming|morph(?:s|ing|ed)?(?: into)?|replaced by|is replaced|are replaced|gives? way to|changes? into)\b/i;
// A CAMERA WORD IS AN INSTRUCTION, NOT A NOUN (measured 2026-09-14: "copper pans on a rail", "a framed photograph", "a hedge that tilts
// in the wind" each threw away a composition that was otherwise whole, and the mechanical join shipped in its place). The engine's own
// camera law is the tuned one — the camera, a zoom, a panning shot, a dolly, a tracking shot, a push, a pull — and the stage reads THAT,
// plus the cut it may never write.
const CAMERA = new RegExp(`${CAMERA_WORD_RE.source}|\\bcut to\\b`, "i");

/** the distinctive words of a set piece (short material words kept: icy, ice, snowy), never the way's words nor a bare surface noun */
export function looseKeys(piece, wayWords = []) {
  const way = new Set((Array.isArray(wayWords) ? wayWords : []).flatMap((w) => String(w || "").toLowerCase().split(/[^a-z0-9'-]+/)).filter(Boolean));
  return [...new Set(String(piece || "").toLowerCase().split(/[^a-z0-9'-]+/).filter((w) => w.length >= 3 && !STOP.has(w) && !way.has(w) && !SURFACE_NOUNS.test(w)))];
}
/** the surface noun of a set piece ("wall" of "the icy wall on the right"), or "" */
export const surfaceNoun = (piece) => (String(piece || "").toLowerCase().split(/[^a-z0-9'-]+/).find((w) => SURFACE_NOUNS.test(w)) || "");
const stem = (k) => k.replace(/-lit$/, "").replace(/y$/, "").replace(/ies$/, "y").replace(/s$/, "");
const keyRx = (k) => new RegExp(`\\b${_re(stem(k))}(?:e|y|ies|es|s|ed|-lit)?\\b`, "i");   // a material's own root: "icy" stems to "ic" and must still reach the word "ice"

const _read = (v) => (Array.isArray(v) ? v.map((x) => String(x ?? "").trim()).filter(Boolean).join(", ") : typeof v === "string" ? v : "").trim();
const stripRole = (l) => String(l || "").replace(/^[^:]{0,80}\(frame zero[^)]*\):\s*/i, "").replace(/^the seat photograph[^:]*:\s*/i, "").trim();
/** the stage's inputs, read off the ride decision: the replacements (piece → by), the additions, what is kept, the seat's own words */
export function frameZeroInputs(d) {
  const w = rideWords(d);
  const zero = (d?.dressing?.placements || []).map(stripRole).filter((l) => l && !/^(?:the second|the third|the fourth|the fifth|photograph )/i.test(l));
  const replacements = [], additions = [];
  for (const f of zero) {
    const m = f.match(/^(.*?)\s+becomes\s+(.+?)\.?$/i);
    if (m) { replacements.push({ piece: m[1].trim(), by: m[2].trim(), fact: replacementFact(f, w.way) }); continue; }
    const a = f.match(/^(.+?)\s+at\s+(.+?)\.?$/i);
    if (a) additions.push({ thing: a[1].trim(), where: a[2].trim(), fact: `${a[1].trim()} at ${a[2].trim()}` });
  }
  const replacedSet = new Set(replacements.map((r) => r.piece.toLowerCase()));
  const kept = (d?.dressing?.plateThings || []).filter((p) => p && !replacedSet.has(String(p).toLowerCase()));
  const r = d?.seat?.reading || {};
  const direction = /veers? (?:to the )?left/i.test(String(r.way_direction || "")) ? "and veering away to the left" : /veers? (?:to the )?right/i.test(String(r.way_direction || "")) ? "and veering away to the right" : "";
  const fore = _read(r.foreground);
  return { way: w.way || "way ahead", vehicle: w.vehicle || "vehicle", direction, foreground: /^none\b/i.test(fore) ? "" : fore, environment: _read(r.environment), replacements, additions, kept, title: String(d?.world?.title || "").trim() };
}
/** the mechanical frame zero — the facts in the golden grammar, joined — the fallback when the composition fails, and the pre-stage behaviour */
export function frameZeroFacts(d) {
  const i = frameZeroInputs(d);
  const parts = [`the ${i.way} ${/s$/.test(i.way) ? "run" : "runs"} on ahead${i.direction ? " " + i.direction : ""}`];
  if (i.foreground) parts.push(i.foreground);
  parts.push(...i.replacements.map((r) => r.fact), ...i.additions.map((a) => a.fact), ...i.kept);
  return parts.filter(Boolean).join("; ") + ".";
}
/** THE SET LINE — the replacements as CONSTANTS of the whole take (owner 2026-09-15, re-reading the set test of 09-11: same plate, same three references, same
 *  beats; one untimed "Set:" line, and the take stayed on the plate and painted the world's things into it, where render 1 without it opened in the maze
 *  photograph and came back to the unreplaced plate at the end). The run appends it after the Sound line — the stage's own facts, no writer; never a beat,
 *  never a spoken line. The construction clause states the other half of the set test: the ride's own building stays. */
export function frameZeroSetLine(d) {
  const i = frameZeroInputs(d);
  const art = (s) => (/^(?:the|a|an|its|their)\s/i.test(String(s || "")) ? String(s) : `the ${s}`);
  const parts = [...i.replacements.map((r) => `${art(r.piece)} is ${r.by}`), ...i.additions.map((a) => `${a.thing} stands at ${a.where}`)];
  if (!parts.length) return "";
  return `Set: for the whole take, ${parts.join("; ")}; the ride's own building — its walls and scenery, ceiling, floor, ${i.way} and light — stays as photographed.`;
}
/** does a beat-zero line carry the ground — both sides of every replacement, the addition, the kept pieces (half the words of each) */
export function frameZeroHolds(line0, d) {
  const i = frameZeroInputs(d); const l = String(line0 || "");
  // a side with no distinctive word of its own ("the ceiling", "the walls") is policed by its WHOLE phrase, never waved through: a
  // replacement half-stated is the one thing this check exists to see (a recovery tool that always succeeds is a bug report)
  const has = (s) => { const keys = looseKeys(s, [i.way, i.vehicle]); if (!keys.length) return new RegExp(`\\b${_re(String(s || "").replace(/^the\s+/i, ""))}\\b`, "i").test(l); return keys.filter((k) => keyRx(k).test(l)).length * 2 >= keys.length; };
  const missing = [];
  for (const r of i.replacements) if (!(has(r.piece) && has(r.by))) missing.push(r.fact);
  for (const a of i.additions) if (!has(a.thing)) missing.push(a.fact);
  return { ok: missing.length === 0, missing };
}
/** one call: compose frame zero from the facts; validated by code; the mechanical facts when the composition fails (loudly) */
export async function composeFrameZero(d, { model = process.env.PROVIDER_FRAME0_MODEL || process.env.PROVIDER_LLM_MODEL || "fast-model", ask = null, log = console.log } = {}) {
  const i = frameZeroInputs(d);
  // THE CAP SCALES WITH WHAT THERE IS TO SAY (the 9/11 re-run, 2026-09-14): seven pieces named as replaced came back at 139 words, over a flat 120,
  // and a paragraph that was right was thrown away for the facts list. Sixty words plus fifteen a piece, never past two hundred.
  const wordCap = Math.min(200, 60 + 15 * (i.replacements.length + i.additions.length));
  if (!i.replacements.length && !i.additions.length) return null;   // nothing to appropriate — the photograph is the world; the stage has no work
  const facts = [...i.replacements.map((r) => r.fact), ...i.additions.map((a) => a.fact)];
  const prompt =
    `Write FRAME ZERO of one continuous take filmed from the seat of a ${d.noun || "dark ride"}. The photograph is the seat's own view: ${i.way} running on ahead${i.direction ? " " + i.direction : ""}` +
    `${i.foreground ? `; in the foreground ${i.foreground}` : ""}${i.environment ? `; the scene around the seat is ${i.environment}` : ""}. ` +
    `The world's things already stand on this photograph at frame zero — standing facts, never changes: ${facts.join("; ")}.` +
    `${i.kept.length ? ` Kept as themselves: ${i.kept.join("; ")}.` : ""} ` +
    `Write ONE paragraph, present tense, at most ${wordCap} words, that a video model reads as the first frame: it opens with ${i.way} running on ahead, then the foreground, then every fact above stated in exactly its grammar (the world's thing where the set piece stood), then what is kept. ` +
    `Never a place's name, never a work's title, never a person's name, never a camera word, never a word of change (nothing becomes, turns into or is replaced on screen). ` +
    `The photograph's own construction — its walls and scenery, ceiling, floor, ${i.way} and light — stays exactly as it is and is never named as changed. ` +
    `Return ONLY JSON {"frame_zero":"the paragraph"}`;
  let out = null, why = "";
  // ⚠ THE BUDGET BOUNDS THE ANSWER, IT NEVER SPENDS IT — and 2400 did not bound this one. the fast model counts its reasoning against max_tokens (the
  // writer's own lesson, _ground_prompt "WRITER BUDGETS"), so measured live 2026-09-14 on draw 27's inputs this call truncated at 2385 tokens
  // on THREE draws of three and provider-llm paid the doubling rung every time: $… / $… / $… for two calls and ~33 s. At 8000
  // one call answered as well (source "composed", holds), for $… in 16 s.
  try {
    const j = ask ? await ask(prompt) : await providerJson([textPart(prompt)], { model, maxTokens: 8000, temperature: 0.2, tag: "frame0" });
    const text = String(j?.frame_zero || "").replace(/\s+/g, " ").trim();
    const holds = frameZeroHolds(text, d);
    const wayFirst = new RegExp(`^(?:\\S+\\s+){0,12}?${_re(String(i.way).replace(/^the\s+/i, ""))}`, "i").test(text.replace(/^the\s+/i, ""));
    const words = text.split(/\s+/).filter(Boolean).length;
    if (!text) why = "empty";
    else if (!holds.ok) why = `missing: ${holds.missing.join(" | ").slice(0, 160)}`;
    else if (!wayFirst) why = "the way is not named first";
    else if (TRANSFORM.test(text)) why = `a change-verb: ${(text.match(TRANSFORM) || [""])[0]}`;
    else if (CAMERA.test(text)) why = `a camera word: ${(text.match(CAMERA) || [""])[0]}`;
    else if (words > wordCap + 20) why = `${words} words (the cap is ${wordCap} for ${i.replacements.length + i.additions.length} piece(s))`;
    else if (i.title && worldNameFindings(text, [i.title]).length) why = "the work is named";
    if (!why) out = { text, replaced: i.replacements.map((r) => ({ piece: r.piece, by: r.by })), source: "composed" };
  } catch (e) { if (e?.name === "ProviderInfraError" || e?.ledgerCap) throw e; why = String(e?.message || e).slice(0, 120); }
  if (!out) {
    log(`  ⚠ FRAME ZERO: the composition failed validation (${why}) — the mechanical facts stand as frame zero (read this: it is the stage failing, not the writer)`);
    out = { text: frameZeroFacts(d), replaced: i.replacements.map((r) => ({ piece: r.piece, by: r.by })), source: "facts", why };
  }
  return out;
}
/** a replaced set piece written as still present AFTER frame zero (the loud finding); a key the world's own things also carry is never policed */
export function pieceReturns(text, d) {
  const i = frameZeroInputs(d); const out = [];
  const worldWords = new Set([...i.replacements.map((r) => r.by), ...i.additions.map((a) => a.thing), ...(d?.dressing?.later || []), ...((d?.dressing?.photographed || []).flatMap((p) => p?.qualities || []))].flatMap((s) => looseKeys(s)).map(stem));
  const lines = String(text || "").split("\n").filter((l) => /^\s*\[\d+(?:\.\d+)?s\]/.test(l));
  for (const r of i.replacements) {
    const keys = looseKeys(r.piece, [i.way, i.vehicle]).filter((k) => !worldWords.has(stem(k))); if (!keys.length) continue;
    const noun = surfaceNoun(r.piece);
    lines.forEach((line, n) => {
      if (n === 0) return;
      const hit = keys.filter((k) => keyRx(k).test(line)).length;
      const need = keys.length <= 2 ? keys.length : Math.ceil(keys.length / 2);
      const withNoun = !noun || new RegExp(`\\b${_re(noun.replace(/s$/, ""))}s?\\b`, "i").test(line);
      if (hit >= need && withNoun && !/\bwhere\b[^.;]{0,60}\b(?:stood|was|were)\b/i.test(line)) out.push({ rule: "plate-thing", figure: `"${r.piece}" is written as still present after frame zero — it was replaced there by ${r.by}; the photograph's own scenery is never named again`, at: Number((line.match(/^\s*\[(\d+(?:\.\d+)?)s\]/) || [])[1] || 0) });
    });
  }
  return out;
}
/** the last resort after the re-asks: a replaced piece named after frame zero reads as the world's thing (mechanical, logged by the caller) */
export function carryReplacements(text, d) {
  const i = frameZeroInputs(d); const fixed = [];
  const worldWords = new Set([...i.replacements.map((r) => r.by), ...i.additions.map((a) => a.thing), ...(d?.dressing?.later || []), ...((d?.dressing?.photographed || []).flatMap((p) => p?.qualities || []))].flatMap((s) => looseKeys(s)).map(stem));
  const lines = String(text || "").split("\n"); let seenZero = false;
  for (let n = 0; n < lines.length; n++) {
    const isBeat = /^\s*\[\d+(?:\.\d+)?s\]/.test(lines[n]); if (!isBeat) continue;
    if (!seenZero) { seenZero = true; continue; }
    // THE WHOLE PHRASE FIRST, FOR EVERY PIECE: a shorter piece's core words sit inside a longer piece's phrase ("ice wall" inside "the
    // blue-lit ice wall in the background"), so a core-first pass writes the wrong world thing into the longer one.
    const hit = [];
    for (const r of i.replacements) { const b = lines[n]; lines[n] = lines[n].replace(new RegExp(`\\b(?:the\\s+)?${_re(r.piece.replace(/^the\s+/i, ""))}\\b`, "gi"), r.by); if (lines[n] !== b) hit.push(r); }
    // then the core — EVERY distinctive word of a piece, in its own order, before its surface noun ("icy rock … wall", "blue-lit ice …
    // wall"), never one of them alone: one word is the left wall's and the right wall's alike, and the repair that takes it writes the
    // WRONG world thing into the beat. The most distinctive piece claims the words first, so a shorter piece never takes a longer one's
    // phrase; a piece whose every word the world's own things also carry is left alone, as the check leaves it (ambiguous by construction).
    for (const r of [...i.replacements].sort((a, b) => looseKeys(b.piece).length - looseKeys(a.piece).length || b.piece.length - a.piece.length)) {
      const keys = looseKeys(r.piece, [i.way, i.vehicle]); const noun = surfaceNoun(r.piece);
      if (!keys.length || !noun || !keys.some((k) => !worldWords.has(stem(k)))) continue;
      const b = lines[n];
      lines[n] = lines[n].replace(new RegExp(`\\b(?:the\\s+)?${keys.map((k) => `${_re(stem(k))}(?:e|y|ies|es|s|-lit)?`).join("(?:\\s+\\w+){0,2}?\\s+")}(?:\\s+\\w+){0,2}?\\s+${_re(noun.replace(/s$/, ""))}s?\\b`, "gi"), r.by);
      if (lines[n] !== b) hit.push(r);
    }
    for (const r of hit) fixed.push(`${r.piece} → ${r.by} @${(lines[n].match(/^\s*\[(\d+(?:\.\d+)?)s\]/) || [])[1]}s`);
  }
  return { text: lines.join("\n"), fixed };
}
/** the last resort for beat zero: the stage's paragraph takes the opening; the writer's own beat-zero sentences that name no replaced piece follow it */
/** BEAT ZERO OPENS WITH THE GROUND (owner 2026-09-14, on the 9/11 re-run: the writer opened beat zero with "The creators themed this attraction to
 *  satire history as passengers ride through the exhibits." and the ground followed — "that is wrong, so we need to fix it"). The frame-zero ruling
 *  says beat zero states the photograph and what the world lays on it and nothing else; the check above sees a MISSING ground, never a sentence
 *  standing ahead of it. A leading sentence that carries none of the ground's distinctive words and no word of the way or the vehicle pictures
 *  nothing of the first frame and goes; the first sentence that does opens the beat. Mechanical, logged, never a re-ask; never empties the beat. */
export function openWithGround(text, d, frame0) {
  const lines = String(text || "").split("\n"); const n = lines.findIndex((l) => /^\s*\[\d+(?:\.\d+)?s\]/.test(l));
  if (n < 0 || !frame0?.text) return { text: String(text || ""), dropped: [] };
  const stamp = (lines[n].match(/^\s*\[\d+(?:\.\d+)?s\]/) || ["[0s]"])[0];
  const i = frameZeroInputs(d); const ground = String(frame0.text || "");
  const groundKeys = new Set(looseKeys(ground, []).map(stem));
  const pictures = (s) => { if (isRideNoun(s) || (i.way && keyRx(i.way).test(s)) || (i.vehicle && keyRx(i.vehicle).test(s))) return true; return looseKeys(s, [i.way, i.vehicle]).some((k) => groundKeys.has(stem(k))); };
  const sentences = lines[n].slice(stamp.length).trim().split(/(?<=[.!?;])\s+/).filter((x) => x.trim());
  const dropped = []; let k = 0;
  while (k < sentences.length - 1 && !pictures(sentences[k])) { dropped.push(sentences[k]); k++; }
  if (!dropped.length) return { text: String(text || ""), dropped: [] };
  lines[n] = `${stamp} ${sentences.slice(k).join(" ")}`;
  return { text: lines.join("\n"), dropped };
}
export function setFrameZero(text, d, frame0) {
  const lines = String(text || "").split("\n"); const n = lines.findIndex((l) => /^\s*\[\d+(?:\.\d+)?s\]/.test(l));
  if (n < 0 || !frame0?.text) return { text: String(text || ""), changed: false };
  const stamp = (lines[n].match(/^\s*\[\d+(?:\.\d+)?s\]/) || ["[0s]"])[0];
  const body = lines[n].slice(stamp.length).trim();
  const i = frameZeroInputs(d);
  const names = (s) => i.replacements.some((r) => { const keys = looseKeys(r.piece, [i.way, i.vehicle]); return keys.length && keys.filter((k) => keyRx(k).test(s)).length * 2 >= keys.length; });
  // (the frameZeroHolds term that stood in this filter folded to `true` on BOTH branches of its own ternary — it
  //  read as a rule and could never change the result; the filter is, and always was, "a sentence that names no
  //  replaced piece". Stated plainly, 2026-09-14.)
  const kept = body.split(/(?<=[.!?;])\s+/).filter((s) => s.trim() && !names(s));
  // the writer's own way-opening goes: the stage's paragraph already states it, and keeping it opens beat zero with the way twice
  // …AND SO DOES A SENTENCE THAT RESTATES THE GROUND (layer 2, the Woodstock retry, 2026-09-14): the writer opened with the ground in its own words
  // ("a grassy hillside spreads in the foreground …; tall wooden scaffolding towers rise …; track remains"), the check called the ground dropped (no
  // piece named as replaced), the stage set its paragraph in front and KEPT those sentences — the hillside, the towers and the tents twice, and
  // "Track remains." as a sentence of its own. A sentence whose distinctive words the paragraph already carries, or that has none beyond the way
  // and the vehicle, restates the ground and goes; a sentence with something of its own (the rows ahead, a figure, a sound) stays.
  const ground = String(frame0.text || "");
  const restates = (s) => {
    if (s.trim().split(/\s+/).length <= 3 && isRideNoun(s)) return true;   // "track remains" — a stub about the way, in a synonym the way words do not carry
    const keys = looseKeys(s, [i.way, i.vehicle]); if (!keys.length) return false;   // nothing distinctive to compare — the writer's own sentence, kept
    const hit = keys.filter((k) => keyRx(k).test(ground)).length; return hit * 10 >= keys.length * 7;
  };
  // a restating clause the writer hung a fresh one on (", and the rows ahead lean forward") goes alone; the fresh clause stays, capitalised
  const trimLead = (s) => { const m = s.match(/^(.*?),\s+(?:and|then|as|while)\s+(.*)$/); return m && restates(m[1]) ? m[2].charAt(0).toUpperCase() + m[2].slice(1) : s; };
  const rest = kept.map(trimLead).filter((s) => (!/^\s*(?:the\s+)?(?:track bed|rails?|way)\b/i.test(s) || frameZeroHolds(s, d).ok) && !restates(s)).join(" ").trim();
  lines[n] = `${stamp} ${frame0.text.replace(/\.?\s*$/, ".")}${rest ? " " + rest : ""}`;
  return { text: lines.join("\n"), changed: true };
}
