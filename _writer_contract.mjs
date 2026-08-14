// WRITER CONTRACT (C0, WRITER_FACTS=1) — the MJ golden shape as CODE. The final cleared MJ prompt
// (out/tv2_mj/gen_prompt_allsmall.txt, 2026-07-27) decomposes into mechanical predicates; this module IS that
// checklist, plus the fact-block/contract the writer receives instead of the 4,000-char celebClause paragraph.
// Instruction-density law (owner 2026-08-12): the writer sees FACTS and a short contract; enforcement lives in
// goldenViolations() + the caller's targeted re-ask loop, never in prose repetition.
// PURE module: no fs, no net, no env — battery-testable offline, import-safe from either branch.
// ⚠ NON-INTERFERENCE (owner 2026-08-12): consumed ONLY by _ground_shotset's celeb fact-path, which is
// double-gated (WRITER_FACTS==="1" AND CELEB_LENS set). The non-© world-build call (_run:1597, no CELEB_LENS)
// can never reach it; the ip-character branch (_ground_prompt) never touches this file.
import { ledgerToks, dialogueShape, validateBeatsAgainstLedger } from "./_gate_rules.mjs";   // dialogueShape: the SHARED dialogue-skeleton law (word floor, both-parties-speak, sentence-button) — v2, benchmark-verified 6/6 before wiring

const SIZE_WORDS = /\b(small|tiny|distant|far away|faraway|in the distance|at a distance|speck)\b/i;
const CAMERA_WORDS = /\b(pans?|panning|zooms?|zooming|push(?:es)?[- ]?in|tilts?|tilting|dolly|camera)\b/i;
const ANCHOR = /\boriginal (broadcast|stream|footage|recording|clip)\b/i;   // retired 2026-08-12 — its absence is now a golden property
const QUALITY_WORDS = /\b(cinematic|beautiful|stunning|gorgeous|high[- ]?quality|4k|8k|ultra[- ]?(?:hd|realistic)|masterpiece|professional(?:ly)?[- ]?(?:shot|lit|graded)?)\b/i;   // the polished-stock manifold reads AI (candid-not-quality)

// ── THE WRITING LAW (methodology adoption, owner-ratified 2026-08-15) — the non-IP branch's anti-diffusion
// core, v2 text VERBATIM (their draft, my merge; capture-shape content deliberately absent — the celeb
// non-negotiables are carried mechanically by FACTS + RULES, never restated). LEAK-SAFE BY CONSTRUCTION:
// the text contains zero banned tokens (no apparatus nouns, no pace/register/quality words), so a sentence
// leaked verbatim into output prose violates nothing — the battery TESTS this property (regexes vs law = no
// match); preserve it through any future edit. Rule map: 1 frame-zero · 2 restaging · 3 elements/details ·
// 4 simulation-not-description · 5 register continuity + candid-not-quality · 6 apparatus-once/no-static ·
// 7 identity-once-then-HANDLE · 8 sound channel.
export const WRITING_LAW = `WRITING LAW
1. The photograph is the first frame. Write only what it does not show: motion, sound, and what happens next.
2. Every action must fit the photograph as it stands; an action that needs what it does not hold is the wrong action.
3. Name what is present freely; say how it looks only when the action cannot be read without it.
4. Write what happens, never what is.
5. The register is given; keep it. No words about the footage's quality or style — the photograph has decided both.
6. Beyond its capture sentence, nothing about how the scene is seen. A fixed view is silence; the view moves only while a subject travels.
7. Describe a figure's look once, at first action; afterwards their role name carries them.
8. The scene's own sounds carry its life; no music. An empty moment gains a sound, not a detail.`;

// IP replacement clause (owner-locked via x23's validated scrub wording, 2594ba2 lineage — do NOT reword;
// only the role noun computes). SWAP_GRAMMAR matches it by construction.
export const ipSwapClause = (role) => `takes the place of ${role} at the action spot — same position, distance and size`;   // role arrives WITH its article ("the sparring partner")

export const cutLinesOf = (text) => String(text || "").split("\n").map((l) => l.trim()).filter((l) => /^cut \d+\s*:/i.test(l));

/** The MJ golden properties as violations. [] = the text IS the shape. Each violation carries the rule name and
 *  (where per-cut) the 1-indexed cut, so the caller's re-ask can name EXACTLY what to fix and nothing else. */
export const SWAP_GRAMMAR = /\b(takes? (?:the )?place of|in place of|exactly where the [\w\s'-]{1,30}(?:stands|sits|waits|works)|(?:at|onto|into) the [\w\s'-]{1,30}(?:'s)? (?:mark|spot|position)\b)/i;

export function goldenViolations(text, { subjectLook = "", lens = "85mm", wantCuts = 0, castNames = [], maxLines = 16, maxChars = 1400, requireSwap = false, durationSec = 0, partiesNamed = 0, handle = "", plateNouns = null, swapSlots = 0, coGuises = [], ledger = null } = {}) {
  const t = String(text || "");
  const v = [];
  const cuts = cutLinesOf(t);
  const lines = t.split("\n").map((l) => l.trim()).filter(Boolean);
  if (!cuts.length) return [{ rule: "no-cuts", cut: null }];
  if (wantCuts && cuts.length !== wantCuts) v.push({ rule: "cut-count", cut: null, detail: `${cuts.length}/${wantCuts}` });
  // per-cut: wide framing, lens termination, subject presence, size words, camera words
  const lensEnd = new RegExp(`Shot on an? ${lens.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} lens\\.$`, "i");
  const subjToks = subjectLook ? [...new Set(ledgerToks(subjectLook))] : [];
  const handleLc = handle.trim().toLowerCase();
  cuts.forEach((c, i) => {
    if (!/\ba wide shot\b/i.test(c)) v.push({ rule: "wide", cut: i + 1 });
    if (!lensEnd.test(c)) v.push({ rule: "lens", cut: i + 1 });
    if (SIZE_WORDS.test(c)) v.push({ rule: "size-word", cut: i + 1 });
    if (CAMERA_WORDS.test(c)) v.push({ rule: "camera-word", cut: i + 1 });
    if (QUALITY_WORDS.test(c)) v.push({ rule: "quality-word", cut: i + 1 });
    // IDENTITY: without a handle, the legacy law (≥2 look tokens EVERY cut). With a handle (the ratified
    // identity-once-then-HANDLE mechanism): the FIRST cut carries the full look (≥2 tokens); later cuts carry
    // the HANDLE, and a later cut that re-describes the full look (≥4 distinct tokens) is a repaint
    // instruction — flagged, because re-description re-triggers render attention on what the ref already owns.
    const tokHits = subjToks.filter((tok) => c.toLowerCase().includes(tok)).length;
    if (!handleLc) {
      if (subjToks.length >= 2 && tokHits < 2) v.push({ rule: "subject-missing", cut: i + 1 });
    } else if (i === 0) {
      if (subjToks.length >= 2 && tokHits < 2) v.push({ rule: "subject-missing", cut: i + 1 });
    } else {
      if (!c.toLowerCase().includes(handleLc)) v.push({ rule: "subject-missing", cut: i + 1, detail: `handle "${handle}"` });
      if (subjToks.length >= 4 && tokHits >= 4) v.push({ rule: "identity-redescribed", cut: i + 1 });
    }
    // RESTAGING (law 2's mechanical face): when this cut's plate CONTENTS are known, the beat must touch them —
    // ≥1 census noun in the cut line. Absent census = skip (fail-open; the wiring supplies it write-after-plate).
    if (Array.isArray(plateNouns) && Array.isArray(plateNouns[i]) && plateNouns[i].length) {
      const hit = plateNouns[i].some((n) => n && c.toLowerCase().includes(String(n).toLowerCase()));
      if (!hit) v.push({ rule: "restaging", cut: i + 1 });
    }
  });
  // matching-the-reference: exactly ONCE when the handle mechanism is engaged (the de-name shape's clause —
  // zero = the ref is unanchored, two+ = re-description).
  if (handleLc) {
    const mr = (t.match(/matching the reference/gi) || []).length;
    if (mr === 0) v.push({ rule: "match-ref-missing", cut: null });
    else if (mr > 1) v.push({ rule: "identity-redescribed", cut: null, detail: `"matching the reference" ×${mr}` });
  }
  // CO-FIGURE presence: each guise (≥2 distinctive tokens) must appear somewhere — a dropped co-figure is the
  // x1 P1 failure class, caught at write time now.
  for (const g of coGuises.filter(Boolean)) {
    const gToks = [...new Set(ledgerToks(g))];
    if (gToks.length >= 2 && gToks.filter((tok) => t.toLowerCase().includes(tok)).length < 2)
      v.push({ rule: "cofig-missing", cut: null, detail: g.slice(0, 40) });
  }
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
  const needSlots = Math.max(Number(swapSlots) || 0, requireSwap ? 1 : 0);
  if (needSlots) {
    const found = (t.match(new RegExp(SWAP_GRAMMAR.source, "gi")) || []).length;
    if (found < needSlots) v.push({ rule: "swap-missing", cut: null, detail: `${found}/${needSlots} replacement clauses` });
  }
  // CONTINUITY (shared machinery, never reinvented): when the caller supplies a cast ledger, the shared
  // beat-vs-ledger validator folds in — carried props, cut-resume, unledgered figures.
  if (ledger) { try { for (const c of validateBeatsAgainstLedger(t, ledger) || []) v.push({ rule: "continuity", cut: null, detail: c.detail || c.rule || String(c).slice(0, 60) }); } catch { /* fail-open: continuity is additive */ } }
  // ── DIALOGUE SKELETON (owner agreed the shape half verbatim, 2026-08-13) — the SHARED law, folded in. The
  // flat c2b line taught the lesson: labels-only is minimum-compliance, and compression stops there. This
  // enforces the SKELETON (word floor at length, both named parties actually SPEAK, a short terminal sentence
  // as the button) and deliberately does NOT score funny — the payoff-transform bet, extended to conversation.
  // durationSec=0 disables (back-compat); partiesNamed comes from the CALLER's knowledge (the measured plate
  // people / the premise), never re-derived from text that may already have omitted the second party.
  // ⚠ ONLY THE WORD FLOOR IS LAW (owner 2026-08-13: "i dont see why the exchange must end on a short terminal
  // sentence. and i dont see why both must actually speak, this all depends on prompt. and Word floor is very
  // important"). exchange-floor and button-position were style observations promoted too far — whether a second
  // party speaks and how a line ends belong to the PROMPT, not a validator. They are DEMOTED here: never
  // violations, never re-asks. dialogue-underfilled stays LAW — dead air after the voice dies is a defect in
  // every prompt.
  if (durationSec) for (const d of dialogueShape(t, durationSec, { partiesNamed })) {
    if (d.rule === "dialogue-underfilled") v.push({ rule: d.rule, cut: null, detail: d.figure });
  }
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
export function factContract({ userPrompt, cutList, cutCount, subjectLook, lens, payoff = "", swap = "", charSig = "", maxLines = 16, coFigures = [], register = "", handle = "" }) {
  const art = /^[aeiou8]/.test(lens) ? "an" : "a";
  // Identity mechanism (ratified law 7, celeb instantiation): full look + "matching the reference" in the
  // subject's FIRST cut; the HANDLE carries every later cut. Without a handle the legacy shape stands.
  const lookFact = handle
    ? `SUBJECT LOOK: ${subjectLook || "(as the reference shows)"} — this phrase IS the subject in their FIRST cut, plus "matching the reference" there and nowhere else. Never any name.\nHANDLE: from their second cut on, "${handle}" carries the subject — the look is never re-described.`
    : `SUBJECT LOOK: ${subjectLook || "(as the reference shows)"} — this phrase IS the subject, plus "matching the reference". Never any name.`;
  return `You are writing beats for a video staged across ${cutCount} ordered photographs the generator conditions on and cuts between.
VIDEO: "${userPrompt}"

FACTS — data, not suggestions:
${lookFact}
${register ? `REGISTER: ${register} — given, not chosen.\n` : ""}LENS LINE: end every cut with "Shot on ${art} ${lens} lens."
${swap ? `SWAP: ${swap} — SAY WHO HE REPLACES, in the first cut he appears: "takes the place of the <role> — same position and scale".\n` : ""}${(coFigures || []).map((c) => `CO-FIGURE: ${c.guise}${c.nameable ? ` — may be named "${c.name}"` : ` — NEVER any name (not "${c.name}"); the reference carries its identity, your description carries only what it DOES`}.${c.swapRole ? ` In its first cut it ${ipSwapClause(c.swapRole)}.` : ""}\n`).join("")}${payoff ? `PAYOFF MATERIAL: ${payoff}\n` : ""}${charSig ? `SIGNATURE IN THE REFERENCE: ${charSig}\n` : ""}CUTS, IN ORDER:
${cutList}

${WRITING_LAW}

RULES — each is checked mechanically after you write:
1. One line per cut: "Cut N: A wide shot of <the place as photographed>. <subject look> <does the action>. Shot on ${art} ${lens} lens."
2. The subject acts in EVERY cut; no cut belongs to anyone else. The set's other people stay exactly where the photographs show them.
2b. CONTACT, not scenery: each cut's action stages ON that photograph's own objects and people, by DEFINITE ARTICLE — and every noun you write must be FINDABLE in that photograph.
3. The LAST cut lands one payoff, transformed from something already in that photograph; each element pays off once; real-world brand surfaces render blank.
4. Speech goes under "Dialogue:", every line labeled "Name/Role:", aimed at someone in the frame; one short voice-description line above it is allowed.
5. Nothing else — no opener line, no scene prose outside the cut lines, at most ${maxLines} lines.
Return ONLY the lines described.`;
}
