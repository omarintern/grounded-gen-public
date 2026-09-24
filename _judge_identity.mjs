// IDENTITY / USABILITY JUDGE — the 12-field categorical+graded pass, extracted into its OWN module for the
// same reason _judge_quality.mjs was: so a calibration or regression probe scores the EXACT wording that
// ships. A floor or a threshold derived from a COPY of a prompt is worthless — that is how a 0.5 degradation
// floor once got set from a benchmark whose wording scored the owner's endorsed reference 0.8 while
// production scored it 0.3-0.4.
//
// Moved VERBATIM out of _source_scene.mjs (2026-07-30) — the rubric text is byte-identical; only the
// signature changed, so that SCENE_INTENT and the view size can be passed in rather than read off module
// scope. _source_scene.mjs now imports this and is the only production caller.
//
// WHY THIS EXTRACTION WAS NEEDED NOW: subject_scale is a GRADED field that GATES (floor 0.4, target 0.7)
// while living in this 12-field prompt. Across 33 judged passers it took only 4 distinct values and sat at
// 0.5 in 61% of them, never above 0.7 — the crowding-collapse signature that already forced `degradation`
// out into its own call. Measuring whether isolating it recovers separation requires calling THIS prompt,
// not a copy of it.
// ── EVIDENCE MOVED OUT OF THE PROMPT (NOT MODEL-VISIBLE, ON PURPOSE) ─────────────────────────────────────
// Owner's standing rule: worked examples must not reach the model — general rules avoid pushing biases in
// specificity, and every example also spends prompt budget in strings already shown to be over capacity.
// The RULES stay in the strings; the cases that justify them live here, for maintainers. Moved 2026-08-10.
//   · Measured 2026-08-06: a bodycam scene returned plain garage photographs that cleared every gate.
//
import { registerFailure, deviceNoun, OF_THE_DEVICE } from "./_register_law.mjs";
import { AI_TELLS, GENERATOR_MARK_Q, SINGLE_FRAME_Q, CAMERA_INSIDE_Q, vantageQuestion } from "./_gate_rules.mjs";
// ⚠ standin_quality / standin_role ARE HISTORICAL KEYS (2026-09-23, plates are places). They no longer ask how good a SWAP STAND-IN a frame is — the swap
// was removed from the writer on 09-22 and nothing is replaced any more. They ask whether the scene's OWN subject (a real raccoon at the bin) is
// already in the frame, which is the one thing the sourcer still reads them for; the keys stay so cached verdicts and cassettes keep their shape.   // one wording for every judge (owner 2026-09-22, job bebe5716)   // one text for both judges (owner 2026-09-22)
import sharp from "sharp";
import { providerJson, textPart, imagePart, PROVIDER_VLM_MODEL } from "./provider-llm.mjs";

// (largest_real_face_pct / famous_person_visible — the incidental-face size hedge — are GONE from the rubric, owner 2026-09-21)
// VALIDATED 2026-08-05 (_face_estimator_test.mjs): across 10 frames spanning 0–17% the in-rubric % tracked an ISOLATED
// single-field % within ~1–2 points (0/10 flattened ≥3×) and read a clean 0 on every no-face frame — the crowding
// collapse that forced `degradation` and `subject_scale` out into their own calls does NOT bite this field, so it stays
// in-rubric (free). A categorical band (none|small|medium|large) was tried and REVERTED: it over-called "medium" at
// 4–5% (WIDE), noisy exactly at the gate boundary. A FACE_PCT_MODE test toggle was removed after this test. If a future
// prompt change reopens this, re-run _face_estimator_test.mjs before trusting the number.

/** Downscaled whole-frame view — for identity / subject / framing / watermark. */
async function smallViewAt(fp, px) {
  return (await sharp(fp).resize(px, px, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82 }).toBuffer()).toString("base64");
}

// ── SHARED GATE CLAUSES ────────────────────────────────────────────────────────────────────────────────────
// real_photo + ai_generated + shows_subject, exported so the CHEAP KILL-SHOT pass and the FULL rubric compose
// from the SAME text. Retyping them into a second file is how two gates silently diverge — and the AI clause in
// particular is safety-critical (owner: "No AI images ... a hard no go") and fails CLOSED, so it must never be
// paraphrased or trimmed for brevity.
export const gateClauses = (subjectStr, sceneIntent = "") => `shows_minor = TRUE if any HUMAN CHILD or TEENAGER appears in this frame - a human baby, a toddler, a school-age child, any PERSON who plainly is not an adult. \u26a0\u26a0 AN ANIMAL IS NEVER A MINOR, however young: a baby monkey, a cub, a chick, a puppy, a calf all answer FALSE. This rule exists to keep REAL CHILDREN out of generated video, and an infant animal is not a child - the viral figures this pipeline is asked for are very often baby animals (a baby macaque clutching a plush, a baby hippo), and answering TRUE for them destroys the only reference that carries their identity while protecting nobody. Judge APPEARANCE, and when a figure is ambiguous answer TRUE. This is an ABSOLUTE REJECT that fails CLOSED: we GENERATE VIDEO from these frames, so a real minor would be animated, and NO later gate looks at age. A child-monitoring framing returns minors and can clear every other gate, because no other gate asks about age. content_flag = the single most serious problem present, else "none". "nudity" = nudity or sexual content, however partial. "distress" = GRAPHIC HARM SHOWN IN THE FRAME ITSELF: blood, wounds, a dead or dying body, a person or an animal being hurt or in agony, torture, an execution, graphic cruelty. It is NOT the scene or the aftermath of something bad: smoke, fire, rubble, wreckage, ruins, a damaged building, a crash with no one hurt in view, emergency workers at work, a crowd running, an arrest, people who are afraid or grieving, an animal caged - those are the world as it is and pass. Security-camera and dashcam footage is published because something happened, and that alone is never distress (owner 2026-09-14: the gate is for deep gore, and every photograph of a tragedy had failed it). "personal_data" = readable PRIVATE identifying information: a vehicle number plate, a house number, a street sign naming a residential address, a name badge, a screen showing a personal account. "third_party_media" = copyrighted work INSIDE the frame that would be re-rendered: a poster, wall art, an album cover, or a TV or monitor displaying a film, show or game. "symbol" = a hate symbol or prohibited insignia. Each of these is a REJECT and this judgement FAILS CLOSED - when unsure, name the flag rather than "none", because we GENERATE VIDEO from this frame and no later gate looks for any of it - except "distress", which is named only for harm that is GRAPHIC in the frame, never for a scene that merely looks like trouble. real_photo = a photograph made by a REAL CAMERA pointed at a REAL SCENE THAT PHYSICALLY EXISTED (NOT a cartoon/illustration/collage/graphic, and NOT an image synthesised by a model). A FRAME OF A FILM, A TV SHOW OR A VIDEO IS A REAL PHOTOGRAPH: a staged set lit and shot by a real camera is a real scene that physically existed — a film still, a broadcast frame, a screenshot of live footage all answer TRUE, however famous or perfectly composed (owner 2026-09-15: a hotel corridor from a film was refused as not a photograph while the same film's elevator hall passed). FALSE is for drawn, rendered, painted or model-synthesised images and for poster art built from them. ⚠ A FRAME CONTAINING MORE THAN ONE SEPARATE PHOTOGRAPH IS NOT A REAL PHOTO, however real each part of it is. Split screens, side-by-side comparisons, before/after pairs, grids and picture-in-picture are COMPOSITES: they show two places at once, so there is no single camera position and no one place for an action to happen in. Answer FALSE whenever the frame is divided into panels by a hard edge, border or seam — including when every panel is itself a genuine photograph, which is exactly the case a per-panel reading gets wrong. ai_generated = how likely this image was SYNTHESISED by an image model (any image generator) rather than captured: 1.0 = certainly synthetic, 0.0 = certainly a real capture. ⚠ PHOTOREALISTIC AI IS THE DANGEROUS CASE — it is neither a cartoon nor an illustration, so do NOT clear it just because it "looks like a photo". Judge the PHYSICS: architecture or objects that repeat, melt or could not be built; small background items and crowds that dissolve into mush; hands, limbs, wheels or text that never resolve; dreamlike over-even lighting with no real light source; glowing haze; unnaturally perfect symmetry or bokeh; surfaces with no real-world wear, dirt or damage. A genuine photo of a beautiful place is 0.0; a beautiful place that could not have been photographed is 1.0. When genuinely unsure, score HIGHER — a synthetic image reaching delivery is a hard failure in this system, so this judgement fails CLOSED. shows_subject = the image clearly shows: ${subjectStr}. ⚠ THE PLACE, NEVER THE REGISTER: when the subject names a place, judge whether THIS frame shows THAT PLACE — footage from the right KIND of camera showing a DIFFERENT place answers FALSE (a backyard or porch camera frame is not a bedroom, however perfect its register). capture_register is its own field and can never substitute for the place.${sceneIntent ? ` ⚠ THE VIDEO THIS FRAME MUST GROUND: "${sceneIntent}" — judge standin_role and action_spot_room against THAT action specifically, not against the search phrase.` : ""}`;

// CLEANLINESS + usability check for a candidate, judged against the RUNG'S OWN subject string (rung0 asks
// "shows the actor at the place"; rung1 asks "shows the place"). A host filter can't see overlay text baked
// INTO the image (a YouTube grab, a caption, a watermark) — the VLM does.
/** WHAT IS LAID OVER THE PICTURE, AND WHERE THE CAMERA'S OWN PICTURE SITS: the text_kind and feed_box definitions, one text for the crowded call and
 *  for judgeChrome (2026-09-24, B1), so the two can never drift apart. */
export const CHROME_CLAUSE = `text_kind = classify any text/marks OVERLAID on the image after capture — never signage, packaging or a fascia inside the photographed scene, which are part of the world and are not text_kind at all."editorial" = added by a publisher/editor AFTER capture: a caption, headline, meme text, channel name, watermark, or a media-outlet logo — it means a republished / branded image, NOT raw footage (a REJECT). "device_overlay" = burned in by the CAPTURE DEVICE itself: a timestamp / date stamp, a camera name or label, a "LIVE"/REC indicator, battery or signal chrome, an IR / night-vision marker — the stamp that real security / doorbell / dash / body cam footage routinely carries (TOLERATED — often a GOOD sign of authentic utility footage). "brand_logo" = ONLY these four things: (a) a mark carrying a DOMAIN ("ring.com"); (b) a mark from this CLOSED list of household names - Ring, Nest, Google, Amazon, Apple, YouTube, Netflix, Meta/Facebook, Instagram, TikTok, Samsung, Sony, Microsoft, Disney; (c) a BROADCASTER bug (a TV network ident); (d) RESERVED — a video player's scrubber/controls or an app's own chrome answers viewer_chrome, not brand_logo. ⚠ THE LIST IS CLOSED - IF THE MARK IS NOT ON IT AND CARRIES NO DOMAIN, IT IS NOT brand_logo, however styled it looks. Do NOT reason from "this looks like a company logo": nearly every camera stamps a styled wordmark, and styling is not fame. ⚠⚠ A BARE DEVICE-MAKER NAME IS NOT THIS. Camera makers stamp their own name on the footage they record - Kasa, TAPO, TP-Link, Wyze, Swann, Eufy, Reolink, Blink, Arlo, Roku, Lorex, Annke, Hikvision, Dahua, Ezviz, Yi, Kasa Spot - and that stamp is the DEVICE labelling its own recording, i.e. EVIDENCE the frame is authentic utility footage. Answer device_overlay for every one of them. ⚠ IF YOU CANNOT PLACE THE BRAND WITHOUT THINKING, IT IS device_overlay. Mid-tier camera makers are not household names however styled their wordmark looks. Treating every styled wordmark as a brand mark hard-rejects genuine device footage - the camera stamping its own recording - while letting screen-captures of media players through, because overlaid text does not gate. That is backwards. Reserve brand_logo for marks that would re-render as a RECOGNISABLE TRADEMARK and trip a copyright gate (the validated case was a styled "ring.com" wordmark, which cost a whole generation). THIS IS THE HARDEST CALL IN THIS FIELD AND IT HAS A REAL COST, so read carefully: for a doorbell or security camera THE COMPANY NAME AND THE DEVICE NAME ARE THE SAME WORD, which is exactly why this gets confused with device_overlay. Disambiguate by FORM, not by meaning: a DEVICE_OVERLAY is plain unstyled text the installation prints - a timestamp, or a camera identifier like "IP A8D Front Door" / "FRONT DOOR" / "CAM 3" / "GARAGE" - usually monospaced, cornered, unstyled. A BRAND_LOGO is the company's MARK: a designed wordmark, a distinctive typeface or colour, a logo glyph, or a name carrying a domain suffix. "IP A8D Front Door" in plain type = device_overlay (KEEP). The styled "ring.com" wordmark = brand_logo (REJECT). A rendered trademark trips the provider's copyright output gate and costs the whole generation, so a styled mark or one carrying a domain is never a device overlay. When a mark is styled or carries a domain, answer brand_logo even if the same company made the camera. "stock_watermark" = a PAID-PREVIEW overlay from a stock library: branding REPEATED / TILED across the frame, or a large semi-transparent logo or diagonal band laid over the middle of the picture (MotionElements, Shutterstock, Alamy, Getty, Dreamstime, iStock, 123RF and similar). This is NOT an editorial caption on a real photo — it is a paywall watermark that makes the image UNUSABLE no matter what is underneath, so it outranks the other kinds: if tiled/overlaid stock branding is present, answer "stock_watermark" even when a caption or logo is also present. "viewer_chrome" = the candidate is a SCREENSHOT OF A VIEWING APP: phone or desktop UI AROUND the image — a status bar (clock / battery / signal / notification icons), navigation buttons, a player scrubber, app buttons — with the real photograph or camera feed LETTERBOXED INSIDE it. The photograph inside may be perfectly genuine; the chrome is not part of it and would render as fake UI. When you answer viewer_chrome, ALSO return feed_box = the bounding box of the actual photograph/feed region inside the frame, as percentages of the frame (top_pct/left_pct/width_pct/height_pct) — the crop that removes every piece of UI and keeps only the image. feed_box is null for every other text_kind. "none" = no overlaid text or marks. If BOTH editorial and device_overlay appear, answer "editorial". If viewer_chrome applies it outranks device_overlay (the chrome belongs to the phone, not the camera).`;

export async function judgeIdentity(filePath, subjectStr, opts = {}) {
  const SCENE_INTENT = opts.sceneIntent ?? process.env.SCENE_INTENT ?? "";
  const VIEW_PX = Number(opts.viewPx ?? process.env.VIEW_PX ?? 512);
  try {
    const b64 = await smallViewAt(filePath, VIEW_PX); // downscaled: identity/subject/framing/watermark read fine small
    const j = await providerJson([
      textPart(`Return ONLY JSON {"real_photo":bool,"ai_generated":0..1,"generator_mark":bool,"shows_minor":bool,"single_frame":bool,"content_flag":"none|nudity|distress|personal_data|third_party_media|symbol","shows_subject":bool,"text_kind":"none|device_overlay|brand_logo|editorial|stock_watermark|viewer_chrome","feed_box":{"top_pct":0..100,"left_pct":0..100,"width_pct":0..100,"height_pct":0..100}|null,"is_color":bool,"candid":0..1,"casual":0..1,"posed":bool,"arranged_light":bool,"shallow_dof":bool,"styled":bool,"crisp":bool,"overlay_designed":bool,"motion_drift":0..1,"legible":0..1,"usable_stage":"open|enclosed|closeup","standin_quality":0..1,"standin_role":"in_role|wrong_role|none","figures_present":bool,"figures_are_flat_art":bool,"action_spot_room":"ample|tight|too_small","subject_scale":0..1,"capture_register"}. ${gateClauses(subjectStr, SCENE_INTENT)}${AI_TELLS}${GENERATOR_MARK_Q}${SINGLE_FRAME_Q}An image generator's mark is NEVER a device overlay. ${CHROME_CLAUSE} is_color = TRUE if the photo is in natural full color; FALSE if it is black-and-white / grayscale / monochrome / heavy sepia. casual = would an ordinary person have taken this WITHOUT THINKING ABOUT IT? (1.0) \u2014 a quick snap of something mundane; nobody arranged it, nobody waited for the light, nobody thought about where to stand. Score LOW (\u22640.2) for a picture someone MADE rather than took: a posed subject looking at or performing for the camera; a stock, press, promotional or magazine image; deliberate composition (subject centred or thirds-placed, leading lines, a background chosen to be clean); studio or arranged lighting; telephoto bokeh separating subject from background; food or product styled for the shot. \u26a0 SHARPNESS, RESOLUTION AND GOOD EXPOSURE ARE NOT EVIDENCE EITHER WAY. A modern phone produces clean, high-resolution, well-exposed images and those are exactly what we search for \u2014 a pin-sharp 12-megapixel photo of a messy counter is MAXIMALLY casual. Never deduct for a picture being technically good. \u26a0 GRAIN, NOISE AND BLUR ARE NOT EVIDENCE EITHER: they come from a cheap sensor OR from a deliberate film-grain aesthetic, and an artfully grainy, carefully lit photograph is NOT casual. Judge the INTENT, never the texture. GUT TEST: does this look like it was taken TO BE LOOKED AT, or just TAKEN? Taken to be looked at \u2192 \u22640. \u26a0\u26a0 AND NOW REPORT THE TELLS THEMSELVES, SEPARATELY, AS PLAIN OBSERVATIONS. The score above is a JUDGEMENT, and judgements do not transfer \u2014 the same photograph scores differently cropped than whole. These do transfer, because each is a thing you can SEE. Answer each independently of the score and of each other. posed = a person or animal looking at, or performing for, the camera. arranged_light = the light was PUT THERE for the picture \u2014 studio heads, a reflector, shaped or bounced flash, a subject lit apart from its surroundings. NOT ordinary daylight, a room lamp, or a direct on-camera flash, which ordinary snapshots have. shallow_dof = STRONG background blur against a sharp subject: the background rendered to smooth bokeh while the foreground stays crisp \u2014 the separation a fast lens or long focal length produces. This is the single most reliable tell that someone brought a camera to MAKE a picture, because a phone snapshot keeps its background legible. Judge the SEPARATION, never the sharpness of the subject. styled = objects placed or arranged for the shot \u2014 food plated, products aligned, a scene dressed. crisp = the image is CRISP: sharp, high-definition, fine detail holding cleanly across the frame \u2014 the look of a good camera and a steady hand. \u26a0 THIS IS ONE PROPERTY, NOT AN ABSENCE OF FAULTS. Do not hunt for blown highlights, a crooked horizon or awkward edges, and do not require the frame to be flawless. Ask only: is it SHARP AND CLEAN, or is it soft, grainy, smeared, low-detail, compressed? A phone snapshot grabbed in a moment is usually the second. \u26a0 Judge the CAPTURE, never the scene \u2014 a tidy room is not crispness, and a crisp frame of a messy room still is; pretty subject matter is not the question. \u26a0\u26a0 ANSWER TRUE OR FALSE, NEVER A NUMBER, AND SET THE BAR HIGH: answer TRUE only when the frame is CONSPICUOUSLY sharp and clean the way a stock photograph is, with no hesitation. If it is merely acceptable, or you find yourself weighing it, answer FALSE. overlay_designed = any text or marks laid over this image were ARRANGED BY A PERSON rather than emitted by a device: decorative corner brackets or crop marks around the frame, evenly-spaced clean typography, balanced or centred placement, semi-transparent panels. A real camera stamps functional text wherever its firmware puts it and never draws a bracket around its own picture. \u26a0 Judge the CRAFT of the marks, not whether the scene looks plausible \u2014 a stock MOCKUP of security footage carries a timestamp and a REC indicator exactly like the real thing, and the layout is the only thing that separates them. FALSE when there are no overlaid marks at all. Weakest of the five, since a snapshot can land there by luck.2. candid = how UNPOSED and un-staged the moment is — a spontaneous moment where the subject is caught MID-ACTION and is UNAWARE of or ignoring the camera, in plain un-composed framing (1.0). ⚠ Do NOT judge CAPTURE QUALITY here; that is scored separately. In particular do NOT treat "looks like a phone photo" as evidence either way: modern phone cameras produce CLEAN, high-resolution, well-exposed images (validated — a 4000x3000 phone frame scored candid 0.90 and degradation 0.15), so phone-ness says nothing about quality. Score LOW (≤0.3) for EITHER (a) a POLISHED PROFESSIONAL / press / stock photo (crisp, glossy, carefully composed, telephoto bokeh, magazine-clean) OR (b) a POSED shot — the subject LOOKING AT / SMILING FOR / presenting to the camera, a portrait, a 'say cheese' moment, or a news / promotional photo. ⚠ 'Casual-looking but POSED' (someone grinning at the lens, even on a phone) is NOT candid — candid REQUIRES the subject be unposed and not performing for the camera. ⚠⚠ \u26a0 DO NOT JUDGE THE LOOK HERE - the casual field owns it. This field previously carried a second, contradictory rubric capping it at 0.2 for HIGH RESOLUTION, fine detail, pleasing composition, vivid colour, clean dynamic range and bokeh, which penalised exactly the frames we search for and rewarded film grain over casualness. Score ONLY posing and awareness of the camera. Judge the MOMENT, not the capture. motion_drift = how much this frame is smeared by MOVEMENT during the exposure — subject motion blur, camera shake, or a panned/dragged background. 1.0 = heavily smeared or dragged; 0.0 = motion-clean, whatever its other flaws. Judge this SEPARATELY from grain and noise: a grainy, noisy, badly-exposed frame that is motion-CLEAN scores 0.0 here. A frame is rejected on this because r2v INHERITS the smear into the generated video, so a drifting base yields a drifting clip. legible = how CLEARLY the subject reads — in focus, recognizable, you can plainly see what it is (1.0) — versus near-abstract: heavy motion-blur or badly out-of-focus, the subject just a smear you can barely identify (0.0). legible is SEPARATE from candid: a candid phone shot can still be perfectly legible. usable_stage = does this frame CONTAIN SPACE — enough of the surrounding world for an action to happen in it, with the subject seen from a usable vantage (front or side visible, not back-turned or heavily occluded)? "open" = the frame establishes its location: you can see the place around the action, there is room to move, and the subject reads within a world rather than filling the frame. "enclosed" = cramped, boxed-in or heavily occluded — a usable subject but no room around it. "closeup" = the subject or object fills most of the frame and there is essentially NO surrounding world visible. ⚠ This is a THREE-WAY JUDGEMENT, not a score, because the rule it encodes is stated in words: a delivered aspect ratio can only be recomposed safely when the source frame already contains space (validated — a wide anchored laundromat interior recomposed to 9:16 holding its register, while a close interior shot with no surrounding world made the generator abandon the photograph and invent a new camera position entirely). Judge the SURROUNDING WORLD, not the subject and not the photo quality. standin_quality = is the scene's OWN subject already in this frame: a real one of its kind (the animal the scene is about, the thing it centres on) at the spot where the scene happens and at a usable size (1.0); small, off to the side or far in the background (0.3 or less); absent, the frame holding only the place (0). NOTHING IN THE FRAME IS EVER REPLACED: the scene's figures are added to the place, so a person or creature that is not the scene's own subject is scenery and scores 0. standin_role = is that subject already doing the scene's action where it happens? \"in_role\" = yes (a raccoon AT THE BIN when the scene is rummaging); \"wrong_role\" = the subject is here but doing something else, somewhere else; \"none\" = the scene's subject is not in the frame. figures_present = is ANY figure visible in this frame — a person, an animal, or a DRAWN / ANIMATED CHARACTER? Answer TRUE if even one appears, at any size, anywhere: background figures, partly-visible figures, figures on a poster or screen inside the scene. ⚠ THIS IS A PRESENCE QUESTION, NOT A USABILITY QUESTION. Answer TRUE even when the figure means nothing to the scene — wrongly positioned, tiny, turned away, blurred, occluded, or drawn rather than photographed. A CARTOON CHARACTER IS A FIGURE. This is presence only: whether a figure is the scene's own subject is standin_role's question. Answer FALSE only for a frame holding no figure of any kind: an empty room, an empty street, a landscape with nobody in it. figures_are_flat_art = are the figures in this frame themselves FLAT ARTWORK LYING ON A SURFACE INSIDE THE PHOTOGRAPHED SCENE — an illustration printed on a book page, a figure on a poster or packet, a painted mural, a character displayed on a screen — rather than bodies occupying the room's own three-dimensional space? ⚠ THIS IS A QUESTION ABOUT THE PLANE A FIGURE OCCUPIES, NOT ABOUT THE MEDIUM OF THE IMAGE, and it is NOT real_photo's question or ai_generated's. A photograph of an open comic book is TRUE — the figures are ink on paper, and the paper is an object in the room. A still from an animated film is FALSE whenever its characters inhabit the scene's own space and depth: the whole picture being drawn does NOT make its characters flat art. ⚠⚠ AND THE REVERSE TRAP, WHICH IS THE ONE THAT GETS ANSWERED WRONG: a figure PRINTED on a page is flat art on a surface EVEN WHEN THE PRINTED IMAGE DEPICTS A FULLY DIMENSIONAL SCENE. A photograph reproduced in a magazine, a film still printed in a storybook, a 3D-rendered character on a poster or a cereal box — every one of those is ink on paper, and it is ink on paper no matter how solid, rounded, shaded or lifelike the thing it shows appears. Do NOT judge how dimensional the depicted subject LOOKS; judge whether the figure is part of a printed or displayed surface that exists as an object inside the photographed room. If you can see the page it sits on, the edge of the poster, the bezel of the screen, or the curve of the paper, the answer is TRUE. Judge where the figure LIVES — pressed onto a surface the camera can see the edges of (TRUE), or standing in the space (FALSE). When a frame holds both, answer for the figure at the ACTION SPOT. Answer FALSE when there are no figures at all. action_spot_room = is the action spot framed at a scale where THIS action's precise job reads — what the action needs seen, at the size it needs seeing? Judge against the job the action names, never the subject's size alone: whether the specific business the action names would read at this framing. "ample" = the action spot holds enough of the frame that the job reads and the whole action can play in one fixed frame. "tight" = the subject and place read, but the detail this job needs would be too small here, so the generator would cut in to show it — a framing change that breaks the single take. Answer "tight" whenever the action's point lives in fine per-subject detail but the framing sits too wide to render it, and "ample" when the action is coarse enough to read at the framing shown. "too_small" = too small FOR THIS JOB: at this framing what the job needs would be unreadable pixels, so the generator ignores the beat or restages the shot; a subject that is merely small or distant is not too small when its job reads at that size. The people may not be in the photo yet: judge the place where they will be, at the size they would appear there. Judge the action spot and the job's own needs, not the whole scene. subject_scale = how LARGE the subject / action-spot reads in the frame (its distance): 0.9 = CLOSE (fills much of frame), 0.7 = MEDIUM-CLOSE (subject clearly the focus, torso-ish), 0.5 = MEDIUM (subject present, room around it), 0.3 = WIDE (subject smallish in a big scene), 0.1 = SUPER-WIDE / ESTABLISHING (subject tiny/distant in a vast scene). Judge how BIG the subject would be, NOT the photo quality. capture_register = ${process.env.REQUIRED_FORM ? `does THIS FRAME look like it was captured by a ${process.env.REQUIRED_FORM}? Answer match when the frame carries that register own visual signature - its mounting height and angle, its lens character, its exposure and colour behaviour, and any overlay it stamps on the image. Answer ordinary when it is a normal photograph of the same place: correctly exposed, held at eye level by someone composing a picture, with no device signature at all. Answer ${OF_THE_DEVICE} when the frame is ${registerFailure(deviceNoun(process.env.REQUIRED_FORM))} — that is never the right plate for anything, and it is not "ordinary" either. Answer unclear only when you genuinely cannot tell. \u26a0 JUDGE THE CAPTURE, NOT THE CONTENT - the right room photographed the wrong way is ordinary, and the register is about HOW the image was made, never about what is in it. \u26a0 WHY THIS EXISTS: the form is asserted in the search query and nothing else verifies it, so an ordinary photograph of the requested place satisfies every other field and the register silently fails to survive into the reference.  ` : `not required for this scene, answer unclear`}.`),
      imagePart("image/jpeg", b64),
    ], { maxTokens: 1600, temperature: 0.1, model: opts.model || PROVIDER_VLM_MODEL }); // GENEROUS ceiling — the provider's model now emits ~700-1000 reasoning+JSON tokens for this rubric; max_tokens is billed on ACTUAL output, so a high ceiling is free and prevents finish_reason=length truncation (→ judge-failed)
    // (the 1024px overlay second look is GONE, 2026-09-24, engine review B4: the hunt always passes viewPx, so it never ran there, and the zone
    //  hunt, where it did run, never reads overlay_designed)
    return j;
  } catch (e) {
    // INFRA IS NOT A VERDICT. A null return means "judged and unreadable" and fails CLOSED, which is
    // right. But a provider 402/429/5xx means we never judged at all - flattening that to null made the
    // sourcer report an UNJUDGED pool as "all posed/stock/off-subject" (validated 2026-08-01).
    if (e?.name === "ProviderInfraError") throw e;
    return null;
  }
}

// ── CHROME DECIDED ONCE, ON THE REASONING MODEL (2026-09-24, engine review B1) ─────────────────────────────────────────────────────────────────
// The crowded call decided it inside 28 fields and got the CLASS wrong on whole Tesla-app screenshots (0 of 3: "device_overlay", so never cropped;
// ca013b14), and the vision model's feed box is a guess at the centre. Asked alone on the fast model at low thinking, with the crowded call's own definitions,
// it answered 18 of 18 on fixed frames with boxes that crop to the camera's picture (B0, HQ/reviews/2026-09-24-engine-review/b0-result.md). The hunt
// asks it of every kill-shot survivor BEFORE any other judge reads the frame, so the crop is what everything after it judges, and what the shelf holds.
/** { text_kind, feed_box } for the image, or null when it could not be read. A budget stop and an outage go up: neither is a verdict. */
export async function judgeChrome(filePath, opts = {}, { judge = providerJson } = {}) {
  const px = Number(opts.viewPx ?? process.env.VIEW_PX ?? 512);
  try {
    const j = await judge([
      textPart(`Return ONLY JSON {"text_kind":"none|device_overlay|brand_logo|editorial|stock_watermark|viewer_chrome","feed_box":{"top_pct":0..100,"left_pct":0..100,"width_pct":0..100,"height_pct":0..100}|null}. ${CHROME_CLAUSE}`),
      imagePart("image/jpeg", await smallViewAt(filePath, px)),
    ], { maxTokens: 3000, temperature: 0.1, reasoning: "low", tag: "chrome" });
    return j && typeof j.text_kind === "string" ? { text_kind: j.text_kind, feed_box: j.feed_box && typeof j.feed_box === "object" ? j.feed_box : null } : null;
  } catch (e) {
    if (e?.ledgerCap || e?.name === "ProviderInfraError") throw e;
    return null;
  }
}

// ── THE PLACE, ASKED FIRST (2026-09-24, engine review B3) ───────────────────────────────────────────────────────────────────────────────────
// Scene-fit asked "is this the scene's PLACE, and does it offer the position the scene puts its subject in?" LAST, in the adaptive loop, of at most
// six finalists that had already cleared about ten judges: four census runs (8a05cdad, 7f65ce11, c746d65b, d722968a) spent their hunts on photos
// it then refused (a desert motel for "the hood", a European village street, Rocky Mountain tundra for "Everest-like", a daytime steel coaster for an
// indoor 1930s dark ride), and when the improviser's words drifted the early judges drifted with them while only this one held the scene. The hunt
// now asks it of every kill-shot survivor right after the chrome crop (the fast model at low thinking: 17 of 17 on fixed frames, B0); a wrong place or a
// wrong slot ends the frame there, and the loop reads the saved verdict instead of asking again. The question is the adaptive loop's, moved here whole.
// ⚠⚠ THE SUBJECT IS NAMED SO IT CAN BE DISREGARDED (owner 2026-08-20, penguin run da0c677e). The swap
// licence above already said "judge the PLACE, NOT who is in it" — and the judge still scored genuine
// supermarket fish counters fit 0.00 with "wrong place and context for a penguin wearing a paper hat…
// an inappropriate and morbid context… unhygienic", because FIT_TARGET carries the frame-zero ACTION
// and the conjured subject rides inside it: content beat the instruction, as it always measures. Two
// laws, both the owner's: a photo is NEVER the wrong place because the CONJURED subject is absent or
// implausible in it — "it can just get world-ref without character" (rung-0's bonus is untouched: a
// real actor already present still scores); and PROPRIETY IS NOT AN AXIS — "gating on inappropriateness
// is wrong for this": hygiene, morbidity, taste, suitability-for-the-subject are the killshot's
// business where they are anyone's, never scene-fit's.
/** The place question for one photograph: `target` is what the scene's place is judged against; `opening` when the story moves on by a cut
 *  (only the opening's place is asked); `conjured` names a subject that will never be in any photograph. Pure. */
export const sceneFitQuestion = (target, { opening = false, conjured = "" } = {}) =>
  `Return ONLY JSON {"fits":0..1,"why":"short","placement":"short","placement_matches":true|false}. fits = does this REAL photo depict the PLACE / CONTEXT of this scene closely enough to be the base where a subject is later dropped in? The scene's figures are ADDED to this place and anyone already in it is scenery, so judge the PLACE + context, NOT who/what is currently in it.${conjured ? ` ⚠ The scene's subject (${JSON.stringify(conjured)}) is CONJURED — it will never appear in any photograph, so a photo is NEVER the wrong place because that subject is absent from it, implausible in it, or seems unsuited to it; a real one already present is simply a bonus.` : ""} ⚠ APPROPRIATENESS IS NOT AN AXIS of this question: hygiene, morbidity, taste and suitability-for-the-subject are irrelevant here — score PLACE identity only. Scene: "${target}". 1.0 = the right place/context; 0.0 = wrong place (e.g. a custom party van when the scene needs a delivery/driving van cab).` +
  ` ⚠ SEPARATELY, ANSWER WHERE THE SUBJECT GOES. The subject is placed at the spot in this photo where the scene happens. placement = name the surface or space that position sits on or in, as THIS photo shows it ("standing on the counter", "printed on the open page", "in the water", "on the stage", "behind the desk"). placement_matches = does the scene put its subject in THAT position? Judge the POSITION ONLY, never the action: the scene's verb happens later in the video and is NOT required to be visible here, so do not lower this for a subject that is not yet doing what the scene describes. WHY THIS IS ASKED APART FROM fits: a photo can depict exactly the right place and still offer only a position the scene never uses - the right room, but the body standing on the floor when the scene puts it on the page, on the screen, or in the water. Those are DIFFERENT SLOTS, and the subject is placed into one position; it cannot be moved from one slot to another, so the wrong slot renders the subject in the wrong place and often in the wrong PLANE (a creature standing in the room where flat artwork on a surface was called for). If the scene names no particular slot beyond the place itself, placement_matches = true.` +
  (opening
    ? ` ⚠ JUDGE THE OPENING ONLY. This story MOVES to another place later, and it gets there by a CUT, not by this camera. Score ONLY whether this photo is the right place for the opening described above. A location the story visits AFTERWARDS being absent from this frame is NOT a mismatch — it is the premise. Do not lower the score for anything the story only reaches later.`
    : ``);
/** The place verdict for one photograph ({fits, why, placement, placement_matches}, as the model answered), or null when it could not be read.
 *  A budget stop and an outage go up: neither is a verdict. */
export async function judgeSceneFit(filePath, target, opts = {}, { judge = providerJson } = {}) {
  const px = Number(opts.viewPx ?? process.env.VIEW_PX ?? 512);
  try {
    return await judge([textPart(sceneFitQuestion(target, opts)), imagePart("image/jpeg", await smallViewAt(filePath, px))],
      { maxTokens: 3000, temperature: 0.1, reasoning: "low", tag: "place" }) ?? null;
  } catch (e) {
    if (e?.ledgerCap || e?.name === "ProviderInfraError") throw e;
    return null;
  }
}

// ── WHERE THE CAMERA STOOD, ASKED ALONE (2026-09-23) ──────────────────────────────────────────────────────
// Only where an inside was asked for (see _source_scene): a car's inside photographed through its windshield from outside answers a crowded rubric
// as an inside, and this question alone as what it is. → true | false | null (no answer, which never vetoes). A spend cap still stops the run.
export async function judgeCameraInside(filePath, opts = {}, { judge = providerJson } = {}) {
  const px = Number(opts.viewPx ?? process.env.VIEW_PX ?? 512);
  try {
    const j = await judge([textPart(CAMERA_INSIDE_Q), imagePart("image/jpeg", await smallViewAt(filePath, px))],
      { maxTokens: 200, temperature: 0.1, model: opts.model || PROVIDER_VLM_MODEL });
    return typeof j?.camera_inside === "boolean" ? j.camera_inside : null;
  } catch (e) {
    if (e?.ledgerCap) throw e;
    return null;
  }
}

// ── WAS THIS RECORDED FROM THE CAMERA'S PLACE, ASKED ALONE (2026-09-23) ─────────────────────────────────────────
// Under every camera form, of a candidate that already passes every other gate (see _source_scene): the form reader's own device and vantage go in,
// one boolean comes out. It reasons about a place and a direction from words, which the vision model could not do (it kept the served plate), so it
// asks the reasoning model at low thinking, the level it was measured at. → true | false | null (no answer, which never vetoes).
export async function judgeFromVantage(filePath, device, vantage, opts = {}, { judge = providerJson } = {}) {
  const px = Number(opts.viewPx ?? process.env.VIEW_PX ?? 512);
  try {
    const j = await judge([textPart(vantageQuestion(device, vantage)), imagePart("image/jpeg", await smallViewAt(filePath, px))],
      { maxTokens: 3000, temperature: 0.1, reasoning: "low", tag: "vantage" });
    return typeof j?.recorded_there === "boolean" ? j.recorded_there : null;
  } catch (e) {
    if (e?.ledgerCap) throw e;
    return null;
  }
}

// ── THE SPATIAL SECOND LOOK ───────────────────────────────────────────────────────────────────────
// ⚠⚠ MEASURED PROMPT CROWDING, 2026-08-19, and it is the reason three gates failed today. The identity
// rubric asks ~25 fields in ONE call, and the SPATIAL ones degrade there while the safety and capture ones
// hold. Same image, same rubric TEXT, same 512px view — only the number of co-asked fields differs:
//     the foot-shot sidewalk plate   full judge  usable_stage=open      asked ALONE  usable_stage=closeup
//                                    full judge  action_spot_room=ample
//     the bar counter macro          full judge  action_spot_room=ample asked ALONE  action_spot_room=too_small
// The full-judge answers repeated 3/3, so this is systematic rather than variance. Both plates passed and both
// diffused; the owner's read was "it keeps diffusing the bar ... even sidewalk is diffused".
// ⚠ IT ALSO MADE A GATE SHIPPED THE SAME MORNING INERT. stageFails() can only fire on "closeup", and the
// crowded call never returns it — so usable_stage gated nothing even after it was wired.
//
// Precedent for the shape: overlay_designed already takes a targeted second look above. This asks the THREE
// spatial questions alone, with the same wording, so the answers are comparable to the ones they replace.
// ⚠ CALLED ONLY ON A CANDIDATE THAT WOULD OTHERWISE PASS — see _source_scene. A near-winner is worth one more
// call; a frame already rejected on subject or safety is not.
export async function judgeSpatial(filePath, sceneIntent = "", opts = {}) {
  const px = Number(opts.viewPx ?? process.env.VIEW_PX ?? 512);
  try {
    // ⚠⚠ KEEP THIS PROMPT SHORT — THE SAME DISEASE, ONE LEVEL DOWN. The first cut carried the full rubric
    // verbatim and the model never closed the JSON: at maxTokens 120 the reply stopped at `{ "usable_stage": "`
    // and at 400 it stopped at `{ "`. A longer prompt buys more reasoning before the object starts, so a
    // three-field answer ran out of budget. The wording below is the one that answered cleanly, and it is
    // deliberately terser than the crowded rubric it replaces.
    const j = await providerJson([
      textPart(`Return ONLY JSON {"usable_stage":"open|enclosed|closeup","action_spot_room":"ample|tight|too_small","subject_scale":0..1}.` +
        (sceneIntent ? ` THE ACTION: "${String(sceneIntent).slice(0, 140)}".` : "") +
        ` usable_stage = does this frame CONTAIN SPACE? "open" = it ESTABLISHES ITS LOCATION — you can see the place around the action. "enclosed" = cramped or occluded. "closeup" = no surrounding world; a frame pointed at the ground, a wall or a detail shows no place however much room is in it.` +
        ` action_spot_room = would THIS action's precise job read here (what it needs seen, at the size it needs)? "ample" yes · "tight" the subjects read but the detail this job needs would not · "too_small" too small FOR THIS JOB: what it needs would be unreadable pixels here (a subject that is merely small or distant is not too small when its job reads at that size). The people are not in the photo yet: judge the place where they will be, at the size they would appear there.` +
        ` subject_scale = 0.9 close · 0.5 medium · 0.3 wide · 0.1 super-wide.`),
      imagePart("image/jpeg", await smallViewAt(filePath, px)),
    ], { maxTokens: 3000, temperature: 0.1, reasoning: "low", tag: "spatial", ...(opts.model ? { model: opts.model } : {}) });
    // ⭐⭐ THE PRECISE JOB NEEDS A MODEL THAT REASONS (owner 2026-09-24: "it must be 'too small for the precise job' not just 'too small'" → "yes"). Fixed
    // inputs, 14 frames, 3 reps each: on the vision model the job's wording made the answer stricter, not wiser (too_small 21 → 27, a cabin frame whose front
    // seats fill the view went tight → too_small); a "job_needs" field first made it lenient (a parking lot seen from outside → ample); the reasoning model at
    // LOW thinking with the same words was the one that judged the job (that cabin frame and an app view → ample, the wrong views → too_small). It left the
    // vision model on 2026-09-07 over cost ("$… on cut hunts seems like a lot"): a 200-token budget made the reasoning model overrun and retry, ~530 billed
    // tokens a call; with room to think (3000) and low thinking a call is ~0.7¢, asked only of a frame that clears everything else.
    if (!j) return null;
    const st = String(j.usable_stage || "").toLowerCase();
    const rm = String(j.action_spot_room || "").toLowerCase();
    return {
      usable_stage: ["open", "enclosed", "closeup"].includes(st) ? st : null,
      action_spot_room: ["ample", "tight", "too_small"].includes(rm) ? rm : null,
      subject_scale: Number.isFinite(Number(j.subject_scale)) ? Number(j.subject_scale) : null,
    };
  } catch (e) { if (process.env.SPATIAL_DEBUG) console.error(`  [judgeSpatial] ${String(e && e.message).slice(0,120)}`); return null; }   // ⚠ FAILS OPEN — no opinion leaves the crowded answers in place
}

// ── THE TELLS SECOND LOOK ─────────────────────────────────────────────────────────────────────────
// ⚠⚠ THE CANDOUR TELLS CROWD-SUPPRESS EXACTLY LIKE THE SPATIAL FIELDS (measured 2026-08-20). The plate the
// owner rejected as "professional" — a ground-level NYC street shot with a faded film grade, from a stock
// mirror (pxhere) — answered shallow_dof=FALSE in the crowded 25-field call and TRUE when the tells were
// asked alone. Same image, same wording. A crowded TRUE is trustworthy (it already rejected); a crowded
// FALSE is not, so would-pass candidates get the tells re-asked in their own small call.
// ⚠⚠ TWO NEW TELLS, FROM THE OWNER'S OWN READ ("an image should look low-effort and casual and as if
// someone took it on the fly/spot"). Both are ACTS OF PRODUCTION you can see, not taste:
//   chosen_vantage  the camera occupies a position nobody casually holds a phone — this plate was LAID ON
//                   THE ROAD for its leading lines. Mounted utility devices (doorbell/cctv/dashcam) are
//                   FALSE: they were not placed for a picture. (Tells only gate where candidness selects,
//                   so device-form worlds never reach this anyway — the FALSE is belt and braces.)
//   graded_color    the colors were processed toward an aesthetic — the faded pink wash, split-toning,
//                   HDR looks. Ordinary camera color, however dull, is FALSE.
// MEASURED before shipping, on owner-labelled plates: NYC fires [shallow_dof, chosen_vantage, graded_color];
// the bar portrait fires [posed, graded_color]; the penguin plate, the foot-shot (owner: "actually candid"),
// the heron and the deer all stay clean — so the foot-shot still dies on SPATIAL, not on tells.
// ⚠ SEPARATE FROM judgeSpatial, DELIBERATELY: a combined 10-field call re-crowded the spatial answers (the
// foot-shot flipped back to stage=open with the tells added). Two small calls preserve both measured
// behaviours. ⚠ FAILS OPEN — null leaves the crowded answers in place.
export async function judgeTells(filePath, opts = {}) {
  const px = Number(opts.viewPx ?? process.env.VIEW_PX ?? 512);
  try {
    const j = await providerJson([
      textPart(`Return ONLY JSON {"posed":bool,"arranged_light":bool,"shallow_dof":bool,"styled":bool,"crisp":bool,"chosen_vantage":bool,"graded_color":bool}. Each is a fact you can SEE, not a taste judgement. posed = a person or animal looking at, or performing for, the camera. arranged_light = light PUT THERE for the picture. shallow_dof = STRONG background blur against a sharp subject. styled = objects placed or arranged for the shot. crisp = the IMAGE is conspicuously sharp and high-definition, fine detail holding cleanly, the way a stock photograph is: a quality of the picture itself, never of how tidy, empty or orderly the scene in it is. chosen_vantage = the camera occupies a position a person does not casually hold a phone: laid on the ground, ankle height, flat overhead, pressed to a surface, shooting through an object for framing. Ordinary standing or seated eye/chest height — including a quick tilt down at something on the ground — is FALSE. A mounted utility device (doorbell, security cam, dashcam) is FALSE: it was not placed for a picture. graded_color = the colors were PROCESSED toward an aesthetic after capture: faded film emulation, split-toned shadows, heavy vignette, HDR tone-mapping, a wash the real scene could not have had. Ordinary camera color, including dull or badly-lit color, is FALSE.`),
      imagePart("image/jpeg", await smallViewAt(filePath, px)),
    ], { maxTokens: 200, temperature: 0.1, model: opts.model || PROVIDER_VLM_MODEL });   // an IMAGE question → the vision model (owner 2026-09-07: "$… on cut hunts seems like a lot"): these two calls ran on the default REASONING model, whose thinking overran a 200-token budget and retried — ~530 billed output tokens per call, $…–$… of every hunt; the 08-11 bakeoff measured the vision model on exactly these rubric fields (the framing question went back to the reasoning model at low thinking on 2026-09-24, above)
    if (!j) return null;
    const out = {};
    for (const k of ["posed", "arranged_light", "shallow_dof", "styled", "crisp", "chosen_vantage", "graded_color"])
      if (typeof j[k] === "boolean") out[k] = j[k];
    return Object.keys(out).length ? out : null;
  } catch { return null; }   // ⚠ FAILS OPEN — no opinion leaves the crowded answers in place
}

// ── FULL-RESOLUTION AI RE-READ (owner 2026-08-29: ai generated is a hard no-go. very hard no-go) ──
// The kill-shot judges a 512px thumbnail, and the AI tells — mushy background detail, unresolved
// objects, dreamlike over-even glow — are exactly what 512px hides (the overlay_designed field already
// recorded this class of blindness: FALSE at 512, TRUE at 1024). Measured live: a generated fantasy
// bedchamber passed real_photo=true ai<=0.3 and was SERVED as a world-ref; r2v amplified its synthetic
// texture into heavy diffusion. So the WINNER gets one extra read at 1024px, real/ai only, before any
// serve. The veto is ABSOLUTE — no best-of-bunch exception, no style carve-out: synthetic is never served.
export async function aiRecheck(filePath, opts = {}) {
  try {
    const b64 = await smallViewAt(filePath, Number(opts.viewPx ?? 1024));
    return await providerJson([
      textPart(
        'Return ONLY JSON {"real_photo":bool,"ai_generated":0..1,"generator_mark":bool,"single_frame":bool}. You are looking at a candidate WORLD ' +
        'REFERENCE at full resolution — judge ONLY whether it is a genuine photograph. real_photo = made by a ' +
        'REAL CAMERA pointed at a REAL SCENE THAT PHYSICALLY EXISTED (never a render, illustration, or model ' +
        'synthesis; a frame of a film, a TV show or a video IS a real photograph — a staged set shot by a real camera is a real scene, answer TRUE for a film still or a broadcast frame). ai_generated = how likely this was SYNTHESISED by an image model. ' + AI_TELLS + GENERATOR_MARK_Q + SINGLE_FRAME_Q + 'PHOTOREALISTIC AI IS ' +
        'THE CASE YOU ARE HERE FOR — judge the PHYSICS at this resolution: architecture or objects that repeat, ' +
        'melt, or could not be built; background detail dissolving into mush; hands, wheels, text or small ' +
        'objects that never resolve; dreamlike over-even light with no real source; unnaturally perfect ' +
        'symmetry; surfaces with no real wear. A beautiful real place is 0.0; a place that could not have been ' +
        'photographed is 1.0. When genuinely unsure score HIGHER — a synthetic reference reaching the video ' +
        'model is a hard failure, so this judgement fails CLOSED.'
      ),
      imagePart("image/jpeg", b64),
    ], { maxTokens: 900, temperature: 0.1, model: opts.model || PROVIDER_VLM_MODEL });
  } catch (e) {
    if (e?.name === "ProviderInfraError") throw e;
    return null;   // infra/unreadable → no opinion; the caller must not treat this as a pass or a veto
  }
}

// THE SEAT is judged by _judge_seat.mjs (2026-09-09): one look per candidate, evidence never a verdict, the whole pool ranked.
