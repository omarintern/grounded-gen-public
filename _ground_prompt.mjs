// GROUND-THE-PROMPT (form follows function) — author the seedance beats AFTER the scrape, to the scrape's
// ACTUAL conditions. The LLM does NOT write the final prompt before the scrape; it works WITHIN what was
// sourced. A VLM READS the picked world-ref, names the real STAND-IN occupant at the action spot, and the
// beats then DIRECT the swap: replace <stand-in> with <target creature>, taking its exact place/pose. If the
// stand-in IS ALREADY the target (the scene's own animal — stand-in == character), NO swap: normal beats for
// the subject's action (+ any conjured 2nd subject). Runs between the sourcer pick and the gen.
//   node _ground_prompt.mjs <worldRef.jpg> "<user prompt>" <slug>
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { providerJson, providerText, textPart, imagePart } from "./provider-llm.mjs";
import { ELEMENTS_FIELD, invokeClause, worldSimClause } from "./_invoke.mjs";   // INVOKE + world-sim bar (seesaw half inline below; dedupe post-test)

const HERE = dirname(fileURLToPath(import.meta.url));
const [worldRef, userPrompt, slug = "scene", ...charRefs] = process.argv.slice(2);
// CHARACTER REFS (owner 2026-07-30): the beat writer used to see ONLY the world-ref, so it knew the subject
// as WORDS while the delivered clip carried a sourced character IMAGE it had never seen. Consequence: it wrote
// the "all roads lead to Rome" rabbit without the POCKET WATCH — the meme's whole signature — because nothing
// told it there was one. "The vlm might need to see the character ref, see the watch and write effectively …
// we need to consider not just world-ref post-scrape for the prompt, but also character-ref."
if (!worldRef || !userPrompt) { console.error('usage: node _ground_prompt.mjs <worldRef.jpg> "<prompt>" <slug>'); process.exit(1); }

// FRAMING CONCESSION (ii) — the sourcer folds an action-detail check into action_spot_room. When the finally-
// picked plate is framed too WIDE for this action's fine detail (a nearer view could not be sourced), the
// adaptive loop flags framing_conceded in adapt_<slug>.json. Then author every beat at the plate's ACTUAL scale
// — group / whole-body motion only, never per-actor detail — or the render CUTS IN to show detail the frame
// can't hold (validated: a wide bedroom + a per-cat choir → invented cuts). FRAMING_CONCEDED=1 forces it
// (manual / REUSE_REF testing, where the sidecar is stale or absent).
let framingConceded = process.env.FRAMING_CONCEDED === "1";
if (!framingConceded) {
  try { framingConceded = JSON.parse(readFileSync(join(HERE, "out/_aspect", `adapt_${slug}.json`), "utf8"))?.framing_conceded === true; } catch {}
}
if (framingConceded) console.log("framing: CONCEDED → beats pitched to the plate's scale (no per-actor detail)");

// 1. INTENT (text-only) — the target creature + its action, extracted from the user's prompt.
const intent = await providerJson([textPart(
  `Return ONLY JSON {"target":"the single main creature/subject the video should feature, as a plain visual noun phrase e.g. 'a large brown bear'","action":"EVERY action the request names, in order, as one phrase - NOT a summary. The request is a SEQUENCE and each verb is a beat: 'enter a room and perform a choir, waking her up' has THREE (entering, performing, waking) and all three must survive. Compressing it to 'singing in a choir' DELETED the entry and the payoff (validated failure 2026-07-31)","secondary":"any OTHER creatures/props to CONJURE INTO the scene, else ''. ⚠ THE PLACE ITSELF IS NEVER LISTED HERE. This field names only what must be ADDED to a photograph that already exists; the location and its fixed furnishings are supplied BY THAT PHOTOGRAPH, so they are not things to conjure. If the request names a place, that place belongs in the action, never in this field."}. Prompt: "${userPrompt}".`
)], { maxTokens: 900, temperature: 0.2 });

// 2. READ THE SCRAPE (VLM) — what real STAND-IN is actually in the picked world-ref, and is it already the target?
const b64 = readFileSync(worldRef).toString("base64");
const seen = await providerJson([
  textPart(`You are looking at the WORLD-REF photo a video model will animate. The video should feature: ${intent.target} (${intent.action}). Return ONLY JSON {"scene":"brief description of the real place/scene as photographed","standin":"the SINGLE real occupant/subject currently AT THE ACTION SPOT that the target should REPLACE — the body the model swaps (e.g. 'the person driving', 'the clerk at the counter', 'the raccoon on the table'); if the action spot is empty say 'none'","standin_is_target":boolean (TRUE only if that occupant is ALREADY a ${intent.target} — the same kind of creature — so NO swap is needed),"standin_placement":"foreground | side | background | none",${ELEMENTS_FIELD}}.`),
  imagePart("image/jpeg", b64),
], { maxTokens: 1000, temperature: 0.2 });

// 2b. READ THE CHARACTER REFS (VLM) — what does the sourced character actually LOOK like, and what does it
// CARRY or WEAR that the beats can put to work? A signature the beats never touch is a signature the action
// cannot use; naming it in a beat is how the identity gets performed rather than merely rendered.
let charSig = "";
// char refs arrive as "Name=path" so the VLM can be told WHO it is looking at (see _run.mjs)
// Beat stamps DERIVED from the duration. This line used to hardcode `[0s] [2s] [4s]` and "2-3 beats", so a
// 7-second clip was explicitly instructed to stop at 4 seconds — no amount of "span the full duration" elsewhere
// could win against a literal format spec. Every 2s, last stamp at least 2s before the end.
const BEAT_SECS = Math.max(2, Math.round(Number(process.env.BEAT_DURATION || 4)));
const BEAT_STAMPS = Array.from({ length: Math.max(2, Math.ceil(BEAT_SECS / 2)) }, (_, i) => i * 2)
  .filter((t) => t < BEAT_SECS); // any stamp BEFORE the end — reproduces the validated patterns:
                                   // rabbit 8s = [0,2,4,6] (owner: perfect), porch 5s = [0,2,4] (near perfect)
const charNames = charRefs.map((r) => (r.includes("=") ? r.split("=")[0] : "")).filter(Boolean);
const charPaths = charRefs.map((r) => (r.includes("=") ? r.split("=").slice(1).join("=") : r));
if (charPaths.length) {
  const parts = [textPart(
    `You are looking at the CHARACTER reference image(s) for: ${charNames.join(", ") || intent.target}. ` +
    `⚠ These images depict THAT character — NOT the scene's main subject. Describe ONLY what you see of the named ` +
    `character; ignore any other creature, animal or background element in the picture (a Santa illustration may ` +
    `contain reindeer — the reindeer are NOT the character). ` +
    `Return ONLY JSON {"signatures":["the 2-5 most DISTINCTIVE visible things about this character — what it WEARS, ` +
    `CARRIES or HOLDS, and any object that is part of its identity"],"carried":"the single most usable object it ` +
    `holds or carries for an action, or '' if none"}. Name only what is VISIBLE in the image.`)];
  for (const r of charPaths) {
    try { parts.push(imagePart("image/jpeg", readFileSync(r).toString("base64"))); } catch {}
  }
  try {
    const cs = await providerJson(parts, { maxTokens: 700, temperature: 0.2 });
    const sig = (cs?.signatures || []).filter(Boolean);
    if (sig.length) charSig = sig.join("; ");
    if (cs?.carried && !/^none$/i.test(cs.carried)) charSig += `${charSig ? " | " : ""}CARRIES: ${cs.carried}`;
    if (charSig) console.log(`charref : ${charSig}`);
  } catch {}
}

// 3. AUTHOR THE BEATS — MINIMAL (form follows function). For a SWAP, keep it to the BARE instruction
// "replace <stand-in> with <target>": the REFERENCE already carries the motion + scale, so OVER-describing
// size/pose/motion FIGHTS it and breaks physics (validated: a verbose "takes the exact size … rides upward"
// made the penguin GROW up the escalator). Templated (not LLM-elaborated) to guarantee minimalism.
const has = (s) => s && !/^none$/i.test(String(s).trim());
let beatLine, mode;
if (seen.standin_is_target) {
  mode = "animate (stand-in IS the target)";
  // stand-in IS the subject — use the clean TARGET noun + action (NOT the verbose VLM stand-in string, which
  // already embeds an article + the action → doubled words like "The the red fox trotting … trotting …").
  const T = String(intent.target).charAt(0).toUpperCase() + String(intent.target).slice(1);
  beatLine = `[0s] ${T} ${intent.action}${has(intent.secondary) ? `, with ${intent.secondary} in the scene` : ""}.`;
} else if (has(seen.standin)) {
  mode = `SWAP: ${seen.standin} → ${intent.target}`;
  beatLine = `[0s] Replace ${seen.standin} with ${intent.target}. Everything else in the scene stays exactly as photographed.`;
} else {
  mode = "conjure (empty action-spot — really wants an image-model insert, rule 11b)";
  beatLine = `[0s] ${intent.target} appears in the scene ${intent.action}; everything else stays exactly as photographed.`;
}
// ── NARRATIVE BEATS (BEAT_STYLE=narrative) — the "narrative way": the user's prompt rewritten into a short
// TEMPORAL script rather than one flat instruction. Owner 2026-07-29: "we need to test with the narrative-dense
// beats, of course taking in user demands / prompts but rewriting for beats."
//
// ⚠ THE PHYSICS TRAP THIS MUST AVOID: an earlier verbose beat ("takes the exact size … rides upward") made a
// penguin GROW as it moved, because re-describing SIZE / SCALE / MOTION fights what the reference photo
// already encodes. The reference owns geometry; the beat owns TIME. So narrative mode may elaborate WHAT
// HAPPENS and WHEN, and is forbidden from describing subject size, distance, camera movement, lens, framing,
// or image quality — all of which come from the sourced frame and must not be contradicted.
// ⚠⚠ NARRATIVE IS THE DEFAULT (2026-08-01). This was opt-in behind BEAT_STYLE=narrative, which only the hand-
// written experiment scripts ever set — so every DEFAULT run, including the autonomous ones, shipped the
// minimal template above and nobody saw it, because the template still produces a working clip whenever the
// ref is strong and the action is simple.
// What it costs when the story is not simple: on a 7s TWO-LOCATION prompt with cuts explicitly PERMITTED, the
// planner authored a proper temporal script and this stage replaced it with the raw user sentence plus a
// mechanical requirements list — one beat, no time blocks, no cut. The template names WHAT THE SUBJECT IS and
// never WHAT IT DOES OVER TIME, so it structurally cannot express a story that moves, a payoff that lands
// last, or the anthropomorphic-competence joke that is the whole point of the non-© branch.
// The minimal template REMAINS, in two roles that both still matter: it is the automatic fallback when the
// narrative beats fail to parse (see the tail of this block), and BEAT_STYLE=minimal selects it deliberately
// for a pure SWAP, where over-describing motion fights the reference's own geometry.
// ⚠⚠ THE STYLE IS MEASURED FROM THE REQUEST, NOT FIXED. A single default is wrong in both directions: it
// either invents a story over a user who already wrote one, or withholds one from a user who wrote a bare
// situation. The seesaw law governs the STYLE too — broad prompts get populated, heavily detailed prompts get
// nothing they didn't invite — so the pole is computed per request and the env var only OVERRIDES it.
//   spectacle — the request is a situation. Invent the turn, write the speech, build the comedy.
//   minimal   — the request already carries its own turn, speech or genre. Deliver THEIRS; add little.
// Both poles write NARRATIVE beats with time blocks. "minimal" does NOT mean the flat template — the template
// loses the time blocks that make a beat a beat, and it is reachable only as BEAT_STYLE=template or as the
// automatic fallback when narrative beats fail to parse.
// ⚠ THIS IS A PRIOR, NOT A VERDICT. It is a cheap deterministic read of the request, passed to the beat writer
// as a tilt; the writer still judges turn and dialogue separately against what was actually supplied, because
// a request can state the turn and omit the speech or the reverse.
const SPEECH = /["“”'']|\b(?:says?|said|shouts?|yells?|whispers?|asks?|replies|screams?|mutters?|tells)\b/i;
const GENRE = /\b(?:funny|hilarious|comedy|comedic|dramatic|drama|scary|horror|tense|sad|romantic|awkward|absurd|epic)\b/i;
const TURN = /\b(?:then|suddenly|until|but|reveals?|realises?|realizes?|turns out|only to|before|after|when)\b/i;
// ⚠ NO VERB COUNT. "several distinct actions" sounds like the right signal and cannot be measured honestly
// here: a word-shape regex counts every plural noun as a verb (it scored "streetlamps" as an action), so it
// fired on plain situations and tilted them away from invention — the exact opposite of the intent. Length
// already proxies elaboration. Prefer three signals that mean what they say over four where one is noise.
function specDensity(p) {
  const s = String(p || "");
  let d = 0;
  if (SPEECH.test(s)) d += 3;            // they wrote speech — on its own, decisive: the scene is authored
  if (GENRE.test(s)) d += 2;             // they named the register
  if (TURN.test(s)) d += 2;              // they supplied the hinge
  if (s.trim().split(/\s+/).filter(Boolean).length >= 18) d += 1;   // a long request is a specified one
  return d;
}
const SPEC_DENSE = Number(process.env.SPEC_DENSE ?? 3);
const _density = specDensity(userPrompt);
const BEAT_STYLE = process.env.BEAT_STYLE || (_density >= SPEC_DENSE ? "minimal" : "spectacle");
console.log(`seesaw : spec-density ${_density} (dense at ${SPEC_DENSE}) → ${BEAT_STYLE}${process.env.BEAT_STYLE ? " (env override)" : ""}`);
if (BEAT_STYLE !== "template") {
  const swapClause = seen.standin_is_target
    ? `The ${intent.target} is ALREADY the creature in the photo — do not swap anything, just animate it.`
    : has(seen.standin)
      ? `Beat 1 MUST begin by replacing ${seen.standin} with ${intent.target}, which takes over that exact position.`
      : `Beat 1 MUST introduce ${intent.target} into the scene at the natural action spot.`;
  // ANTHROPOMORPHIC COMEDY — the point of the whole non-© branch, and the thing the minimal swap beat structurally
  // cannot deliver. Owner 2026-07-30, on a pigeon that replaced a laundromat clerk: "the pigeon didnt work the
  // register, it acted like a pigeon. comedy, the narrative way, is to overstep the usual and have the bird actually
  // work the register in hilarous fashion."
  // The swap template says WHAT the creature IS and never WHAT IT DOES, so the model renders a plausible animal
  // standing in a human's place — which is the un-funny reading. The joke is COMPETENCE: the creature performing
  // the human job deliberately and well, with specific physical business, not chaos and not animal behaviour.
  const humanRole = has(seen.standin) ? seen.standin : "the person who would normally be there";
  const comedyClause =
    `⚠ THIS IS THE JOKE, AND IT IS THE POINT OF THE SHOT. The ${intent.target} must ACTUALLY PERFORM the human ` +
    `job that ${humanRole} was doing — not merely stand in that spot behaving like a ${intent.target}. Work out ` +
    `what that job physically INVOLVES in this exact scene and have the creature DO IT, deliberately and ` +
    `competently, with whatever body it has. Invent SPECIFIC physical business — but PITCH IT AT THE DISTANCE ` +
    `THE PHOTOGRAPH WAS TAKEN FROM: business the WHOLE BODY performs and that reads from across the room, never ` +
    `business identified by the limb that does it or by the small object in its grip. Specific and coarse are ` +
    `not opposites — the same act can be written either way, and only one of them can be seen from here. ` +
    `The humour comes from COMPETENCE, not from mess: it is funny because the animal is unmistakably ` +
    `GOOD at a job it has no business doing, and treats it as completely routine. Do NOT write generic animal ` +
    `behaviour (pecking at crumbs, flapping, sniffing around, looking cute) — that is the boring reading and it ` +
    `wastes the shot. Do NOT have it fail, panic or wreck the place unless the prompt asked for that.`;
  // FULL OBSERVABILITY: dump the ENTIRE instruction the beat writer receives. Until now only its OUTPUT (the
  // beats) was inspectable, so the ruling that produced them — hundreds of lines of accumulated doctrine — was
  // invisible to review. Written every run to out/_aspect/<slug>_instruction.txt.
  const _dump = (t) => { try { writeFileSync(join(HERE, "out/_aspect", `${slug}_instruction.txt`), t); } catch {} return t; };
  const instruction = _dump(
    `Write the shot script for a ${process.env.BEAT_DURATION || "4"}-second video generated FROM a real photograph.\n\u26a0 THE BEATS MUST SPAN THE WHOLE DURATION. Space them evenly to the END: a 7-second clip needs beats at [0s] [2s] [4s] [6s], not three that stop at [4s]. Unscripted tail time is time the generator fills however it likes, which is where off-beat pacing and invented action come from.\n` +
    `SCENE AS PHOTOGRAPHED: ${seen.scene}\n` +
    `WHAT THE USER ASKED FOR: "${userPrompt}"\n` +
    `SUBJECT: ${intent.target} — ${intent.action}${has(intent.secondary) ? ` (also present: ${intent.secondary})` : ""}\n` +
    `${swapClause}\n${comedyClause}\n${worldSimClause()}\n${invokeClause(BEAT_STYLE, seen.elements)}\n\n` +
    `⚠ THE GOAL — THE SHOT MUST READ AS A REAL CAPTURED MOMENT WITH A BEGINNING AND AN END. ` +
    `not a cinematic scene, not a spectacle — someone's camera happened to catch one small COMPLETE thing. We are ` +
    `NOT writing a text-to-video prompt: a text-to-video model's prompt must specify every visual detail, while ` +
    `we ALREADY HAVE THE PHOTOGRAPH. Dense visual description does not help here, it COMPETES with the reference ` +
    `(a verbose beat once made a penguin GROW; a spectacle-heavy beat turned a grainy night photo into a polished ` +
    `render). Take a text-to-video model's TEMPORAL AND NARRATIVE STRUCTURE only. The reference owns geometry, lighting, texture, ` +
    `lens and grade; the beats own TIME, CAUSALITY and INTENT.\n\n` +
    (framingConceded
      ? `⚠⚠ FRAMING CONCESSION — the sourced plate is framed too WIDE for this action's fine detail, and a nearer plate could not be sourced. Author every beat at the plate's ACTUAL scale: describe only motion that READS WIDE — the group as a whole, whole-body movement, things entering, gathering or leaving — and NEVER per-actor detail (individual faces, paws, small gestures, one performer's business). If the action's point is fine detail, render it as a COARSE GROUP event: a row of performers rising and opening together, not one conductor's paw. Asking for detail this framing cannot show is exactly what makes the generator CUT IN, which is the one thing we are avoiding.\n\n`
      : "") +
    (process.env.PROSE_FIGURES
      ? `⚠ THESE FIGURES CARRY THEIR IDENTITY IN YOUR PROSE — there is NO reference image for them, by design ` +
        `(they are concepts the video model already knows, and a reference would collapse them into one arbitrary ` +
        `rendering). Introduce each ONCE, at first mention, in a SINGLE clause built from these fixed signatures, ` +
        `then never describe it again: ${process.env.PROSE_FIGURES}. Signatures only — no mood, no manner, no ` +
        `texture.\n\n`
      : "") +
    `\u26a0\u26a0 BEAT ZERO ESTABLISHES THE WHOLE SCENE - INCLUDING WHAT THE PHOTOGRAPH LACKS. The picture is ` +
    `the STARTING FRAME, not a limit on what may exist. If the story needs something the photo does not show, ` +
    `NAME IT IN THE FIRST BEAT as part of the opening state: "a woman is asleep in the bed", "a cat sits at the ` +
    `foot of the steps". The generator will put it there. VALIDATED: a porch plate containing no animal produced ` +
    `a near-perfect clip because beat one simply stated the cat was sitting in the snow.\n` +
    `\u26a0 BUT BEAT ZERO CANNOT HOLD WHAT THE PLATE CONTRADICTS. It may add what the photograph merely OMITS (an occupant off to one side, a prop that could already be there); it may NOT add something the photograph ACTIVELY SHOWS OTHERWISE - a display already lit with one picture, a wall already bare. Such an element ENTERS at the moment its change is plausible, by TRANSFORMING what the frame already contains (a screen resolves to a new picture, a panel lifts to reveal): that transformation IS its visible route. Forced into beat zero it fights the plate; introduced with no route the generator cuts.\n` +
    `\u26a0 ENTERING IS ALLOWED, AND IS PART OF BEAT ZERO. "Established at beat zero" does NOT mean "standing still at beat zero" - if the request says the subject ENTERS, then beat zero SHOWS IT ENTERING (walking in from the frame edge, coming through a doorway) and settling into place. Do not silently convert an entrance into a static arrangement; the entrance is an action the user asked for. What is forbidden is a subject FIRST APPEARING in a LATER beat.\n` +
    `\u26a0\u26a0 NEVER INTRODUCE A SUBJECT AFTER BEAT ZERO. Later beats may only CHANGE what already exists - ` +
    `move it, turn it, wake it, break it. A subject first appearing at [2s] or [4s] is one the camera has been ` +
    `treating as absent, so the generator CUTS to go and find it, and a cut is the one thing we never want. ` +
    `A subject the story needs but the beats leave unmentioned until midway is one the camera has been treating as absent, so the render cuts away to find it. Had beat zero said "a woman is asleep in the bed" while the cats filed in, she ` +
    `would have been present throughout and the waking could happen in place.\n` +
    `\u26a0\u26a0 BEAT ZERO LEADS WITH THE SCENE'S ACTUAL SUBJECT. Whoever or whatever the user's request is ABOUT is the grammatical subject of beat zero; anyone else present is CONTEXT and belongs in a subordinate clause or a following sentence, never in front. This is a writing rule first - a cat-choir joke that opens on a sleeping woman has its emphasis backwards - and it has a second, harder consequence. Promoting a vulnerable or unaware person to the opening subject of a covert-capture frame reads as surveillance of that person, and providers refuse it on content policy; the identical scene passes when the real subject leads. Do not soften or remove what happens - reorder so the real subject is in front and the person is present as context. `+
    `\u26a0\u26a0 BUT THE BAN IS ON MATERIALISING, NOT ON ARRIVING. A subject may appear at ANY beat PROVIDED the beat shows it ARRIVE by a route the frame already contains - through a door that opens, in from the edge of shot, up from behind furniture, down the stairs. What the generator cannot do is find a subject that simply BEGINS TO EXIST somewhere it was not: that is when it cuts. Ask which one you are writing. `+
    `\u26a0 AND SOME SUBJECTS MUST *NOT* BE IN BEAT ZERO. If the story's point is that someone is revealed - a door opens at the end and a person is behind it - then putting that person in frame at [0s] is a RED FLAG, not compliance: it spoils the reveal and contradicts the geometry, because a person behind a closed door is not in the room. The rule protects against POP-IN, not against entrances. Likewise a group that ENTERS need not all be in beat zero - the cats may file in at [2s] if the beat shows them coming through the doorway. `+
    `\u26a0 THE TEST: can the viewer SEE WHERE IT CAME FROM in the beat that introduces it? Yes -> it may arrive whenever the story wants. No -> it must be established at beat zero. `+
    `\u26a0 SO: put EVERY actor and EVERY prop the story needs into beat zero, however little of it the ` +
    `photograph shows. Spend the remaining beats CHANGING them. Never drop what the user asked for, and never ` +
    `hold a subject back as a reveal.\n\n` +
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
    `(Over-describing a tertiary figure over-weights it; deleting it entirely costs the premise. Name it once.)\n\n` +
    `${charSig ? `⚠ THE CHARACTER'S VISIBLE SIGNATURES (read off the sourced character reference): ${charSig}. USE at least one of these IN THE ACTION — have the creature actually handle or use what it carries, rather than merely having it present. An identity performed is stronger than one only rendered.\n\n` : ""}` +
    `⚠ SOUND CARRIES THE STORY WHEN THE CAUSE IS OFF-FRAME. in a shot where the target of the ` +
    `action is outside the frame, "we dont know whats happening" until the consequence arrives — so the sound must ` +
    `tell us. Author DIEGETIC sound that does narrative work: an approach heard before it is seen, a bell or an ` +
    `engine locating something off-frame, an impact heard rather than shown, sound STOPPING to mark an event. Name ` +
    `sound in the beat that needs it. ⚠ NEVER ask for MUSIC or a score — this is found footage, music breaks the ` +
    `realism AND the provider REFUSES generations whose invented soundtrack trips a copyright check (a warehouse ` +
    `clip was rejected outright on exactly that). Ambient and diegetic only.\n\n` +
    `\u26a0\u26a0 THIS RULE IS ROUTINELY IGNORED - CHECK YOUR OWN OUTPUT BEFORE RETURNING IT. Re-read every beat for 'as' / 'while' / 'and then' and split any that joins an act to its result. A beat may hold a concurrent STATE; it may not hold an act and that act's consequence. `+
    (process.env.ALLOW_CUTS === "1"
      ? `⚠⚠ THIS STORY SPANS MORE THAN ONE PLACE, SO YOU MAY CUT. Write the cut as an EVENT INSIDE a ` +
        `timestamped beat - "Hard cut to <the other place> of the same <building>: ..." - never as a separate ` +
        `label and never as a shot list. Three rules bind it. (1) NEVER AT THE FIRST BEAT: the opening frame is ` +
        `the photograph and must play from that camera untouched. (2) THE SECOND PLACE BELONGS TO THE SAME ` +
        `PREMISES the photograph establishes - one reference grounds one world, so name the relationship rather ` +
        `than inventing an unrelated location. (3) EVERY CUT MUST BE AN ACTUAL CHANGE OF PLACE, and this story ` +
        `has room for at most ${process.env.CUT_BUDGET || 1}. That number is derived from how many places the ` +
        `story visits, so it is a CEILING and never a target: use ONLY the cuts the story's own movement ` +
        `requires and no more. Never cut for variety, for emphasis, or to show something better — a cut spent ` +
        `on anything but a change of place is what turns a short story into a montage. Returning to the opening ` +
        `place is a legitimate use of one, and when you return show the CONSEQUENCE of what happened while away ` +
        `rather than resetting the room. ` +
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
        `the beats need must happen within the frame the photograph gives you.\n\n`) +
    `⚠ CAUSAL ORDER — AN EFFECT MUST APPEAR IN A LATER BEAT THAN ITS CAUSE. Never join a cause and its consequence ` +
    `in one beat with "as", "while" or "and then": that collapses them into the same instant and the render shows ` +
    `the effect already underway before the cause. Fusing them makes the render show the effect already underway before its cause. One link per beat: the act in one, its consequence in the NEXT.\n\n` +
    `⚠ THE PAYOFF LANDS LAST, AND THE RESTRAINT IS IN THE CAMERA - NOT IN THE STORY. Put the consequence in ` +
    `the FINAL beat. What must stay unstaged is the SHOOTING: a real camera does not reframe, push in, or hunt ` +
    `the money shot, so nothing is composed FOR the lens and no spectacle is front-loaded into beat 1. ` +
    `⚠⚠ THIS IS NOT A LIMIT ON HOW MUCH HAPPENS. An ` +
    `earlier version of this rule told you to keep the payoff SMALL and preferred ANTICLIMAX, and that ` +
    `suppressed the exact thing this branch exists for. The comedy is NARRATIVE-DENSE: a densely plotted, fully ` +
    `committed absurd event captured by a mundane fixed camera. The mundane CAPTURE is what makes the absurd ` +
    `CONTENT funny - so be restrained about FRAMING and generous about STORY. Let the event land on frame and ` +
    `let the characters react to it. Something happening off-frame may still be HEARD rather than chased.\n\n` +
    `⚠⚠ THE SEESAW - HOW MUCH OF THE STORY IS YOURS TO WRITE. Ported from src/composer/seesaw.ts, whose law is ` +
    `"broad prompts get populated; heavily detailed prompts get nothing they didn't invite". Judge TWO things ` +
    `about the user's request and regulate each INVERSELY to what they supplied. `+
    `(1) THE TURN - did they already give you the joke or the dramatic hinge? If they DID ("cats perform a ` +
    `choir" is already the premise), do not bolt a second one on; spend the beats DELIVERING theirs. If they ` +
    `gave only a situation, invent the turn - and give it a real arc, not a token gesture. `+
    `(2) DIALOGUE - did anyone speak in their prompt? If they wrote speech, use THEIR words. If nobody speaks ` +
    `but the scene contains a plausible SPEAKER and a moment that invites speech, WRITE THE SPEECH. If there is ` +
    `no one who could speak (only animals, an empty room), write none. `+
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
    `\n` +
    `⚠ IF THE PROMPT DESCRIBES A SITUATION WITH NO EVENT, INVENT ONE AND GIVE IT A REAL ARC. Some prompts are a subject in a place ` +
    `and nothing more ("a rabbit outside someone's front door"). A situation is not a captured moment — something ` +
    `must HAPPEN and then be OVER. Author a tiny complete incident that suits the place and the creature: it ` +
    `arrives, does one specific thing, and reacts or leaves. Use whatever the photograph actually contains as the ` +
    `Scale the invention to the DURATION, not to a fixed minimum - fill the beats you have. A short clip ` +
    `carries a setup and a payoff; a longer one carries setup, escalation and payoff. Ordinary in KIND (a ` +
    `real thing that could happen in that place) but never artificially small in AMOUNT.\n\n` +
    // ── OUTPUT SHAPE ──────────────────────────────────────────────────────────────────────────────────────
    // TIME BLOCKS ARE ON BY DEFAULT (owner 2026-07-30, REVISED same day — an earlier version of this comment had
    // them off, and that was wrong). The montage worry was real but the cause was misattributed: the block-free
    // wins were ALSO the low-DETAIL ones, so density and timing moved together and timing took the blame.
    // Separated by controlled test — minimal prose WITH blocks: owner "time blocks work fine", and the 8s
    // doorbell story (7 elements, blocks, near-zero detail) came back "this is great … this is perfect".
    // Timestamps supply PACING the model otherwise invents; without them events land off-beat. BEAT_BLOCKS=0
    // restores continuous prose.
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
        `into what it DOES. Name props only when the action touches them.\n\n`) +
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
    `Return ONLY the beat lines, nothing else.\n\n` +
    // FINAL CHECKLIST, LAST ON PURPOSE. This instruction passed 10,000 characters of accumulated doctrine and new
    // rules buried mid-text stopped landing: a 7-second clip kept returning beats that stopped at [4s], and the
    // payoff verb kept vanishing, though both were stated above. Same law as the judges - ISOLATE WHAT YOU GATE ON.
    `BEFORE YOU ANSWER, CHECK ALL FOUR:\n` +
    `1. EVERY VERB from the request appears. Request: "${userPrompt}". If it names entering, performing AND waking, ` +
    `all three are in the beats. Dropping one is a failure, not a simplification.\n` +
    `2. The beats SPAN THE FULL ${process.env.BEAT_DURATION || "4"} SECONDS, evenly spaced, last beat near the end.\n` +
    `3. EVERY subject exists in beat [0s], including anything the photograph does not show. Nothing appears for the ` +
    `first time later.\n` +
    `4. NO camera words anywhere.\n`);
  let { text } = await providerText(instruction, { maxTokens: 700, temperature: 0.5 });

  // ⚠ THE VALIDATOR MUST MATCH THE REQUESTED SHAPE. It filtered for /^\[\d+s\]/ unconditionally, so the moment
  // timestamps were switched off it rejected perfectly good continuous prose and silently fell back to the
  // one-line minimal beat — the model was writing what we asked for and we were throwing it away.
  // ⚠ VERIFY AND RETRY, DO NOT JUST ASK AGAIN. The instruction is >11,000 chars of accumulated doctrine and the
  // model stopped complying with parts of it: a 7s clip explicitly told to return 4 beats stamped [0s][2s][4s][6s]
  // came back with 3, and the payoff verb kept vanishing - both stated tersely at the very end. Restating a rule a
  // fifth time does not fix a compliance problem at that length; CHECKING THE OUTPUT does.
  const wantStamps = BEAT_STAMPS.join(",");
  const gotStamps = (t) => (t.match(/\[(\d+)s\]/g) || []).map((x) => x.replace(/\D/g, "")).join(",");
  if (process.env.BEAT_BLOCKS !== "0" && gotStamps(text) !== wantStamps) {
    console.error(` (returned [${gotStamps(text)}], need [${wantStamps}] - one corrective retry)`);
    const fix = await providerText(
      `Rewrite these beats so there are EXACTLY ${BEAT_STAMPS.length}, stamped ${BEAT_STAMPS.map((t) => `[${t}s]`).join(" ")}. ` +
      `Keep the same story and wording as far as possible; redistribute or extend the action to fill every stamp. ` +
      `The request was "${userPrompt}" - EVERY verb in it must still appear. Return ONLY the beat lines.\n\n${text}`,
      { maxTokens: 700, temperature: 0.3 }
    ).catch(() => null);
    if (fix?.text && gotStamps(fix.text) === wantStamps) { text = fix.text; console.error(` (retry OK)`); }
  }

  let lines;
  // ⚠ MUST MATCH THE PROMPT SELECTOR ABOVE (`!== "0"`). This read `=== "1"` while the prompt asked for blocks
  // by default, so on the first end-to-end run the model DID emit "[0s] …" and the parser silently STRIPPED
  // every timestamp. Exactly the bug fixed earlier the same day, reintroduced in the opposite direction: when a
  // format flag gates two places, a change to one is a change to both.
  if (process.env.BEAT_BLOCKS !== "0") {
    // ⚠ CAP AT THE REQUESTED STAMP COUNT, NOT A LITERAL 3. This was `.slice(0, 3)`, a leftover from the hardcoded
    // "2-3 beats" era. Once stamps became duration-derived (a 7s/8s clip asks for 4), the model correctly returned
    // 4 beats and this line silently DELETED the 4th — the PAYOFF beat, which by doctrine lands LAST. That is the
    // whole "payoff survives some runs, not others": it survived only when the model happened to pack it into beat 3.
    // The retry validator never fired because it inspects `text` (4 stamps, matched) BEFORE this slice cut it to 3.
    // Cap at BEAT_STAMPS.length so parser, instruction and validator agree on one number.
    lines = text.split("\n").map((l) => l.trim()).filter((l) => /^\[\d+s\]/.test(l)).slice(0, BEAT_STAMPS.length);
  } else {
    // Continuous prose: keep every non-empty line, but strip any timestamps the model emits out of habit.
    lines = text.split("\n").map((l) => l.trim().replace(/^\[\d+s\]\s*/, ""))
      .filter((l) => l && !/^(beats?|shot script|prose)\s*:?\s*$/i.test(l));
  }
  if (lines.length) { beatLine = lines.join("\n"); mode += " + NARRATIVE"; }
  else console.error(" (narrative beats failed to parse — keeping the minimal beat)");

  // ⚠⚠ DETERMINISTIC GUARD — POST-CUT BEATS MAY NOT NAME FINE DETAIL.
  // The doctrine above already forbids this, and the doctrine is an LLM instruction, which makes it a
  // TENDENCY rather than a constraint: measured 3/3 clean immediately after the clause was reconciled, then
  // a later run shipped "flips open the lid of the pizza box WITH ITS FRONT PAWS". Naming the limb or the
  // small object in the grip is only showable from CLOSE, so the generator invents a nearer vantage — and
  // after a cut there is no photograph behind that vantage, so it synthesises one and the shot turns
  // artificial exactly at the payoff.
  // A guard is not a second instruction. It reads what came back, and when the rule was broken it says so and
  // asks once more, naming the offending words. Same pattern as the [GUARD] lines in manifest.mjs, and for the
  // same reason: prompt rules slip, code does not. The [GUARD] line is also the only way to SEE how often the
  // doctrine is being ignored, which until now was invisible.
  // ⚠ IT NEVER EDITS THE BEAT ITSELF. Silently deleting a clause could delete the payoff the user asked for;
  // re-asking keeps authorship with the writer. If the retry also breaks the rule, the beats SHIP anyway with
  // a loud warning — a working clip with a close payoff beats no clip.
  // ⚠ MATCH THE LIMB, NOT A POSSESSIVE. The first version keyed on "with its/his/her/their <limb>" and the very
  // first live run slipped straight past it with "with BOTH paws" — the determiner varies far more than the
  // body part does, so anchor on the body part and accept any determiner or none.
  const FINE_DETAIL = /\b(?:with|in|using|between)\s+(?:its|his|her|their|both|two|one|a|the)?\s*(?:front|back|hind|fore)?\s*(?:paws?|hands?|claws?|teeth|beak|snout|mouth|fingers?|forepaws?)\b/i;
  const cutIdx = lines.findIndex((l) => /\bhard cut\b/i.test(l));
  const offending = cutIdx >= 0 ? lines.slice(cutIdx).filter((l) => FINE_DETAIL.test(l)) : [];
  if (offending.length) {
    const hit = offending.map((l) => (l.match(FINE_DETAIL) || [""])[0]).filter(Boolean);
    console.warn(`[GUARD] beats: post-cut beat named fine detail (${hit.join(" · ")}) — re-asking once (doctrine drifting; fix the root).`);
    try {
      const { text: t2 } = await providerText(
        instruction +
        `\n\n⚠ YOUR PREVIOUS ATTEMPT BROKE ONE RULE AND IS OTHERWISE FINE. In a beat AFTER the cut you wrote ` +
        `${hit.map((h) => `"${h}"`).join(" and ")}. After a cut there is no photograph behind the camera, so a beat ` +
        `pitched at something that small can only be shown by moving CLOSER, and the model then invents that ` +
        `vantage with nothing to ground it. Rewrite the SAME beats, keeping every event and the payoff exactly ` +
        `as they are, but describe the post-cut action by what the WHOLE BODY does at the distance the ` +
        `photograph was taken from. Do not name the limb or the object in the grip. Change nothing else.`,
        { maxTokens: 1000, temperature: 0.2 });
      const relines = t2.split("\n").map((l) => l.trim()).filter((l) => /^\[\d+s\]/.test(l)).slice(0, BEAT_STAMPS.length);
      const stillBad = relines.filter((l) => FINE_DETAIL.test(l)).length;
      if (relines.length && !stillBad) { beatLine = relines.join("\n"); console.log(`[GUARD] beats: repaired on retry`); }
      else console.warn(`[GUARD] beats: retry ${relines.length ? "STILL names fine detail" : "failed to parse"} — shipping the original (expect a close payoff)`);
    } catch (e) {
      if (e?.name === "ProviderInfraError") throw e;
      console.warn(`[GUARD] beats: retry errored (${String(e.message).slice(0, 60)}) — shipping the original`);
    }
  }
}

const outFile = join(HERE, "out/_aspect", `${slug}_beats.txt`);
writeFileSync(outFile, beatLine + "\n");
console.log(`target : ${intent.target} · action: ${intent.action}${intent.secondary ? ` · +${intent.secondary}` : ""}`);
console.log(`scene : ${seen.scene}`);
console.log(`standin: "${seen.standin}" [${seen.standin_placement}] → ${mode}`);
console.log(`\nBEATS → ${outFile}\n ${beatLine}`);
