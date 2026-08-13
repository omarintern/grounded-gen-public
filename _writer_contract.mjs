// WRITER CONTRACT (C0, WRITER_FACTS=1) — the MJ golden shape as CODE. The final cleared MJ prompt
// (out/tv2_mj/gen_prompt_allsmall.txt, 2026-07-27) decomposes into mechanical predicates; this module IS that
// checklist, plus the fact-block/contract the writer receives instead of the 4,000-char celebClause paragraph.
// Instruction-density law (owner 2026-08-12): the writer sees FACTS and a short contract; enforcement lives in
// goldenViolations() + the caller's targeted re-ask loop, never in prose repetition.
// PURE module: no fs, no net, no env — battery-testable offline, import-safe from either branch.
// ⚠ NON-INTERFERENCE (owner 2026-08-12): consumed ONLY by _ground_shotset's celeb fact-path, which is
// double-gated (WRITER_FACTS==="1" AND CELEB_LENS set). The non-© world-build call (_run:1597, no CELEB_LENS)
// can never reach it; the ip-character branch (_ground_prompt) never touches this file.
import { ledgerToks, dialogueShape } from "./_gate_rules.mjs";   // dialogueShape: the SHARED dialogue-skeleton law (word floor, both-parties-speak, sentence-button) — v2, benchmark-verified 6/6 before wiring

const SIZE_WORDS = /\b(small|tiny|distant|far away|faraway|in the distance|at a distance|speck)\b/i;
const CAMERA_WORDS = /\b(pans?|panning|zooms?|zooming|push(?:es)?[- ]?in|tilts?|tilting|dolly|camera)\b/i;
const ANCHOR = /\boriginal (broadcast|stream|footage|recording|clip)\b/i;   // retired 2026-08-12 — its absence is now a golden property

export const cutLinesOf = (text) => String(text || "").split("\n").map((l) => l.trim()).filter((l) => /^cut \d+\s*:/i.test(l));

/** The MJ golden properties as violations. [] = the text IS the shape. Each violation carries the rule name and
 *  (where per-cut) the 1-indexed cut, so the caller's re-ask can name EXACTLY what to fix and nothing else. */
const SWAP_GRAMMAR = /\b(takes? (?:the )?place of|in place of|exactly where the [\w\s'-]{1,30}(?:stands|sits|waits|works)|(?:at|onto|into) the [\w\s'-]{1,30}(?:'s)? (?:mark|spot|position)\b)/i;

export function goldenViolations(text, { subjectLook = "", lens = "85mm", wantCuts = 0, castNames = [], maxLines = 16, maxChars = 1400, requireSwap = false, durationSec = 0, partiesNamed = 0 } = {}) {
  const t = String(text || "");
  const v = [];
  const cuts = cutLinesOf(t);
  const lines = t.split("\n").map((l) => l.trim()).filter(Boolean);
  if (!cuts.length) return [{ rule: "no-cuts", cut: null }];
  if (wantCuts && cuts.length !== wantCuts) v.push({ rule: "cut-count", cut: null, detail: `${cuts.length}/${wantCuts}` });
  // per-cut: wide framing, lens termination, subject presence, size words, camera words
  const lensEnd = new RegExp(`Shot on an? ${lens.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} lens\\.$`, "i");
  const subjToks = subjectLook ? [...new Set(ledgerToks(subjectLook))] : [];
  cuts.forEach((c, i) => {
    if (!/\ba wide shot\b/i.test(c)) v.push({ rule: "wide", cut: i + 1 });
    if (!lensEnd.test(c)) v.push({ rule: "lens", cut: i + 1 });
    if (SIZE_WORDS.test(c)) v.push({ rule: "size-word", cut: i + 1 });
    if (CAMERA_WORDS.test(c)) v.push({ rule: "camera-word", cut: i + 1 });
    // ≥2 distinctive subject tokens per cut — the "PRESENT IN EVERY CUT" law, counted not hoped. ledgerToks
    // drops stopwords, so "the slim man in the white fedora" matches on slim/man/white/fedora.
    if (subjToks.length >= 2 && subjToks.filter((tok) => c.toLowerCase().includes(tok)).length < 2)
      v.push({ rule: "subject-missing", cut: i + 1 });
  });
  // whole-text: names, the retired anchor, length, dialogue labels
  for (const n of castNames.filter(Boolean)) {
    if (new RegExp(`\\b${String(n).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(t)) { v.push({ rule: "name", cut: null, detail: n }); break; }
  }
  if (ANCHOR.test(t)) v.push({ rule: "anchor", cut: null });
  // ── SWAP GRAMMAR (owner 2026-08-13, C2a/C2b post-mortem) — when the plate MEASURES people, placement
  // language is not enough: "stands at the podium" makes the model ADD a fresh likeness beside the plate's own
  // bodies, and a conjured celebrity is what the output gate reads hardest. Every validated clear carried
  // REPLACEMENT grammar ("where the presenter stands — same position and size"); both C2 rung-0 trips lacked
  // it. requireSwap is set by the caller from the MEASURED face count (sourcing-time geometry), never from a
  // post-widen re-ask.
  if (requireSwap && !SWAP_GRAMMAR.test(t)) v.push({ rule: "swap-missing", cut: null });
  // ── DIALOGUE SKELETON (owner agreed the shape half verbatim, 2026-08-13) — the SHARED law, folded in. The
  // flat c2b line taught the lesson: labels-only is minimum-compliance, and compression stops there. This
  // enforces the SKELETON (word floor at length, both named parties actually SPEAK, a short terminal sentence
  // as the button) and deliberately does NOT score funny — the payoff-transform bet, extended to conversation.
  // durationSec=0 disables (back-compat); partiesNamed comes from the CALLER's knowledge (the measured plate
  // people / the premise), never re-derived from text that may already have omitted the second party.
  if (durationSec) for (const d of dialogueShape(t, durationSec, { partiesNamed })) v.push({ rule: d.rule, cut: null, detail: d.figure });
  if (lines.length > maxLines) v.push({ rule: "too-long", cut: null, detail: `${lines.length}/${maxLines} lines` });
  if (t.length > maxChars) v.push({ rule: "too-long", cut: null, detail: `${t.length}/${maxChars} chars` });
  const dlgIdx = lines.findIndex((l) => /^dialogue:$/i.test(l));
  if (dlgIdx >= 0) for (const l of lines.slice(dlgIdx + 1)) {
    if (!/^[A-Za-z][\w .'-]{0,40}:\s/.test(l)) { v.push({ rule: "dialogue-label", cut: null }); break; }
  }
  return v;
}

/** The writer's instruction under WRITER_FACTS: labeled fact lines + a SHORT rule contract. Everything the old
 *  paragraph said three ways is either a FACT here or a predicate in goldenViolations — never both, never prose. */
export function factContract({ userPrompt, cutList, cutCount, subjectLook, lens, payoff = "", swap = "", charSig = "", maxLines = 16 }) {
  const art = /^[aeiou8]/.test(lens) ? "an" : "a";
  return `You are writing beats for a video staged across ${cutCount} ordered photographs the generator conditions on and cuts between.
VIDEO: "${userPrompt}"

FACTS — data, not suggestions:
SUBJECT LOOK: ${subjectLook || "(as the reference shows)"} — this phrase IS the subject, plus "matching the reference". Never any name.
LENS LINE: end every cut with "Shot on ${art} ${lens} lens."
${swap ? `SWAP: ${swap} — SAY WHO HE REPLACES, in the first cut he appears: "takes the place of the <role> — same position and scale".\n` : ""}${payoff ? `PAYOFF MATERIAL: ${payoff}\n` : ""}${charSig ? `SIGNATURE IN THE REFERENCE: ${charSig}\n` : ""}CUTS, IN ORDER:
${cutList}

RULES — each is checked mechanically after you write:
1. One line per cut: "Cut N: A wide shot of <the place as photographed>. <subject look> <does the action>. Shot on ${art} ${lens} lens."
2. The subject appears in EVERY cut; no cut belongs to anyone else. The set's other people stay exactly where the photographs show them.
3. No size words (small / tiny / distant / far) — the photographs own size. No camera words (pan / zoom / push / tilt) — each cut's camera is fixed.
4. The LAST cut lands one payoff, transformed from something already in that photograph; each element pays off once; real-world brand surfaces render blank.
5. Speech goes under "Dialogue:", every line labeled "Name/Role:", aimed at someone in the frame; one short voice-description line above it is allowed.
6. Nothing else — no opener line, no scene prose outside the cut lines, at most ${maxLines} lines.
Return ONLY the lines described.`;
}
