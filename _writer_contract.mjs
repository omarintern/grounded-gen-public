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
// ⭐ TEMPO IS A DELIVERY DETAIL, NOT AN ACTION (owner 2026-08-15, on x27d's "a slow swing" / "a slow, looping
// arc" rendering as slow motion). The shared law already forbids it — «Write WHAT IS SAID and WHAT HAPPENS;
// never how it is shot, lit or DELIVERED» — but enforcement only ever covered camera MOVES, so speed words
// walked straight through. A punch is an action; a SLOW punch is a direction to the renderer.
// ⚠ NARROWED BY ITS OWN FIXTURE: a bare /slow/ flagged the VALIDATED doorman sample's "unclips the velvet rope
// on a slow ten-count", which is DIEGETIC — a count that happens in the world, not a rendering speed. So the
// rule fires on explicit slow-motion terms, or on "slow" attached to a MOTION noun (the x27d defect), and
// leaves the pace of an in-world event alone. Both directions are fixtured.
const TEMPO_WORDS = /\b(?:slo-?mo(?:tion)?|slow[- ]motion|time-?lapse|sped[- ]up|speed(?:ed)?[- ]up)\b|\bslow(?:ly)?\b[^.]{0,24}?\b(?:swing|swipe|punch|jab|hook|arc|motion|movement|step|stride|walk|turn|spin|fall|drop|kick|throw|glide|lunge|reach)\b/i;
const ANCHOR = /\boriginal (broadcast|stream|footage|recording|clip)\b/i;   // retired 2026-08-12 — its absence is now a golden property
const QUALITY_WORDS = /\b(cinematic|beautiful|stunning|gorgeous|high[- ]?quality|4k|8k|ultra[- ]?(?:hd|realistic)|masterpiece|professional(?:ly)?[- ]?(?:shot|lit|graded)?)\b/i;   // the polished-stock manifold reads AI (candid-not-quality)

// ── METHODOLOGY ADOPTION COURSE-CORRECTION (owner 2026-08-15, verbatim: "nonip already has infra so we
// should adopt it how it is instead of fixing what isnt broken") — the freshly-written 8-law distillation
// NEVER LANDED: a new, never-run instrument. The adoption base is _ground_prompt.mjs's EXISTING gen-validated
// instruction text VERBATIM, with ONLY the celeb-mechanical deltas swapped in (time-blocks→Cut-N/per-cut
// capture; celeb clause stack incl. the coFigures swap encode below; register bound to the route-derived
// FACT). Same law as the image-model insert wording: validated instruction text is settled tech, never
// rewritten. The mechanical validators added alongside (handle/restaging/quality/slots/cofig/continuity)
// SURVIVE as dormant opt-in enforcement — model-invisible, falsy-safe, engaged by the wiring only.

// ── THE COMEDY LAW (owner-ratified 2026-08-15 verbatim: «comedy wording looks great» — six rules WITH the
// rule-2 particularity amendment, exactly as sampled). Lane-neutral BY DESIGN: celeb / ip-persona / crossover
// differ by their FACTS (recall clauses, guises + canon register, collision material), never by law text.
// LEAK-SAFE, tested in the battery: the rules carry no size/camera/quality/anchor vocabulary and never name
// the joke — only the title says COMEDY. FUNNY stays validator-unowned: the validators below check
// commitment-to-a-reading (imports, straight face, context spend), never score the joke.
export const COMEDY_LAW = `COMEDY LAW
1. A signature arrives as the MANNER of an ordinary action — the way the task gets done, never the thing the scene is about. Nobody remarks on it.
2. The scene's business is done with the venue's own things, in PARTICULARS — the specific configuration, never the general item; what this place calls its objects is what gets handled and said.
3. The subject speaks in their own register; every line could only be theirs.
4. The payoff is the same material one step further — the commitment deepens.
5. Everyone plays it straight. The world answers the situation, never the fame.
6. When the request carries its own joke, deliver theirs — these laws serve it, never replace it.`;
const COMMENT_ADVERBS = /\b(hilarious(?:ly)?|comically|absurdly|jokingly|ridiculous(?:ly)?|wacky|zany|goofily|amusingly|farcical(?:ly)?)\b/i;   // straight-face law's validator-side face — the writer COMMENTING on the joke breaks rule 5; the model never sees this list

// ── PLACE-NOUN EXTRACTION (owner-ratified slot fix, x27: «the nonip agent is exactly right») — the capture
// sentence place is a FACT read off the plate census, never a composition. THE + the census noun AT PLATE
// GRAIN; a CONTAINER (arena/stadium-class) is never the place — containers instruct the model to build a
// world bigger than the photograph shows (x26h2 bug), and when the census clause itself leads with one, the
// extraction takes the CONTAINED place instead. The definite article IS the video-lane operator for "this
// particular place you can see" — the as-photographed phrasing is image-model/apparatus vocabulary, DELETED
// from the template (x27 proved it leaks verbatim into the emitted prompt).
const PLACE_MARKER = /\s+(?:surrounded by|encircled by|ringed by|framed by|set in|packed with|filled with|in front of|inside|within|beneath|under|amid|amidst|overlooking|beside|against|before|at|in|with)\s+/;
const PLACE_CONTAINER = /\b(?:arena|stadium|hall|venue|coliseum|colosseum|amphitheatre?|complex|center|centre|facility|building)s?\s*$/;
export function extractPlaceNoun(clause) {
  let c = String(clause || "").toLowerCase().replace(/[.,;].*$/, " ").trim();
  if (!c) return "";
  // the census may LEAD with the camera's own position ("beside an outdoor boxing ring" — caught by the
  // mandatory live proof on the ring2 plate): strip leading prepositions before anything else reads the head.
  for (let guard = 0; guard < 3; guard++) c = c
    .replace(/^(?:in front of|next to|beside|inside|within|beneath|underneath|under|amidst|amid|overlooking|against|before|behind|around|outside|atop|above|below|near|by|at|in)\s+/, "")
    .replace(/^(?:the\s+)?(?:edge|corner|side|front|back|center|centre|middle|interior|end|top|bottom|foot|base|view) of\s+(?:an|a|the)?\s*/, "");   // part-of prefixes are the camera's position, not the place ("edge of an outdoor boxing ring" — third live shape)
  const seg = (t) => String(t).split(PLACE_MARKER)[0].replace(/^\s*(?:a|an|the)\s+/, "").trim();
  let head = seg(c);
  if (PLACE_CONTAINER.test(head)) {
    const after = c.slice(c.indexOf(head) + head.length);
    const inner = after.match(/\b(?:with|holding|containing|featuring|centered on|centred on|around)\s+(?:a|an|the)?\s*([^,.;]+)/);
    if (inner) { const innerSeg = seg(inner[1]); if (innerSeg && !PLACE_CONTAINER.test(innerSeg)) head = innerSeg; }
  }
  return head ? `the ${head}` : "";
}

// IP replacement clause (owner-locked via x23's validated scrub wording, 2594ba2 lineage — do NOT reword;
// only the role noun computes). SWAP_GRAMMAR matches it by construction.
export const ipSwapClause = (role) => `takes the place of ${role} at the action spot — same position, distance and size`;   // role arrives WITH its article ("the sparring partner")

// HYBRID SHAPE RATIFIED (owner 2026-08-15, verbatim: "i want timeblocks. ([0s] CUT 1 — a WIDE shot…, shot on
// an 85mm lens) is correct shape where lens and wide prompted for each cut") — the Jul-26 record's own hybrid:
// stamps + CUT-N + per-cut capture sentence. Both shapes parse; the stamp consistency check below fires only
// on stamped texts, so legacy callers are byte-identical.
export const CUT_LINE = /^(?:\[\d+(?:\.\d+)?s\]\s*)?cut \d+\s*[:—-]/i;
export const cutLinesOf = (text) => String(text || "").split("\n").map((l) => l.trim()).filter((l) => CUT_LINE.test(l));
const STAMPED_CUT = /^\[\d+(?:\.\d+)?s\]\s*cut \d+/i;

/** The MJ golden properties as violations. [] = the text IS the shape. Each violation carries the rule name and
 *  (where per-cut) the 1-indexed cut, so the caller's re-ask can name EXACTLY what to fix and nothing else. */
export const SWAP_GRAMMAR = /\b(takes? (?:the )?place of|in place of|exactly where the [\w\s'-]{1,30}(?:stands|sits|waits|works)|(?:at|onto|into) the [\w\s'-]{1,30}(?:'s)? (?:mark|spot|position)\b)/i;

// maxChars 1400→1750 (x26, the comedy law's first live contact): the old cap was sized against the
// pre-comedy record (golden 1077 · mcgregor 1252 · c1-old's 1410 bloat flagged just over it). Six-rule
// texts run STRUCTURALLY longer — the moment sentence (~90) + two swap clauses (~130) + a legit free-cut
// (~180) put the measured legit ceiling ≈1650 over the mcgregor max; 1750 = that + margin, still tight
// enough that paragraph bloat flags. CONTRACT CONSTANT — flagged to the owner's eye at landing.
export function goldenViolations(text, { subjectLook = "", lens = "85mm", wantCuts = 0, castNames = [], maxLines = 16, maxChars = 1750, requireSwap = false, durationSec = 0, partiesNamed = 0, handle = "", plateNouns = null, swapSlots = 0, coGuises = [], ledger = null, context = null } = {}) {
  const t = String(text || "");
  const v = [];
  const cuts = cutLinesOf(t);
  const lines = t.split("\n").map((l) => l.trim()).filter(Boolean);
  if (!cuts.length) return [{ rule: "no-cuts", cut: null }];
  if (wantCuts && cuts.length !== wantCuts) v.push({ rule: "cut-count", cut: null, detail: `${cuts.length}/${wantCuts}` });
  // per-cut: wide framing, lens termination, subject presence, size words, camera words
  const lensEsc = lens.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const lensEnd = new RegExp(`Shot on an? ${lensEsc} lens\\.$`, "i");
  const lensInline = new RegExp(`shot on an? ${lensEsc} lens`, "i");   // hybrid: the capture sentence carries the lens inline ("…, shot on an 85mm lens. <action>…")
  const stamped = cuts.some((c) => STAMPED_CUT.test(c));
  const subjToks = subjectLook ? [...new Set(ledgerToks(subjectLook))] : [];
  const handleLc = handle.trim().toLowerCase();
  cuts.forEach((c, i) => {
    if (!/\ba wide shot\b/i.test(c)) v.push({ rule: "wide", cut: i + 1 });
    if (!(stamped ? lensInline : lensEnd).test(c)) v.push({ rule: "lens", cut: i + 1 });
    // stamp consistency: a stamped text stamps EVERY cut, ascending — one shape per prompt, never a mix
    if (stamped && !STAMPED_CUT.test(c)) v.push({ rule: "stamp-missing", cut: i + 1 });
    if (SIZE_WORDS.test(c)) v.push({ rule: "size-word", cut: i + 1 });
    if (CAMERA_WORDS.test(c)) v.push({ rule: "camera-word", cut: i + 1 });
    if (TEMPO_WORDS.test(c)) v.push({ rule: "tempo-word", cut: i + 1 });   // speed is DELIVERY — the law's own words, now enforced
    if (QUALITY_WORDS.test(c)) v.push({ rule: "quality-word", cut: i + 1 });
    if (COMMENT_ADVERBS.test(c)) v.push({ rule: "comment-adverb", cut: i + 1 });   // rule 5's face: play it straight — describe the act, never the comedy of it
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
  if (stamped) {
    const times = cuts.map((c) => Number((c.match(/^\[(\d+(?:\.\d+)?)s\]/) || [])[1])).filter(Number.isFinite);
    if (times.length >= 2 && times.some((t2, i2) => i2 && t2 <= times[i2 - 1])) v.push({ rule: "stamps-not-ascending", cut: null });
    if (times.length && times[0] !== 0) v.push({ rule: "stamps-not-ascending", cut: null, detail: `first stamp [${times[0]}s]` });
  }
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
  // ── COMEDY-LAW VALIDATORS (owner-ratified round) — ACTIVE ONLY when context facts ride (legacy calls
  // unchanged; the golden predates harvested context and must keep scoring zero). Commitment is validated,
  // the joke is never scored.
  if (context && cuts.length) {
    // hyphenated material expands to its parts ("ten-count" also banks "ten" + "count") so the writer's
    // natural re-articulation of the SAME noun never reads as an import.
    const matSet = new Set(ledgerToks([subjectLook, handle, ...(context.subjectContext || []), ...(context.venueVocabulary || []), ...(context.collision || []), context.moment || "", ...coGuises, ...cuts.slice(0, -1), ...(Array.isArray(plateNouns) ? plateNouns.flat() : [])].join(" ")).flatMap((tok) => tok.includes("-") ? [tok, ...tok.split("-")] : [tok]));
    // rule 4's face: the last cut escalates the SAME material. Scaffolding is stripped (the stamp/CUT-N
    // prefix would read fresh every time), and freshness counts only NOUN-WEIGHT tokens (≥6 chars — the
    // register's articulation words run short: holds/line/waits; its imported OBJECTS run long: stallion/
    // pyrotechnic/fountains). ≥2 fresh noun-weight tokens = an imported element. Fixture-calibrated BOTH
    // directions: "holds the rope through the count as the line waits" → 1 (through) PASSES; "rides a white
    // stallion through pyrotechnic fountains backstage" → 4 FLAGS. Loud detail: a false positive costs one
    // targeted re-ask naming the tokens, never a kill.
    const lastAction = cuts[cuts.length - 1].replace(/^\[\d+(?:\.\d+)?s\]\s*cut \d+\s*[—:-]\s*/i, "");
    // ARTICULATION FILTER (x26 false positive: "shudders behind" — a verb + a preposition read as imported
    // material and killed the writer). Closed-class spatial/relational words are ENUMERABLE and never an
    // imported OBJECT; excluding them leaves open-class noun-weight tokens as the import signal.
    const ART_STOP = new Set(["behind", "through", "across", "toward", "towards", "beneath", "around", "against", "between", "inside", "outside", "beyond", "underneath", "before", "beside", "within", "without", "during", "upward", "upwards", "downward", "downwards", "forward", "forwards", "backward", "backwards", "together", "overhead", "alongside"]);
    // SECOND ARTICULATION CLASS (x26g: "[shoulder straining]" flagged): BODY-PART tokens are articulation on
    // ESTABLISHED bodies, never imported objects — closed class, always excluded. A GERUND is excluded ONLY
    // when it rides a body part (pair-context: "shoulder straining", "fist clenching") — a gerund on a
    // genuinely-new OBJECT still counts ("juggling chainsaws" flags), which the fixture pins both ways.
    const BODY_PARTS = new Set(["shoulder", "shoulders", "elbow", "elbows", "forearm", "forearms", "wrist", "wrists", "knuckle", "knuckles", "knee", "knees", "fist", "fists", "torso", "haunches", "shoulderblade", "shoulderblades", "hamstring", "hamstrings", "bicep", "biceps", "tricep", "triceps"]);
    const seq = ledgerToks(lastAction);
    const gerundOnBody = new Set();
    for (let gi = 0; gi < seq.length; gi++) if (/ing$/.test(seq[gi]) && (BODY_PARTS.has(seq[gi - 1] || "") || BODY_PARTS.has(seq[gi + 1] || ""))) gerundOnBody.add(seq[gi]);
    const fresh = [...new Set(seq)].filter((tok) => !matSet.has(tok) && !/^\d+s?$/.test(tok) && tok.length >= 6 && !ART_STOP.has(tok) && !BODY_PARTS.has(tok) && !gerundOnBody.has(tok));
    // ⚠ ADVISORY ONLY (owner 2026-08-16: «lets go advisory on payoff-import») — 0-for-3 in production: every
    // real firing was a false positive (spatial → body-part → bare verb+gerund), three writes killed incl.
    // the series' best. The rule-4 LAW still teaches the writer; this heuristic REPORTS loudly and never
    // re-asks, never kills.
    // ⚠⚠⚠ DOUBLY DEAD (owner 2026-08-16, second refinement): rule 4's "nothing new enters" clause is DELETED
    // from the law itself — an invented GAG OBJECT in a cut payoff is lawful (his example: MJ running off
    // with a buggy absent from frame0, arriving in the cut payoff). So this heuristic enforced the wrong
    // TEST (novelty vs establishment) of a clause that no longer EXISTS. The boundary lives where it always
    // belonged: the beat-zero block's hard-cut clause (a prop in a CUT-TO world, established in that cut's
    // first beat, same premises) + materialise-vs-route for the continuous shot.
    // ⚠⚠ THE PREMISE ITSELF WAS WRONG, independent of the regex (owner doctrine 2026-08-16): a payoff is «a
    // moment… a potential that can encompass many elements that are permitted in our architecture… it can be
    // in a continous action, a cut, anything permitted». The REAL constraint is ESTABLISHMENT/ROUTE, never
    // NOVELTY — already law in the shared beat-zero block (materialise-vs-arrive, THE TEST, hard-cut-resets):
    // a new element is lawful in frame0, established in the first beat, or arriving by a route the frame
    // contains — and a CUT is itself a lawful route (the MJ parking-lot payoff introduces whole new scenery
    // lawfully). The owner's observed defect was a table thrown-onto that was NEVER established — awkward
    // invocation, not novelty. Post-freeze option (his later call): ONE cheap semantic call asking «is this
    // element ESTABLISHED, or does it arrive by a route the frame contains?» (~$…) — never "is this word
    // new"; a regex is structurally unable to answer either question.
    if (fresh.length >= 2) console.warn(`  ⚠ payoff-import ADVISORY (cut ${cuts.length}): ${fresh.slice(0, 4).join(" ")} — reported, not enforced`);
    // context-spend: when the venue's own nouns rode in as facts, at least one must surface in the text —
    // spoken or handled; harvested material the writer never touches is the contract failing silently.
    const vv = (context.venueVocabulary || []).map((n) => ledgerToks(n)).filter((a) => a.length);
    if (vv.length && !vv.some((toks) => toks.some((tok) => t.toLowerCase().includes(tok)))) v.push({ rule: "context-unspent", cut: null });
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
// lawBlocks (substitution merge, owner 2026-08-15): the adopted _beat_law/_invoke instruction blocks arrive as
// STRINGS composed by the caller — this module stays PURE (no env, no imports of env-reading modules); the
// blocks sit between the CUTS list and the mechanical RULES. stamps engage the ratified HYBRID output shape.
// freeCuts (owner 2026-08-15, single-world multi-cut): the writer chooses the cut count by SCENE DEMAND and
// REGISTER — no floor, and "no more than that which robs scene's intent and effectiveness" (no padding). Only
// the celeb/ip/crossover lane enters here (the double-gate); each cut still carries the full hybrid capture.
// context (owner 2026-08-15, materials-conditioned recall): {subjectContext:[], venueVocabulary:[], collision:[]}
// — per-gen harvested FACTS. De-named visual clauses with physics + the venue's own speakable/handleable
// nouns. Data the laws can point at; never law text itself.
export function factContract({ userPrompt, cutList, cutCount, subjectLook, lens, payoff = "", swap = "", charSig = "", maxLines = 16, coFigures = [], register = "", handle = "", lawBlocks = [], stamps = [], freeCuts = false, durationSec = 0, context = null, places = [] }) {
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
${register ? `REGISTER: ${register} — given, not chosen.\n` : ""}${stamps.length ? `LENS: every cut's capture sentence carries ", shot on ${art} ${lens} lens." — its one lawful home; no lens or framing words anywhere else.` : `LENS LINE: end every cut with "Shot on ${art} ${lens} lens."`}
${swap ? `SWAP: ${swap} — SAY WHO HE REPLACES, in the first cut he appears: "takes the place of the <role> — same position and scale".\n` : ""}${(coFigures || []).map((c) => `CO-FIGURE: ${c.guise}${c.nameable ? ` — may be named "${c.name}"` : ` — NEVER any name (not "${c.name}"); the reference carries its identity, your description carries only what it DOES`}.${c.swapRole ? ` In its first cut it ${ipSwapClause(c.swapRole)}.` : ""} It speaks when the scene calls for it — write its lines IN CHARACTER${c.nameable ? "" : ", labeled by its role noun"}; if its canon is wordless, write its response-turn in its own register. The WORDS are yours; the voice and mannerism are the model's.\n`).join("")}${payoff ? `PAYOFF MATERIAL: ${payoff}\n` : ""}${context?.subjectContext?.length ? `SUBJECT CONTEXT — the subject's signatures as PHYSICS, deployable as the manner of ordinary actions: ${context.subjectContext.join("; ")}.\n` : ""}${context?.venueVocabulary?.length ? `VENUE VOCABULARY — this place's own nouns, for DIALOGUE and ACTION only (spoken or handled, never written on anything): ${context.venueVocabulary.join(", ")}.\n` : ""}${context?.collision?.length ? `COLLISION MATERIAL: ${context.collision.join("; ")}.\n` : ""}${context?.moment ? `THE MOMENT — script THIS, the particular not the general: ${context.moment}\n` : ""}${charSig ? `SIGNATURE IN THE REFERENCE: ${charSig}\n` : ""}${(places || []).filter(Boolean).length ? `CUT PLACES — from the photograph itself, use VERBATIM as each capture sentence place: ${places.map((pl, pi) => `Cut ${pi + 1} = ${pl}`).join("; ")}.\n` : ""}CUTS, IN ORDER:
${cutList}
${lawBlocks.length ? `\n${lawBlocks.filter(Boolean).join("\n")}` : ""}
RULES — each is checked mechanically after you write:
${freeCuts
    ? `1. Each cut: "[Ns] CUT N — A wide shot of <that cut given place>, shot on ${art} ${lens} lens. <the subject> <does the action>." YOU choose the cut count — as many as the scene's intent needs and no more (padding robs the scene; one cut is a full answer when the scene wants one). Stamp cuts ascending from [0s], spread across the ${durationSec || 6}-second clip. The capture sentence is the one home for framing and lens; nothing about how the scene is seen anywhere else.`
    : stamps.length
    ? `1. One line per cut: "[Ns] CUT N — A wide shot of <that cut given place>, shot on ${art} ${lens} lens. <the subject> <does the action>." Use these stamps in order, one per cut: ${stamps.map((t) => `[${t}s]`).join(" ")} — the bracket is the cut's start time. The capture sentence is the one home for framing and lens; nothing about how the scene is seen anywhere else.`
    : `1. One line per cut: "Cut N: A wide shot of <that cut given place>. <subject look> <does the action>. Shot on ${art} ${lens} lens."`}
2. The subject acts in EVERY cut; no cut belongs to anyone else. The set's other people stay exactly where the photographs show them.
2b. CONTACT, not scenery: each cut's action stages ON that photograph's own objects and people, by DEFINITE ARTICLE — and every noun you write must be FINDABLE in that photograph.
${lawBlocks.length ? "" : `3. The LAST cut lands one payoff, transformed from something already in that photograph; each element pays off once; real-world brand surfaces render blank.\n`}${lawBlocks.length ? "3" : "4"}. Speech goes under "Dialogue:", every line labeled "Name/Role:", aimed at someone in the frame.
${lawBlocks.length ? "4" : "5"}. Nothing else — no opener line, no scene prose outside the cut lines, at most ${maxLines} lines.
Return ONLY the lines described.`;
}
