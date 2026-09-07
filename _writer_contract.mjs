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
// ⭐ TEMPO IS DELIVERY, NOT ACTION — GENERAL RULE (owner 2026-08-15). The shared law already says it: «Write
// WHAT IS SAID and WHAT HAPPENS; never how it is shot, lit or DELIVERED». Enforcement only ever covered camera
// MOVES, so speed words walked through and x27d rendered in slow motion off "a slow swing" / "a slow, looping
// arc". ⚠ THE RULE IS THE WHOLE SPEED FAMILY, NOT A LIST OF MOTIONS IT MAY MODIFY: an earlier draft narrowed
// it to "slow" + motion nouns so a battery fixture would keep passing, which is case-law shaped around one
// sample — the owner's standing preference is a general ruling, and the fixture changes to match the law, not
// the reverse. A beat states that a punch lands; how fast it lands is the renderer's, not the writer's.
const TEMPO_WORDS = /\b(?:slow(?:ly|er|est)?|slo-?mo(?:tion)?|fast(?:er|est)?|quick(?:ly|er)?|rapid(?:ly)?|swift(?:ly)?|time-?lapse|sped[- ]?up)\b/i;
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
/** DISTINCT cut NUMBERS, not cut LINES — cuts are VANTAGES, beats are moments, and the law admits many beats
 *  inside one vantage ("One line per BEAT, every one of them inside the SAME cut"). Counting LINES made the law
 *  and this check MUTUALLY UNSATISFIABLE the moment a scene wanted several beats off one plate: x31 asked for
 *  3 beats on 1 sourced ref, scored cut-count [3/1], and no re-ask could ever satisfy both — the writer was
 *  punished for obeying its own contract. _ground_shotset counted distinctly already; this is the other half. */
export const cutNumbersOf = (text) => {
  const labelled = cutLinesOf(text);
  if (labelled.length) return new Set(labelled.map((l) => ((l.match(/\bCUT\s*(\d+)/i) || [])[1]) ?? "1")).size;
  // ⭐ A STAMPED, UNLABELLED SCRIPT IS ONE VANTAGE — the shape factContract MANDATES for a single plate ("One
  // line per BEAT and NO cut label anywhere"). Returning 0 here made the two counters disagree on the very
  // shape the law orders: goldenViolations scored it CLEAN while _ground_shotset's pre-check (:252,
  // cutCount(lines) !== wantCuts) read 0 !== 1 and threw the compliant script away for a PAID prose-model rewrite
  // — and the rewrite re-adds "CUT 1 —" per line, which is precisely what x37 emitted. I reported that as the
  // writer IGNORING the new law. It obeyed; this counter overwrote it. Same two-predicates-drifted class I had
  // just written three commits about, introduced by my own cut-law change and caught by the vacuum probe.
  // Prose carries its vantage in the capture sentence and has no stamps, so it is left to the caller's own
  // shape handling rather than guessed at here.
  return /^\[\d+(?:\.\d+)?s\]/m.test(String(text || "")) ? 1 : 0;
};
const STAMPED_CUT = /^\[\d+(?:\.\d+)?s\]\s*cut \d+/i;

/** The MJ golden properties as violations. [] = the text IS the shape. Each violation carries the rule name and
 *  (where per-cut) the 1-indexed cut, so the caller's re-ask can name EXACTLY what to fix and nothing else. */
export const SWAP_GRAMMAR = /\b(takes? (?:the )?place of|in place of|exactly where the [\w\s'-]{1,30}(?:stands|sits|waits|works)|(?:at|onto|into) the [\w\s'-]{1,30}(?:'s)? (?:mark|spot|position)\b)/i;

// maxChars 1400→1750 (x26, the comedy law's first live contact): the old cap was sized against the
// pre-comedy record (golden 1077 · mcgregor 1252 · c1-old's 1410 bloat flagged just over it). Six-rule
// texts run STRUCTURALLY longer — the moment sentence (~90) + two swap clauses (~130) + a legit free-cut
// (~180) put the measured legit ceiling ≈1650 over the mcgregor max; 1750 = that + margin, still tight
// enough that paragraph bloat flags. CONTRACT CONSTANT — flagged to the owner's eye at landing.
// APPARATUS LAW (owner 2026-09-05/06): in a ridden or worn form the camera IS the rider. A cut that looks AT the rider
// or the vehicle from outside, or that carries no seat cue at all, has dismounted — 2026-09-05 the writer authored
// "a trike-borne rider pumps hard down the patterned carpet" from a plate showing a boy on a trike, and the ride was
// gone. Pure text predicates; the caller passes `apparatus: true` when the run recognised such a form.
// Riders ARE seen in a POV when the camera sits mid-train or at the back (owner 2026-09-06): the backs of heads,
// shoulders and raised arms in the rows ahead are the seat's own view. What dismounts is a rider or vehicle looked at
// from OUTSIDE the train (a kid on a tricycle watched from a doorway) or a rider doing a driver's work (pumping,
// pedalling, steering, swerving — impossible on rails, so always a view of someone else's ride).
const DISMOUNT_PARTS = [
  // a rider or figure on a non-train vehicle, looked at
  String.raw`\b(?:(?:a|the|one|another|some)\s+(?:[\w-]+\s+)?(?:rider|riders|cyclist|driver|passenger|boy|girl|kid|child|man|woman|figure)\s+(?:on|astride|aboard)\s+(?:a|the|his|her|their|its)\s+(?:trike|tricycle|bike|bicycle|kart|sled|board|skateboard|scooter|wagon|big wheel))\b`,
  String.raw`\b(?:trike|tricycle|bike|bicycle|kart|sled|scooter)-borne\b`,
  // a rider doing a driver's work — impossible on rails, so always someone else's ride
  String.raw`\b(?:the|a)\s+(?:rider|cyclist|driver|passenger)\s+(?:veers|swerves|pumps|pedals|steers|brakes|aims|weaves)\b`,
  String.raw`\bwatch(?:es|ing)?\s+(?:the|a)\s+(?:ride|rider|riders|cart|car|coaster|train)\b`,
  String.raw`\b(?:from|on)\s+the\s+(?:sidelines?|platform|ground|shore|balcony|doorway|curb|pavement)\b`,
  // the vehicle described from the ROOM (owner 2026-09-06: "the coaster carves past them" is the room's view, not the seat's)
  String.raw`\b(?:the|a)\s+(?:car|cart|coaster|train|ride|carriage)\s+(?:whips|carves|barrels|races|roars|plunges|swoops|tears|rips|hurtles|rockets|thunders|slaloms|spirals|screams|charges|blasts|slices|weaves)\s+(?:past|by|through|around|between|into)\s+(?:them|it|the crowd|the diners|the guests|the room|the tables|the figures|the people|everyone|the onlookers|the dancers|the patrons)\b`,
  // the room performing for the ride (owner 2026-09-06: the ride is voyeuristic — the riders see the room; it does not react)
  String.raw`\b(?:the crowd|the diners|the guests|the room'?s?(?: gathered)? figures|the figures|the people|the onlookers|the patrons|the dancers|bystanders|everyone)\b[^.;]{0,50}\b(?:press(?:es|ed)? back|lean(?:s|ed|ing)? away|scatter(?:s|ed)?|part(?:s|ed)?|recoil(?:s|ed)?|flinch(?:es|ed)?|duck(?:s|ed)?|gasp(?:s|ed)?|startled|leap(?:s|ed)? (?:back|aside)|give(?:s)? (?:the turn|it|the car|the ride) room)\b`,
];
const DISMOUNT = new RegExp(DISMOUNT_PARTS.join("|"), "i");
// a seat cue is a seat OBJECT, never a motion word (owner 2026-09-06: "the turn" alone let a ballroom cut through)
const SEAT = /\b(?:rails?|tracks?|lap bar|restraint|harness(?:es)?|handlebars?|grab bar|safety bar|restraint bar|bar across (?:the|my|our|their) (?:laps?|chests?|waists?)|hands?|gloves|knuckles|car nose|nose of the car|the car'?s? (?:nose|front)|hood|visor|goggles|the seat|from the seat|rows? ahead|the row in front|backs? of (?:heads|riders)|train ahead|car ahead|seats? ahead)\b/i;
const INVERSION = /\b(?:loop(?:s|ing|ed)?|loop-the-loop|inversions?|upside[- ]down|inverted|corkscrews?|barrel[- ]rolls?)\b/i;
const FACEFILL = /\b(?:fills? the (?:frame|lens|screen|shot)|filling the (?:frame|lens|screen)|faces? (?:fill|loom)s?\b|inches from (?:a|the|her|his|their) faces?|straight into (?:a|the|her|his|their) faces?|close-up (?:of|on) (?:a|the|her|his|their) faces?|between the two (?:girls|twins|figures))/i;
// REFERENCE-DEPENDENT GENS NEVER CUT TO AN UNPHOTOGRAPHED PLACE (owner 2026-09-06: "we do hard cut to unphotographed places
// sometimes. however, where this is a reference-dependent gen like the overlook hotel and or a disney type ride, these can't
// be unphotographed cuts"). A named work or venue is the reference; a cut the plates do not carry is a place the model
// invents — a dark-wood corridor where the Overlook's hexagons should be. Counts "hard cut to" lines against the cut plates.
export const HARD_CUT = /\bhard cuts?\s+to\b/gi;
export function unphotographedCuts(text, cutPlates = 0) {
  const n = (String(text || "").match(HARD_CUT) || []).length;
  return Math.max(0, n - Math.max(0, Number(cutPlates) || 0));
}
// WHATEVER THE RAILS REACH IS MET AT SPEED (owner 2026-09-07, job 17b1f0fd: "Jack stands where the plate holds him … not swinging,
// not yet … the coaster clatters past close enough to stir the powder near his boots, and he lets it go by without turning" — a
// figure the ride passed close, written as a statue). A stillness phrase + a passage-close phrase + no reaction on the figure.
const STILL = /\b(?:stands?|standing|stood) (?:where|still|motionless|there|at|by|in|beside|on)\b|\b(?:holds? (?:still|position)|motionless|frozen (?:in place|still)|unmoving|does not move|doesn't move|without moving|not moving|waits? there|waiting|lets? it (?:go|pass|rush|roll) by|without turning|does not turn|doesn't turn)\b/i;
const CLOSE_PASS = /\b(?:clatters?|rattles?|roars?|rushes?|races?|sweeps?|whips?|passes?|goes|hurtles?|barrels?) (?:past|by)\b|\bclose enough\b|\binches? (?:from|past)\b|\bbrush(?:es|ing)? (?:past|by)\b|\bnear(?:ly)? (?:his|her|their) (?:boots|feet|shoulder|face|coat)\b|\bpast (?:him|her|them)\b/i;
const REACTS = /\b(?:steps? (?:back|aside|away|clear|off)|leaps?|lunges?|dives?|ducks?|flinch(?:es|ing)?|recoils?|staggers?|stumbles?|scrambles?|swings? (?:the|his|her|at|it|round|around)|spins?|wheels? (?:round|around)|is (?:thrown|knocked|swept|shoved|blown|spun)|blown back|(?:coat|hair|scarf|hat|dress|sleeves?) (?:whips?|snaps?|lifts?|flies|tears?)|snatches?|jumps? (?:back|aside|clear)|bolts?|throws? (?:himself|herself|themselves)|shoved aside|pushed aside|knocked aside)\b/i;
// THE RAILS NEVER END ON SCREEN (owner 2026-09-07: "a constant problem because that doesn't happen in rollercoaster"): no cut may
// end the track, and the payoff cut must send the rails ON — through, past, out of the frame — as its final words.
const RAILS_END = /\b(?:rails?|track|tracks) (?:end|ends|ending|stop|stops|stopping|terminate|terminates|run out|runs out|give out|gives out|dead-?end|dead-?ends|halt|halts)\b/i;
// the RIDE goes on: the rails running, or the car/train diving through what the payoff releases (the 12-second Shining ride the owner
// praised ends "submerging the car as the car dives into the red deluge" — engulfed at speed is a ride; a stopped track is not)
const RAILS_ON = /\b(?:rails?|track|tracks|car|cars|train|coaster|ride)\b[^.!?]{0,90}\b(?:run|runs|running|carry|carries|carrying|continue|continues|continuing|race|races|racing|rush|rushes|rushing|stretch|stretches|stretching|curve|curves|curving|bank|banks|banking|drop|drops|dropping|climb|climbs|climbing|lead|leads|leading|plunge|plunges|plunging|dive|dives|diving|hurtle|hurtles|hurtling|barrel|barrels|barreling|tear|tears|tearing|vanish|vanishes|vanishing|disappear|disappears|disappearing|go|goes|going|carries? on|roll|rolls|rolling)\b[^.!?]{0,60}\b(?:on|onward|onwards|ahead|through|into|past|beyond|out of|away|around|down|up|off|under)\b/i;
export function railsFinding(cutText, { last = false } = {}) {
  const t = String(cutText || "");
  const e = t.match(RAILS_END);
  if (e) return `the rails end: "${e[0]}" — a rollercoaster's track never ends on screen; the rails run on through the payoff and out of the frame`;
  if (last) {
    const sentences = t.replace(/^\s*(?:Cut\s+\d+\s*:|\[\d+(?:\.\d+)?s\])\s*/i, "").split(/(?<=[.!?])\s+/).filter(Boolean);
    const tail = sentences[sentences.length - 1] || t;
    if (!RAILS_ON.test(tail)) return "the payoff does not send the ride on — the last words of the last cut say where it goes: the rails through the doors and out of the frame, or the car diving through what the payoff releases";
  }
  return null;
}
export function statueFinding(cutText) {
  const t = String(cutText || "");
  const s = t.match(STILL);
  if (!s || !CLOSE_PASS.test(t) || REACTS.test(t)) return null;
  return `a figure the ride reaches is held still: "${s[0]}" — the ride is the event; whatever the rails pass close is acted upon (steps back, is blown, swings, turns with it), never a statue`;
}
export function apparatusFinding(cutText, { interior = false, last = false } = {}) {
  const t = String(cutText || "");
  const m = t.match(DISMOUNT);
  if (m) return `dismounted: "${m[0]}" — the camera rides the train; riders appear only as the seat sees them (backs, shoulders, arms up in the rows ahead), never looked at from outside`;
  if (!SEAT.test(t)) return "no seat cue — every cut opens from the seat (the rails ahead, the lap bar, the hands)";   // "the bar" alone is a LOUNGE ("around the bar" passed a doorway shot on job 4c0c2aff); a seat's bar is the lap/safety/restraint bar
  const st = statueFinding(t);
  if (st) return st;
  const rl = railsFinding(t, { last });
  if (rl) return rl;
  const inv = interior ? t.match(INVERSION) : null;
  if (inv) return `inverted indoors: "${inv[0]}" — a corridor or room hosts straight runs, dips and banks at corners, never a loop or inversion (owner 2026-09-06: the frame diffuses into nothing true)`;
  const ff = last ? t.match(FACEFILL) : null;
  if (ff) return `payoff stops on a face: "${ff[0]}" — the ride passes THROUGH or BY at speed; the frame never ends on a face and figures keep the room's scale`;
  return null;
}

export function writerFindings(text, { subjectLook = "", lens = "85mm", wantCuts = 0, castNames = [], maxLines = 16, maxChars = 1750, requireSwap = false, durationSec = 0, partiesNamed = 0, dialogueWords = 0, stamps = [], handle = "", plateNouns = null, plateWords = null, swapSlots = 0, coGuises = [], ledger = null, context = null, apparatus = false, apparatusInterior = false, referenceDependent = false, cutPlates = 0, cutsAreMax = false } = {}) {
  const t = String(text || "");
  const v = [];
  const lines = t.split("\n").map((l) => l.trim()).filter(Boolean);
  // ⭐⭐ A CUT IS NAMED ONLY WHEN THERE IS MORE THAN ONE, AND ONLY AT THE MOMENT IT HAPPENS (owner 2026-08-16,
  // holding up the seaworld-rabbit script as the shape: "[0s] White Rabbit … stands balanced on the orca's
  // back" / "[4s] Hard cut to the … meme" — bare stamped beats, the cut spoken in the PROSE where it occurs,
  // never a label on every line). x35 emitted "CUT 1 — A wide shot of the boxing ring, shot on a 200mm lens."
  // THREE TIMES because the law told it to and these validators required it per line. The label was noise on a
  // single-vantage script, and the capture sentence tripled the identity surface handed to the © gate.
  // So a script may be BARE-STAMPED: beats carry [Ns] and no cut label at all. That is ONE cut by definition.
  // ⚠ The MULTI-cut shape is untouched — the MJ golden's "Cut 1: / Cut 2: / Cut 3:" genuinely has three cuts,
  // and naming each AT its moment is exactly the owner's rule, not an exception to it.
  const STAMP_ONLY = /^\[\d+(?:\.\d+)?s\]/;
  const labelled = cutLinesOf(t);
  const bareBeats = labelled.length ? [] : lines.filter((l) => STAMP_ONLY.test(l));
  const bareSingle = !labelled.length && bareBeats.length > 0;
  // ⭐ PROSE IS A SHAPE THE RECORD CLEARED WITH (replay, 2026-08-16). THREE delivered celeb scripts carry no cut
  // label and no stamp at all — the x32-era Tyson ("Shot on a 200mm lens. A wide shot. In the boxing ring from
  // the photograph, a bald, stocky man…") and both Trump clears. Every one of them scored the FATAL `no-cuts`
  // under this checker, so the writer producing the shape that cleared BEST would have been killed at the desk.
  // no-cuts must mean "nothing renderable", not "no marker": a capture sentence declares a vantage whether or
  // not anyone labelled it. Pure prose with no capture still fires, which is the case the rule was written for.
  const _lensEsc0 = lens.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const proseCapture = !labelled.length && !bareBeats.length
    && /\ba wide shot\b/i.test(t) && new RegExp(`shot on an? ${_lensEsc0} lens`, "i").test(t);
  const cuts = bareSingle ? bareBeats : labelled.length ? labelled : proseCapture ? [t.replace(/\n/g, " ")] : [];
  if (!cuts.length) return [{ rule: "no-cuts", cut: null }];
  const cutNums = bareSingle ? 1 : cutNumbersOf(t);
  if (apparatus) cuts.forEach((c, i) => { const why = apparatusFinding(c, { interior: apparatusInterior, last: i === cuts.length - 1 }); if (why) v.push({ rule: "apparatus", cut: i + 1, detail: why }); });
  if (referenceDependent) { const extra = unphotographedCuts(t, cutPlates); if (extra) v.push({ rule: "unphotographed-cut", cut: null, detail: `${extra} hard cut(s) to a place no plate carries — this gen depends on its references; the story reaches that place within a photographed plate or not at all` }); }
  // ⚠ ADVISORY, DELIBERATELY NOT FATAL. The law and the re-ask both now instruct the bare shape, so a labelled
  // single-cut script means the writer ignored an explicit instruction — worth SEEING, not worth killing a
  // $… run over, and promoting it to a violation would risk exactly the unsatisfiable-gate class that has
  // cost three runs this session. If the record shows the writer complying, this stays advisory forever; if it
  // shows the label surviving the instruction, that is the evidence for promoting it.
  if (labelled.length && wantCuts === 1)
    v.push({ rule: "cut-label-on-single", advisory: true, cut: null, detail: `${labelled.length} labelled line(s) on a one-cut script — a cut is named only when there is more than one` });
  // cutsAreMax (owner 2026-09-06, the writer chooses the join): the plate count is a CEILING — fewer cuts means a carried
  // section spent two photographs on one label; more cuts than photographs is still the ungrounded-vantage failure.
  if (wantCuts && (cutsAreMax ? cutNums > wantCuts : cutNums !== wantCuts)) v.push({ rule: "cut-count", cut: null, detail: `${cutNums}/${wantCuts}${cutsAreMax ? " max" : ""}` });
  // per-cut: subject presence, size words, camera words. (The wide/lens REQUIREMENTS are retired — owner
  // 2026-09-01: lens language is gone everywhere; wide is a SOURCING criterion, never prompted.)
  // "stamped" selects the INLINE lens test over the end-of-line one. Bare beats and PROSE both carry the capture
  // mid-line — the x32-era clear opens "Shot on a 200mm lens. A wide shot. In the boxing ring…" — so requiring
  // the line to END with the lens flags a script whose lens is right there in the first sentence. Same
  // shape-coupling as everything else this week: the predicate encoded one layout as the only layout.
  const stamped = (bareSingle || proseCapture) ? true : cuts.some((c) => STAMPED_CUT.test(c));
  const subjToks = subjectLook ? [...new Set(ledgerToks(subjectLook))] : [];
  let censusHit = false;   // bare-single restaging: did ANY beat touch the plate census (asked once, after the loop)
  // ⭐⭐ THE HANDLE IS SELF-DECLARED (owner 2026-08-15: multi-cut must «not produce doubles and trip»). The swap
  // FACT is generic — "the ONE person at the action spot" — but the WRITER names the role in its own first cut
  // ("takes the place of the boxer"). That noun IS the handle, so no scene-roles census is needed to unlock it.
  // ⚠ SUPERSEDED IN PART, KEPT DELIBERATELY (coherence audit 2026-08-16): this was written when the identity law
  // demanded look tokens in EVERY cut, and deriving a handle was how multi-cut survived. The law has since been
  // RELAXED TO THE RECORD — later cuts may omit the subject entirely — so the derivation no longer turns a
  // requirement off. What it still does is give a later cut a SECOND lawful way to carry him ("the boxer"
  // satisfies presence exactly as a trait subset does), and it gates the once-only "matching the reference"
  // check. It composes with the record's carrier rather than competing with it; neither is load-bearing alone.
  const _declared = cuts.length > 1 && !handle.trim()
    ? (cuts[0].match(/takes? the place of the ([a-z][a-z ]{2,24}?)(?=\s*[—,.]|\s+at\b|\s+in\b|\s+on\b|$)/i) || [])[1]
    : null;
  const handleLc = (handle.trim() || (_declared || "").trim()).toLowerCase();
  // ⭐ PLATE INDEX ≠ LINE ORDINAL (2026-08-16, the other half of the x31 fix). `cuts` is beat LINES; plateNouns
  // and plateWords are built ONE PER PLATE by the caller (reads.map). Under the ratified shape — several beats
  // inside CUT 1 off one plate — indexing them by the line ordinal made plateNouns[1..n] undefined, so the
  // Array.isArray guards short-circuited and RESTAGING + PLATE-DRESSING silently skipped on every beat after the
  // first: the moat enforced on one line in three, reporting clean. On a genuine multi-plate run it was worse —
  // a lawful beat scored against the WRONG plate's census. The cut NUMBER is the plate index; the line's
  // position is not. cutNumbersOf got this conversion when x31 was fixed; these two call sites did not.
  const plateIdxOf = (line) => Math.max(0, (Number((String(line).match(/\bCUT\s*(\d+)/i) || [])[1]) || 1) - 1);
  cuts.forEach((c, i) => {
    const pi = plateIdxOf(c);
    // stamp consistency: a stamped text stamps EVERY cut, ascending — one shape per prompt, never a mix
    if (stamped && !(bareSingle ? STAMP_ONLY : STAMPED_CUT).test(c)) v.push({ rule: "stamp-missing", cut: i + 1 });
    if (SIZE_WORDS.test(c)) v.push({ rule: "size-word", cut: i + 1 });
    if (CAMERA_WORDS.test(c)) v.push({ rule: "camera-word", cut: i + 1 });
    if (TEMPO_WORDS.test(c)) v.push({ rule: "tempo-word", cut: i + 1 });   // speed is DELIVERY — the law's own words, now enforced
    if (QUALITY_WORDS.test(c)) v.push({ rule: "quality-word", cut: i + 1 });
    if (COMMENT_ADVERBS.test(c)) v.push({ rule: "comment-adverb", cut: i + 1 });   // rule 5's face: play it straight — describe the act, never the comedy of it
    // ⭐ IDENTITY, RELAXED TO THE RECORD (owner 2026-08-16: «yes your subject-missing validator is stricter
    // than the record»). The cleared multi-cut corpus, read off the prompts: MJ 3 cuts / McGregor 4 / Tysonfeud
    // 3 — and TWO of the three contain a cut with NO subject at all (McGregor's panel-only Cut 3, Tysonfeud's
    // survey-board Cut 2), both DELIVERED. So subject-in-EVERY-cut is MJ's golden SHAPE, never a gate law.
    // WHAT SURVIVES AS LAW: the FIRST cut carries the subject — universal across all three clears, and the
    // frame-zero/swap law needs the likeness established at frame zero. LATER CUTS MAY OMIT HIM: a reaction
    // cut, an object cut, or a beat carried by pronoun all read as "no look tokens" and are lawful; absence is
    // REPORTED (the golden prefers presence) and never a violation. Re-description in a later cut still flags —
    // the record's own carry is a definite-article trait SUBSET, never the full phrase again.
    const tokHits = subjToks.filter((tok) => c.toLowerCase().includes(tok)).length;
    const subjectThin = subjToks.length >= 2 && tokHits < 2 && (!handleLc || !c.toLowerCase().includes(handleLc));
    if (i === 0) {
      if (subjectThin) v.push({ rule: "subject-missing", cut: 1 });
    } else {
      if (subjectThin) v.push({ rule: "subject-missing", advisory: true, cut: i + 1, detail: "lawful (McGregor/Tysonfeud both cleared with one), reported because the golden prefers presence" });
      // ⚠ VERBATIM ONLY (caught by the golden itself: a ≥4-shared-token test flagged MJ's own cuts 2-3,
      // which ARE the record's carry — 7 of 10 look tokens in a legal SUBSET). The distinguishing fact is not
      // how many traits repeat but whether the WHOLE phrase returns: a subset is the law, the full sequence
      // again is the repaint. Article-insensitive token-sequence containment; zero false positives by
      // construction, and it catches x30's actual behaviour (the full look restated per cut).
      if (subjToks.length >= 3 && ledgerToks(c).join(" ").includes(subjToks.join(" "))) v.push({ rule: "identity-redescribed", cut: i + 1 });
    }
    // RESTAGING (law 2's mechanical face): when this cut's plate CONTENTS are known, the beat must touch them —
    // ≥1 census noun in the cut line. Absent census = skip (fail-open; the wiring supplies it write-after-plate).
    if (Array.isArray(plateNouns) && Array.isArray(plateNouns[pi]) && plateNouns[pi].length) {
      const hit = plateNouns[pi].some((n) => n && c.toLowerCase().includes(String(n).toLowerCase()));
      // ⭐ RESTAGING IS PER CUT, AND A BARE-STAMPED SCRIPT IS ONE CUT (x36, caught live). Per-BEAT was only ever
      // passing because the old shape repeated "A wide shot of the boxing ring…" on every line — "boxing ring"
      // is itself a census noun, so the capture sentence was satisfying the check, not the beat's own content.
      // Removing that repetition made restaging fire on nearly every bare beat and killed the writer after two
      // re-asks. The law is "each CUT's action stages on that photograph's own objects"; with one cut that is
      // one question, asked of the whole script.
      if (bareSingle) censusHit = censusHit || hit;
      else if (!hit) v.push({ rule: "restaging", cut: i + 1 });
    }
    // ⭐⭐ NO ADJECTIVES ON PLATE NOUNS (owner 2026-08-15: «adjectives on plate nouns are banned, character
    // description stays… what it does to plate nouns is wrong. thats the difference»). WHY the two halves
    // differ: the CHARACTER is conjured, so describing it is how it gets rendered at all; the PLATE already
    // EXISTS, so describing it hands the model a second authority for something the photograph already owns —
    // the drift the whole moat is built to prevent (x27d: "elasticized ropes", "padded turnbuckle").
    // ⚠ CLOSED ALLOWLIST, NOT AN ADJECTIVE BANLIST — adjectives are open-class and a banlist would need a new
    // entry every run (the payoff-import lesson, 0-for-3). The authority for what a plate noun may carry is
    // THE PLATE READ ITSELF: a modifier the photograph's own description supplied ("the red trunks", where the
    // read said red) is the plate's and passes; one the writer invented is dressing and flags. The other legal
    // predecessors are a small closed set of articles/prepositions/possessives, plus another plate word (so a
    // compound the read supplied — "the canvas floor" — stays whole).
    // ⚠ TWO SETS, TWO JOBS (fixed after x29 flagged "[cut a]" and killed the write): the GOVERNED tokens are
    // the plate's CONTENT nouns (plateNouns — length-filtered, stop-listed), because only a thing can be
    // dressed; the ALLOWED predecessors are EVERY word the read used (plateWords), because a modifier the
    // photograph's own description supplied is the plate's. Governing on plateWords made the article "a" a
    // plate noun, so the contract's own shape — "CUT 1 — A wide shot of…" — flagged on every single cut.
    if (Array.isArray(plateWords) && Array.isArray(plateWords[pi]) && plateWords[pi].length
        && Array.isArray(plateNouns) && Array.isArray(plateNouns[pi])) {
      const governed = new Set(plateNouns[pi].map((w) => String(w).toLowerCase()));
      const owned = new Set(plateWords[pi].map((w) => String(w).toLowerCase()));
      const LEGAL = new Set(["the","a","an","his","her","its","their","our","this","that","these","those","and","or","of","on","at","in","into","onto","near","by","against","through","over","under","beside","behind","along","across","from","toward","towards","off","up","down","with","two","three","four"]);
      const toks = c.toLowerCase().match(/[a-z][a-z-]*/g) || [];
      for (let k = 1; k < toks.length; k++) {
        if (!governed.has(toks[k])) continue;                  // only the plate's CONTENT nouns are governed
        const prev = toks[k - 1];
        if (LEGAL.has(prev) || owned.has(prev)) continue;      // article/preposition, or plate-supplied word
        v.push({ rule: "plate-dressing", cut: i + 1, detail: `${prev} ${toks[k]}` });
        break;                                                 // one report per cut — the re-ask fixes the class
      }
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
    if (fresh.length >= 2) v.push({ rule: "payoff-import", advisory: true, cut: cuts.length, detail: fresh.slice(0, 4).join(" ") });
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
  // ⚠ NOTHING EVER CHECKED THAT THE SUPPLIED STAMPS WERE USED (x37: a single [0s] beat and no dialogue for a
  // SIX-second clip — five seconds of unscripted tail, the exact defect spanHeader exists to prevent).
  // stamp-missing only ever asked whether a line HAS a stamp, never whether the clip was filled. The law
  // already says "Use these stamps in order, one per beat" and x37 ignored it, so instruction alone does not
  // close this — but per the owner's ruling this REPORTS rather than kills: a thin script is a quality
  // failure, not a © or engine-mechanical one, and killing a run over it is what the prune exists to stop.
  if (Array.isArray(stamps) && stamps.length > 1) {
    const used = stamps.filter((sec) => new RegExp(`\\[${sec}(?:\\.\\d+)?s\\]`).test(t)).length;
    if (used < stamps.length)
      v.push({ rule: "stamps-unused", advisory: true, cut: null, detail: `${used}/${stamps.length} supplied stamps appear — the clip runs ${durationSec || "?"}s and the script only reaches [${stamps[used - 1] ?? 0}s]` });
  }
  // the one-cut restaging verdict (see the per-cut note above): the SCRIPT must touch the photograph somewhere.
  if (bareSingle && Array.isArray(plateNouns) && Array.isArray(plateNouns[0]) && plateNouns[0].length && !censusHit)
    v.push({ rule: "restaging", cut: 1 });
  if (durationSec) for (const d of dialogueShape(t, durationSec, { partiesNamed, dialogueWords })) {
    if (d.rule === "dialogue-underfilled") v.push({ rule: d.rule, cut: null, detail: d.figure });
  }
  if (lines.length > maxLines) v.push({ rule: "too-long", cut: null, detail: `${lines.length}/${maxLines} lines` });
  if (t.length > maxChars) v.push({ rule: "too-long", cut: null, detail: `${t.length}/${maxChars} chars` });
  const dlgIdx = lines.findIndex((l) => /^dialogue:$/i.test(l));
  if (dlgIdx >= 0) for (const l of lines.slice(dlgIdx + 1)) {
    // ⭐ MIRRORS dialogueShape's OWN PARSER (_gate_rules ~:1169: `^\s*([^:]{1,40}):\s*(.+)$`, which then strips
    // `\s*\(to [^)]*\)` and sets `addressed` from it). The old class `[\w .'-]` excluded PARENTHESES, so this
    // check rejected the exact addressee form its sibling was built to read — and addressing is doctrine, not
    // decoration ("a speaker with no listener is an advert"). x33 died here: the writer emitted a Dialogue:
    // block with addressee labels, survived two re-asks it could not satisfy, and fell back to the pre-scrape
    // draft. Same shape as the cut-count kill — two predicates for one concept, drifted apart. Measured:
    // "Garfield (to Tyson):" now clean, the MJ golden's bare "Investor:" still clean, an unlabelled line still
    // flags. The leading-letter anchor and the 40-char cap are kept; only the character class is reconciled.
    // ⭐ THE EXISTING NAME CLASS IS UNCHANGED; the ONLY addition is the optional "(to Other)" suffix, which is
    // not new vocabulary — dialogueShape already strips exactly `\s*\(to [^)]*\)` and sets `addressed` from it,
    // so the construct exists in this architecture and the two predicates simply disagreed about it. The
    // addressee form is doctrine, not decoration ("a speaker with no listener is an advert"), so the writer was
    // obeying the law and dying on the sibling check: x33 emitted `Garfield (to Tyson):`, failed two re-asks it
    // could not satisfy, and shipped the pre-scrape fallback. ⚠ Nothing on the celeb path instructs a Dialogue:
    // block (dialogueClause is inert without PLAN_DIALOGUE, which _run sets at :1813, past the celeb exit at
    // :760) — the writer chooses the shape itself, so instructions alone cannot prevent this. The pre-colon
    // capture is length-bounded the same way dialogueShape bounds it, so a label this accepts is a label the
    // parser can actually read; that is the drift the reconciliation exists to close.
    const lab = l.match(/^([A-Za-z][^:]{0,40}):\s/);
    if (!lab || !/^[\w .'-]+(?:\s*\([^)]*\))?$/.test(lab[1])) { v.push({ rule: "dialogue-label", cut: null }); break; }
  }
  // ⭐⭐ THE `advisory` FLAG IS NOW LOAD-BEARING (owner-directed hardening, 2026-08-16). It existed in the
  // codebase — _gate_rules pushes exchange-floor/button-position with it — but NOTHING read it: dialogueShape's
  // advisories were filtered by NAME one boundary up, and anything pushed with the flag out of THIS function
  // reached _ground_shotset, which treats a non-empty return as violations, re-asks twice and exits 3. So the
  // flag read like a contract and was decoration, which is precisely how I nearly shipped a fatal rule wearing
  // an advisory label. Now it means what it says, everywhere: reported on stderr, never returned, never fatal.
  // ⚠ Position still matters where a rule is fatal in one place and advisory in another — subject-missing is a
  // VIOLATION on cut 1 and an advisory on later cuts; the flag is what distinguishes them now, not whether the
  // push happened at all.
  return v;
}

// ⭐⭐ SEMANTIC CLARITY OVER DETERMINISTIC RULES (owner 2026-08-16, verbatim: «we cant afford to impose
// deterministic rules. semantic clarity is always better, because clauses trip up alot. our recent additions
// reflect this as did history»). FOUR writer deaths in one session, every one a mechanical predicate that had
// drifted from the law it was meant to enforce — cut-count counted lines while the law meant vantages;
// plate-dressing governed the article "a" and flagged the contract's own shape; dialogue-label rejected the
// addressee form its sibling parser strips; restaging was only ever passing because of a repetition that was
// then correctly removed. In none of the four was the INSTRUCTION unclear. So the law carries the intent and
// the validator mostly reports.
//
// ⚠ THE FATAL SET IS THE POLICY, AND IT IS DELIBERATELY SIX (owner-confirmed). Each one is mechanically
// load-bearing on the celeb lane — not a taste call — and the whole celeb cleared record satisfies all six:
//   name         a celebrity name reaching the model is a © hazard
//   lens         the ©-ceiling ladder walks 200→135→85 IN THE TEXT; without it the instrument does not exist
//   wide         face size is identity safety
//   swap-missing the celeb has to land on a real body
//   no-cuts      nothing to render
//   too-long     over budget
// Everything else REPORTS. Kept as one declarative set rather than eighteen scattered flags so the policy can
// be read in one place — which is the same clarity principle applied to our own code.
const FATAL = new Set(["no-cuts", "name", "swap-missing", "too-long", "apparatus", "unphotographed-cut"]);   // apparatus: owner 2026-09-06 — a dismounted cut is a wrong video, not a style note   // lens+wide REMOVED (owner 2026-09-01: lens retired; wide lives in sourcing, never in prompts)

/** The enforcement layer: what may KILL a run. Everything else is warned and dropped. */
export function goldenViolations(text, opts = {}) {
  const found = writerFindings(text, opts);
  const fatal = found.filter((x) => FATAL.has(x.rule) && !x.advisory);
  for (const a of found.filter((x) => !FATAL.has(x.rule) || x.advisory))
    console.warn(`  ⚠ ${a.rule} ADVISORY${a.cut ? ` (cut ${a.cut})` : ""}${a.detail ? `: ${a.detail}` : ""} — reported, not enforced`);
  return fatal;
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
export function factContract({ userPrompt, cutList, cutCount, subjectLook, lens, payoff = "", swap = "", charSig = "", maxLines = 16, coFigures = [], register = "", handle = "", dialoguePace = "", dialogueWords = 0, lawBlocks = [], stamps = [], freeCuts = false, durationSec = 0, context = null, places = [] }) {
  // Identity mechanism (ratified law 7, celeb instantiation): full look + "matching the reference" in the
  // subject's FIRST cut; the HANDLE carries every later cut. Without a handle the legacy shape stands.
  // ⭐ THE CARRY, TAKEN FROM THE CLEARED RECORD (owner 2026-08-16; the role-noun handle proposal WITHDRAWN):
  // all three multi-cut clears do one thing — first appearance INDEFINITE + the full look, every later
  // appearance DEFINITE + a 2-3 signature-trait subset. MJ: «A slim man in a white fedora, a red jacket, and
  // a single gold sequined glove» → «The slim man in the white fedora and single sequined glove». McGregor:
  // 4 traits → «The muscular athletic man with a short beard and chest tattoos». Tysonfeud: → «the same
  // muscular bald man». NEVER a pronoun, NEVER a role noun, NEVER the full phrase twice. (x30 restated the
  // whole look ×3 because THIS FACT LINE said the phrase IS the subject with no once-only bound — the writer
  // obeyed my text.) An explicit HANDLE, when the caller supplies one, is the same law with the subset named.
  const lookFact = handle
    ? `SUBJECT LOOK: ${subjectLook || "(as the reference shows)"} — this full phrase IS the subject at their FIRST appearance, with "a"/"an", plus "matching the reference" there and nowhere else. Never any name.\nHANDLE: every later appearance carries him as "${handle}" — never the full look again.`
    : `SUBJECT LOOK: ${subjectLook || "(as the reference shows)"} — this full phrase IS the subject at their FIRST appearance, with "a"/"an", plus "matching the reference" there. Never any name.\nCARRY HIM ON: later appearances use "the" + two or three of those same traits — never the full phrase again.`;
  return `You are writing beats for a video staged across ${cutCount} ordered photographs the generator conditions on and cuts between.
VIDEO: "${userPrompt}"

FACTS — data, not suggestions:
${lookFact}
${register ? `REGISTER: ${register} — given, not chosen.\n` : ""}CAMERA: no lens or framing words — the plates own the vantage (lens retired 2026-09-01).
${swap ? `SWAP: ${swap} — SAY WHO HE REPLACES, in the first cut he appears: "takes the place of the <role> — same position and scale". ${cutCount > 1 || !cutCount ? `From your SECOND cut on, that role noun alone carries him ("the <role>"): never re-describe the look, the reference already owns it and repeating it repaints him every cut. ` : ""}\n` : ""}${(coFigures || []).map((c) => `CO-FIGURE: ${c.guise}${c.nameable ? ` — may be named "${c.name}"` : ` — NEVER any name (not "${c.name}"); the reference carries its identity, your description carries only what it DOES`}.${c.swapRole ? ` In its first cut it ${ipSwapClause(c.swapRole)}.` : ""} It speaks when the scene calls for it — write its lines IN CHARACTER${c.nameable ? "" : ", labeled by its role noun"}; if its canon is wordless, write its response-turn in its own register. The WORDS are yours; the voice and mannerism are the model's.\n`).join("")}${payoff ? `PAYOFF MATERIAL: ${payoff}\n` : ""}${dialogueWords ? `DIALOGUE PACE: ${dialoguePace} — about ${dialogueWords} spoken words across this clip. That is the BUDGET, not a ceiling to creep toward: an underfilled clip is dead air, and a character with a voice is wasted saying nothing.\n` : ""}${context?.subjectContext?.length ? `SUBJECT CONTEXT — the subject's signatures as PHYSICS, deployable as the manner of ordinary actions: ${context.subjectContext.join("; ")}.\n` : ""}${context?.venueVocabulary?.length ? `VENUE VOCABULARY — this place's own nouns, for DIALOGUE and ACTION only (spoken or handled, never written on anything): ${context.venueVocabulary.join(", ")}.\n` : ""}${context?.collision?.length ? `COLLISION MATERIAL: ${context.collision.join("; ")}.\n` : ""}${context?.moment ? `THE MOMENT — script THIS, the particular not the general: ${context.moment}\n` : ""}${charSig ? `SIGNATURE IN THE REFERENCE: ${charSig}\n` : ""}${(places || []).filter(Boolean).length ? `CUT PLACES — from the photograph itself, use VERBATIM as each capture sentence place: ${places.map((pl, pi) => `Cut ${pi + 1} = ${pl}`).join("; ")}.\n` : ""}CUTS, IN ORDER:
${cutList}
${lawBlocks.length ? `\n${lawBlocks.filter(Boolean).join("\n")}` : ""}
RULES — each is checked mechanically after you write:
${freeCuts
    ? `1. Each cut: "[Ns] CUT N — <that cut given place>. <the subject> <does the action>." YOU choose the cut count — as many as the scene's intent needs and no more (padding robs the scene; one cut is a full answer when the scene wants one). Stamp cuts ascending from [0s], spread across the ${durationSec || 6}-second clip. No framing or lens words — nothing about how the scene is seen.`
    : stamps.length
    ? `1. ${cutCount === 1 ? `One line per BEAT and NO cut label anywhere — a cut is named only when there is more than one, and only at the moment it happens. The FIRST beat opens at the place once: "[${stamps[0] ?? 0}s] <the place>. <the subject> <does the action>." Every later beat is just "[Ns] <who> <does what>." — no framing, no lens, no "CUT". Use these stamps in order, one per beat: ${stamps.map((t) => `[${t}s]`).join(" ")} — the bracket is that beat's moment. ONE plate means ONE vantage, so every line is CUT 1; what changes between them is what HAPPENS, never where the camera is.` : `One line per cut: "[Ns] CUT N — <that cut given place>. <the subject> <does the action>." Use these stamps in order, one per cut: ${stamps.map((t) => `[${t}s]`).join(" ")} — the bracket is the cut's start time.`} No framing or lens words — nothing about how the scene is seen.`
    : `1. One line per cut: "Cut N: <that cut given place>. <subject look> <does the action>." No framing or lens words.`}
2. The subject acts in EVERY cut; no cut belongs to anyone else. The set's other people stay exactly where the photographs show them.
2b. CONTACT, not scenery: each cut's action stages ON that photograph's own objects and people, by DEFINITE ARTICLE — and every noun you write must be FINDABLE in that photograph.
${lawBlocks.length ? "" : `3. The LAST cut lands one payoff, transformed from something already in that photograph; each element pays off once; real-world brand surfaces render blank.\n`}${lawBlocks.length ? "3" : "4"}. Speech goes under "Dialogue:", every line labeled "Name/Role:", aimed at someone in the frame.
${lawBlocks.length ? "4" : "5"}. Adjectives belong to what you CONJURE, never to what the photograph already shows — name its things bare ("the arena", never "the bright arena"): the picture already carries how they look. And never write how FAST something happens; write what happens.
${lawBlocks.length ? "4" : "5"}. Nothing else — no opener line, no scene prose outside the cut lines, at most ${maxLines} lines.
Return ONLY the lines described.`;
}
