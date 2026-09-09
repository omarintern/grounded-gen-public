// BEAT LAW — the import-safe home of the beat-writer doctrine (owner 2026-08-14: "nonip already has
// infra so we should adopt it how it is instead of fixing what isnt broken" — validated instruction text is
// SETTLED TECH). Extracted VERBATIM from _ground_prompt.mjs so BOTH writers (world single-ref AND the merged
// celeb contract) consume the SAME BYTES: import, never paste — verdicts derived from a copy drift the moment
// either copy is edited. ZERO text change at extraction; _ground_prompt imports its own former text from here.
// Model-visible doctrine lives in the clause functions; pure machinery (the deterministic dialogue builder,
// the FINE_DETAIL regex) rides along. speechReach already lives in _gate_rules (shared there, not here).
import { dialogueStamps, musicRequested, captureFormNoun } from "./_gate_rules.mjs";
import { rideFromEnv } from "./_ride.mjs";   // the ride's handheld exception is carved where the camera law is stated (2026-09-09)

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
    // ── THE SPEAKER SIDE, WHICH THIS CLAUSE NEVER POLICED (owner 2026-08-18, on the UFC clip) ───────────
    // Everything above decides who a line is aimed AT. Nothing decided who it comes FROM, and the brain's
    // own speaker law lives in manifest.mjs — the DRAFT prompt, which this writer does not import. So a
    // dialogue block reading `UFC interviewer to raccoon: "..."` arrived with the addressee present and
    // correct and the speaker a bare NAME with no body anywhere in the beats. The generator resolved
    // "someone is asking" the only way it could — it handed the question to a visible panelist, who then
    // read as asking something he plainly was not.
    // ⚠ ALL THREE LEGITIMATE GEOMETRIES SURVIVE, and that is why this is not the manifest rule copied over:
    // visible-when-speaking, carried-voice (established, then the picture moves on — the rule below), and
    // the questioner of a form whose questioners stand where the camera stands. The owner ruled that last
    // one CORRECT for a presser, and an absolute speaker-must-be-visible rule is what produced the fault.
    + `\n· AND WHOEVER SPEAKS MUST BE SOMEONE THE SCENE HAS ESTABLISHED. A line may come from a figure the `
    + `frame shows; from one established earlier whose voice carries over a later shot; or, in a form whose `
    + `questioners stand where the camera stands, from off-frame by that form's own convention. What it may `
    + `never come from is a NAME that appears only in a dialogue label. A speaker with no body anywhere in `
    + `the beats leaves the generator to invent one, and it will give the line to whoever happens to be `
    + `visible — who then reads as saying something they are plainly not. If you cannot say where a speaker `
    + `is, either put them in a beat or cut the line.`
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
// ── ANTHROPOMORPHISM IS CONTEXT-CARRIED, NEVER A DEFAULT (owner 2026-08-21: «if its a nonanthropomorphic
// thing like a fox in snow, or bear in a zoo, then it doesnt warrant anthropomorphism. context carries here
// and prompting»). The competence joke (owner 2026-07-30, the pigeon register) is UNCHANGED where it was
// measured — a creature REPLACING a human occupant performs that human's job. What died is the fallback that
// INVENTED "the person who would normally be there" when no such occupant existed: a creature in its own
// natural world behaves as the creature. humanRole = the actual occupant's description, or null when the
// scene offers no human role to perform.
export const anthropomorphismClause = (target, humanRole) => humanRole
  ? `⚠ THIS IS THE JOKE, AND IT IS THE POINT OF THE SHOT. The ${target} must ACTUALLY PERFORM the human ` +
    `job that ${humanRole} was doing — not merely stand in that spot behaving like a ${target}. Work out ` +
    `what that job physically INVOLVES in this exact scene and have the creature DO IT, deliberately and ` +
    `competently, with whatever body it has. Invent SPECIFIC physical business — but PITCH IT AT THE DISTANCE ` +
    `THE PHOTOGRAPH WAS TAKEN FROM: business the WHOLE BODY performs and that reads from across the room, never ` +
    `business identified by the limb that does it or by the small object in its grip. Specific and coarse are ` +
    `not opposites — the same act can be written either way, and only one of them can be seen from here. ` +
    `The humour comes from COMPETENCE, not from mess: it is funny because the animal is unmistakably ` +
    `GOOD at a job it has no business doing, and treats it as completely routine. Do NOT write generic animal ` +
    `behaviour (pecking at crumbs, flapping, sniffing around, looking cute) — that is the boring reading and it ` +
    `wastes the shot. Do NOT have it fail, panic or wreck the place unless the prompt asked for that.`
  : `⚠ ANTHROPOMORPHISM IS CARRIED BY CONTEXT AND PROMPTING, NEVER A DEFAULT. If the request or the scene ` +
    `puts the ${target} in a HUMAN ROLE — a job, a station, a task a person would do there — it performs that ` +
    `role deliberately and competently with whatever body it has, and that competence is the joke. If the ` +
    `context is the creature's own natural world, it behaves AS THE CREATURE — no invented human job, no ` +
    `borrowed business; its canon and the feeling of the beats carry the clip.`;

// ── AN ANTHROPOMORPHIZED CREATURE CARRIES LINES AS VOCALIZATION (owner 2026-08-21: «an anthropomorophisized
// animal can and should carry a "line" as vocalization in the Dialogue block»). The exchange geometry is
// speech's own — addressee, timing, progression — only the content is the creature's voice.
export const vocalizationClause = () =>
  `⚠ A creature holding a human role CAN AND SHOULD carry dialogue lines: its line is ITS OWN VOCALIZATION — ` +
  `written as the sound it makes, in quotes, never human words — timed, labeled and AIMED like any spoken ` +
  `line, and an exchange of such lines progresses like an argument: each answer responding to the last.`;

// ── A KEPT BELONGING RIDES A REFERENCE IMAGE (owner 2026-08-21: «keeping plush would mean maintaining the
// punch character-ref and referencing the plush from the image») — the deep-remix executor sets the note;
// the beats bind the belonging to its pixels and the replacement grammar keeps the old holder out of frame.
export const belongingClause = () =>
  !process.env.BELONGING_NOTE ? "" :
  `⚠ A KEPT BELONGING RIDES A REFERENCE IMAGE: ${process.env.BELONGING_NOTE} ` +
  `The beats NAME it inside the action so the reference's pixels carry its look; the figure holding it in ` +
  `that reference is NOT in this video — the replacement takes its place entirely, belonging in hand.`;

// THE RIDE'S BLOCK for the writer lives in _ride_writer.mjs (2026-09-09): one block from the ride decision, in the plate's own words.

// NAMED WORKS ARE TITLES (owner 2026-09-06: "context carries here rather than a user's perfect punctuation/grammar"). The
// run restores each resolved work's casing in the prompt the writer reads (restoreWorkTitles) and names them here, so a
// lowercase "the shining rollercoaster" is never written as "the rollercoaster is shining".
export const workTitlesClause = () =>
  !process.env.WORK_TITLES ? "" :
  `⚠ NAMED WORKS IN THIS REQUEST: ${process.env.WORK_TITLES}. These are TITLES of works — never read a title's words as adjectives or verbs, whatever the user's casing.`;

// FRAME ZERO'S REGISTER (owner 2026-09-08; _gate_rules.captureFormNoun): a capture form is stated at frame zero as what the
// photograph IS — the plate's own register, not a camera word. The run repairs mechanically when the writer leaves it out.
export const frameZeroRegisterClause = () => {
  const n = captureFormNoun(process.env); if (!n) return "";
  const shown = /^cctv$/i.test(n) ? "CCTV" : n.toLowerCase();
  // THE STATEMENT IS MANDATED ONLY WHEN THE WORDS ARE RE-AUTHORED AGAINST A KEPT PLATE (owner 2026-09-09, on the record: the badger, the
  // cymbal monkeys and Redmond Barry kept their monochrome security-camera look with NO register word at beat zero — the plate carried it;
  // the one loss was the T-rex REMIX, whose denser, larger action was re-authored against the parent's kept plate). A fresh gen may state
  // it, as the bear's writer did by choice; a kept-plate remix must, and the run repairs it in when the writer leaves it out.
  return `⚠ FRAME ZERO IS THIS PHOTOGRAPH, WHICH A ${shown === "CCTV" ? "security camera" : shown} MADE: beat zero describes what it shows — the place as photographed, its objects and occupants — and never announces the device as a caption ("${n} footage: …" is not written; the look is the picture's own and every later beat stays inside it). The recording device is a THING of the scene and may be ADDRESSED as one — a subject notices the ${shown === "CCTV" ? "security camera" : shown} and looks straight into its lens — that is the subject's action, not a camera word, and it holds the footage's look through the payoff (the bear that "recognized the lens of the overhead security camera" kept its CCTV; the T-rex that "looked directly up" lost it, job 6280175e).\n`;
};
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
/** A SYNTHESISED SPEAKER UNDER THE NAME LAW IS LABELLED BY ITS GUISE (owner 2026-09-09, job d8bd1a08: the plan's line was "the man (to T-rex)",
 *  the guard copied that label, and the name law refused the run twice over it). A dename'd figure's speaker label becomes its guise (build,
 *  clothing, posture) with the addressee kept; an omitted figure's line is dropped. Pure; null in, null out. */
export function denameSpeakers(block, modesJson = process.env.IP_FIGURES) {
  if (!block) return block;
  let modes = []; try { modes = JSON.parse(modesJson || "[]"); } catch { modes = []; }
  if (!Array.isArray(modes) || !modes.length) return block;
  const lines = String(block).split("\n");
  const out = [];
  for (const l of lines) {
    const m = l.match(/^(\s*)([^:\n(\[]{1,80}?)(\s*(?:\([^)]*\)\s*)*(?:\[\d+(?:\.\d+)?s\]\s*)?:)(.*)$/);
    if (!m) { out.push(l); continue; }
    const bare = m[2].trim().toLowerCase();
    const mode = modes.find((x) => (x?.names || []).some((n) => String(n).toLowerCase() === bare));
    if (!mode) { out.push(l); continue; }
    if (mode.mode === "omit") continue;
    const guise = String(mode.guise || "").trim();
    out.push(guise ? `${m[1]}${guise}${m[3]}${m[4]}` : l);
  }
  const kept = out.filter((l) => /:\s*"/.test(l) || /^\s*\S.*:\s*\S/.test(l)).length;
  return kept ? out.join("\n") : null;
}
export function buildDialogueBlock(planDialogue, stamps = DIALOGUE_STAMPS, fallbackSpeaker = null) {
  if (!(planDialogue || "").trim()) return null;
  const raw = planDialogue.replace(/^\s*Dialogue\s*:\s*/i, "").trim();
  // ⚠ NO ANONYMOUS LABELS (owner 2026-08-22, the walrus "Speaker [2s]" — MANUFACTURED HERE, not by the
  // writer: this default was "Speaker", reintroducing the exact label the law bans one stage after the
  // validator ran). A label-less plan line takes the CALLER's subject; with no subject either, the block
  // is DROPPED — an unlabeled line violates the label law and an absent block degrades gracefully.
  const m = raw.match(/^([^:\n]{1,80}?)\s*:/);
  const speaker = (m ? m[1] : (fallbackSpeaker || "")).trim();
  if (!speaker) return null;
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
`Write the shot script for a ${process.env.BEAT_DURATION || "4"}-second video generated FROM a real photograph.\n${singleBlock() ? "\u26a0 ONE BLOCK: the prose spans the whole duration in order, every photographed place entered before it ends." : "\u26a0 THE BEATS MUST SPAN THE WHOLE DURATION."} Space them evenly to the END: a 7-second clip needs beats at [0s] [2s] [4s] [6s], not three that stop at [4s]. Unscripted tail time is time the generator fills however it likes, which is where off-beat pacing and invented action come from.\n`
);

export const goalBlock = () => (
`⚠ THE GOAL — THE SHOT MUST READ AS A REAL CAPTURED MOMENT WITH A BEGINNING AND AN END. ` +
    `not a cinematic scene, not a spectacle — someone's camera happened to catch one small COMPLETE thing. We are ` +
    `NOT writing a text-to-video prompt: a text-to-video model's prompt must specify every visual detail, while ` +
    `we ALREADY HAVE THE PHOTOGRAPH. Dense visual description does not help here, it COMPETES with the reference ` +
    `(a verbose beat once made a penguin GROW; a spectacle-heavy beat turned a grainy night photo into a polished ` +
    `render). Take a text-to-video model's TEMPORAL AND NARRATIVE STRUCTURE only. The reference owns geometry, lighting, texture, ` +
    `lens and grade; the beats own TIME, CAUSALITY and INTENT. The CAMERA is NEVER written — no camera words, ` +
    `no framing, no shot-scale, no lens (a clause like "the camera tracks with it" is a law break): the ` +
    `reference's own framing IS the shot; write only what the SUBJECT does.` +
    (rideFromEnv()?.family === "dark ride" ? ` THE ONE EXCEPTION IS THIS DARK RIDE: the rider's own handheld camera may peer around — turn to look at what the ride passes and come back to the way ahead — see THE RIDE block; nothing else about the camera is written.` : "") + `\n\n`
);

export const framingConcessionBlock = (framingConceded) => (
(framingConceded
      ? `⚠⚠ FRAMING CONCESSION — the sourced plate is framed too WIDE for this action's fine detail, and a nearer plate could not be sourced. Author every beat at the plate's ACTUAL scale: describe only motion that READS WIDE — the group as a whole, whole-body movement, things entering, gathering or leaving — and NEVER per-actor detail (individual faces, paws, small gestures, one performer's business). If the action's point is fine detail, render it as a COARSE GROUP event: a row of performers rising and opening together, not one conductor's paw. Asking for detail this framing cannot show is exactly what makes the generator CUT IN, which is the one thing we are avoiding.\n\n`
      : "")
);

// ⚠ THE PLATE'S OWN QUESTIONER IS DESCRIBED, NEVER INVENTED (owner 2026-08-18: "often television news
// reporter holding a microphone will hit rung0, in which case you dont need to conjure the reporter but
// rather describe the reporter in frame0 to carry forward the scene"). A figure the photograph already holds
// needs no signatures and no reference — it needs to be READ. Same law as frame zero generally: the plate is
// the scene's first frame, so whoever stands in it is already cast.
// ⚠⚠ THE SPACE LAW LIVED ONLY IN THE BRAIN DOCTRINE, WHICH IS NOT WHERE THE SHIPPED BEATS ARE WRITTEN
// (measured 2026-08-18). manifest.mjs holds the plan/draft prompt; the POST-SCRAPE writers compose their laws
// from this module, and _ground_shotset does not import manifest at all. So the affordance law governed the
// DRAFT — which is only the fallback — while the beats that actually reach the generator had no space law of
// any kind. That is why the raccoon walked through the cage mesh, and why ten A/B samples showed no effect
// from a law they never received. Exported as TEXT so the brain can import the same bytes; two copies of a
// law drift, and a drifted law is worse than a missing one because it looks present.
export const RECONCILE_LAW = "⚠⚠ RECONCILE THE REQUEST WITH THE PHOTOGRAPH — THAT RECONCILIATION IS YOUR JOB, NOT A RULE YOU OBEY. The photograph is the ground truth for SPACE: what exists, what stands where, what is reachable from where. The request is the ground truth for INTENT. When the space cannot stage the action as asked, keep the intent and change only the staging — begin from the state that action would have produced, or stage it where the photograph allows. ⚠ AND NEVER INVENT STRUCTURE THE PHOTOGRAPH DOES NOT SHOW in order to make an action work. If you cannot see how a thing is reached, you do not know that it can be, and describing the route anyway is how a clip ends up showing a body passing through something solid. What you can actually see, use freely.";

export const reconcileLaw = () => `${RECONCILE_LAW}\n\n`;

export const plateQuestionerBlock = () => (
(process.env.PLATE_QUESTIONER === "1"
      ? `\u26a0 THE QUESTIONER IS ALREADY IN THE PHOTOGRAPH. Do not invent one and do not give them an ` +
        `appearance of your own: read the person the plate shows — what they wear, where they stand, what they ` +
        `hold — and write THAT into beat zero, then carry them forward unchanged. They are cast already; your ` +
        `job is to describe, not to conjure.\n\n`
      : "")
);

export const proseFiguresBlock = () => (
(process.env.PROSE_FIGURES
      ? `⚠ THESE FIGURES CARRY THEIR IDENTITY IN YOUR PROSE — there is NO reference image for them, by design ` +
        `(they are concepts the video model already knows, and a reference would collapse them into one arbitrary ` +
        `rendering). Introduce each ONCE, at first mention, in a SINGLE clause built from these fixed signatures, \u26a0 THE BRACKETED LIST IS DATA, NEVER PHRASING: name the figure in your own sentence and fold its signatures into that sentence's grammar. Never copy the brackets, the separators or the list itself into a beat. ` +
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
    `\u26a0 A PROP THE PLATE LACKS IS PLACED ON WHAT THE PLATE HAS. Naming a prop LICENSES it; it does not POSITION it. If the frame already holds an object of the same kind or use - a chair where the story wants a seat, a table where it wants a desk, a ledge where it wants a shelf - beat zero names the requested prop AT THAT OBJECT and lets it be that object. Keep the user's word for the thing; give it the host. A prop named loose ("nearby", "off to one side", "in the corner") binds to nothing, and the later beat whose action NEEDS it - sitting on it, opening it, climbing it - resolves somewhere else entirely.\n` +
    `\u26a0 ENTERING IS ALLOWED, AND IS PART OF BEAT ZERO. "Established at beat zero" does NOT mean "standing still at beat zero" - if the request says the subject ENTERS, then beat zero SHOWS IT ENTERING (walking in from the frame edge, coming through a doorway) and settling into place. Do not silently convert an entrance into a static arrangement; the entrance is an action the user asked for. What is forbidden is a subject FIRST APPEARING in a LATER beat.\n` +
    `\u26a0\u26a0 NOTHING MATERIALISES AFTER BEAT ZERO \u2014 a subject that simply BEGINS TO EXIST, with no ` +
    `visible route, is the violation. A subject popping into [2s] or [4s] out of nowhere is one the camera has ` +
    `been treating as absent, so the generator CUTS to go and find it, and a cut is the one thing we never want. ` +
    `\u26a0 AND BEAT ZERO IS THE CENSUS OF FRAME ZERO: whoever and whatever the PHOTOGRAPH already contains is ` +
    `present from the first frame, and beat zero holds them. THE PLACE AS PHOTOGRAPHED belongs to that census too (owner 2026-09-09: beat zero describes frame zero, the plate): beat zero names the place the picture shows and the objects and occupants the action touches, so nothing of the frame is left for the generator to guess. A device that made the photograph is NEVER announced as a caption — no "footage of …" at the head of a beat — its look is the picture's own and rides along untouched; the device is a thing of the scene a subject may look into. Had beat zero said "a woman is asleep in the bed" while the cats filed in, she ` +
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
    // NAME VIOLATIONS ARE NOT TIMING VIOLATIONS (owner 2026-09-08, job bd19152d: framed as ledger feedback, the writer MOVED the room's
    // name to another beat instead of removing it). A named place or figure is REMOVED — the scene stays, described by its things.
    (process.env.NAME_FEEDBACK ? `\u26a0\u26a0 YOUR PREVIOUS DRAFT NAMED WHAT MUST NOT BE NAMED: ${process.env.NAME_FEEDBACK}. Rewrite the SAME beats at the SAME stamps and REMOVE each such name: a place of the world is never named \u2014 the ride's own scene stays, described only by the things it carries ("the next scene, its walls hung with tiered black chandeliers"); a named figure is written by build, clothing and posture only. Never replace a name with another name of the same world.\n` : "") +
    // POLICY REPAIR (owner 2026-09-08): the video provider refused the previous draft on its content policy. The run says what to
    // change; the writer keeps the story, the stops and the stamps and rewrites only what the note names.
    (process.env.POLICY_FEEDBACK ? `\u26a0\u26a0 THE VIDEO PROVIDER REFUSED YOUR PREVIOUS DRAFT ON ITS CONTENT POLICY. Keep the same story, the same places in the same order and the same timestamps, and rewrite so that: ${process.env.POLICY_FEEDBACK} Return the full beat list and the dialogue block.\n` : "") +
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
`${charSig ? `⚠ THE CHARACTER'S VISIBLE SIGNATURES (read off the sourced character reference): ${charSig}. USE at least one of these IN THE ACTION — have the creature actually handle or use what it carries, rather than merely having it present. An identity performed is stronger than one only rendered.\n⚠⚠ A SIGNATURE OBJECT IS THAT FIGURE'S OWN, AND THE REFERENCE FIXES ITS LOOK. When the figure has a signature carried thing (a plush, a toy, a hat, a prop named in its signatures above OR referred to in the request as belonging to it — "his plush", "her doll") it is ONE specific object throughout, the exact one the reference shows. Name it the way the request/signatures name it and let the reference render it; NEVER assign it a colour, material or type the reference does not show — do not turn an orange plush into "a brown stuffed toy", do not invent a generic version of it, and never spawn a second fresh prop of the same kind. If the request has that object act ("his plush comes in to save him"), it is still HIS established plush doing the acting, not a new one.\n\n` : ""}`
);

// MUSIC THE MAKER ASKED FOR (owner 2026-09-07): allowed, in the Sound block, DIEGETIC — its source is in the scene.
const musicClause = () => (
  musicRequested(process.env.RAW_USER_PROMPT || process.env.USER_PROMPT || "")
    ? `⚠ THE REQUEST NAMES MUSIC, SO MUSIC IS ALLOWED — write it in the Sound: line as DIEGETIC music with its SOURCE in the ` +
      `scene ("warped 1930s swing from the ride's own speakers", "a brass band on the stand", "a radio on the counter"), described ` +
      `by era and genre, NEVER a named song, album or artist (a named work trips the provider's copyright check). It plays where ` +
      `its source is — it swells when the ride nears the speakers and fades in the tunnel — and it is the only music: no score, ` +
      `no soundtrack laid over the scene. `
    : `⚠ NEVER ask for MUSIC or a score — this is found footage, music breaks the realism AND the provider REFUSES generations ` +
      `whose invented soundtrack trips a copyright check (a warehouse clip was rejected outright on exactly that). `
);
export const soundLaw = () => (
`⚠ SOUND CARRIES THE STORY WHEN THE CAUSE IS OFF-FRAME. in a shot where the target of the ` +
    `action is outside the frame, "we dont know whats happening" until the consequence arrives — so the sound must ` +
    `tell us. Author DIEGETIC sound that does narrative work: an approach heard before it is seen, a bell or an ` +
    `engine locating something off-frame, an impact heard rather than shown, sound STOPPING to mark an event. Name ` +
    `sound in the beat that needs it. ⚠ AUTHOR THE SOUNDSCAPE — DO NOT LEAVE THE AUDIO SLOT TO THE FALLBACK. End the beats with a Sound: line naming the DIEGETIC ambience of each world the clip visits, in order, specific to what is on screen (water, a crowd, a mechanism, wind)${musicRequested(process.env.RAW_USER_PROMPT || process.env.USER_PROMPT || "") ? "" : `, closing with "no music"`}. A specific soundscape crowds out the generator's urge to score; a generic room-tone fallback invites it. ` +
    musicClause() +
    `Ambient and diegetic only.\n\n`
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

// ── THE MOOD FORK (owner 2026-08-24: «two moods one selects on the platform … same processes and rulings,
// breaks the rules where we've seen them broken in b30 and b28»). CANDID is the default and is
// BYTE-IDENTICAL to the law as it stood — the fork is falsy-safe; an absent flag changes nothing.
// CINEMATIC re-licenses exactly the four seams the b28/b30 forensics identified as the fever-dream moment (register named "cinematic" (owner 2026-08-25: montage grammar, cross-location tension — "conjure"/"dream" rejected as untrue or unslick)):
//   1. cut targets with NO photograph behind them (the flashback licence + hard-cut reset),
//   2. physics-free spectacle after beat zero,
//   3. one non-diegetic property riding the payoff (a glow), and the object-looms-to-fill-frame move,
//   4. denser cadence (density floor 1.5s → 1.0s per beat).
// Everything else is SHARED law in both moods: sourcing, clearance, blur, captions, de-naming, camera
// silence, action-zero, identity-as-prose, the Sound line — and frame zero still grounds on a REAL plate.
export const genMood = () => (process.env.GEN_MOOD === "cinematic" ? "cinematic" : "candid");

// ── NARRATIVE vs OBSERVATIONAL (owner 2026-09-07, universal on the platform). A plan whose maker asked for no plot and no drama is a VIEW
// HELD: the laws that serve plot and drama — payoff, climax, twist, overstep, the comedy construction — step aside, the count set is
// {2,4}, and the last beat is where the view rests. Read from the run's TELLING (tellingMode in _gate_rules); absent = narrative.
export const telling = () => (process.env.TELLING === "observational" ? "observational" : "narrative");
// ── ONE BLOCK FOR A MULTI-WORLD-REF ONE-TAKE (owner 2026-09-07, from the golden gen d73f9ca1: a single "[0s]" and three sentences
// of continuous prose, no later stamps — the only ride gen that read as one take; every stamped one restarted at each place).
// Set by the run when the take never cuts and more than one WORLD photograph rides in the bag (character refs never count).
export const singleBlock = () => process.env.SINGLE_BLOCK === "1";
// FIGURES THE PROSE NEVER NAMES (owner 2026-09-08; _gate_rules.ipFigureModes): the run computes each figure's mode from the
// resolver's verdicts — dename (described, never named) or omit (not written at all); public-domain figures never appear here.
export const ipFiguresLaw = () => {
  let modes = []; try { modes = JSON.parse(process.env.IP_FIGURES || "[]"); } catch { modes = []; }
  if (!Array.isArray(modes) || !modes.length) return "";
  const dename = modes.filter((m) => m && m.mode === "dename"), omit = modes.filter((m) => m && m.mode === "omit");
  return `⚠⚠ FIGURES THAT ARE NEVER NAMED (a public-domain figure and a work's lesser figures are named and described; a work's FACE and a real person are not): ` +
    (dename.length ? `${dename.map((m) => `"${m.name}" is written ONLY as a description of build, clothing and posture${m.guise ? ` — ${m.guise}` : ""} — never the name, not in a beat, not in a speaker label`).join("; ")}. ` : "") +
    (omit.length ? `${omit.map((m) => `"${m.name}"`).join(", ")} ${omit.length > 1 ? "do" : "does"} not appear at all — the signature IS the name, and a description would still be it. ` : "") +
    `The request's own words may name them; your beats and dialogue may not.\n`;
};
export const viewLaw = () => (
`\u26a0\u26a0 THIS IS A VIEW HELD, NOT A STORY (the maker's words ask for nothing to happen and nothing to turn \u2014 no plot, no drama). ` +
    `So: NO payoff, NO climax, NO twist, NO punchline, NO reveal, NO overstep \u2014 never manufacture an event to end on. ` +
    `The beats are the view's STATIONS: what the frame passes or holds, in order, each a physical change the form's own motion brings ` +
    `(the next place entered, what streams past, a light that changes). The last beat is where the view RESTS, not where something lands; ` +
    `a quiet end is correct here. Figures and speech only when the maker's words carry them. Everything else in this contract stands: ` +
    `the photograph owns the place, the camera is never written, a travelling take never cuts.\n\n`
);

export const payoffLaw = () => (telling() === "observational" ? "" : genMood() === "cinematic"
? `⚠ THE PAYOFF LANDS LAST, AND IT MAY LAND ACROSS A CUT. Put the consequence in the FINAL beat — and in ` +
    `this register the consequence may arrive in the dreamed place the story cut to, not only where it began. ` +
    `The event itself may be larger than physics: a creature flung skyward, a fall that hangs, a leap the ` +
    `real world would refuse. ONE impossible property may ride the payoff — an object may glow, shimmer, or ` +
    `pulse — one, not a light show. And one camera-adjacent move is licensed here alone: an object may fly ` +
    `toward the viewer until it fills the frame. Every other camera word stays banned; the shooting is still ` +
    `a mundane fixed witness to an impossible event.\n\n`
: `⚠ THE PAYOFF LANDS LAST, AND THE RESTRAINT IS IN THE CAMERA - NOT IN THE STORY. Put the consequence in ` +
    `the FINAL beat. What must stay unstaged is the SHOOTING: a real camera does not reframe, push in, or hunt ` +
    `the money shot, so nothing is composed FOR the lens and no spectacle is front-loaded into beat 1. ` +
    `⚠⚠ THIS IS NOT A LIMIT ON HOW MUCH HAPPENS. An ` +
    `earlier version of this rule told you to keep the payoff SMALL and preferred ANTICLIMAX, and that ` +
    `suppressed the exact thing this branch exists for. The comedy is NARRATIVE-DENSE: a densely plotted, fully ` +
    `committed absurd event captured by a mundane fixed camera. The mundane CAPTURE is what makes the absurd ` +
    `CONTENT funny - so be restrained about FRAMING and generous about STORY. Let the event land on frame and ` +
    `let the characters react to it. Something happening off-frame may still be HEARD rather than chased. ` +
    // ⚠ THE WORLD PARTICIPATES (owner 2026-08-23): the delivered clips' worlds stood STATIC through their
    // payoffs — the event happened AT the scene, never TO it. Consequences are actions, so the no-scene law
    // is untouched: touched props were always nameable; now the touch must have a result.
    `⚠ THE CLIMAX RECRUITS THE SCENE: what the event touches MOVES — objects topple, spill, scatter, swing; ` +
    `bystanders react in frame. Consequences are ACTIONS the camera sees, never described scenery — name a ` +
    `prop when the event touches it, and let every touch have a visible result.\n\n`
);

// ⚠ ANIMAL EXCLUSION IS CONDITIONAL (owner 2026-08-14, verbatim: «the animal exclusion applies only when
// the user didn't ask or imply»). User wrote speech → their words (unchanged law). User asks/IMPLIES a
// talking creature without supplying words → the writer WRITES the speech. No ask, no implication → mute.
// "Imply" is intent-sensitivity, not explicit-ask-only. Single-world non-IP cut law untouched by the
// parallel multi-cut ruling (celeb/ip/crossover only — orchestrator relay, same date).
export const seesawLaw = (BEAT_STYLE) => (telling() === "observational"
? `\u26a0 THE SEESAW UNDER A VIEW: no turn is invented \u2014 the maker asked for a view, not an event. Speech only when their words gave someone speech, or the scene's own people plausibly speak in passing; diegetic, never narration, never music.\n`
: `⚠⚠ THE SEESAW - HOW MUCH OF THE STORY IS YOURS TO WRITE. Ported from src/composer/seesaw.ts, whose law is ` +
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

export const situationArc = () => (telling() === "observational" ? "" : genMood() === "cinematic"
? `⚠ IF THE PROMPT DESCRIBES A SITUATION WITH NO EVENT, INVENT ONE AND GIVE IT A REAL ARC — and in this ` +
    `register the arc may LEAVE THE PHOTOGRAPH. Beat zero still happens in the real place the photograph ` +
    `shows, mid-action. After that, the spectacle may defy physics — a creature flung skyward, a leap the ` +
    `real world would refuse — and the story CARRIES AT LEAST ONE HARD CUT to a place the photograph never held — the cut is this register's signature move, not an option: open that ` +
    `cut beat by naming the place plainly ("Hard cut to a sunny grassy meadow:") — the ONE place-naming ` +
    `licence in this contract, allowed ONLY on a cut to an unphotographed place. Anyone who first appears ` +
    `in the dreamed place enters AT the cut, never before it; a hard cut back is equally licensed, and the ` +
    `payoff may land on either side. Scale the invention to the DURATION, not to a fixed minimum - fill ` +
    `the beats you have.\n\n`
: `⚠ IF THE PROMPT DESCRIBES A SITUATION WITH NO EVENT, INVENT ONE AND GIVE IT A REAL ARC. Some prompts are a subject in a place ` +
    `and nothing more ("a rabbit outside someone's front door"). A situation is not a captured moment — something ` +
    `must HAPPEN and then be OVER. Author a tiny complete incident that suits the place and the creature: it ` +
    `arrives, does one specific thing, and reacts or leaves. Use whatever the photograph actually contains as the ` +
    `Scale the invention to the DURATION, not to a fixed minimum - fill the beats you have. ` +
    // ⚠ C — THE OVERSTEP LADDER (owner 2026-08-23, activated on the measured trigger: the real pipeline's
    // restraint stack averaged the A+B climaxes down — zeus landed "lights on, a nod". The middle of the arc
    // is now a STRUCTURAL slot for size, not a volume contest: the pigeon-register ruling — don't just work
    // the register, work it in hilarious fashion — generalized to every arc. Amended same day: the ladder
    // applies at EVERY duration — the original "short clip = setup and payoff" carve-out let 6s clips skip
    // the overstep entirely (the guard flinched and dropped a bow).
    `Every clip, whatever its length, carries setup, OVERSTEP and consequence: the ` +
    `middle escalates PAST the sensible version of the action — the subject overdoes, overcommits, oversteps ` +
    `the reasonable form of what it is doing — and the final event is the consequence the overstep earned. ` +
    `With few beats the overstep and its consequence may share a beat; neither may be skipped. ` +
    `Ordinary in KIND (a real thing that could happen in that place) but never artificially small in AMOUNT.\n\n`
);

// ⚠ SIGNATURE CHANGED 2026-08-20 (the depth ruling): the grid argument died with the grid — the stamped
// branch now hands the writer the LEGAL COUNT SET and the placement rules instead of a prescribed list.
// The single-ref writer is the only consumer (_ground_shotset deliberately never imported this).
// the narrative line through the beats (owner 2026-08-21/23) — a view (telling observational) takes STATION_LINE instead
const FEELING_LINE = (
        `Each beat describes ONLY what physically CHANGES at that moment — a movement, a gesture, a ` +
        `small event. But a beat IS a movement of feeling, not an action counted: across the beats one ` +
        `emotion must move — build, dip, or turn — and find its CLIMAX at the final beat. ` +
        // ⚠ REGISTER ≠ SIZE (owner 2026-08-23, the spectacle ruling): "a deadpan climax counts" was read as
        // license for micro-gesture endings — Zeus POKED the fuse box, the reaper's payoff was a GRIN. The
        // owner's own exemplar separates the axes: the cat SMASHES the counter (huge event) and lets off one
        // flat meow (deadpan register). Deadpan is a register; the event is still the premise's largest.
        `⚠ THE CLIMAX IS AN EVENT, NOT AN EXPRESSION: the final beat's change is a whole-body, whole-scene ` +
        `PHYSICAL event — the largest the premise affords. An expression or micro-gesture may ride the climax ` +
        `but can never BE it. Deadpan is a REGISTER, never a size — flat delivery over a big event is the ` +
        `form's own joke. Escalation is optional; the one failure is a flat end.\n`
);
const STATION_LINE = `Each beat describes ONLY what physically CHANGES at that moment \u2014 a movement, the next place entered, what streams past. ` +
    `Under a view a beat is a STATION, not a movement of feeling: no climax is owed, no escalation, and a quiet last beat is correct; ` +
    `the line through the beats is the view's own progression.\n`;
export const outputShape = (secs, counts) => (
singleBlock()
      ? `Return ONE BLOCK: a single "[0s] " stamp followed by the whole take as continuous present-tense prose — one paragraph, ` +
        `the photographed places entered in story order and joined by the ride's own motion ("then crests", "drops into", "emerges ` +
        `into"). NO further timestamps: on a travelling take a stamp per place reads as a CUT MARKER and restarts the place without ` +
        `its rails (measured 2026-09-07: the one-block take carried through; every stamped take restarted). Name the way ahead as each ` +
        `place is entered — the rails or path running on through the doorway, the archway, the tunnel mouth — so the track is drawn ` +
        `INTO it; enter the first photographed place early and give each place its share of the take, in order; the opening is a moment, not a scene. ` +
        `The rider is never written \u2014 no hands, clothing, legs or body; the vehicle is the bar, the nose, the bow, the rails. ` +
        `Each sentence describes ONLY what physically changes — a movement, the next place entered, what streams past. ` +
        `\u26a0 DO NOT DESCRIBE THE SCENE OR SETTING: the photographs carry the places; write nothing about the location, weather, ` +
        `lighting, time of day, surfaces or background, and name props only when the motion touches them.\n\n`
      : (process.env.BEAT_BLOCKS !== "0"
      ? `Return your beats one per line, each stamped "[Ns] …" in WHOLE seconds: ` +
        `${counts.length > 1 ? `choose a beat count from {${counts.join(", ")}} — whichever this material wants; different materials deserve different counts` : `exactly ${counts[0]} beats`}, ` +
        `first beat at [0s], stamps ascending, all under ${secs}s. Spacing is yours — beats need not be evenly ` +
        `spaced; two may land close and a third delayed. ` +
        // ⚠ A BEAT IS A FEELING, NOT AN ACTION COUNTED (owner 2026-08-21, on the first remix pair): «beats
        // arent actions in themselves, theyre a feeling … its about progression of emotion that finds climax
        // at the end (not a flat end) … it doesnt require escalation … but must find climax whether deadpan
        // or not. the point is not 3's of actions in the pure sense of just number, but rather how a plot
        // lands … the key here is flux of emotion but structure in 3's». The beat still DESCRIBES only
        // physical change (the no-scene and objectivity laws own the register); what this rules is the LINE
        // THROUGH the beats.
        (telling() === "observational" ? STATION_LINE : FEELING_LINE) +
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

// ── COMPLETENESS + LABEL LAWS (owner 2026-08-21, measured on the penguin deep remix): a beat that ends
// mid-sentence ("lets out a flat") and a dialogue line labeled "Speaker" both shipped. The laws are
// general non-IP-lane law — feed gens and remixes alike. Pure halves here; the writers re-ask on
// violation (the check-the-output pattern, never a fifth restatement).
export const incompleteBeatLines = (text) =>
  String(text || "").split("\n").map((l) => l.trim())
    .filter((l) => /^\[\d+(?:\.\d+)?s\]/.test(l))
    .filter((l) => !/[.!?…"”']$/.test(l));
// ⚠ ONLY truly ANONYMOUS labels ban — "Woman"/"Bartender" name a figure the beats established and are
// legitimate; "Speaker"/"Voice"/"Narrator" name nobody and hand the line to whoever happens to be visible.
export const genericSpeakerLabels = (text) =>
  String(text || "").match(/^\s*(?:Speaker|Voice|Narrator|Someone)\s*\d*\s*(?:\([^)]*\))?\s*\[\d+s\]\s*:/gim) || [];

export const hardConstraints = () => (
`⚠ HARD CONSTRAINTS — the photograph already determines these, and contradicting them corrupts the render:\n` +
    `• PROPS ARE BARE NOUNS — never name an object's construction, material or making; the thing, not its fabrication.\n` +
    `• EVERY BEAT IS A COMPLETE SENTENCE — a line that trails off unfinished corrupts the render it half-describes.\n` +
    `• A DIALOGUE LABEL NAMES ITS SPEAKER — a figure the beats established; never a generic label.\n` +
    `• NEVER mention how BIG, SMALL, NEAR or FAR the subject is, and never say it grows, shrinks or approaches.\n` +
    (rideFromEnv()?.family === "dark ride" ? `• CAMERA ON THIS DARK RIDE — the rider's own handheld camera: it may peer around, turning to look at what the ride passes and coming back to the way ahead (see THE RIDE); the ladder below otherwise stands — never a zoom, push-in, crane, dolly or reframe.\n` : "") +
    (rideFromEnv()?.kind === "ridden" ? `• DIALOGUE ON THIS RIDE — "Ride narrator" (the ride's own speakers) and a speaking animatronic named as its figure are established speakers of the form; they need no listener in frame.\n` : "") +
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
    (singleBlock() ? `2. The single [0s] block covers the FULL ${process.env.BEAT_DURATION || "4"} SECONDS in order: every photographed place is entered, and the last sentence is where the take ends.\n` : `2. The beats SPAN THE FULL ${process.env.BEAT_DURATION || "4"} SECONDS, evenly spaced, last beat near the end.\n`) +
    `3. EVERY subject exists in beat [0s], including anything the photograph does not show. Nothing appears for the ` +
    `first time later.\n` +
    `4. NO camera words anywhere.\n`
);

// ── STAMPED-OUTPUT MACHINERY (joined the export set 2026-08-14: the owner's hybrid fold — stamps + Cut-N +
// capture sentence — makes the stamp machinery SLOT payload for the merged contract, not world-only) ─────────
// ── THE COUNT IS THE WRITER'S; THE LAW IS THE SET (owner 2026-08-20, the depth ruling) ────────────────────
// «economy of statement (3,6,9) beats … its not a deterministic formula, it depends on the writer. and the
// beats dont need to occur in equal spaces of time» — and the density half: «6s cant carry 6 beats (1 per
// second is too much)». So: legal counts are the members of {3,6,9} that give each beat ≥1.5s of screen
// time — 6s→{3}, 9s→{3,6}, 12s→{3,6} (the owner's own "6 in 2 spaces"), 15s→{3,6,9} — and WHICH one, and
// WHERE the stamps land, is authorship: whole seconds, [0s] first, ascending, syncopation welcome.
// Vacuum-lab measured (2026-08-20): 7/7 legal scripts under this contract, counts varying with material,
// while the arithmetic grid below gives an illegal 5 at 9s — the punch clips' "5 arithmetic beats with no
// act structure" that this ruling was written from. Enforcement is unchanged in KIND (a validator re-asks,
// the density lesson's own mechanism); only the meaning of "wrong" moved from grid-disagreement to
// ILLEGALITY. `counts` is overridable for the short-duration fallback the caller supplies.
// CINEMATIC relaxes the density floor to 1.0s/beat (the b-era cadence: more cuts, more dream); CANDID keeps 1.5.
export const legalBeatCounts = (secs) => (singleBlock() ? [1] : telling() === "observational" ? [2, 4] : [3, 6, 9]).filter((c) => secs / c >= (genMood() === "cinematic" ? 1.0 : 1.5));
export const stampsLegal = (stamps, secs, counts = legalBeatCounts(secs)) =>
  counts.includes(stamps.length) && stamps[0] === 0
  && stamps.every((v, i) => Number.isInteger(v) && v < secs && (i === 0 || v > stamps[i - 1]));

// ── CANON COMPILES TO MANNER (owner 2026-08-20): «whatever the characterization should imbue within the
// bounds of action, almost blending but not giving out on the central piece of actions». The character never
// takes a sentence from the action — it shows only in HOW the actions are performed, on bare nouns (owner:
// «stitched mouth is description we dont do»). The canon itself is the RESOLVER's derivation over a
// CONFIRMED entity — this block is data-driven and collapses to nothing for a rhetorical John Doe.
export const charContextBlock = (canon) => (canon && (canon.temperament || canon.attachment || canon.always)
  ? `⚠ CHARACTER CONTEXT — show it ONLY in HOW actions are performed, never as a statement; the character ` +
    `never takes a sentence from the action, and ordinary props stay bare nouns (the figure's OWN signature object is the exception — it keeps its referenced identity, never recoloured): ` +
    `temperament: ${canon.temperament || "—"} · attachment: ${canon.attachment || "—"} · always: ${canon.always || "—"}\n\n`
  : "");

// ⚠ CELEB-ONLY (CELEB_STAMPS=1 in _ground_shotset) plus the short-duration fallback (<4.5s has no legal
// count above). The single-ref writer no longer consumes this grid — the depth ruling retired it there.
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

// ── SECONDARY RECASTS (owner 2026-08-29, the cymbal-king ruling) ────────────────────────────────
// "the swap grammar should recast every role-bearing occupant the story re-casts, not just the
// subject's stand-in. but we should limit it to three." The validated moat law already says a real
// in-role body is the SWAP TARGET, never an obstacle — a sleeping woman is the perfect stand-in for
// a sleeping king. This extends that ruling from the subject's stand-in to every occupant the story
// re-casts, hard-capped at three bodies total (subject included): the owner's stated worry is that
// too many simultaneous swaps may diffuse the render, so the cap is a quality guard, not a nicety.
export const RECAST_CAP = 3;

/** The secondary-recast law block for the writer instruction. `others` = the plate-reader's list of
 *  OTHER real occupants (each {body, position, doing}); trimmed to RECAST_CAP-1 (the subject's own
 *  stand-in holds the first slot). Pure — vacuum-tested. Returns "" when there is nobody to recast. */
export function recastLaw(others, cap = RECAST_CAP) {
  const list = (Array.isArray(others) ? others : [])
    .filter((o) => o && typeof o.body === "string" && o.body.trim() && !/^none$/i.test(o.body.trim()))
    .slice(0, Math.max(0, cap - 1));
  if (!list.length) return "";
  const lines = list.map((o) => ` • ${o.body.trim()}${o.position ? ` (${String(o.position).trim()}` + (o.doing ? `, ${String(o.doing).trim()}` : "") + ")" : o.doing ? ` (${String(o.doing).trim()})` : ""}`).join("\n");
  return `\nSECONDARY RECASTS — the photograph ALSO contains:\n${lines}\n` +
    `When a story character's ROLE matches an occupant's — a sleeping person for a sleeping king, a clerk for the story's clerk — ` +
    `beat zero MUST state that story body at the occupant's EXACT position, replacing it: the same replacement grammar as the subject. ` +
    `⚠ HARD CAP: at most ${cap} bodies are replaced in total, the subject's stand-in included — recast only role-matching occupants. ` +
    `Every other occupant KEEPS ITS PLACE: leave it real and unmentioned, and never invent a replacement for a body whose role the story does not name.`;
}
