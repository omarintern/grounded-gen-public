// BEAT LAW — the import-safe home of the beat-writer doctrine (owner 2026-08-14: "nonip already has
// infra so we should adopt it how it is instead of fixing what isnt broken" — validated instruction text is
// SETTLED TECH). Extracted VERBATIM from _ground_prompt.mjs so BOTH writers (world single-ref AND the merged
// celeb contract) consume the SAME BYTES: import, never paste — verdicts derived from a copy drift the moment
// either copy is edited. ZERO text change at extraction; _ground_prompt imports its own former text from here.
// Model-visible doctrine lives in the clause functions; pure machinery (the deterministic dialogue builder,
// the FINE_DETAIL regex) rides along. speechReach already lives in _gate_rules (shared there, not here).
import { dialogueStamps } from "./_gate_rules.mjs";

export const DIALOGUE_STAMPS = dialogueStamps(Number(process.env.BEAT_DURATION) || 4, Number(process.env.CUT_BUDGET) || 0);

// ── THE DIALOGUE IS RE-ATTRIBUTED HERE, BECAUSE THIS IS WHERE THE MATERIALS ARE KNOWN ────────────────────
// The brain writes the Dialogue block at PLAN time, before any image exists, and it used to be stapled onto
// the beats untouched. So the prose was rewritten against the photographed scene and the dialogue was not —
// and the dialogue is the part that decides where a speaker looks. Whether the person a line is aimed at is
// actually in the frame, and where they are, is a fact about the MATERIALS. Only this layer holds the VLM's
// reading of the plate, so only this layer can attribute a line truthfully.
//
// Reproduce the speech as written — the words are the owner's requirement and are not ours to rewrite — and
// change only WHO EACH LINE IS AIMED AT, against what is actually in the frame.
export const dialogueClause = () => {
  const d = (process.env.PLAN_DIALOGUE || "").trim();
  if (!d) return "";
  return `⚠ RE-ATTRIBUTE THIS DIALOGUE AGAINST THE SCENE AS PHOTOGRAPHED, THEN EMIT IT AS THE FINAL BLOCK.\n`
    + `${d}\n`
    + `Keep every line's WORDS exactly as written — the speech is a requirement, not a draft. You may BREAK a `
    + `line into several timed lines when it is carried across cuts (see the carried-voice rule below); that is `
    + `a decision about WHEN each word is heard, not a change to the words, and it is the only division allowed. `
    + `What you decide is `
    + `WHO EACH LINE IS AIMED AT, and you decide it from the frame you were given, not from the plan:\n`
    + `· If the addressee is a figure the photograph actually contains, name them in the label and let a beat `
    + `put the two of them in a physical geometry — who faces whom, what passes between them.\n`
    + `· If the addressee is NOT in the frame, place them there in a beat first. Naming someone who is not `
    + `present asks the model to invent a body mid-line, which it does badly or not at all.\n`
    + `· An unaddressed line is delivered TO THE LENS. That is occasionally right and usually not — it is the `
    + `grammar of an advertisement — so let it happen only where you actually mean it.`
    // ── THE THIRD OPTION: A VOICE MAY OUTLAST THE SHOT IT WAS ANCHORED IN ──────────────────────────────────
    // This clause used to say "two honest options and no third", which foreclosed the one thing a montage
    // needs. Camera-address and carried voice get confused because neither shows a listener, but they are
    // OPPOSITE geometries: camera-address has the speaker IN frame addressing the lens (advert grammar, still
    // banned); carried voice has the speaker NOT IN FRAME AT ALL, already established, while the picture has
    // moved on. A speaker cannot address the lens from a shot they are absent from.
    // The anchor is what separates them, and it is a requirement, not a preference: the line must BEGIN in a
    // beat where speaker and addressee are both present and oriented to each other. Only then may the picture
    // cut away with the voice still running. An unanchored voice over images is narration to nobody, which is
    // the ad-read this whole clause exists to prevent — so the escape hatch opens only after the geometry has
    // been shown once.
    // Owner 2026-08-09, on a montage that died at its last cut: "we'd want narration to prolong into the
    // montage." Withholding all the speech for the anchor shot is what makes a montage read as a slideshow —
    // the voice is the only thing tying cut to cut, and the cuts are where the meaning accumulates.
    + (process.env.ALLOW_CUTS === "1"
      ? `\n· ⚠ A LINE MAY RUN ACROSS CUTS, AND WHEN THE CUTS ARE A MONTAGE THE SPEECH SETS OFF, IT SHOULD. `
        + `Once a line is ANCHORED — begun in a beat where the speaker and the person addressed are both present `
        + `and turned to each other — the picture may cut away while that voice keeps going. The speaker is then `
        + `not in frame at all, which is the OPPOSITE of addressing the lens, not a version of it: nobody can `
        + `present to a camera from a shot they are absent from. Split the words across the beats so the voice `
        + `carries INTO and THROUGH the new images rather than finishing before the first cut — a montage whose `
        + `speech ended in the shot before it has nothing holding one image to the next, and it reads as a `
        + `slideshow. The anchor is mandatory: a voice that never appeared on screen is narration to nobody, `
        + `which is the advertisement read above.\n`
        // ⚠ SAY HOW, OR IT CANNOT BE SAID AT ALL. Measured 2026-08-09: this clause reached the writer intact
        // and the writer still emitted ONE line, because the surrounding instruction says the dialogue is
        // "THE FINAL BLOCK" and a final block has no per-beat position. "Split the words across the beats" had
        // nowhere to land — the rule was expressible in English and not in the output shape, which is the same
        // failure as a gate reading a field that answers a different question. The block STAYS terminal (audio
        // detection and the slop meter both key on a trailing `Dialogue:` section, and the label-strip regex is
        // line-anchored, so a bracketed time inside the label survives it). What changes is that its LINES may
        // now carry their own timings.
        + `· HOW TO WRITE A CARRIED LINE, because the block itself stays at the end: keep ONE "Dialogue:" `
        + `section as the final block, but give its lines their own timings in brackets and break the speech `
        + `across them — "Speaker to Listener [0s]: …" then "Speaker (continuing, over the cuts) [4s]: …". `
        + `The bracketed time says WHEN that fragment is heard, so a single sentence can begin in the anchor `
        + `shot and finish over the last image. Do NOT move speech up into the beat lines and do NOT open a `
        + `second Dialogue block — one terminal block, several timed lines inside it.\n`
        // ⚠ THE RULE ABOVE READS AS A PROHIBITION ON THIS ONE, WHICH IS WHY IT LOST. Measured 2026-08-09: the
        // clause reached the writer intact (confirmed in the instruction dump) and the writer still emitted a
        // single untimed line, because two lines earlier it is told "Keep every line's WORDS exactly as
        // written — the speech is a requirement, not a draft." Splitting a line LOOKS like altering it, so the
        // older and more emphatic rule won. Both are right; they were simply never reconciled, and a model
        // resolving a contradiction picks one — usually the one phrased as an absolute.
        // Say plainly that splitting is a re-TIMING, so obeying it cannot read as disobeying the other.
        // ⚠ THE SLOP METER WAS NEVER THE LEVER FOR THIS. Owner 2026-08-09: "i dont think the slop meter
        // wouldve been the lever for prolonged speech. but a general rule would be speech not cutting short,
        // instead using the length of a video unless prompted." Density (words per second) and REACH (does the
        // speech still arrive at the end) are different properties: a line can sit at a perfect 3 wps and be
        // over in the first three seconds of a twelve-second clip. The meter measures the first and says
        // nothing about the second, so no meter target could ever have produced a line that lasts.
        // ⚠ AND IT IS SUBORDINATE TO PLOT, WHICH IS THE OLDER RULE. Owner, same message: a subject who walks
        // into a hall and only meets the people they address in a later time block SHOULD start speaking in
        // that block — arriving silent is correct, because the geometry says nobody is there to hear them yet.
        // Reach is the DEFAULT, not an override: fill the clip unless the story says where the speech belongs.
        + `⚠ THE SPEECH USES THE LENGTH OF THE CLIP. This is a ${process.env.BEAT_DURATION || "4"}-second video, `
        + `and by default speech should still be ARRIVING near the end of it — a line that finishes in the first `
        + `third leaves the rest silent, and silence after a voice reads as the clip having ended early. Spread `
        + `the words across the time you have rather than delivering them all at once and then stopping. `
        + `⚠ UNLESS THE PLOT PLACES THEM. Where the story has the speaker ARRIVE — walk in, reach the people `
        + `they are addressing, get to the room where the exchange happens — the speech belongs in THAT time `
        + `block and the earlier blocks are rightly silent, because there is nobody there to be spoken to yet. `
        + `Plot placement always wins; filling the clip is what you do when the story does not say otherwise.\n`
        // ⚠ MEASURED DISTRIBUTION, 11 SAMPLES ON ONE PROMPT (2026-08-10). The writer reads "split across the
        // cut" as "split at the FIRST cut and stop": the last stamp was <= 4s in six of eight runs that wrote
        // speech, clustering at reach 0.53, and only one of eight cleared the floor. It reliably produces TWO
        // fragments no matter how many cuts the clip has. So the instruction needed the END named explicitly —
        // "carries into and through" was read as "crosses one boundary", which it does, and then it stops.
        // ⚠ A LITERAL STAMP SPEC, NOT A DESCRIPTION — the lesson BEAT_STAMPS already learned, applied one
        // field along. Prose asking for spread lost 6 times in 8: "no amount of 'span the full duration'
        // elsewhere could win against a literal format spec" (see BEAT_STAMPS above). So compute the seconds
        // and hand them over, exactly as the beats get theirs.
        + `⚠ USE THESE EXACT TIMINGS FOR THE DIALOGUE LINES: ${DIALOGUE_STAMPS.map((t) => `[${t}s]`).join(" ")} `
        + `— one fragment per stamp, in order, breaking the sentence at its own natural clause boundaries. `
        + `Two fragments at the top is the reflex and it is wrong: it lands the last words a third of the way `
        + `in and leaves the rest of the clip silent. The final stamp is deliberately late so the voice is `
        + `still going when the last image arrives. If the line genuinely cannot divide that many ways, use `
        + `FEWER fragments but keep the LAST one on the LAST stamp — never bunch them at the start.\n`
        + `⚠ SPLITTING IS NOT REWRITING, AND IT DOES NOT BREAK THE KEEP-THE-WORDS RULE ABOVE. The words and `
        + `their order stay EXACTLY as given — you are choosing only where the sentence BREAKS and when each `
        + `part is heard. Add no word, remove no word, reorder nothing. If you find yourself keeping the line `
        + `whole because you were told not to alter it, that is the misreading this paragraph exists to correct: `
        + `a line kept whole in the anchor shot is speech that ends before the first cut, which is the exact `
        + `failure the carried-voice rule was written to prevent.`
      : "");
};

// ── WHO IS BEING SPOKEN TO ──────────────────────────────────────────────────────────────────────────────
// A form that stages an ELICITED response has an obligatory geometry the beats must state, because the model
// has no default for it and will fall back to addressing the lens. Camera-address is the grammar of an
// ADVERTISEMENT; a solicited response is the grammar of documentary and reportage. Measured 2026-08-08: the
// plan chose a television news segment, the beats named no interviewer and no addressee, and the clip read as
// an advert — the form was decided and then never expressed.
//
// Stated as a general rule, not a worked case: whenever the form implies someone off-frame drew the speech
// out, that person must EXIST in the beats and the speaker must be oriented to them rather than to us.
export const ELICITED_FORM = /\b(?:interview|news|segment|report(?:er|age)?|broadcast|vox[- ]?pop|documentary|talk[- ]?show|press|podcast)\b/i;
export const addresseeClause = () => {
  const form = process.env.MEDIA_FORM || "";
  if (!ELICITED_FORM.test(form)) return "";
  return "⚠ THIS FORM IS AN ELICITED RESPONSE, AND ITS GEOMETRY IS NOT OPTIONAL. Someone off-frame asked the "
    + "question, so that person must be PRESENT in the beats and the speech must be directed AT THEM. Put the "
    + "questioner in the frame the way the form actually shows one — commonly no more than a held microphone "
    + "entering frame, a shoulder, or an arm — and give the speaker an eyeline that goes to that person, NOT to "
    + "the camera. A subject who looks down the lens is presenting to an audience, which is the grammar of an "
    + "advertisement and the exact failure this clause exists to prevent. The camera OBSERVES the exchange; it "
    + "is never the thing being spoken to. Do not add a spoken question unless the beats have room for one — "
    + "the microphone and the eyeline carry the form on their own.";
};

// ── THE PLATE'S PLANE IS FRAME ZERO TOO ───────────────────────────────────────────────────────────────────
// When the figure at the action spot is ART PRINTED ON A SURFACE — an illustration on a book page, a poster, a
// mural, a screen — then "on the page" is a fact the photograph ESTABLISHED, exactly like the room's light or
// the camera's distance. Beat 0 may hold what the photograph OMITS; it may never hold what the photograph
// DENIES ([[feedback_frame_zero_rule]]). A dimensional creature standing on the paper denies it.
//
// This is the SCENE half of the same call renditionMode() makes on the CHARACTER half in _gate_rules.mjs. That
// one is scoped to flat-canonical IP, because "flat vs brought-to-life" is an axis only such a character has.
// This one is scoped to the PLATE and therefore applies to whoever takes that position, IP or not — a swap
// into a comic panel is page art no matter who is swapped in. They agree on the case that produced both; they
// are not duplicates, and neither is a safe place to delete the other from.
//
// Owner 2026-08-09, on a Ratatouille cookbook plate whose chef is ink on a page: "the anthropomorphic reversal
// should apply when 2d is implied, and the vlm can see the chef is 2d on paper and not apply the
// anthropomorphism we usually apply."
export const renditionClause = () =>
  process.env.PLATE_FLAT_ART !== "1" ? "" :
  "⚠ THE FIGURE IN THIS PHOTOGRAPH IS FLAT ARTWORK ON A SURFACE, AND WHATEVER REPLACES IT STAYS FLAT ARTWORK ON "
  + "THAT SURFACE. The occupant of the action spot is printed or drawn ON something the camera can see the edges "
  + "of — a page, a poster, a screen — not a body standing in the room. So the substituted character is part of "
  + "that same printed surface: flat ink outlines and flat painted colour, lying in the plane of the page, "
  + "lit by the room's light falling ACROSS it rather than by light of its own. It may move, gesture and speak "
  + "as drawings do, and the surface itself may be handled, turned or lifted by someone in the scene. It must "
  + "NOT gain volume, depth, real fur, real fabric, cast shadows into the room, or rise off the surface — do "
  + "NOT bring it to life as a three-dimensional creature, which is the DEFAULT for a drawn character and is "
  + "the wrong call here. The photograph already answered which plane this figure lives in; keep its answer.";

// post-cut fine-detail tell (moved verbatim from the guard in _ground_prompt; the guard loop stays with its writer)
export const FINE_DETAIL = /\b(?:with|in|using|between)\s+(?:its|his|her|their|both|two|one|a|the)?\s*(?:front|back|hind|fore)?\s*(?:paws?|hands?|claws?|teeth|beak|snout|mouth|fingers?|forepaws?)\b/i;

// ── THE DETERMINISTIC DIALOGUE BUILDER (moved verbatim; parameterized only at the boundary) ────────────────
// Returns the terminal Dialogue block string, or null when planDialogue is empty. The caller appends + warns.
export function buildDialogueBlock(planDialogue, stamps = DIALOGUE_STAMPS) {
  if (!(planDialogue || "").trim()) return null;
  const raw = planDialogue.replace(/^\s*Dialogue\s*:\s*/i, "").trim();
  const speaker = (raw.match(/^([^:\n]{1,80}?)\s*:/) || [, "Speaker"])[1].trim();
  const words = raw.replace(/^[^:\n]{1,80}?\s*:\s*/, "").replace(/^["'“]|["'”]$/g, "").trim();
  // ⚠ SENTENCES FIRST, COMMAS ONLY IF THAT IS NOT ENOUGH; ⚠ DO NOT MANUFACTURE FRAGMENTS (see the history at
  // the callsite in _ground_prompt.mjs — the comments stay there with their measured regression record).
  let parts = words.split(/(?<=[.!?])\s+/).map((x) => x.trim()).filter(Boolean);
  const want = Math.max(2, Math.min(stamps.length, parts.length));
  while (parts.length < want) {
    const li = parts.reduce((b, p, i, a) => (p.length > a[b].length ? i : b), 0);
    const seam = [...parts[li].matchAll(/[,;]\s+/g)].map((m) => m.index).pop();
    if (seam == null) break;
    parts.splice(li, 1, parts[li].slice(0, seam + 1).trim(), parts[li].slice(seam + 1).trim());
  }
  while (parts.length > stamps.length) { const i = parts.length - 2; parts.splice(i, 2, `${parts[i]} ${parts[i + 1]}`); }
  const use = stamps.slice(-parts.length);   // keep the LATE stamps when there are fewer fragments
  return { stamps: use, block: "Dialogue:\n" + parts.map((t, i) =>
    `${speaker}${i ? " (continuing, over the cuts)" : ""} [${use[i]}s]: "${t.replace(/^["'“]|["'”]$/g, "")}"`).join("\n") };
}

// ── THE INSTRUCTION BLOCKS (extracted VERBATIM from _ground_prompt's assembly, 2026-08-14) ──────────
// Each factory returns exactly the bytes its block contributed to the writer instruction. Params carry the
// caller's locals (framingConceded/charSig/BEAT_STYLE/BEAT_STAMPS/userPrompt); process.env reads are the
// originals, untouched. The world writer assembles them in its historical order; the celeb contract
// imports the blocks its map marks TRANSFER-VERBATIM and plugs its own payloads into the SLOT positions.

export const spanHeader = () => (
`Write the shot script for a ${process.env.BEAT_DURATION || "4"}-second video generated FROM a real photograph.\n\u26a0 THE BEATS MUST SPAN THE WHOLE DURATION. Space them evenly to the END: a 7-second clip needs beats at [0s] [2s] [4s] [6s], not three that stop at [4s]. Unscripted tail time is time the generator fills however it likes, which is where off-beat pacing and invented action come from.\n`
);

export const goalBlock = () => (
`⚠ THE GOAL — THE SHOT MUST READ AS A REAL CAPTURED MOMENT WITH A BEGINNING AND AN END. ` +
    `not a cinematic scene, not a spectacle — someone's camera happened to catch one small COMPLETE thing. We are ` +
    `NOT writing a text-to-video prompt: a text-to-video model's prompt must specify every visual detail, while ` +
    `we ALREADY HAVE THE PHOTOGRAPH. Dense visual description does not help here, it COMPETES with the reference ` +
    `(a verbose beat once made a penguin GROW; a spectacle-heavy beat turned a grainy night photo into a polished ` +
    `render). Take a text-to-video model's TEMPORAL AND NARRATIVE STRUCTURE only. The reference owns geometry, lighting, texture, ` +
    `lens and grade; the beats own TIME, CAUSALITY and INTENT.\n\n`
);

export const framingConcessionBlock = (framingConceded) => (
(framingConceded
      ? `⚠⚠ FRAMING CONCESSION — the sourced plate is framed too WIDE for this action's fine detail, and a nearer plate could not be sourced. Author every beat at the plate's ACTUAL scale: describe only motion that READS WIDE — the group as a whole, whole-body movement, things entering, gathering or leaving — and NEVER per-actor detail (individual faces, paws, small gestures, one performer's business). If the action's point is fine detail, render it as a COARSE GROUP event: a row of performers rising and opening together, not one conductor's paw. Asking for detail this framing cannot show is exactly what makes the generator CUT IN, which is the one thing we are avoiding.\n\n`
      : "")
);

export const proseFiguresBlock = () => (
(process.env.PROSE_FIGURES
      ? `⚠ THESE FIGURES CARRY THEIR IDENTITY IN YOUR PROSE — there is NO reference image for them, by design ` +
        `(they are concepts the video model already knows, and a reference would collapse them into one arbitrary ` +
        `rendering). Introduce each ONCE, at first mention, in a SINGLE clause built from these fixed signatures, ` +
        `then never describe it again: ${process.env.PROSE_FIGURES}. Signatures only — no mood, no manner, no ` +
        `texture.\n\n`
      : "")
);

// ⚠ POLES RECONCILED WITH THE MIDDLE (owner-ratified 2026-08-15; his flag verbatim: «its a real issue to
// say NEVER INTRODUCE A SUBJECT AFTER BEAT ZERO», and «beat0 establishes frame0 does it not»). The middle
// (materialising-vs-arriving, the reveal rule, the hard-cut reset, THE TEST) was always the coherent system;
// the old headline absolute and the old closer ("put EVERY actor... never hold a subject back as a reveal")
// contradicted it from the two highest-salience positions. Headline now bans POP-IN in the middle's own
// vocabulary + re-attributes the sleeping-lady to the FRAME-0 CENSUS (her true violation: she was IN the
// photograph). Closer now restates THE TEST. Middle clauses byte-identical, every scar intact.
export const beatZeroLaw = () => (
`\u26a0\u26a0 BEAT ZERO ESTABLISHES THE WHOLE SCENE - INCLUDING WHAT THE PHOTOGRAPH LACKS. The picture is ` +
    `the STARTING FRAME, not a limit on what may exist. If the story needs something the photo does not show, ` +
    `NAME IT IN THE FIRST BEAT as part of the opening state: "a woman is asleep in the bed", "a cat sits at the ` +
    `foot of the steps". The generator will put it there. VALIDATED: a porch plate containing no animal produced ` +
    `a near-perfect clip because beat one simply stated the cat was sitting in the snow.\n` +
    `\u26a0 BUT BEAT ZERO CANNOT HOLD WHAT THE PLATE CONTRADICTS. It may add what the photograph merely OMITS (an occupant off to one side, a prop that could already be there); it may NOT add something the photograph ACTIVELY SHOWS OTHERWISE - a display already lit with one picture, a wall already bare. Such an element ENTERS at the moment its change is plausible, by TRANSFORMING what the frame already contains (a screen resolves to a new picture, a panel lifts to reveal): that transformation IS its visible route. Forced into beat zero it fights the plate; introduced with no route the generator cuts.\n` +
    `\u26a0 ENTERING IS ALLOWED, AND IS PART OF BEAT ZERO. "Established at beat zero" does NOT mean "standing still at beat zero" - if the request says the subject ENTERS, then beat zero SHOWS IT ENTERING (walking in from the frame edge, coming through a doorway) and settling into place. Do not silently convert an entrance into a static arrangement; the entrance is an action the user asked for. What is forbidden is a subject FIRST APPEARING in a LATER beat.\n` +
    `\u26a0\u26a0 NOTHING MATERIALISES AFTER BEAT ZERO \u2014 a subject that simply BEGINS TO EXIST, with no ` +
    `visible route, is the violation. A subject popping into [2s] or [4s] out of nowhere is one the camera has ` +
    `been treating as absent, so the generator CUTS to go and find it, and a cut is the one thing we never want. ` +
    `\u26a0 AND BEAT ZERO IS THE CENSUS OF FRAME ZERO: whoever and whatever the PHOTOGRAPH already contains is ` +
    `present from the first frame, and beat zero holds them. Had beat zero said "a woman is asleep in the bed" while the cats filed in, she ` +
    `would have been present throughout and the waking could happen in place \u2014 she was IN the photograph; leaving her unwritten denies the frame.\n` +
    `\u26a0\u26a0 BEAT ZERO LEADS WITH THE SCENE'S ACTUAL SUBJECT. Whoever or whatever the user's request is ABOUT is the grammatical subject of beat zero; anyone else present is CONTEXT and belongs in a subordinate clause or a following sentence, never in front. This is a writing rule first - a cat-choir joke that opens on a sleeping woman has its emphasis backwards - and it has a second, harder consequence. Promoting a vulnerable or unaware person to the opening subject of a covert-capture frame reads as surveillance of that person, and providers refuse it on content policy; the identical scene passes when the real subject leads. Do not soften or remove what happens - reorder so the real subject is in front and the person is present as context. `+
    `\u26a0\u26a0 BUT THE BAN IS ON MATERIALISING, NOT ON ARRIVING. A subject may appear at ANY beat PROVIDED the beat shows it ARRIVE by a route the frame already contains - through a door that opens, in from the edge of shot, up from behind furniture, down the stairs. What the generator cannot do is find a subject that simply BEGINS TO EXIST somewhere it was not: that is when it cuts. Ask which one you are writing. `+
    `\u26a0 AND SOME SUBJECTS MUST *NOT* BE IN BEAT ZERO. If the story's point is that someone is revealed - a door opens at the end and a person is behind it - then putting that person in frame at [0s] is a RED FLAG, not compliance: it spoils the reveal and contradicts the geometry, because a person behind a closed door is not in the room. The rule protects against POP-IN, not against entrances. Likewise a group that ENTERS need not all be in beat zero - the cats may file in at [2s] if the beat shows them coming through the doorway. `+
    `\u26a0 THE TEST: can the viewer SEE WHERE IT CAME FROM in the beat that introduces it? Yes -> it may arrive whenever the story wants. No -> it must be established at beat zero. `+
    `\u26a0\u26a0 AND A HARD CUT RESETS THE WHOLE RULE. The establish-at-zero law governs ONE CONTINUOUS SHOT - it exists to stop pop-in, and a CUT is not pop-in: the cut itself is the visible route, exactly like the opened door of the reveal rule. So a figure, prop or place that lives in a CUT-TO world - a remembered scene, a flashback, a second location - is established in THAT CUT'S FIRST BEAT and must appear NOWHERE EARLIER. Beat zero belongs ENTIRELY to the photograph's world: seating a later world's occupant at [0s] "so they are established" satisfies the letter of the rule while destroying the frame - the generator must then reconcile two incompatible places in one opening image, and it resolves the conflict by abandoning the photograph. Every actor in the OPENING world goes in beat zero; every actor in a CUT-TO world goes in its cut's first beat; no actor goes in both. `+
    // Owner 2026-08-13 (b33's vacant-space ending): the writer time-skipped the landing during the flashback
    // and returned to an aftermath — coherent bookkeeping, abandoned protagonist.
    `⚠ A CUT-AWAY PAUSES THE WORLD IT LEAVES — no time passes there while we are away. The return beat RESUMES the suspended action at the exact point it paused: a body launched mid-air is STILL mid-air and drops NEXT; a pour mid-stream keeps pouring. Never return to an aftermath the viewer was not shown. `+
    (process.env.CAST_LEDGER_LINE ? `\u26a0\u26a0 ${process.env.CAST_LEDGER_LINE}\n` : "") +
    (process.env.PLATE_OCCUPANTS_LINE ? `\u26a0 ${process.env.PLATE_OCCUPANTS_LINE}\n` : "") +
    (process.env.VALIDATOR_FEEDBACK ? `\u26a0\u26a0 YOUR PREVIOUS DRAFT VIOLATED THE CAST LEDGER: ${process.env.VALIDATOR_FEEDBACK}. Rewrite the beats obeying the ledger exactly \u2014 do not drop any figure; move each violation to its declared beat.\n` : "") +
    `\u26a0 BEAT ZERO IS AN ACTION, NOT A DESCRIPTION \u2014 its subject is MID-DOING from the first frame; a line that only says what the subject IS or WEARS lets the frame drift. `+
    // Owner 2026-08-13, restored from the golden gens (capybara ski counter, raccoon kiosk, fox hob, badger
    // tarp, capybara beer tap): every one staged beat zero ON the plate's named objects/occupants with THE.
    // The anti-scenery rule was over-read into dropping plate contact; adjectives stay banned, contact returns.
    `\u26a0 AND BEAT ZERO STAGES THAT ACTION ON THE PHOTOGRAPH \u2014 name the reference image's visible objects and occupants the subject touches ("behind the counter", "at the stove", "toward the customer"), with THE: every noun in beat zero should be findable in the picture. A noun the picture does not show belongs to a later beat or a cut. This is CONTACT, not scenery \u2014 look/lighting/mood adjectives stay banned. `+
    `\u26a0 SO, THE SUMMARY IS THE TEST: for every actor and prop the story needs, ask whether the viewer can ` +
    `SEE WHERE IT CAME FROM in the beat that introduces it \u2014 yes means it may arrive at that moment (an ` +
    `entrance, a transformation, a cut); no means it belongs in beat zero. Whatever the photograph already ` +
    `contains is in beat zero by census. Never drop what the user asked for.\n\n`
);

export const trappingsLaw = () => (
`⚠ MAKE THE CONCEPT LEGIBLE — NAME ITS TRAPPINGS ONCE. When the request names something with canonical ` +
    `trappings, you MAY name those trappings, because WITHOUT THEM THE CONCEPT DOES NOT READ: cats meowing in a ` +
    `room is not a CHOIR — a choir has robes, a conductor and a formation. A wedding has a veil; a heist has masks; ` +
    `a band has instruments. Name what the thing IS, once, at first mention.\n` +
    `⚠ BUT THIS IS IDENTITY, NOT DESCRIPTION — the same free category as a character's fixed signatures, and it ` +
    `carries the same limit. "wearing small choir robes" is identity. "wearing small crimson choir robes that catch ` +
    `the lamplight as they sway" is description, and description competes with the photograph and polishes the ` +
    `render out of its candid register. NAME THE TRAPPING, NEVER DRESS IT: no fabric, no colour beyond what ` +
    `identifies, no manner, no mood, no sound.\n\n` +
    `⚠ A MINOR FIGURE IS NAMED, NEVER DESCRIBED. a figure that is SECONDARY or TERTIARY to the ` +
    `shot gets its NAME and nothing more — "Santa Claus", not "Santa Claus, a portly, jolly, white-bearded elderly ` +
    `man in a red suit with white fur trim". A pile of attributes tells the model to DIFFUSE FOR THAT CHARACTER, ` +
    `spending detail on someone who is a background event while the shot is really about the SUBJECT and what ` +
    `HAPPENS. The name alone resolves a known figure completely — the model already knows what Santa looks like.\n` +
    `⚠ BUT DO NOT DELETE THE FIGURE EITHER. Name it at least ONCE so the event stays legible: "Santa Claus's sleigh ` +
    `spirals down" reads as the joke the user asked for, while "a silhouetted sleigh spirals down" reads as a ` +
    `generic object and throws the premise away. Minimal is the target — NAMED and UNDESCRIBED, not absent. ` +
    `(Over-describing a tertiary figure over-weights it; deleting it entirely costs the premise. Name it once.)\n\n`
);

export const charSigBlock = (charSig) => (
`${charSig ? `⚠ THE CHARACTER'S VISIBLE SIGNATURES (read off the sourced character reference): ${charSig}. USE at least one of these IN THE ACTION — have the creature actually handle or use what it carries, rather than merely having it present. An identity performed is stronger than one only rendered.\n\n` : ""}`
);

export const soundLaw = () => (
`⚠ SOUND CARRIES THE STORY WHEN THE CAUSE IS OFF-FRAME. in a shot where the target of the ` +
    `action is outside the frame, "we dont know whats happening" until the consequence arrives — so the sound must ` +
    `tell us. Author DIEGETIC sound that does narrative work: an approach heard before it is seen, a bell or an ` +
    `engine locating something off-frame, an impact heard rather than shown, sound STOPPING to mark an event. Name ` +
    `sound in the beat that needs it. ⚠ AUTHOR THE SOUNDSCAPE — DO NOT LEAVE THE AUDIO SLOT TO THE FALLBACK. End the beats with a Sound: line naming the DIEGETIC ambience of each world the clip visits, in order, specific to what is on screen (water, a crowd, a mechanism, wind), closing with "no music". A specific soundscape crowds out the generator's urge to score; a generic room-tone fallback invites it. ⚠ NEVER ask for MUSIC or a score — this is found footage, music breaks the ` +
    `realism AND the provider REFUSES generations whose invented soundtrack trips a copyright check (a warehouse ` +
    `clip was rejected outright on exactly that). Ambient and diegetic only.\n\n`
);

export const asWhileCheck = () => (
`\u26a0\u26a0 THIS RULE IS ROUTINELY IGNORED - CHECK YOUR OWN OUTPUT BEFORE RETURNING IT. Re-read every beat for 'as' / 'while' / 'and then' and split any that joins an act to its result. A beat may hold a concurrent STATE; it may not hold an act and that act's consequence. `
);

export const cutLaw = () => (
(process.env.ALLOW_CUTS === "1"
      ? `⚠⚠ THIS STORY SPANS MORE THAN ONE PLACE, SO YOU MAY CUT. Write the cut as an EVENT INSIDE a ` +
        `timestamped beat - "Hard cut to <the other place> of the same <building>: ..." - never as a separate ` +
        `label and never as a shot list. Three rules bind it. (1) NEVER AT THE FIRST BEAT: the opening frame is ` +
        `the photograph and must play from that camera untouched. (2) THE SECOND PLACE BELONGS TO THE SAME ` +
        `PREMISES the photograph establishes - one reference grounds one world, so name the relationship rather ` +
        `than inventing an unrelated location. ⚠ ONE EXCEPTION: A REMEMBERED OR IMAGINED SCENE THE REQUEST ` +
        `ITSELF ASKS TO SHOW - a memory, a flashback, a vision. That departure is legitimate and is NOT bound ` +
        `to the premises: the request chose where it goes. It is ONE cut, never a montage. It fires INSIDE the ` +
        `timestamped beat of the EVENT the request ties it to - when the request says the memory comes AT a ` +
        `moment, the cut lands at that moment's beat, not before it and not after it. And it goes FULL-FRAME: ` +
        `do not demote the departure into a reflection, an inset, or an image on a surface - the request asked ` +
        `to GO there, and a scene shown inside an object is not a cut, it is set dressing. The return licence ` +
        `below still applies afterward. (3) EVERY CUT MUST BE AN ACTUAL CHANGE OF PLACE, and this story ` +
        `has room for at most ${process.env.CUT_BUDGET || 1}. That number is derived from how many places the ` +
        `story visits, so it is a CEILING and never a target: use ONLY the cuts the story's own movement ` +
        `requires and no more. Never cut for variety, for emphasis, or to show something better — a cut spent ` +
        `on anything but a change of place is what turns a short story into a montage. ` +
        (process.env.MONTAGE === "1"
          // ⚠ A MONTAGE DEPARTS AND DOES NOT COME HOME. Validated by two independent authors writing the same
          // ending — see MONTAGE_RE in _gate_rules.mjs. The generic return-to-opening licence below is right
          // for a story that travels and comes back, and exactly wrong for a sequence of imagined futures.
          ? `⚠⚠ THIS REQUEST IS A MONTAGE, SO THE SEQUENCE DEPARTS AND NEVER COMES HOME. Do NOT cut back to the ` +
            `opening place at the end, and do not intercut with it between the futures — the framing device ` +
            `(the book, the window, the narrator) has done its job the moment the first cut leaves it, and ` +
            `returning re-anchors the clip to the very thing the sequence was escaping. Each cut must go ` +
            `FURTHER than the one before — further in time, in distance, in ambition — and the LAST image must ` +
            `be the FURTHEST. End out there. A montage that lands back where it started has described a loop, ` +
            `and a loop has no momentum: the futures are the payoff, so give them the final frame. ` +
            // ⚠ CLOSURE IS NOT CANCELLED, IT MOVES. Owner 2026-08-09: "i understand the return for rule of 3,
            // but that should apply elsewhere not in terms of returns but rather narrative." The three-beat
            // shape — set up, develop, pay off — is doing real work and the rule above must not read as "do
            // not resolve". What is banned is discharging that debt with a LOCATION: cutting home is the lazy
            // form of closure, and it costs the sequence its momentum to buy something the writing can supply
            // for free. So keep the payoff and spend it on the furthest image instead.
            `⚠ CLOSE THE STORY, BUT CLOSE IT IN THE LAST IMAGE — NOT BY GOING BACK. The three-beat shape still ` +
            `applies and the ending must still LAND; what may not carry it is a change of place. Pay it off ` +
            `INSIDE the furthest future: echo the opening gesture there, show the thing the speaker promised ` +
            `now true, let the object from the first beat reappear in that far place changed by the journey. ` +
            `The audience should feel the circle close WITHOUT the camera travelling back to draw it. `
          : `Returning to the opening ` +
            `place is a legitimate use of one, and when you return show the CONSEQUENCE of what happened while away ` +
            `rather than resetting the room. `) +
        (process.env.STYLE_PARTICULAR
          // ⚠ SCOPED TO APPROPRIATION, NOT TO MONTAGE. First written inside the montage branch — too
          // narrow, by exactly the mistake this file keeps repeating: a rule parked under the branch it
          // was first noticed in. A scene that takes ONE cut leaves its world as completely as one that
          // takes three. Gate on the appropriation, which is what makes a form worth preserving at all.
          ? // ⚠⚠ PERSISTENCE OF FORM. Owner 2026-08-09: "the plot should carry in the world (persistence
          // of form), remaining in a pixar world or whatever the form of ratatouille lives in." When a scene
          // is appropriated from a named work, that work's FORM — its animation, its rendering, the kind of
          // world it is — is part of what was appropriated, not just its staging. Measured the same day: a
          // Ratatouille cookbook opening cut to a photoreal restaurant kitchen, a photoreal loft and a
          // photoreal laboratory. Each cut was individually fine and the sequence was incoherent, because
          // the boy left the film he was in. The rule the CUT clause already carries — "the second place
          // belongs to the SAME PREMISES the photograph establishes, one reference grounds one world" — is
          // about GEOGRAPHY. This is the same thought about MEDIUM, and it had no clause.
          `⚠⚠ EVERY CUT STAYS IN THE WORLD THE PHOTOGRAPH CAME FROM. This opening frame belongs to a `
          + `particular made world, with its own way of being drawn, lit and rendered. That form was `
          + `appropriated along with the staging and it must survive every cut: the later places are `
          + `elsewhere in THAT world, not their real-life equivalents. A cut from an animated kitchen to a `
          + `photographed one is a cut to a DIFFERENT FILM, and it reads as an error even when each shot is `
          + `good on its own. Carry the rendering, the palette, the density of detail and the physical `
          + `logic of the opening frame all the way to the last image — the subject travels, the world does `
          + `not change medium underneath them.\n`
          : "") +
        `⚠ A CUT IS NOT AN ESCAPE FROM A DIFFICULT FRAME: if the action will not fit the photograph that is a ` +
        `sourcing fault, and cutting around it hides the fault.\n` +
        `⚠⚠ (4) AFTER A CUT THERE IS NO PHOTOGRAPH, SO THE SCALE MUST NOT CHANGE. Before the cut the reference ` +
        `fixes how large the subject sits in frame; after it, nothing does — the model is inventing that vantage ` +
        `unaided. Carry the SAME distance across the cut and hold it to the end. ⚠ THE CONSTRAINT IS THE GRAIN OF ` +
        `THE WRITING, NEVER WHETHER THE ACTION HAPPENS. Deliver every action the request asks for, the payoff most ` +
        `of all — but write it at the distance the photograph was taken from. Describe the WHOLE BODY doing the ` +
        `thing: posture, where it sits or stands, the gross movement, what changes in the room. Do NOT reach for ` +
        `the small end of it — the individual object in the grip, the limb doing the gripping, what the face is ` +
        `doing — because a beat pitched at that grain can only be shown from CLOSE, and coming closer is a second ` +
        `framing change you did not write and did not budget. That invented close vantage has no photograph behind ` +
        `it, so the model synthesises it, and a shot that was grounded until then turns plainly artificial exactly ` +
        `at the payoff. Same event, coarser grain.\n\n`
      : `⚠ THIS STORY HAPPENS IN ONE PLACE. Do not cut and do not move the camera to a new vantage; everything ` +
        `the beats need must happen within the frame the photograph gives you.\n\n`)
);

export const causalOrder = () => (
`⚠ CAUSAL ORDER — AN EFFECT MUST APPEAR IN A LATER BEAT THAN ITS CAUSE. Never join a cause and its consequence ` +
    `in one beat with "as", "while" or "and then": that collapses them into the same instant and the render shows ` +
    `the effect already underway before the cause. Fusing them makes the render show the effect already underway before its cause. One link per beat: the act in one, its consequence in the NEXT.\n\n`
);

export const payoffLaw = () => (
`⚠ THE PAYOFF LANDS LAST, AND THE RESTRAINT IS IN THE CAMERA - NOT IN THE STORY. Put the consequence in ` +
    `the FINAL beat. What must stay unstaged is the SHOOTING: a real camera does not reframe, push in, or hunt ` +
    `the money shot, so nothing is composed FOR the lens and no spectacle is front-loaded into beat 1. ` +
    `⚠⚠ THIS IS NOT A LIMIT ON HOW MUCH HAPPENS. An ` +
    `earlier version of this rule told you to keep the payoff SMALL and preferred ANTICLIMAX, and that ` +
    `suppressed the exact thing this branch exists for. The comedy is NARRATIVE-DENSE: a densely plotted, fully ` +
    `committed absurd event captured by a mundane fixed camera. The mundane CAPTURE is what makes the absurd ` +
    `CONTENT funny - so be restrained about FRAMING and generous about STORY. Let the event land on frame and ` +
    `let the characters react to it. Something happening off-frame may still be HEARD rather than chased.\n\n`
);

// ⚠ ANIMAL EXCLUSION IS CONDITIONAL (owner 2026-08-14, verbatim: «the animal exclusion applies only when
// the user didn't ask or imply»). User wrote speech → their words (unchanged law). User asks/IMPLIES a
// talking creature without supplying words → the writer WRITES the speech. No ask, no implication → mute.
// "Imply" is intent-sensitivity, not explicit-ask-only. Single-world non-IP cut law untouched by the
// parallel multi-cut ruling (celeb/ip/crossover only — orchestrator relay, same date).
export const seesawLaw = (BEAT_STYLE) => (
`⚠⚠ THE SEESAW - HOW MUCH OF THE STORY IS YOURS TO WRITE. Ported from src/composer/seesaw.ts, whose law is ` +
    `"broad prompts get populated; heavily detailed prompts get nothing they didn't invite". Judge TWO things ` +
    `about the user's request and regulate each INVERSELY to what they supplied. `+
    `(1) THE TURN - did they already give you the joke or the dramatic hinge? If they DID ("cats perform a ` +
    `choir" is already the premise), do not bolt a second one on; spend the beats DELIVERING theirs. If they ` +
    `gave only a situation, invent the turn - and give it a real arc, not a token gesture. `+
    `(2) DIALOGUE - did anyone speak in their prompt? If they wrote speech, use THEIR words. If nobody speaks ` +
    `but the scene contains a plausible SPEAKER and a moment that invites speech, WRITE THE SPEECH. If there is ` +
    `no one who could speak (only animals, an empty room), write none — UNLESS the request asks for or IMPLIES `+
    `the creature speaking: a subject the user gave a voice is a plausible speaker, so WRITE THE SPEECH. `+
    `⚠ THE BUDGET IS TIME, NOT A COUNT. Do not ration yourself to one line or one turn - fill the beats you ` +
    `have at a speakable pace (roughly two words per second of clip, so a 7s shot carries a short exchange, not ` +
    `a monologue). Speech is DIEGETIC and in-scene; never a voiceover, never narration, never music. `+
    `⚠ DIALOGUE AND PLOT ARE ELEMENTS, WHICH ARE FREE. Shot description, lens, lighting and camera moves are ` +
    `DETAILS, which cost - the seesaw NEVER adds those. Write WHAT IS SAID and WHAT HAPPENS; never how it is ` +
    `shot, lit or delivered. `+
    `⚠ ⚠ THE TWO VECTORS ARE JUDGED SEPARATELY. A request can state the turn and omit the dialogue, or the reverse; regulate each against what the user actually supplied.\n` +
    (BEAT_STYLE === "minimal"
      ? `⚠⚠ THIS REQUEST READS AS ALREADY AUTHORED — it carries its own turn, its own speech or its own stated register. So the board is tilted AWAY from invention: your job is to DELIVER what they wrote across the beats, not to add a second joke, a second hinge or speech they did not ask for. Adding on top of an authored request overwrites it. Where they left a gap, fill it plainly.\n`
      : `⚠⚠ THIS REQUEST READS AS A SITUATION, NOT A STORY — it names a subject and a place and leaves the event open. So the board is tilted TOWARD invention: supply the turn, and give it a real arc with a beginning and a payoff that lands LAST. If there is a plausible speaker and a moment that invites speech, write the speech. An un-invented situation is a clip where nothing happens.\n`) +
    `\n`
);

export const situationArc = () => (
`⚠ IF THE PROMPT DESCRIBES A SITUATION WITH NO EVENT, INVENT ONE AND GIVE IT A REAL ARC. Some prompts are a subject in a place ` +
    `and nothing more ("a rabbit outside someone's front door"). A situation is not a captured moment — something ` +
    `must HAPPEN and then be OVER. Author a tiny complete incident that suits the place and the creature: it ` +
    `arrives, does one specific thing, and reacts or leaves. Use whatever the photograph actually contains as the ` +
    `Scale the invention to the DURATION, not to a fixed minimum - fill the beats you have. A short clip ` +
    `carries a setup and a payoff; a longer one carries setup, escalation and payoff. Ordinary in KIND (a ` +
    `real thing that could happen in that place) but never artificially small in AMOUNT.\n\n`
);

export const outputShape = (BEAT_STAMPS) => (
(process.env.BEAT_BLOCKS !== "0"
      ? `Return ${BEAT_STAMPS.length} beats, one per line, stamped exactly ${BEAT_STAMPS.map((t) => `"[${t}s] …"`).join(" ")} ` +
        `(evenly spaced across ` +
        `the duration). Each beat describes ONLY what physically CHANGES at that moment — a movement, a gesture, a ` +
        `small event. Build a tiny arc so the clip has a beginning and an end rather than a loop.\n` +
        // ⚠ THIS RULE LIVED ONLY IN THE PROSE BRANCH BELOW, SO THE DEFAULT (STAMPED) PATH NEVER RECEIVED IT.
        // Measured 2026-08-05: a CONFIDENT Tesco plate — real customer phone shot, branded packaging, £ prices,
        // daylight — produced a gen with none of it: night, blue cast, a MOON inside the store, generic boxes.
        // The beat had written "down the aisle of a Tesco at 3am", so the model held a photograph of an aisle AND
        // a description of one, and built from the words. The time cue did the rest. Nothing about stamping vs
        // prose changes whether the photograph carries the setting, so the rule belongs in both.
        `\u26a0 DO NOT DESCRIBE THE SCENE OR SETTING. Describing the world makes the model DIFFUSE ITS OWN ` +
        `environment instead of working with the photograph — it "recreates" the place rather than inheriting it. ` +
        `Write NOTHING about the location, weather, lighting, time of day, surfaces or background; the reference ` +
        `already carries all of it. \u26a0 THIS INCLUDES A TIME OR LIGHTING CUE CARRIED OVER FROM THE USER'S ` +
        `REQUEST: if the request says a time of day and the photograph does not show it, the photograph WINS — ` +
        `a time cue in a beat fights the plate and the model resolves it by regenerating the whole place. Name ` +
        `props only when the action touches them.\n\n`
      : `Return CONTINUOUS PROSE — NO timestamps, NO "[0s]" markers, NO numbered or bulleted beats, NO shot list. ` +
        `Write it as ONE UNBROKEN ACTION SEQUENCE in present tense: one thing happens, then the next, then the next, ` +
        `joined as flowing sentences. Timestamps read as CUT MARKERS and produce a montage of disconnected moments; ` +
        `we want ONE CONTINUOUS TAKE. Order still carries the causality — an effect must come LATER IN THE SENTENCE ` +
        `ORDER than its cause, never in the same clause.\n` +
        `⚠ DO NOT DESCRIBE THE SCENE OR SETTING. describing the world makes the model DIFFUSE ITS ` +
        `OWN environment instead of working with the photograph — it "recreates" the place rather than inheriting it. ` +
        `Write NOTHING about the location, weather, lighting, time of day, surfaces or background; the reference ` +
        `already carries all of it. Open on THE SUBJECT — what it is, described by its LOOK — and then go straight ` +
        `into what it DOES. Name props only when the action touches them.\n\n`)
);

export const hardConstraints = () => (
`⚠ HARD CONSTRAINTS — the photograph already determines these, and contradicting them corrupts the render:\n` +
    `• NEVER mention how BIG, SMALL, NEAR or FAR the subject is, and never say it grows, shrinks or approaches.\n` +
    `• CAMERA — FLY ON THE WALL. Owner doctrine 2026-07-29/30: the camera is a BYSTANDER that happened to be\n` +
    ` there. It does not reveal, follow drama, chase a subject, or reframe for effect. If something enters the\n` +
    ` frame, that is ENOUGH — you do NOT tilt or pan to find it. A sled falling out of the sky is simply VISIBLE\n` +
    ` falling; do not write 'the camera tilts up to reveal' it. THE ONLY thing that may break a fixed camera is a\n` +
    ` PLOT REQUIREMENT the shot genuinely cannot be told without — never drama, never a reveal, never composition.\n` +
    ` A strict ladder. DEFAULT: the camera is FIXED, exactly as the\n` +
    ` photograph was shot; the subject moves WITHIN the frame and the frame itself never moves. Say nothing\n` +
    ` about the camera at all and it stays fixed, which is what almost every scene should do.\n` +
    ` FIRST FALLBACK, only when the action inherently TRAVELS out of frame (a vehicle driving off, an animal\n` +
    ` running past): the camera may TRACK the subject to keep it in frame — and NOTHING else. Write exactly\n` +
    ` "the camera tracks with it". NEVER zoom, push in, pull out, crane, tilt or change the framing size.\n` +
    ` LAST RESORT, only if the situation genuinely cannot be told otherwise: slight additional steer/movement.\n` +
    ` Prefer keeping the action INSIDE the existing frame over moving the camera — rewrite the action so it\n` +
    ` happens in place (a cart rolls a short way and stops) rather than travelling out of shot.\n` +
    `• NEVER describe lens, angle or framing SIZE — those come from the photograph.\n` +
    `• NEVER describe image quality, lighting style, colour grade, mood or film look.\n` +
    `• Do NOT re-describe the setting; it is already in the photo. Only what MOVES.\n` +
    `• Keep every other part of the scene exactly as photographed.\n` +
    `Return ONLY the beat lines, nothing else.\n\n`
);

export const finalChecklist = (userPrompt) => (
`BEFORE YOU ANSWER, CHECK ALL FOUR:\n` +
    `1. EVERY VERB from the request appears. Request: "${userPrompt}". If it names entering, performing AND waking, ` +
    `all three are in the beats. Dropping one is a failure, not a simplification.\n` +
    `2. The beats SPAN THE FULL ${process.env.BEAT_DURATION || "4"} SECONDS, evenly spaced, last beat near the end.\n` +
    `3. EVERY subject exists in beat [0s], including anything the photograph does not show. Nothing appears for the ` +
    `first time later.\n` +
    `4. NO camera words anywhere.\n`
);

// ── STAMPED-OUTPUT MACHINERY (joined the export set 2026-08-14: the owner's hybrid fold — stamps + Cut-N +
// capture sentence — makes the stamp machinery SLOT payload for the merged contract, not world-only) ─────────
export const beatStamps = (secs = Math.max(2, Math.round(Number(process.env.BEAT_DURATION || 4)))) =>
  Array.from({ length: Math.max(2, Math.ceil(secs / 2)) }, (_, i) => i * 2)
    .filter((t) => t < secs); // any stamp BEFORE the end — reproduces the validated patterns:
                              // rabbit 8s = [0,2,4,6] (owner: perfect), porch 5s = [0,2,4] (near perfect)
export const gotStamps = (t) => (String(t).match(/\[(\d+)s\]/g) || []).map((x) => x.replace(/\D/g, "")).join(",");
export const parseStampedLines = (text, capN) =>
  String(text).split("\n").map((l) => l.trim()).filter((l) => /^\[\d+s\]/.test(l)).slice(0, capN);
export const stampRetryPrompt = (stamps, userPrompt, text) =>
  `Rewrite these beats so there are EXACTLY ${stamps.length}, stamped ${stamps.map((t) => `[${t}s]`).join(" ")}. ` +
  `Keep the same story and wording as far as possible; redistribute or extend the action to fill every stamp. ` +
  `The request was "${userPrompt}" - EVERY verb in it must still appear. Return ONLY the beat lines.\n\n${text}`;
