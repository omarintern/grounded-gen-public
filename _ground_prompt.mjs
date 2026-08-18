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
import { ELEMENTS_FIELD, invokeClause, worldSimClause, specDensity } from "./_invoke.mjs";
import { speechReach, SPEECH_REACH_FLOOR } from "./_gate_rules.mjs";
import { DIALOGUE_STAMPS, dialogueClause, addresseeClause, renditionClause, FINE_DETAIL, buildDialogueBlock, beatStamps } from "./_beat_law.mjs";
import { spanHeader, goalBlock, framingConcessionBlock, proseFiguresBlock, plateQuestionerBlock, reconcileLaw, beatZeroLaw, trappingsLaw, charSigBlock, soundLaw, asWhileCheck, cutLaw, causalOrder, payoffLaw, seesawLaw, situationArc, outputShape, hardConstraints, finalChecklist } from "./_beat_law.mjs";   // the import-safe beat-law home (owner 2026-08-14: both writers consume the SAME BYTES — import, never paste)   // INVOKE + world-sim bar (seesaw half inline below; dedupe post-test)

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
const BEAT_STAMPS = beatStamps(BEAT_SECS);   // derivation MOVED to _beat_law (slot payload for the merged contract per the hybrid fold)
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
    if (cs?.carried && !/^none$/i.test(cs.carried)) {
      charSig += `${charSig ? " | " : ""}CARRIES: ${cs.carried}`;
      // sidecar for the parent's prop-continuity validator (owner 2026-08-13): a carried item must be
      // visible from its carrier's first beat or arrive by staged retrieval — never materialize mid-story
      try { writeFileSync(join(HERE, "out/_aspect", `${slug}_carried.txt`), String(cs.carried)); } catch {}
    }
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
// SPEECH/GENRE/TURN + specDensity: DEDUPED to the shared _invoke.mjs (the "dedupe post-test" this file planned at its import line — import, never paste)
// ⚠ NO VERB COUNT. "several distinct actions" sounds like the right signal and cannot be measured honestly
// here: a word-shape regex counts every plural noun as a verb (it scored "streetlamps" as an action), so it
// fired on plain situations and tilted them away from invention — the exact opposite of the intent. Length
// already proxies elaboration. Prefer three signals that mean what they say over four where one is noise.

const SPEC_DENSE = Number(process.env.SPEC_DENSE ?? 3);
const _density = specDensity(userPrompt);
// dialogueClause: MOVED VERBATIM to _beat_law.mjs (shared by both writers — import, never paste)

// addresseeClause: MOVED VERBATIM to _beat_law.mjs

// renditionClause: MOVED VERBATIM to _beat_law.mjs

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
    spanHeader() +
    `SCENE AS PHOTOGRAPHED: ${seen.scene}\n` +
    `WHAT THE USER ASKED FOR: "${userPrompt}"\n` +
    `SUBJECT: ${intent.target} — ${intent.action}${has(intent.secondary) ? ` (also present: ${intent.secondary})` : ""}\n` +
    `${swapClause}\n${comedyClause}\n${worldSimClause()}\n${invokeClause(BEAT_STYLE, seen.elements)}\n${addresseeClause()}\n${renditionClause()}\n${dialogueClause()}\n\n` +
    goalBlock() +
    framingConcessionBlock(framingConceded) +
    proseFiguresBlock() +
    plateQuestionerBlock() +
    reconcileLaw() +
    beatZeroLaw() +
    trappingsLaw() +
    charSigBlock(charSig) +
    soundLaw() +
    asWhileCheck() +
    cutLaw() +
    causalOrder() +
    payoffLaw() +
    seesawLaw(BEAT_STYLE) +
    situationArc() +
    // ── OUTPUT SHAPE ──────────────────────────────────────────────────────────────────────────────────────
    // TIME BLOCKS ARE ON BY DEFAULT (owner 2026-07-30, REVISED same day — an earlier version of this comment had
    // them off, and that was wrong). The montage worry was real but the cause was misattributed: the block-free
    // wins were ALSO the low-DETAIL ones, so density and timing moved together and timing took the blame.
    // Separated by controlled test — minimal prose WITH blocks: owner "time blocks work fine", and the 8s
    // doorbell story (7 elements, blocks, near-zero detail) came back "this is great … this is perfect".
    // Timestamps supply PACING the model otherwise invents; without them events land off-beat. BEAT_BLOCKS=0
    // restores continuous prose.
    outputShape(BEAT_STAMPS) +
    hardConstraints() +
    // FINAL CHECKLIST, LAST ON PURPOSE. This instruction passed 10,000 characters of accumulated doctrine and new
    // rules buried mid-text stopped landing: a 7-second clip kept returning beats that stopped at [4s], and the
    // payoff verb kept vanishing, though both were stated above. Same law as the judges - ISOLATE WHAT YOU GATE ON.
    finalChecklist(userPrompt) );
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
  // ⚠⚠ THE DIALOGUE BLOCK SURVIVES THE BEAT FILTER. Both branches above keep only lines the parser recognises
  // as BEATS — the timestamped branch requires /^\[\d+s\]/ outright. A "Dialogue:" section matches neither, so
  // the writer was told to "EMIT IT AS THE FINAL BLOCK" and the block was then DELETED by construction, on every
  // run, silently. That is the root cause of three separate carried-voice failures chased across two days: the
  // clause was present in the instruction every time and its output could never reach the file. It also explains
  // why the model kept narrating speech INLINE inside beat lines — inline is the only place speech survived, so
  // the model was right and the parser was wrong.
  // Captured from the RAW text before filtering and re-attached after, so the beat parser keeps its strict
  // contract and the speech stops being thrown away. _run re-attaches the plan's block only when none is
  // present, so a surviving block now correctly suppresses that fallback instead of duplicating against it.
  // ⚠ DUMP THE WRITER'S RAW OUTPUT, FOR THE SAME REASON THE INSTRUCTION IS DUMPED. Until now only the PARSED
  // beats were inspectable, so when a Dialogue block failed to appear there was no way to tell whether the
  // writer never wrote one or the parser threw it away — two very different bugs with one symptom, and two days
  // were spent fixing the wrong layer because of it. The instruction dump answers "what did we ask for"; this
  // answers "what did it actually say". Cheap, written every run, next to its instruction.
  try { writeFileSync(join(HERE, "out/_aspect", `${slug}_raw.txt`), text); } catch {}

  // ⚠ THE `\n` MUST NOT BIND TO THE END-OF-STRING ALTERNATIVE. Written as `(?=\n\s*(?:Sound\s*:|$))`, BOTH
  // branches required a preceding newline — so a block that runs to the very end of the model's output, with no
  // trailing newline, never matched. That is the normal case: the raw dump shows the writer emitting a correct
  // timed, carried Dialogue block as its LAST line, and this regex silently returned "". One layer down from
  // the beat filter, same symptom, and it is the third bug in this family today (`$` under /m in slop_meter,
  // the `[\d+s]` beat filter, now this) — an end-of-input assumption that holds for every input except the
  // real one. Lift the `\n` into the Sound branch only.
  const emittedDialogue = (text.match(/(^|\n)\s*Dialogue\s*:[\s\S]*?(?=\n\s*Sound\s*:|$)/i) || [""])[0].trim();
  if (lines.length) {
    beatLine = lines.join("\n");
    if (emittedDialogue) {
      beatLine += "\n\n" + emittedDialogue;
      console.log(`  \u266a dialogue block kept from the writer (${emittedDialogue.split("\n").length - 1} line(s)) — it used to be dropped by the beat filter`);
    }
    mode += " + NARRATIVE";
  }
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
  // FINE_DETAIL: MOVED VERBATIM to _beat_law.mjs (imported above)
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

// ── SPEECH THAT ENDED UP IN THE BEATS IS A DUPLICATION BUG, NOT A STYLE CHOICE ────────────────────────────
// The dialogue contract is: words live in ONE terminal "Dialogue:" block, beats describe only what is SEEN.
// Asking for carried voice pushed the writer to narrate speech inline instead ("...as the Rabbit, continuing
// over the cuts, says: '...'"), which reads naturally and breaks three things at once:
//   · slop_meter's spokenWords() returns NULL — there is no block, so density cannot be measured at all;
//   · applyAudioFill sees no Dialogue:/Sound: line and appends ROOM TONE over a scene that has speech;
//   · worst, _run.mjs re-attaches the PLAN's dialogue block only when the beats carry none — so the same
//     line ships TWICE, once inline and once appended, and the generator is asked to say it two ways.
// A rule in a prompt is a probability; this is the mechanical backstop, in the same spirit as the
// fine-detail guard above. Deterministic repair rather than a re-ask: the words are MOVED, never rewritten,
// so the keep-the-words rule is preserved exactly and it costs nothing.
{
  const QUOTED = /[:,]?\s*(?:\b(?:say(?:s|ing)?|tell(?:s|ing)?|call(?:s|ing)? out|continu\w*[^:"]*)\b[^:"]*)?[:,]?\s*"([^"]{2,})"/g;
  const bl = beatLine.split("\n");
  const hasBlock = /(^|\n)\s*(?:Dialogue|Sound)\s*:/i.test(beatLine);
  const spoken = [];
  const cleaned = bl.map((line) => {
    if (/^\s*(?:Dialogue|Sound)\s*:/i.test(line)) return line;
    const at = (line.match(/^\s*\[(\d+)s\]/) || [])[1];
    let out = line;
    for (const m of [...line.matchAll(QUOTED)]) { spoken.push({ at, text: m[1] }); out = out.replace(m[0], ""); }
    return out.replace(/\s{2,}/g, " ").replace(/\s+([.,;])/g, "$1").replace(/[,:;]\s*$/, ".").trimEnd();
  });
  if (spoken.length && !hasBlock) {
    const who = (process.env.PLAN_DIALOGUE || "").match(/\n\s*([^:\n]{1,80}?)\s*:/);
    const speaker = who ? who[1].trim() : "Speaker";
    const block = "Dialogue:\n" + spoken.map((q, i) =>
      `${speaker}${i ? " (continuing, over the cuts)" : ""}${q.at != null ? ` [${q.at}s]` : ""}: "${q.text}"`).join("\n");
    beatLine = cleaned.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n\n" + block;
    console.warn(`[GUARD] dialogue: ${spoken.length} spoken line(s) were narrated INSIDE the beats and no Dialogue block existed — MOVED into one terminal block, timings preserved (doctrine drifting; fix the root).`);
    console.warn(`[GUARD] dialogue: left in place they would have shipped TWICE — _run re-attaches the plan's block whenever the beats carry none.`);
  } else if (spoken.length) {
    // ⚠ SPEECH IN BOTH PLACES SHIPS IT TWICE — REPAIR, DO NOT MERELY WARN. Measured across three consecutive
    // writer runs on one prompt: one emitted a block, one narrated inline, and one did BOTH. That third case
    // used to warn and pass through, which hands the generator the same line in two forms and asks it to say
    // them both. The terminal block is the canonical location — it carries the timings, and it is what
    // applyAudioFill and the slop meter read — so the block STAYS and the inline copies come out of the beats.
    // The words are removed, never rewritten: nothing is lost that the block does not already hold.
    beatLine = cleaned.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd();
    console.warn(`[GUARD] dialogue: ${spoken.length} quoted line(s) appeared in the beats ALONGSIDE a Dialogue block — STRIPPED from the beats, block kept (it holds the timings). Left in place the generator would have been told the same speech twice.`);
  }
}

// ── IF THE WRITER OMITTED THE SPEECH, BUILD THE BLOCK OURSELVES ───────────────────────────────────────────
// ⚠⚠ MEASURED REGRESSION, AND THE REASON THIS IS DETERMINISTIC. Handing the writer a literal stamp list made
// things WORSE, not better: no-speech went from 3-of-11 to 4-of-6, and the two runs that did write dialogue
// ignored the given stamps entirely (one reused the BEAT stamps, one wrote a single [0s]). More instruction
// text bought less compliance — the crowding effect, one field over from where it is already documented.
// The mistake was diagnostic. BEAT_STAMPS does not work because it is a literal spec; it works because a
// VALIDATOR RE-ASKS when the stamps come back wrong. Copying the spec without the enforcement copied the half
// that was never doing the work.
// So stop asking. The plan's dialogue already exists, dialogueStamps() already knows where the fragments
// belong, and splitting a sentence at clause boundaries is arithmetic. Build it. This cannot fail to comply,
// costs nothing, and makes every prior "writer dropped the speech" outcome impossible rather than unlikely.
// The writer's own block still wins whenever it produces one — this is a floor, not a replacement.
if (!/(^|\n)\s*Dialogue\s*:/i.test(beatLine) && (process.env.PLAN_DIALOGUE || "").trim()) {
  const _b = buildDialogueBlock(process.env.PLAN_DIALOGUE);
  beatLine += "\n\n" + _b.block;
  const stamps = _b.stamps;
  console.warn(`[GUARD] dialogue: the writer emitted no speech — SYNTHESISED a timed block from the plan's line across ${stamps.map((x) => `${x}s`).join(", ")} (deterministic; the writer's own block always wins when it produces one).`);
}

// ── AND MEASURE WHETHER THE SPEECH ACTUALLY REACHES THE END ───────────────────────────────────────────────
// The clip-length rule lives in the instruction above, which makes it a probability. This reports the fact.
// Advisory ONLY: plot placement legitimately silences parts of a clip, so a gate here would delete correct
// dialogue. It exists so "the narration cuts early" is measured at write time instead of noticed on playback.
{
  const r = speechReach(beatLine, Number(process.env.BEAT_DURATION) || null);
  if (r.verdict === "cuts-early")
    console.warn(`[GUARD] speech: last line begins at ${r.last}s of ${process.env.BEAT_DURATION}s (reach ${r.reach.toFixed(2)} < ${SPEECH_REACH_FLOOR}) — the back half of this clip has no voice in it. Legitimate only if the PLOT places the speech there.`);
  else if (r.verdict === "untimed")
    console.warn(`[GUARD] speech: the dialogue block carries no [Ns] timings, so its reach cannot be measured — one untimed line is delivered wherever the generator puts it, usually at the top.`);
  else if (r.verdict === "reaches")
    console.log(`  \u266a speech reaches ${r.last}s of ${process.env.BEAT_DURATION}s (${(r.reach * 100).toFixed(0)}% in)`);
}

const outFile = join(HERE, "out/_aspect", `${slug}_beats.txt`);
writeFileSync(outFile, beatLine + "\n");
console.log(`target : ${intent.target} · action: ${intent.action}${intent.secondary ? ` · +${intent.secondary}` : ""}`);
console.log(`scene : ${seen.scene}`);
console.log(`standin: "${seen.standin}" [${seen.standin_placement}] → ${mode}`);
console.log(`\nBEATS → ${outFile}\n ${beatLine}`);
