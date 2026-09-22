// ═══ THE RIDE FOR THE WRITER — ONE BLOCK IN THE PLATE'S OWN WORDS, AND ITS FINDINGS (owner 2026-09-09) ══════════════════════
// Before: apparatusClause + informantPlacesBlock (three branches) + neverCutsText (two) + MOUNT_TEXT + vehicleLine + dressingBlock
// + carryPhrase/transitionPhrase/wayOf/vehicleOf across _beat_law and _ground_prompt, each keyed on a flag of its own, and three
// finding functions with a hardcoded seat regex and a noun-then-verb rails regex that missed "the vehicle plunges … onto the
// continuing track". Now: ONE block built from the ride decision (the plate's own way and vehicle, frame zero's placements, the
// later things or the photographed places, the mode's own laws) and ONE findings function. Mechanical repairs for FACTS only —
// a frame-zero placement missing from beat zero is appended as a fact; a surviving place name is redacted by the run.
import { rideFromEnv, rideWords } from "./_ride.mjs";
import { worldNameFindings } from "./_gate_rules.mjs";

const _re = (s) => String(s || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const _words = (s) => String(s || "").toLowerCase().split(/[^a-z0-9'-]+/).filter((w) => w.length >= 4 && !STOP.has(w));
const STOP = new Set(["with", "from", "that", "this", "into", "onto", "over", "under", "through", "their", "there", "where", "which", "while", "then", "than", "them", "they", "your", "have", "been", "were", "also", "just", "only", "very", "some", "each", "same", "like", "near", "left", "right", "side", "wall", "walls", "floor", "scene", "ahead", "beside", "behind"]);

// ── THE BLOCK ─────────────────────────────────────────────────────────────────────────────────────────────
/** @fed the ride decision (rideFromEnv in the writer; passed by the run) — "" when this run is not a ride's. */
/** FRAME ZERO IS A STAGE OF ITS OWN (owner 2026-09-14): when the run composed it (_frame_zero.mjs), the writer opens from it as the ground — it does not
 *  perform the appropriation itself, and the photograph's own scenery is never named again after it. Pure. */
export function frameZeroSection(d) {
  const f = d?.frame0 || {}; const replaced = (f.replaced || []).map((r) => r?.piece).filter(Boolean);
  const way = rideWords(d).way || "way";
  return `FRAME ZERO IS WRITTEN — a stage of its own composed it from the photograph and the world. The [0s] line IS THIS GROUND, kept whole (tightened only, never contradicted, nothing put before it, no figure of the world added to it, no sentence about what stays or remains — the figures are met later along the ${way}): \u00ab${String(f.text || "").trim()}\u00bb ` +
    `NOTHING OF THE PHOTOGRAPH'S DRESSING SURVIVES — every set piece is named in the ground as what it became; only the vehicle, the way and the seat stay as photographed; the light follows the world (owner 2026-09-15, A' is the standard). ` +
    `AFTER FRAME ZERO THE PHOTOGRAPH'S OWN SCENERY IS NEVER NAMED AGAIN${replaced.length ? ` (${replaced.join("; ")})` : ""} — the world's things stand where those stood, and every later beat names them as the world's. `;
}
/** THE RIDE'S BLOCK IS THE RIDE'S (owner 2026-09-14: "i dont think we work in terms of motion words and such, i think thats only for rider form (coasters)";
 *  "yes 'The ride's block goes back to being the ride's'"). The 09-09 rewrite typed every camera-on-a-thing as ridden, driven or worn and handed all three the
 *  rider's laws with the nouns swapped; dry-form-dashcam-1 then wrote a bar, a bow and rails onto a country road. The windshield gens that worked (08-15 deer
 *  over the bonnet, 08-23 Punch Monkey on the windshield) had no form word and no motion law: the photograph was frame zero and the writer named what stood
 *  in front of the camera. A driven or worn form keeps the plate hunt and gets exactly that: the photograph is frame zero, the camera and its mount are never
 *  looked at, the photographed places and the world's things where the run placed them, the maker's named figures by role. Nothing about how it moves. */
export function formBlock(d) {
  if (!d) return "";
  const w = rideWords(d), r = d.seat?.reading || {};
  const vehicleShown = r.vehicle_in_foreground === true;
  const env = typeof r.environment === "string" && r.environment.trim() !== "other" ? r.environment.trim() : "";
  const occupant = d.kind === "driven" ? "the driver" : "the wearer";
  const mount = d.kind === "driven" ? `the ${w.vehicle}'s own hood or dashboard edge` : "the wearer's own apparatus";
  const placements = (d.dressing?.placements || []).map((l) => String(l).replace(/^[^:]{0,80}\(frame zero[^)]*\):\s*/i, "").replace(/^the seat photograph[^:]*:\s*/i, "")).filter(Boolean);
  const otherPlacements = (d.dressing?.placements || []).filter((l) => !/frame zero|seat photograph/i.test(String(l)));
  const places = (d.dressing?.places || []).filter(Boolean);
  let s = `\u26a0\u26a0 THE FORM: the whole clip is ONE continuous take from the ${d.noun}'s own camera. The photograph is FRAME ZERO, as it is: the ${w.way} runs ahead from the camera's own position` +
    (vehicleShown ? `, ${mount} in the foreground` : `; ${mount} is out of frame and is never looked for`) + (env ? `; the scene around the camera is ${env}` : "") + `. ` +
    `Compose EVERY beat from inside it — what this camera sees, never a view OF the ${d.kind === "driven" ? w.vehicle : "wearer"} from outside; the camera and its mount are never introduced, explained or looked at; ${occupant} is never seen${d.kind === "worn" ? " (no face, no body — only what the apparatus itself shows)" : ""}. ` +
    `The opening names what the photograph shows — the ${w.way}${vehicleShown ? `, ${mount}` : ""} — so frame zero is the photograph; what happens, happens in front of this camera. `;
  if (d.frame0?.text) s += frameZeroSection(d);
  if (places.length) s += `PHOTOGRAPHED PLACES BEYOND THIS FRAME (real photographs riding with this one, in story order): ${places.join(" \u2192 ")}. The take is written from this camera and ARRIVES in each of them in this order — the world enters the frame, the camera never leaves its mount. `;
  if (otherPlacements.length || placements.length) s += `THE WORLD'S THINGS, on the photographs' own surfaces (a reading of each real photograph decided where each can sit): ${[...placements, ...otherPlacements].join(" | ")} — written as facts of the scene, never as changes. `;
  { let modes = []; try { modes = JSON.parse(process.env.IP_FIGURES || "[]"); } catch { modes = []; }
    const dn = (Array.isArray(modes) ? modes : []).filter((m) => m && m.mode === "dename" && m.name);
    if (dn.length) s += `THE MAKER'S NAMED FIGURES ARE WRITTEN BY ROLE IN THE BEATS: ${dn.map((m) => `"${m.name}" is ${m.guise ? m.guise : "written by role and look"}`).join("; ")} — a beat or a speaker label never carries the name in any form; the name is free ONLY inside a spoken line. `; }
  return s;
}
export function rideBlock(d = rideFromEnv()) {
  if (!d) return "";
  if (d.kind !== "ridden") return formBlock(d);   // the ride's block is the ride's (owner 2026-09-14): a car and a wearer get the plain law
  const w = rideWords(d), r = d.seat?.reading || {}, mode = d.world?.mode || "setting";
  const vehicleShown = r.vehicle_in_foreground === true;
  const env = typeof r.environment === "string" && r.environment.trim() !== "other" ? r.environment.trim() : "";
  const dark = d.family === "dark ride", coaster = d.family === "coaster";
  const secs = Number(process.env.BEAT_DURATION || 0);   // the take's length, when the run has told it (the climax's third is counted from it)
  const view = process.env.TELLING === "observational";   // A RIDE MAY BE A VIEW (owner 2026-09-15): no turn, no climax, no scream owed; the ride passes its scenes and rests
  const plural = /s$/.test(w.way), runs = plural ? "run" : "runs", ends = plural ? "END" : "ENDS";
  const carrier = d.kind === "driven" ? `the ${w.vehicle} the camera drives` : d.kind === "worn" ? `the wearer's own apparatus (${w.vehicle})` : `the ${w.vehicle} the camera rides in`;
  const placements = (d.dressing?.placements || []).map((l) => String(l).replace(/^[^:]{0,80}\(frame zero[^)]*\):\s*/i, "").replace(/^the seat photograph[^:]*:\s*/i, "")).filter(Boolean);
  const later = (d.dressing?.later || []).filter(Boolean);
  const figures = (d.dressing?.figures || []).filter(Boolean);
  const finale = String(d.dressing?.finale || "").trim();
  const plateThings = (d.dressing?.plateThings || []).filter(Boolean);
  const places = (d.dressing?.places || []).filter(Boolean);
  const otherPlacements = (d.dressing?.placements || []).filter((l) => !/frame zero|seat photograph/i.test(String(l)));
  let s = `⚠⚠ THE RIDE: the whole clip is ONE continuous take from the seat of a ${d.noun}. The photograph is FRAME ZERO, taken from the seat: the ${w.way} ${runs} ahead from the camera's own position` +
    (vehicleShown ? `, ${carrier} in the foreground` : `; ${carrier} is out of frame in the photograph and is WRITTEN once, in the first clause, as the frame's constant foreground, then never looked at again`) +
    (env ? `; the scene around the camera is ${env}` : "") + `. ` +
    `Compose EVERY beat from inside it — what the ${d.kind === "driven" ? "driver's camera" : d.kind === "worn" ? "wearer" : "rider"} sees, never a view OF the ${d.kind === "ridden" ? "ride" : d.kind === "driven" ? "car" : "wearer"} from outside; the seat is never introduced, explained or looked at; ${d.kind === "ridden" ? "the camera's own rider is never seen (no hands, clothing, legs or body); " : d.kind === "driven" ? "the driver is never seen; " : "the wearer is never seen (no face, no body — only what the apparatus itself shows); "}${d.kind === "ridden" ? "other riders appear only as the seat sees them — the backs of heads, shoulders and raised arms in the rows ahead — never a rider or vehicle looked at from outside. " : d.kind === "driven" ? "there are no rows and no riders: the car's own hood or dashboard edge is the frame's constant foreground and the road the only way. " : "there are no rows and no riders: the wearer's own hands or strap edge are the frame's constant foreground. "}` +
    `Motion is the ride's own (the climb, the drop, the turn, the glide) and never a camera instruction; a ${d.kind === "ridden" ? "ride on its own way never steers, swerves or aims a wheel" : "driver's or wearer's motion is the ride's own"}. ` +
    `The opening names the seat's own objects — the ${w.way}, ${vehicleShown ? `the ${w.vehicle}` : d.kind === "ridden" ? "the bar or nose" : d.kind === "driven" ? "the hood or dashboard edge" : "the wearer's own apparatus"}${d.kind === "ridden" ? ", the rows ahead" : ""} — so frame zero is the photograph. `;
  if (mode === "theme") {
    const photographed = (d.dressing?.photographed || []).filter((p) => p && p.name);
    // THE TAKE NEVER OPENS INSIDE A RIDING PHOTOGRAPH (owner 2026-09-11, measured on the same plate and words: frame zero naming the plate's set pieces
    // as what they became = the plate grounds the take (its way, its vehicle, its scale) and the photographs dress it, one continuous track (draw 5 render 1,
    // golden); frame zero naming only a photograph = that photograph with a lap bar, a hard cut at every next photograph, the plate arriving last, whole and
    // unreplaced (dry-cave-3 render). What frame zero names is the ground of the take; a replacement only takes at frame zero.)
    s += `THE WORLD IS BUILT INTO THE RIDE: the seat photograph IS the ride — its ${w.vehicle}, its ${w.way} and its seat are the frame's constant from frame zero to the end; everything else in it is the world's from frame zero. ` +
      (photographed.length
        ? `PHOTOGRAPHS OF THE WORLD RIDE WITH THIS FRAME, in story order — ${photographed.map((p) => `${p.name}${(p.qualities || []).length ? ` (${p.qualities.join(", ")})` : ""}`).join("; ")}: THE TAKE'S SCENES (owner 2026-09-15, A' is the standard) — the take opens in the seat photograph with every set piece named as what it becomes (the replacements are these photographs' own things), then rides THROUGH what each photograph shows, in this order, without a cut, the ${w.way} running on and the ${w.vehicle} never leaving it; each is written as its things — the pattern of its floor, the finish of its walls, its fixtures, its figures — never by name. `
        : `No photograph of the world rides with it: the world arrives as THINGS on the ride's own surfaces. `) +
      (d.frame0?.text ? frameZeroSection(d) : `FRAME ZERO NAMES EVERY SET PIECE OF THIS PHOTOGRAPH${plateThings.length ? ` — ${plateThings.join(", ")} —` : ""} (owner: frame zero is always grounded): each either as WHAT IT BECOMES — a replacement names the set piece it takes the place of ("<the world's thing> where the <set piece> stood") — or as ITSELF, in its place, when nothing of the world takes its place; a set piece that is replaced is named once, in its replacement, and never again as present; NOTHING OF THE PHOTOGRAPH'S DRESSING SURVIVES (owner 2026-09-15, A' is the standard): every set piece — its props, its figures, its plants, its signs, its furniture, its themed scenery (painted scenery, rock work, forest walls), its themed floor and ceiling — is named as what it becomes, in kind: a themed wall by the world's wall (hedge walls, wallpaper, panelling), a floor by the world's pattern under the ${w.way}; its light is never named and follows the world; only the ${w.vehicle}, the ${w.way} and the seat stay as photographed. `) +
      // THE WAY IS KEPT (owner 2026-09-11, draw 5: "the first carpet has no rails, its just carpet which we managed to prevent till now" — a runner carpet
      // where the floor beside the rails was took the rails' place for three seconds): the [0s] line opens with the way itself, and a floor's replacement is
      // written with the way running on across it.
      `THE ${w.way.toUpperCase()} ${plural ? "ARE" : "IS"} KEPT AND NAMED FIRST: the [0s] line opens with the ${w.way} running on ahead under the ${w.vehicle}, as in the photograph — never replaced, never covered; a floor's replacement lies under and around the ${w.way}, written "with the ${w.way} running on across it". THE SEAT'S OWN FOREGROUND IS WRITTEN AT FRAME ZERO whether or not the photograph shows it${d.seat?.reading?.foreground && !/^none/i.test(String(d.seat.reading.foreground)) ? ` (this photograph shows ${d.seat.reading.foreground})` : ""}: the lap bar's edge and the riders' hands on it or a phone held up filming, the backs of heads in the rows ahead; the rows react at each turn — arms up, a scream — never a face, never a costume (owner 2026-09-13: "we should prompt with people's hands and devices and reactions"). ` +
      (!d.frame0?.text && placements.length ? `FRAME ZERO'S REPLACEMENTS, already in place at [0s], stated as standing facts of the scene in this grammar — the world's thing where the set piece stood — never as a change (nothing becomes, turns into or is replaced on screen): ${placements.map((f) => replacementFact(f, w.way)).join(" | ")}. ` : "") +
      `THE WORLD IS THE BODY OF THE TAKE (owner 2026-09-15, A' is the standard): from frame zero the ${w.vehicle} rides through the world's own scenes, the photographs' things standing beside the ${w.way} and lying under it, the replacements standing from frame zero, the figures met along the ${w.way}; what the world releases (a flood, a burst, a spill) spills ACROSS THE FLOOR around the ${w.way} (never only over the lens); a door or an archway of the world stands BESIDE or AHEAD of the ${w.way} and opens THERE; the take ENDS IN THE WORLD'S OWN DARK — the ${w.way} running on — never back in the seat photograph's scene, never through a door into a place the take has not built, never the words "${d.noun}" for a place. ` +
      // THE BOOTH IS RETIRED (owner 2026-09-12, on draws 6 and 6e: "wendy and her son are projected onto a 2d screen so its very flat and boring … a screen projects the
      // environment"): "a lit tableau on a low platform, a painted flat behind it" rendered as exactly that — a booth with a screen. A dark ride's scenes are BUILT rooms
      // the track passes through.
      `A FIGURE IS NEVER A DISPLAY BESIDE THE ${w.way}: no tableau on a platform beside the ${w.way}, no painted flat, no screen with figures parked before it — the ${w.vehicle} passes THROUGH what surrounds the ${w.way}, and what surrounds it is what the photographs that ride show, written as the things they are. ` +   // owner 2026-09-12 (render 6: "a lit tableau on a low platform beside the rails, showing" a figure came out a flat picture) — and 2026-09-13: the positive template that stood here ("built in three dimensions, life-size, forced perspective, full-bodied animatronics, a backdrop at the far end, ONE device of the craft", with a two-of-a-list check) is DROPPED: "we can't say 2 of a list or list positives"; render 5, the golden ride, never said any of it, and draw 17's diorama said all of it
      `ALONG THE ${w.way.toUpperCase()}, THE WORLD IS STAGED AS TABLEAUX${later.length ? `: these things, in this order, each staged as above — ${later.map((x) => FLOOR_THING.test(x) ? `${x} (a floor thing: its pattern lies under and around the ${w.way}, with the ${w.way} continuing across it)` : x).join(" → ")}` : ""}${figures.length ? `; the world's figures — ${figures.join(", ")} — each an animatronic in a staged scene along the ${w.way}, performing as the seat passes, its line at its beat` : ""}. ` +
      (view ? `A VIEW HELD: this ride owes no turn — the ${w.vehicle} passes its scenes and the last beat is where the view rests, still moving${finale ? `; ${finale}, held back, is the last thing passed` : ""}. ` : finale ? `THE FINALE MAY BE THE PLAN'S TURN (an option, never owed — owner 2026-09-15): when the take has a turn it is the story's last event as the plan wrote it, and ${finale}, held back until now, dresses that scene as a prop in it. ` : `THE FINALE MAY BE THE PLAN'S TURN (an option, never owed — owner 2026-09-15): when the take has a turn it is the story's last event as the plan wrote it, dressed with a thing of the world not yet passed. `) +
      `WHERE THINGS SIT: beside the ${w.way} — on the scene's walls, on raised platforms or banks next to it — or AHEAD, as a tableau the ${w.vehicle} approaches and veers away from before reaching it; a figure of the world stands where a thing would, described by its role and its clothing and posture. The ${w.way}, the floor or bed the ride travels on, and the ${w.vehicle} are never dressed. ` +
      // THE READ SAYS WHO IS IN THE STILL (owner 2026-09-15, B7: the read named people by clothing only, the writer never sees the photograph, and the pair in the maze was
      // written as the twins — then "turned into" them on screen — because the plan's cast was the only cast the writer knew)
      `A PHOTOGRAPHED PERSON IS WHO THE READ SAYS (owner 2026-09-15): a person the read names in a photograph — by their role in the work — IS the figure the ride passes there, written under that role, with that figure's own words where the work gave it any, else the sound it makes; never recast as another figure of the work (a pair in the maze is not the twins unless the read says so), never a change on screen ("turns into", "become" — the figure is who it is from its first word); the plan's cast is an intention the photographs correct, and a figure of the plan no photograph shows is met only where a scene has room for it. ` +
      `THE WORLD'S PLACES ARE WRITTEN AS THEIR QUALITIES: a place of the work — its lobby, its maze, its hallway, a room by name, the work's title — never appears as a name and never as somewhere the ride goes; it appears as what it is made of, beside the ${w.way}: the pattern of its floor, the finish of its walls, its fixtures, its figures, its light (a ballroom is its parquet, its chandeliers and its band; a maze is its walls of clipped hedge). The ${w.way} runs on through every scene, unnamed (the next scene, a turn, a blackout). `;
  } else if (mode === "architecture") {
    s += `THE COASTER IS ARCHITECTURE, THE WORLD IS DRESSING: the seat photograph is a legit coaster on its own rails and structure; the world's things are colouring on that structure (a pattern under the rails, a fixture in a scene's wall, hedges flanking the track, a facade the rails dive through into blackout), never a room the car has entered` +
      (otherPlacements.length ? ` — placed where each photograph offers a surface: ${otherPlacements.join(" | ")}` : "") + `. ` +
      (places.length ? `PHOTOGRAPHED SECTIONS behind the seat, in story order: ${places.join(" → ")} — each entered through a tunnel mouth, a show-scene opening or a blackout, never a door; a section not named here is never entered. ` : "") +
      `The stops beyond the tunnel are written as what the coaster's own architecture carries; the rails run on in order. `;
  } else {
    if (places.length) s += `PHOTOGRAPHED PLACES BEYOND THIS FRAME (real photographs riding with this one, in story order): ${places.join(" → ")}. The take is written from the seat and ARRIVES in each of them in this order — the world enters the ride — through a door, an archway, a tunnel mouth; a place not named here is never entered. `;
    if (otherPlacements.length || placements.length) s += `THE WORLD'S THINGS, on the photographs' own surfaces (a reading of each real photograph decided where each can sit): ${[...placements, ...otherPlacements].join(" | ")} — written as facts of the take at the moment the ride reaches them, never as an instruction, never "add" or "replace". `;
  }
  if (dark) s += `THE VIEW IS THE RIDER'S OWN, ALWAYS FROM THE SEAT — HOW IT BEHAVES IS THE WRITER'S CHOICE (owner 2026-09-15: "its always pov … the behavior of the pov is the writers choice"): either the seat's fixed forward view, or a rider's phone held up that peers around at what the ride passes — to a tableau on the left, up at a figure, across to the far wall, back to the ${w.way} ahead — written as the rider's own unhurried look ("the view drifts up to …", "the view comes back to the ${w.way} ahead"), continuous and small, never a cut, a zoom, a push-in, a crane, a dolly or a reframe; the choice is made, never written out as an instruction, and the seat's own objects (the ${w.way} ahead, the bar or nose) return to the frame within the beat. The ride's motion remains the frame's motion; a coaster and every other ride keep the view fixed as their form does. `;
  if (d.kind === "ridden") s += `THE RIDE VEHICLE LEADS EVERY BEAT (owner 2026-09-09, the mushroom take's grammar): the ${w.vehicle || "vehicle"} is what each beat's sentence does; the figures and the things are what it passes, never the subject of a beat on their own. THE WAY IS NEVER LEVEL AND EVEN FROM THE FIRST FRAME TO THE LAST (owner 2026-09-13: "dark rides can go on incline or decline, rapidly or slowly, sideways"): a dark ride's track rises and drops, banks and turns, hurries and crawls, and the seat feels each change. ` +
    `THE RIDE'S OWN VOICES: a ride narrator or announcer heard from the speakers, and a speaking animatronic in a tableau, are the form's own — they need no listener in frame and never address the camera as an audience; write them as Dialogue lines with a named speaker — the label "Ride narrator" for the ride's own voice (never the bare word "Narrator", which names nobody) and an animatronic by the figure it is — words the ride itself would play. A FIGURE THE WORK GAVE WORDS SPEAKS THEM AS IT IS PASSED (owner 2026-09-11: "narration is only where necessary"; 2026-09-12: "the grady twins should say something … the model should use some intelligence here"), timed to the beat it is passed in — its [Ns] is that beat's stamp, written in the Dialogue block as <speaker> [Ns]: "…" and never as a beat line; the Ride narrator speaks only when no figure of the scene can carry the words. EVERY LINE SAYS HOW IT IS SAID (owner 2026-09-11): the speaker label ends in a short parenthetical of manner — the caretaker in the red plaid jacket (sing-song, mocking, through a grin) [2s]: "…" — two or three words of delivery, the figure's character compiled to voice; never a stage direction of the body, never a mood word in the beats. `;
  // THE MAKER'S NAMED FIGURES (draw 16: the request says "wendy as the riders" and the writer wrote "being tormented like Wendy" in a beat three times): told
  // with the request's own words, so "keep the maker's nouns" and the name law stop pulling against each other
  { let modes = []; try { modes = JSON.parse(process.env.IP_FIGURES || "[]"); } catch { modes = []; }
    const dn = (Array.isArray(modes) ? modes : []).filter((m) => m && m.mode === "dename" && m.name);
    if (dn.length) s += `THE MAKER'S NAMED FIGURES ARE WRITTEN BY ROLE IN THE BEATS: ${dn.map((m) => `"${m.name}" is ${m.guise ? m.guise : "written by role and look"}`).join("; ")} — a beat or a speaker label never carries the name in any form ("like Wendy", "dressed as Wendy", "the Wendy riders" are all the name); a figure the maker casts as the riders is "the riders in the rows ahead"; the name is free ONLY inside a spoken line. `; }
  // THE CAMERA STAYS ABOARD TO THE LAST FRAME (draw 14 rendered: "the caretaker physically pushes the vehicle … rolling around the bend out of the frame" —
  // the model put the camera on the ground, showed the riders' faces and the caretaker behind them, and watched the cart leave)
  s += (d.kind === "ridden" ? `THE ROWS AHEAD ARE NEVER COSTUMED: the other riders are the backs of heads, shoulders and raised arms — no hair, no face, no clothing, no expression; a maker's "<figure> as the riders" is carried by the ride's ADDRESS to the rider (the caretaker calls the seat by her name) and by what is done to the seat, never by dressing the rows ahead as her (dressed rows become figures, and two dressed riders become the twins). ` : "") +
    `THE CAMERA IS ABOARD TO THE LAST FRAME: the ${w.vehicle} never rolls "out of the frame" — only the ${w.way} ahead can; a figure that acts on the ${w.vehicle} is FELT, never seen behind the seat — ${d.kind === "ridden" ? "a jolt, hands on the bar's edge, a voice at the rider's ear" : d.kind === "driven" ? "a jolt through the car, a hand on the hood, a voice at the window" : "a jolt, a hand on the wearer's shoulder, a voice at the wearer's ear"} — never "pushes the ${w.vehicle}" as a picture; a spin or a reversal is written as what the ${d.kind === "driven" ? "driver's camera" : d.kind === "worn" ? "wearer" : "rider"} SEES wheel past (the walls, a figure sliding out of view), never the seat turned to look back${d.kind === "ridden" ? " at the rows" : ""}. ` +
    `THE RIDE NEVER CUTS: no "hard cut", no new camera setup — the ${w.way} carries the ${w.vehicle} into each next scene inside the same take. ` +
    `THE FORM'S NAME IS THE PHOTOGRAPH'S: the words "${d.noun}" name THIS ride — the photograph's own ${w.vehicle} and ${w.way} — and may describe the ${w.vehicle} ("the ${d.noun} ${w.vehicle}"); they never name a scene, a passage or a destination the take produces anew ("into the ${d.noun}", "a ${d.noun}'s interior"), which are written by their construction — the black-painted walls of the ride's own building, a track-lit passage, a tableau on a low platform under a spot — or the photograph returns whole. ` +
    `THE MOUNT (the opening only): the ride MAY open outside the ${w.vehicle} as it comes down the ${w.way} toward the camera and takes it up; from that moment every beat rides, and there is never a dismount after it. ` +
    (coaster ? `WHATEVER THE RAILS REACH IS MET AT SPEED: a figure the ride passes close is ACTED UPON by the passage — steps back, is blown, swings, turns with it — never a statue; a figure may stand only far off, unreached. ` : dark ? `EVERY FIGURE OF THE WORLD ON THIS RIDE IS AN ANIMATRONIC, AND IT PERFORMS AS THE SEAT PASSES: one motion each, COMPLETED while the seat is there, plain and readable, never a menace toward the seat — a head turns to follow the rider, an arm beckons or waves, a hand rises, a body rocks, steps back or rises, eyes light — and EVERY FIGURE HAS ITS TURN (owner 2026-09-12): as the seat passes it, it speaks — its own words where the work gave it any (the twins their line, the caretaker his), else the sound it would make (a giggle, a hiss, a groan, a bell, a knock, the whir of its own mechanism) — and completes its motion; no figure passes silent and inert. The words are a Dialogue line with its manner; the sound is written in the beat that passes it and heard in the Sound line. A figure never merely stands, waits or is held still; a maker's word such as "frozen" describes how the figure LOOKS (frost, ice, snow on it), never its stillness. NO FIGURE CARRIES AN AGE OR CHILD WORD (not young, little, small, girl, boy, child, kid or teen — in the beats and in a speaker label alike): a pair of children in the work is "the twins" or "two identical figures in matching dresses", a child is "a small figure" by build and clothing. ` : "") +
    // THE RIDE IS PROGRAMMED (owner 2026-09-11, on draw 5: "rides can often stop, look at something which performs, then an unpredictable move occurs, or a turn
    // not expected. whereas these gens are linear forward, not stopping — an element of ride ingenuity"): the old law said the ride NEVER stops, and every
    // draft glided forward from first beat to last. A dark ride halts at a scene, holds while the figure performs, then moves in a way the rider did not expect;
    // only the LAST image must still be moving.
    (dark && !view ? `A RIDE MAY STOP AND SURPRISE (owner 2026-09-15: an option, never owed — "too deterministic" as a rule): a scene may be met at a full stop while a figure performs and left with a move the rider did not expect — a move ON the ${w.way}, which the ${w.vehicle} never leaves; no stop is owed and a stop is never the last beat. ` : "") +
    `THE MOTION IS THE ${w.vehicle.toUpperCase()}'S OWN (owner 2026-09-15: a ride "should allow for different experiences, like floating on water"): whatever the seat photograph's vehicle does on its way — a boat's drift and bump is not a car's glide and jerk — the writer writes THAT vehicle's motion, never another's, and it changes beat to beat, never the same glide three beats running. ` +
    `THE LAST IMAGE IS STILL MOVING AND THE ${w.way.toUpperCase()} NEVER ${ends} ON SCREEN: in the final image the ride is moving — the last words of the last beat say where it goes (the ${w.way} on through the doors, around the bend, out of the frame, or the ${w.vehicle} diving through what the payoff releases and swallowed by it). ` +
    `THE ${w.vehicle.toUpperCase()} NEVER LEAVES THE ${w.way.toUpperCase()}: a floor thing of the world — a carpet, tiles, boards, a rug — lies under and around the ${w.way}, with the ${w.way} continuing across it; the ${w.vehicle} never glides, rolls or drives onto anything but its own ${w.way}. ` +
    (d.interior ? `` : "") +
    // NARRATIVE IMAGINATION, NOT BRAVADO (owner 2026-09-12: "spectacle doesn't need a fire or such bravado, it could have been jack torrance returning to push the cart into a maze")
    `${view ? `` : `THE FINALE MAY BE THE STORY'S TURN ACTING ON THE RIDE (an option, never owed — owner 2026-09-15): when the take has a turn it is the world's own story reaching the seat, imagined from the work, never a stock effect chosen for size (a fire, a flood) unless the work's own story is one; and the seat FEELS it: the ${w.vehicle} sways, jolts, dips, is pushed, turned or splashed; and `}${view ? "" : d.kind === "ridden" ? `THE RIDERS REACT AND ARE HEARD AS LINES (owner 2026-09-15): never seen, but their reactions are DIALOGUE LINES with a stamp and a manner under the label "the rows ahead" — never the seat's name — at the surprise and inside the climax (the rows ahead (shrieking) [${secs >= 6 ? secs - 3 : 4}s]: "No, no, no!"); a scream or a gasp written in a beat or in the Sound line is scenery, not a voice, and is never heard; what is felt stays in the beat — arms thrown up in the rows ahead, the rider's own breath` : d.kind === "driven" ? "THE DRIVER REACTS, never seen but heard — a breath, a word, the brakes" : "THE WEARER REACTS, never seen but heard and felt — a breath, a step back, the apparatus jolting"}. ` +
    // THE CLIMAX IS RIDDEN, NOT TAPPED (owner 2026-09-11, on draw 6's render: "the ending is abrupt and doesn't let the climax sit … you want to experience the
    // climax instead of end on an ironic note"): the last beat opened at [8s] of 9 — five events in one second, then the exit doors. The climax gets the last third.
    (view ? `` : d.ending === "quick"
      ? `THE PAYOFF IS A BUTTON (the plan's decision, from the maker's words): the build takes the time and the payoff lands late and clean — one event in the last second or two, the ${w.vehicle} still moving as it lands; quick shortens the landing, never the event. `
      : `THE CLIMAX IS RIDDEN, NOT TAPPED (the plan's decision: held): the climax owns at least ${climaxSecs(secs)} seconds — never fewer than four, never less than a third of the take — so the beat that OPENS it is stamped ${secs >= 6 ? `by [${secs - climaxSecs(secs)}s]` : "early enough to leave it those seconds"} (the climax may run over more than one beat; every beat after it opens is inside it) and the seat rides THROUGH the spectacle to the last frame — it unfolds across those seconds (the burst, then its heat and light on ${d.kind === "ridden" ? "the rows ahead" : d.kind === "driven" ? "the hood and the windscreen" : "the wearer"}, then the ${w.way} running on through it); THE SURPRISE IS INSIDE THE CLIMAX, NOT ITS EXIT: after the ${w.vehicle}'s lurch or spin the spectacle keeps acting on the seat and the last beat is still inside it — never through a door into a place the take has not built, never away from the figure to somewhere else — the ${w.vehicle} still inside it at the final image — the climax is experienced, not glanced at. `) +
    `${makerEndsRide(process.env.RAW_USER_PROMPT) ? `The ride ends because the maker's words end it — ridden to the last frame, the ending itself the payoff` : `The ride never ends itself — no exit doors, no unload, no station — and never shows its backstage: no operators, spare cars, storage or queue (owner 2026-09-15: the world is what the seat passes)`}; THE STAMPS FALL WHERE THE RIDE'S EVENTS FALL, never on a grid — a passage a second, a tableau two, the held stop two. ` +
    `THE PAYOFF NEVER ENDS ON A FACE: nothing fills the lens for long, and every figure keeps the scene's scale to the last frame.\n`;
  return s;
}

// ── THE FINDINGS ──────────────────────────────────────────────────────────────────────────────────────────
// APPARATUS LAW (owner 2026-09-05/06): in a ridden or worn form the camera IS the rider. A beat that looks AT the rider or the vehicle
// from outside, or that carries no seat cue at its opening, has dismounted. Riders ARE seen in a POV when the camera sits mid-train or
// at the back (the backs of heads, shoulders, arms up in the rows ahead); what dismounts is a rider or vehicle looked at from OUTSIDE
// (a kid on a tricycle watched from a doorway) or a rider doing a driver's work (pumping, pedalling, steering — impossible on rails).
// THE TWO THAT BELONG TO NO FORM IN PARTICULAR: the thing the camera rides leaving the frame, and a figure handling it — a picture from
// outside the mount on a ride, a car and a wearer alike. rideFindings reads THESE for every kind; the rest are the seat's own.
const OUTSIDE_PARTS = [
  String.raw`\b(?:the|a|its|our)\s+(?:ride\s+)?(?:vehicle|car|cart|omnimover|boat|train|coaster|pod|gondola|tram|kart|carriage|sled|trolley|buggy)\b[^.;]{0,80}\bout of (?:the )?frame\b`,   // the VEHICLE leaving the frame = the camera off it (draw 14 rendered the cart rolling away down the hedges)
  String.raw`\b(?:pushes|pushing|shoves|shoving|drags|dragging|hauls|hauling|grabs|grabbing)\s+the\s+(?:ride\s+)?(?:vehicle|car|cart|omnimover|boat|train|coaster|pod|gondola|tram|kart|carriage|sled|trolley|buggy)\b`,   // a figure handling the vehicle is a picture from outside it; from the seat it is a jolt and hands on the bar (draw 14)
];
export const OUTSIDE = new RegExp(OUTSIDE_PARTS.join("|"), "i");
const DISMOUNT_PARTS = [
  String.raw`\b(?:(?:a|the|one|another|some)\s+(?:[\w-]+\s+)?(?:rider|riders|cyclist|driver|passenger|boy|girl|kid|child|man|woman|figure)\s+(?:on|astride|aboard)\s+(?:a|the|his|her|their|its)\s+(?:trike|tricycle|bike|bicycle|kart|sled|board|skateboard|scooter|wagon|big wheel))\b`,
  String.raw`\b(?:trike|tricycle|bike|bicycle|kart|sled|scooter)-borne\b`,
  ...OUTSIDE_PARTS,
  String.raw`\b(?:the riders|the passengers|the rows ahead)\b[^.;]{0,40}\b(?:faces?|eyes|expressions?)\b(?!\s+(?:forward|ahead))`,   // the riders' faces are seen only from outside the vehicle
  String.raw`\ba rider (?:peers|looks|turns|leans|glances|stares|gazes)\b`,   // the camera's own rider is THE rider; "a rider" who peers is a rider looked at (dry-shining-3)
  String.raw`\b(?:the|a)\s+(?:rider|cyclist|driver|passenger)\s+(?:veers|swerves|pumps|pedals|steers|brakes|aims|weaves)\b`,
  String.raw`(?<!\bto )\bwatch(?:es|ing)?\s+(?:the|a)\s+(?:ride|rider|riders|cart|car|coaster|train)\b`,   // "to watch the cart pass" is a figure's performance (dry-cave-3), not a camera outside the train
  String.raw`\bfrom\s+the\s+(?:sidelines?|platform|ground|shore|balcony|doorway|curb|pavement)\b|\bon\s+the\s+(?:sidelines?|platform|shore|balcony|curb|pavement)\b`,   // "on the ground" is where a FIGURE stands, not where the camera is (job 9127e915's false positive)
  String.raw`\b(?:the|a)\s+(?:car|cart|coaster|train|ride|carriage)\s+(?:whips|carves|barrels|races|roars|plunges|swoops|tears|rips|hurtles|rockets|thunders|slaloms|spirals|screams|charges|blasts|slices|weaves)\s+(?:past|by|through|around|between|into)\s+(?:them|it|the crowd|the diners|the guests|the room|the tables|the figures|the people|everyone|the onlookers|the dancers|the patrons)\b`,
  String.raw`\b(?:the crowd|the diners|the guests|the room'?s?(?: gathered)? figures|the figures|the people|the onlookers|the patrons|the dancers|bystanders|everyone)\b[^.;]{0,50}\b(?:press(?:es|ed)? back|lean(?:s|ed|ing)? away|scatter(?:s|ed)?|part(?:s|ed)?|recoil(?:s|ed)?|flinch(?:es|ed)?|duck(?:s|ed)?|gasp(?:s|ed)?|startled|leap(?:s|ed)? (?:back|aside)|give(?:s)? (?:the turn|it|the car|the ride) room)\b`,
];
export const DISMOUNT = new RegExp(DISMOUNT_PARTS.join("|"), "i");
const INVERSION = /\b(?:loop(?:s|ing|ed)?|loop-the-loop|inversions?|upside[- ]down|inverted|corkscrews?|barrel[- ]rolls?)\b/i;
const FACEFILL = /\b(?:fills? the (?:frame|lens|screen|shot)|filling the (?:frame|lens|screen)|faces? (?:fill|loom)s?\b|inches from (?:a|the|her|his|their) faces?|straight into (?:a|the|her|his|their) faces?|close-up (?:of|on) (?:a|the|her|his|their) faces?|between the two (?:girls|twins|figures))/i;
// THE VEHICLE NEVER LEAVES ITS WAY (owner 2026-09-09, job eb329045: "the ride cart glides onto a hexagonal carpet pattern" — the rails ended at a
// carpeted platform in the video). A floor thing lies under and around the way; the vehicle rides onto nothing but its own way.
export const FLOOR_THING = /\b(?:carpets?|rugs?|tiles?|tiled|tiling|floorboards?|floors?|flooring|parquet|linoleum|paving|cobbles?|cobblestones?|stairs?|staircase|steps|marble floor)\b/i;
const LEAVES_WAY = /\b(?:cars?|carts?|vehicles?|omnimover|boats?|trains?|coaster|ride|pods?|gondolas?|carriages?|trams?|karts?)\s+(?:\w+\s+){0,2}?(?:glides?|gliding|rolls?|rolling|drives?|driving|moves?|moving|travels?|travelling|traveling|slides?|sliding|coasts?|eases?|climbs?|pulls?|rides?|runs?|swings?|passes?)\s+(?:up |down |out |off |on |forward |straight )?onto\s+(?:a|an|the|its|this|that)\s+(?!(?:own |next |new |same |long |short |dark |lit |wide |narrow )?(?:rails?|track|tracks|way|path|channel|flume|bridge|lift|conveyor|turntable|trestle|ramp|incline|hill|guide|section|stretch|scene|part|area|length|run|span|curve|bend|straight|passage|tunnel|corridor|hall)\b)/i;
// A BEAT THAT KEEPS THE RAILS UNDER THE FLOOR THING IS NOT LEAVING THEM (dry-cave-1 was refused on "rolls onto a section where a carpet lies under and around the rails" — the writer wrote exactly what the law asked)
const RAILS_KEPT = /\b(?:under|beneath) (?:and around )?the (?:rails?|track|way)\b|\b(?:rails?|track) (?:run|runs|running|continue|continues|continuing|carry|carries|carrying|go|goes|going) (?:on|across|over|through|under|beneath)\b|\bwith the (?:rails?|track|way) continuing\b/i;
const LEAVES_RAILS = /\b(?:leaves?|leaving|left|jumps? off|comes? off|off) (?:the|its) (?:\w+ ){0,2}?(?:rails?|track|tracks|channel|flume|water|waterway)\b|\b(?:cars?|carts?|vehicles?|omnimover|boats?|trains?|coaster|ride|pods?|gondolas?|carriages?|trams?|karts?)\s+(?:\w+\s+){0,2}?(?:drifts?|drifting|settles?|settling|sinks?|sinking|lowers?|lowering|drops?|dropping|descends?|descending|comes?|coming|eases?|easing|dips?|dipping)\s+(?:back\s+)?down\s+(?:on)?to\s+(?:a|an|the|its)\s+(?:\w+\s+){0,3}?(?:floor|ground|carpet|rug|tiles|boards|earth|pavement)\b/i;   // "the omnimover drifts down to the patterned floor" (dry-shining-5) leaves the rails as surely as rolling onto it
// A DARK RIDE'S FIGURES PERFORM (owner 2026-09-09: "the characters are frozen, theres no life … yes Dark-ride figures are animatronics")
const ANIMATE = /\b(?:walks?|walking|wanders?|wandering|strolls?|strolling|march(?:es|ing)?|shuffles?|shuffling|turns?|turning|swivels?|pivots?|pivoting|cranes?|craning|beckons?|beckoning|waves?|waving|lunges?|lunging|rises?|rising|lifts?|lifting|raises?|raising|swings?|swinging|nods?|nodding|reach(?:es|ing)?|steps?|stepping|lurch(?:es|ing)?|jerks?|snaps?|tilts?|rotates?|rotating|opens?|opening|blinks?|points?|pointing|gestures?|gesturing|sways?|swaying|rocks?|rocking|bows?|bowing|leans?|leaning|lights? up|flicker(?:s|ing)?|flash(?:es|ing)?|glows? (?:on|alive|brighter)|mouths? mov\w*|jaws? (?:open|drop|snap|work)\w*|speaks?|speaking|sings?|singing|laughs?|laughing|shrieks?|screams?|calls?|whispers?|growls?|roars?|cackles?|creaks? (?:up|forward|to life|alive)|springs? (?:up|forward|to life|alive)|comes? (?:alive|to life)|whirs?|thrash(?:es|ing)?|claws?|clawing|strikes?|slams?|pounds?|shudders?|twitch(?:es|ing)?|drops? (?:down|from|toward)|swoops?|charges?|follows? the (?:rider|car|cart|seat|camera|lens)|tracks? the (?:rider|car|cart|seat|camera|lens)|eyes (?:snap|flick|follow|light|open|glow)|heads? (?:turn|snap|swivel|tilt|lift)|arms? (?:rise|lift|swing|reach)|hands? (?:rise|lift|reach|beckon))\b/i;
/** THE BEAT LINES ONLY (dry-cave-local-2, 2026-09-11: the writer's Dialogue block was "[3s] The caretaker …: "…"", stamp first — every ride check read
 *  it as a beat, the last one as the LAST beat, and the run was refused for "the payoff does not send the ride on"). The beats end where the Dialogue
 *  header begins, and a stamped line shaped as speech (a label then a colon) is never a beat. Pure. */
const SPEECH_SHAPED = /^\s*\[\d+(?:\.\d+)?s\]\s*[^:\n.]{1,80}?(?:\s*\([^)\n]{0,80}\))?\s*(?:\[\d+(?:\.\d+)?s\]\s*)?:\s*["“]?[A-Za-z]/;
export function beatLines(text) {
  const t = String(text || ""); const cut = t.search(/^\s*Dialogue\s*:/im);
  return (cut < 0 ? t : t.slice(0, cut)).split("\n").filter((l) => /^\s*\[\d+(?:\.\d+)?s\]/.test(l) && !SPEECH_SHAPED.test(l));
}
/** Figures of the world the take mentions but never makes perform: [{ name, at }]. Pure. */
export function stillFigures(text, d) {
  const names = (d?.dressing?.figures || []).filter(Boolean);
  if (!names.length) return [];
  const lines = beatLines(text).map((l) => { const m = l.match(/^\s*\[(\d+(?:\.\d+)?)s\]\s*(.*)$/); return m ? { at: Number(m[1]), text: m[2] } : null; }).filter(Boolean);
  const out = [];
  for (const name of names) {
    const keys = [...new Set(_words(name))]; if (!keys.length) continue;
    // a SHORTER later mention is still the figure ("the figure in the red winter jacket slowly turning its head" — dry-shining-4 was refused because a six-word name needed four hits)
    const need = Math.min(2, Math.ceil(keys.length / 2));
    const mention = lines.filter((l) => keys.filter((k) => new RegExp(`\\b${_re(k)}`, "i").test(l.text)).length >= need);
    if (!mention.length) continue;   // an absent figure is the ledger's matter, not stillness
    const own = (t) => String(t).replace(/\b(?:the |a |its )?(?:rider|camera|seat|car|cart|omnimover|boat|vehicle|lens|phone|train|coaster)\b[^.;,]{0,24}?\b(?:turns?|turning|swings?|tilts?|rises?|drops?|pans?|swivels?|rotates?|leans?|dips?|points?|looks?)\b/gi, "");   // the rider's own turn is not the figure's performance
    if (mention.some((l) => ANIMATE.test(own(l.text)) || REACTS.test(own(l.text)))) continue;
    out.push({ name, at: mention[0].at });
  }
  return out;
}
// THE RIDE VEHICLE LEADS EVERY BEAT (owner 2026-09-09): a beat with no vehicle noun and motion at all is a beat the ride did not write
const VEHICLE_NOUNS = ["car", "cars", "cart", "carts", "vehicle", "omnimover", "boat", "boats", "train", "coaster", "pod", "pods", "gondola", "tram", "kart", "carriage", "sled", "ride", "trolley", "buggy", "rover", "capsule", "seat", "raft", "log", "canoe", "barge", "skiff"];   // + the water route's vessels (2026-09-15)
const VEHICLE_MOTION = /\b(?:glid(?:e|es|ing)|turn(?:s|ing)?|roll(?:s|ing)?|pass(?:es|ing)?|slow(?:s|ing)?|look(?:s|ing)?|swing(?:s|ing)?|climb(?:s|ing)?|drop(?:s|ping)?|bank(?:s|ing)?|pivot(?:s|ing)?|jerk(?:s|ing)?|drift(?:s|ing)?|bump(?:s|ing)?|creep(?:s|ing)?|eas(?:e|es|ing)|swivel(?:s|ling)?|round(?:s|ing)?|travel(?:s|ling|ing)?|mov(?:e|es|ing)|dip(?:s|ping)?|lurch(?:es|ing)?|rumbl(?:e|es|ing)|rattl(?:e|es|ing)|coast(?:s|ing)?|carr(?:y|ies|ying)|com(?:e|es|ing)|approach(?:es|ing)?|enter(?:s|ing)?|near(?:s|ing)?|veer(?:s|ing)?|curv(?:e|es|ing)|sweep(?:s|ing)?|plung(?:e|es|ing)|div(?:e|es|ing)|rush(?:es|ing)?|rac(?:e|es|ing)|hurtl(?:e|es|ing)|descend(?:s|ing)?|rise(?:s)?|rising|run(?:s|ning)?|advanc(?:e|es|ing)|push(?:es|ing)? (?:on|forward|through)|press(?:es|ing)? (?:on|forward)|nose(?:s|ing)? (?:into|through|toward)|edg(?:e|es|ing) (?:forward|past|into)|sail(?:s|ing)?|float(?:s|ing)?|whip(?:s|ping)?|swoop(?:s|ing)?|jolt(?:s|ing)?|sway(?:s|ing)?|buck(?:s|ing)?|shudder(?:s|ing)?|judder(?:s|ing)?|rock(?:s|ing)?|bounc(?:e|es|ing)|shak(?:e|es|ing)|tilt(?:s|ing)?|tip(?:s|ping)?|lunge(?:s)?|lunging|accelerat(?:e|es|ing)|speed(?:s|ing)?|surg(?:e|es|ing)|shoot(?:s|ing)?|burst(?:s|ing)?|crash(?:es|ing)?|tear(?:s|ing)?|barrel(?:s|ing)?|charg(?:e|es|ing)|blast(?:s|ing)?|plow(?:s|ing)?|plough(?:s|ing)?|splash(?:es|ing)?|skim(?:s|ming)?|thread(?:s|ing)?|squeez(?:e|es|ing)|wind(?:s|ing)?|snak(?:e|es|ing)|weav(?:e|es|ing)|brush(?:es|ing)? past|scrap(?:e|es|ing) (?:past|along)|crawl(?:s|ing)?|inch(?:es|ing)?|trundl(?:e|es|ing)|chug(?:s|ging)?|spin(?:s|ning)?|rotat(?:e|es|ing)|revers(?:e|es|ing)|brak(?:e|es|ing)|stall(?:s|ing)?|halt(?:s|ing)?|stop(?:s|ping)?|hold(?:s|ing)?|paus(?:e|es|ing)|wait(?:s|ing)?|sit(?:s|ting)? still|stand(?:s|ing)? still|idl(?:e|es|ing)|swerv(?:e|es|ing)|slid(?:e|es|ing)|skid(?:s|ding)?|glanc(?:e|es|ing) off|(?:is|are|gets?|being) (?:splashed|sprayed|soaked|drenched|showered|swallowed|engulfed|thrown|shoved|rocked|jolted|buffeted|swept|carried|pulled|dragged|lifted|dropped|tipped|spun|whipped|battered|struck|hit))\b/i;   // the finale's own verbs — jolt, sway, buck, is splashed — lead a beat (dry-cave-local-2: 'accelerates' and 'jolts' were flagged)
const WAY_NOUNS = ["rails", "rail", "track", "tracks", "way", "channel", "flume", "path", "water", "waterway", "canal", "river"];   // + the water route's ways (2026-09-15)
// THE RIDE IS PROGRAMMED (owner 2026-09-11): the vehicle's full stop, and the move the rider did not expect after it
const STOPS = new RegExp(`\\b(?:${VEHICLE_NOUNS.join("|")})\\b[^.;,]{0,40}?\\b(?:halts?|halting|halted|stops?(?: dead| short)?|stopping|stopped|comes? to a (?:stop|halt|standstill)|to a (?:stop|halt|standstill)|holds? (?:still|there|motionless|for a (?:moment|beat))|holding still|pauses?|pausing|paused|stands? still|sits? still|at a standstill)\\b`, "i");
const SURPRISES = /\b(?:lurch(?:es|ing|ed)? (?:backward|backwards|back|sideways|forward)|(?:rolls?|glides?|slides?|jerks?|shoots?|is (?:pulled|dragged|yanked)) (?:backward|backwards|back)|revers(?:es|ing|ed)|in reverse|backwards?|spins?|spinning|spun|whips? (?:round|around|about)|wheels? (?:round|around)|swings? (?:hard|sharply|round|around|away|suddenly)|swung (?:hard|round|around)|turns? (?:sharply|hard|suddenly|away|abruptly)|veers?|banks? hard|drops?(?: away| suddenly)?|dropping|plunges?|plunging|falls? away|tilts? back|rocks? back|pitches?|shoots? forward|lunges? forward|jolts? (?:forward|sideways)|(?:sudden|unexpected|abrupt) (?:turn|drop|lurch|spin|jolt|dip))\b/i;
export const rideStops = (line) => STOPS.test(String(line || ""));
// THE CLIMAX IS RIDDEN (owner 2026-09-11): the ride never ends itself in the last beat; every spoken line carries its manner
const RIDE_END = /\b(?:exit doors?|the exit|exit gates?|unload(?:ing)?(?: area| station)?|the station|(?:end|close) of the ride|ride ends|gift shop|(?:back |out )?into (?:the )?daylight)\b/i;
// THE RIDE'S BACKSTAGE NEVER SHOWS (owner 2026-09-15, B4: "near where operators park the spare cars" — the show's maintenance leaked into the world): operators, spare vehicles,
// storage, a control booth, the queue — the ride's own operations are never in the take; the world is what the seat passes. Read on every beat (the exit family reads the last).
const BACKSTAGE = /\b(?:operators?|ride attendants?|attendants?|staff|crew|spare (?:cars?|vehicles?|boats?|carts?)|parked (?:cars?|vehicles?|carts?)|maintenance|backstage|back ?stage|storage|storeroom|workshop|control (?:booth|room|panel)|the queue|queue line|loading (?:dock|area|platform)|the depot)\b/i;
export const rideEndsItself = (line) => RIDE_END.test(String(line || ""));
// …unless the MAKER ends it (owner 2026-09-11: "the ride can end if user prompts for it, it all depends"): the maker's own words asking for the exit, the unload, the station or the end stand the ban down
const MAKER_ENDS = /\b(?:ends?|ending|exits?|exiting|unloads?|unloading|the station|gets? off|getting off|steps? off|the end of the ride|last stop|pulls? in(?:to)?)\b/i;
export const makerEndsRide = (words) => MAKER_ENDS.test(String(words || ""));
// A LABEL MAY END IN AN ADDRESSEE TAIL (B5, 2026-09-15: "the twins in matching dresses (monotone, in unison) [2s] to the rows ahead:" — the line's time, its manner
// and the riders' voice were all read off a shape that had no room for the tail, so such a line was never measured at all). One tail, read by every parser here.
const ADDRESSEE_TAIL = "(?:\\s+(?:to|at|toward|towards)\\s+[^:\\n]{1,80})?";
const STAMP_COLON = new RegExp(`\\[(\\d+(?:\\.\\d+)?)s\\]${ADDRESSEE_TAIL}\\s*:`);
const MANNER_TAG = new RegExp(`\\([^)\\n]{2,60}\\)\\s*\\[\\d+(?:\\.\\d+)?s\\]${ADDRESSEE_TAIL}\\s*:`);
/** The Dialogue block's spoken lines: [{ label, line }] — the text after the Dialogue header, each "<label> [Ns]: …" line. */
export function dialogueLines(text) {
  const parts = String(text || "").split(/^\s*Dialogue\s*:/im); if (parts.length < 2) return [];
  return parts.slice(1).join("\n").split("\n").map((l) => { const m = l.match(new RegExp(`^\\s*(.+?)\\s*\\[\\d+(?:\\.\\d+)?s\\]${ADDRESSEE_TAIL}\\s*:\\s*\\S`)); return m ? { label: m[1].trim(), line: l } : null; }).filter(Boolean);
}
export const saysHow = (line) => MANNER_TAG.test(String(line || ""));
// THE CLIMAX OWNS AT LEAST FOUR SECONDS, AND NEVER LESS THAN A THIRD (owner 2026-09-15, live 2516f272: "i never like for the last turns / climaxes of the ride to be
// 2-3 seconds … a minimum of 4 seconds … i dont mean last turn is 4 seconds, i mean the climax of a rider should be that at least"): the 09-11 "last third" (secs−3)
// let a 9 s take open its last beat at [6s] and leave the figure after a second and a half. One number, read by the block, the check, the cheap format retry and the skeleton.
export const climaxSecs = (secs) => Math.max(4, Math.ceil(Number(secs || 0) / 3));
// THE RIDERS ARE HEARD AS LINES (owner 2026-09-15, live 2516f272: "we dont hear the ride occupants saying anything or screaming" — the screams sat in a beat and in the
// Sound line, and neither is a voice; the two lines that were voiced were Dialogue lines): a Dialogue line whose SPEAKER is the rows ahead, the riders or the seats.
// The label's head only — an addressee tail ("the caretaker to the rows ahead (sing-song)") and the manner are not the speaker.
export const RIDERS_LABEL = /^(?:the |a |an )?(?:rows?(?: ahead| behind)?|riders?|passengers?|seats?)\b/i;
export const ridersHeard = (text) => dialogueLines(text).some((dl) => RIDERS_LABEL.test(dl.label.replace(/\([^)]*\)?/g, " ").replace(/\s+to\s+.*$/i, "").trim()));
// A SPOKEN LINE NEVER OUTRUNS THE BEAT THAT CARRIES IT (owner 2026-09-13, on draw 23: four lines in nine seconds, three longer than the second they sat in, the caretaker's
// seven words at 8s of 9). About three words a second; a line's time runs from its stamp to the next beat's stamp (or the take's end); no line begins in the last second.
export const WORDS_PER_SEC = 2.8;
export function linesOutrun(text, secs = 9) {
  const t = String(text || ""); const stamps = beatLines(t).map((l) => Number((l.match(/^\s*\[(\d+(?:\.\d+)?)s\]/) || [])[1])).filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
  const out = [];
  // A LINE'S TIME ENDS WHERE THE NEXT VOICE BEGINS, NOT ONLY WHERE THE NEXT BEAT DOES (2026-09-14): the window was
  // read off the BEAT stamps alone, so every line inside one beat was measured as if the others were not there —
  // two lines on one stamp (the 9/11 draw) and a line still being said when the next begins (draw 27's [4s] before
  // its [5s]) outran nothing at all. The voices share the beat; each one's window closes at the next voice.
  const said_ = dialogueLines(t), spokenAt = said_.map((x) => Number((x.line.match(STAMP_COLON) || [])[1]));
  for (const [i_, dl] of said_.entries()) {
    const at = spokenAt[i_]; if (!Number.isFinite(at)) continue;
    const said = (dl.line.split(STAMP_COLON).slice(2).join("") || "").replace(/^\s*:?\s*/, "").replace(/^["“'\s]+|["”'\s]+$/g, "");
    const words = said.split(/\s+/).filter(Boolean).length; if (!words) continue;
    // ⭐⭐ TWO VOICES ON ONE STAMP ARE SIMULTANEOUS, NOT QUEUED (owner 2026-09-22: the planner may let the addressee "respond at the
    // same time juncture (as if speaking over) to produce realism"). The window used to close at the NEXT VOICE whatever its stamp, so a
    // second line sharing a stamp gave the first a window of zero and every overlap was a law fail. Voices that begin together run
    // together: each is measured to the next voice at a LATER stamp, or the next beat, whichever comes first.
    const nextVoice = spokenAt.slice(i_ + 1).find((n) => Number.isFinite(n) && n > at);
    const next = Math.min(...[stamps.find((s) => s > at), nextVoice].filter((n) => Number.isFinite(n)), secs);
    const window = Math.max(0, next - at);
    const need = words / WORDS_PER_SEC;
    if (at >= secs - 1) out.push({ at, label: dl.label, words, need: Number(need.toFixed(1)), window, kind: "last second" });
    else if (need > window + 0.3) out.push({ at, label: dl.label, words, need: Number(need.toFixed(1)), window, kind: "outruns" });
  }
  return out;
}
export const rideSurprises = (line) => SURPRISES.test(String(line || ""));
export function vehicleLeads(line, d) {
  const w = d ? rideWords(d) : { vehicle: "", way: "" };
  const nouns = [...VEHICLE_NOUNS, ...WAY_NOUNS, ...String(w.vehicle || "").toLowerCase().split(/\s+/).filter((x) => x.length >= 3), ...String(w.way || "").toLowerCase().split(/\s+/).filter((x) => x.length >= 3)];
  // SUBJECT THEN VERB, close together: "the ride vehicle glides", "the car slowly enters", "the rails run on" — never "the rider turns … beside the rails"
  const rx = new RegExp(`\\b(?:${[...new Set(nouns)].map(_re).join("|")})\\b(?:\\s*,[^,\\n]{0,90},)?(?:\\s+\\w+){0,2}?\\s+${VEHICLE_MOTION.source.replace(/^\\b|\\b$/g, "")}`, "i");   // "the ride vehicle, with the backs of riders' heads in the rows ahead, glides" leads (dry-cave-local-2)
  return rx.test(String(line || ""));
}
/** A REPLACEMENT IS A STANDING FACT IN THE GOLDEN GRAMMAR — "<the world's thing> where <the set piece> stood" (draw 5 render 1: "hedge maze walls where the
 *  giant mushroom stood"). dry-cave-local-1 (2026-09-11) was handed "X becomes Y" and wrote "become" at 0s plus a [1s] beat where two more "became" — a morph
 *  on screen. The placement's internal shape stays "X becomes Y"; this is how it is SHOWN to the writer and STATED by the repair. A surface reads "was". Pure. */
const SURFACE_WORD = /\b(?:floor|ceiling|path|walkway|ground|bed|carpet|roof|surface|track|light|lighting|glow|lamps?|sky)\b/i;   // a surface or a light "was"; a thing "stood"
const FLOOR_PIECE = /\b(?:floor|flooring|ground|path|walkway|carpet|rug|bed|trackbed|boards|tiles)\b/i;   // a set piece the way runs across
export function replacementFact(f, way = "") {
  const s = String(f || "").replace(/^[^:]{0,80}\(frame zero[^)]*\):\s*/i, "").replace(/^the seat photograph[^:]*:\s*/i, "").trim();
  const m = s.match(/^(.*?)\s+becomes\s+(.+?)\.?$/i);
  if (!m) return s;
  const fact = `${m[2].trim()} where ${m[1].trim()} ${SURFACE_WORD.test(m[1]) ? "was" : "stood"}`;
  // a floor's replacement carries the way across it (draw 5: "a dark blue runner carpet where the floor beside the rails was" — and the rails were gone for three seconds)
  return way && FLOOR_PIECE.test(m[1]) ? `${fact}, with the ${way} running on across it` : fact;
}
/** The way runs across a floor at frame zero: true when the [0s] line says so (the rails running/continuing on across/over it). */
export function wayAcrossFloor(line, way) {
  if (!way) return true;
  return new RegExp(`\\b${_re(way)}\\b[^.;]{0,50}\\b(?:run|runs|running|continue|continues|continuing|carry|carries|carrying)\\b(?: on)?(?: ahead)? (?:across|over|through|along)\\b`, "i").test(String(line || ""));
}
/** The set pieces a placement REPLACES (its "<where> becomes <name>" names the set piece) — pure. */
export function replacedSetPieces(d) {
  const plate = (d?.dressing?.plateThings || []).filter(Boolean);
  const wheres = (d?.dressing?.placements || []).map((l) => String(l || "").replace(/^[^:]{0,80}\(frame zero[^)]*\):\s*/i, "").replace(/^the seat photograph[^:]*:\s*/i, "")).filter((l) => / becomes /i.test(l)).map((l) => l.split(/ becomes /i)[0]);
  return plate.filter((p) => { const keys = pieceKeys(p); if (keys.length < 2) return false; return wheres.some((wh) => keys.filter((k) => new RegExp(`\\b${_re(k)}`, "i").test(wh)).length * 2 >= keys.length); });
}
const SURFACE_KEYS = new Set(["rails", "rail", "track", "tracks", "trackbed", "ground", "ceiling", "background", "backdrop", "platform", "stand", "surface", "dark"]);
/** A set piece's DISTINCTIVE words: never the way's, never a bare surface's; fewer than two = a surface, not a prop (dry-shining-4: "the floor beside the rails"). */
export const pieceKeys = (p) => [...new Set(_words(p))].filter((k) => !SURFACE_KEYS.has(k));
// (THE STAGING GRAMMAR that stood here — a list of stage words a scene had to name two of — was DROPPED 2026-09-13 with the template; the booth below is the one staging flaw)
// THE BOOTH (owner 2026-09-12): a scene written as a platform beside the way or a flat/screen with figures before it renders flat — the ride's own flaw
const BOOTH = /\b(?:tableau\b[^.;]{0,80}?\bon a (?:low |small |raised )?platform|painted flat|a flat of|flat behind|projected onto a screen|on a screen|a screen showing|a screen with)\b/i;   // a plate's own "raised platform" (dry-shining-4's set piece) is not a booth
// MENACE TOWARD THE SEAT (owner 2026-09-12: "lunges toward the rails is a bit much. in fact the axe softening was what succeeded a failed gen"): a weapon or a strike aimed at the vehicle or the rows is what the provider's gate refuses
// ⚠ THE AIM IS THE WEAPON'S OWN CLAUSE (2026-09-14): the window spanned commas, so a brass dial "swinging between
// floors, and the man … leans toward the rows ahead" read as a strike at the seat and softenMenace then amputated an
// innocent sentence. STOPS and stillFigures already stop at the comma; the strike and its aim share one clause.
const MENACE = /\b(?:axe|hatchet|knife|blade|bat|cleaver|machete|swings?|swinging|swung|lunges?|lunging|thrusts?|jabs?|slash(?:es|ing)?|strikes? out|charges?|rais(?:es|ing) (?:the|his|her|its) (?:axe|hatchet|knife|blade|bat))\b[^.;,]{0,60}\b(?:toward|towards|at|into) the (?:vehicle|car|cart|rails|track(?! bed)|riders?|rows?(?: of (?:riders|passengers))?(?: ahead)?|seat|camera|lens|passengers)\b/i;
export const boothIn = (line) => BOOTH.test(String(line || ""));
// THE ROWS AHEAD ARE NEVER COSTUMED (draw 14 rendered, owner 2026-09-12: "we see the heads of two riders who are indeed the twins (because they're also wearing robes)")
const COSTUMED_ROWS = /\b(?:riders?|rows? ahead|passengers?)\b[^.;]{0,60}\b(?:dressed(?: as| in| like)?|wearing|in (?:matching )?(?:bathrobes?|robes?|cardigans?|pinafores?|dresses|coats?|jackets?|overalls?|costumes?)|with (?:dark|blond|blonde|long|short|red|curly|lank) hair|(?:in )?bangs|pigtails|(?:their |the )?faces?|terrified expressions?|resembling|who look like)\b/i;
// A DESCRIBED PERSON ON A SEAT IS A DRESSED ROW WHATEVER THE WORD ORDER (draw 22, 2026-09-13: "On the rear seat, a terrified woman with dark hair in pigtails, wearing a
// plaid shirt … holds a wooden baseball bat …, while another identical woman sits in the row ahead" passed the check above — the seat came first and the row last).
// Strict: a seat phrase, a person, a look word, in that order within one sentence. Loose (the repair only): a person who sits in a row or on a seat.
const SEAT_PHRASE = "(?:on|in) the (?:rear |back |front |second |next |first |last )?(?:seats?|rows?)(?: ahead| behind)?";
const PERSON = "(?:woman|women|man|men|figures?|girls?|boys?|riders?|passengers?|twins?)";
const LOOK = "(?:hair|pigtails|bangs|dress|dresses|shirt|jacket|pinafore|overalls?|cardigan|robe|bathrobe|coat|face|faces|expression|eyes|wide-eyed|wearing|dressed|holding|holds|clutching|bat|knife|axe)";
const SEATED_FIGURE = new RegExp(`\\b${SEAT_PHRASE}\\b[^.;]{0,60}\\b${PERSON}\\b[^.;]{0,40}\\b${LOOK}\\b`, "i");
const SEATED_LOOSE = new RegExp(`\\b${PERSON}\\b[^.;]{0,60}\\b(?:sits?|sitting|seated|rides?|riding|cowers?|cowering|huddles?|huddling)\\b[^.;]{0,30}\\b${SEAT_PHRASE}\\b`, "i");
export const costumedRows = (line) => COSTUMED_ROWS.test(String(line || "")) || SEATED_FIGURE.test(String(line || ""));
/** THE ROWS ARE UNDRESSED MECHANICALLY as a last resort (owner 2026-09-13: "wendy as the rider is an issue that keeps happening and we need to patch"): a sentence that
 *  seats a described person is DROPPED from its beat — never reworded — and the beat's first sentence (the vehicle's own) is never touched. Pure. */
export function uncostumeRows(text) {
  return String(text || "").split("\n").map((l) => {
    if (!/^\s*\[\d+(?:\.\d+)?s\]/.test(l)) return l;
    // clauses joined by semicolons are statements of their own (draw 24, 2026-09-13: frame zero seated two dressed passengers between semicolons in one long sentence)
    const parts = l.split(/(?<=[.!?;])\s+/); if (parts.length < 2) return l;
    const kept = parts.filter((s, i) => i === 0 || !(COSTUMED_ROWS.test(s) || SEATED_FIGURE.test(s) || SEATED_LOOSE.test(s)));
    return kept.join(" ").replace(/;\s*$/, ".").replace(/;(\s*;)+/g, ";");
  }).join("\n");
}
/** THE MENACE IS SOFTENED MECHANICALLY as a last resort (owner 2026-09-13: "the axe brandished toward the track" must never ship): the aim is cut and the weapon stays —
 *  "brandish his fire axe toward the track" → "brandish his fire axe"; the threat lives in the stance and the words, as the law says. Pure. */
/** THE PLATFORM IS CUT as a last resort (draws 20–24: "on a low platform" four runs running, the booth the 09-12 ruling retired): the phrase goes, the figure stays where it stood. Pure. */
export function unplatform(text) {
  return String(text || "").split("\n").map((l) => (/^\s*\[\d+(?:\.\d+)?s\]/.test(l) ? l.replace(/\s+(?:on|onto|atop) a (?:low |small |raised )?platform(?: (?:beside|next to|by) the (?:rails|track|way))?(?: (?:on|to) the (?:left|right))?\b/gi, "") : l)).join("\n");
}
export function softenMenace(text) {
  const AIM = /(\b(?:axe|hatchet|knife|blade|bat|cleaver|machete|swings?|swinging|swung|lunges?|lunging|thrusts?|jabs?|slash(?:es|ing)?|strikes? out|charges?|rais(?:es|ing) (?:the|his|her|its) (?:axe|hatchet|knife|blade|bat))\b[^.;,]{0,60}?)\s+(?:toward|towards|at|into) the (?:vehicle|car|cart|rails|track(?! bed)|riders?(?: in the (?:rows?|seats?)(?: ahead)?)?|rows?(?: of (?:riders|passengers))?(?: ahead)?|seat|camera|lens|passengers)\b/gi;
  return String(text || "").split("\n").map((l) => (/^\s*\[\d+(?:\.\d+)?s\]/.test(l) ? l.replace(AIM, "$1") : l)).join("\n");
}
// EVERY FIGURE HAS ITS TURN (owner 2026-09-12: "ideally words 'speech' come from every animatronic or subject in a ride, given their turn of course. a non-speaking
// animatronic should at least be making sound or motioning meaningfully"): a figure passed with no line of its own at its beat and no sound in the beat passes silent
const SOUND_WORDS = /\b(?:laugh(?:s|ing|ter)?|giggl\w*|cackl\w*|chuckl\w*|hiss(?:es|ing)?|growl\w*|groan\w*|moan\w*|scream\w*|shriek\w*|whisper\w*|hum(?:s|ming)?|whirr?(?:s|ing)?|click(?:s|ing)?|creak\w*|rattl\w*|chim\w*|bell|sings?|singing|calls? out|cries|crying|whistl\w*|snarl\w*|roar\w*|mutter\w*|chant\w*|knock\w*|taps?|tapping|clatter\w*|its voice|says|speaks?|speaking|intones?|announces?)\b/i;
export function silentFigures(text, d) {
  const names = (d?.dressing?.figures || []).filter(Boolean); if (!names.length) return [];
  const lines = beatLines(text).map((l) => { const m = l.match(/^\s*\[(\d+(?:\.\d+)?)s\]\s*(.*)$/); return m ? { at: Number(m[1]), text: m[2] } : null; }).filter(Boolean);
  const spoken = dialogueLines(text).map((dl) => ({ label: dl.label.toLowerCase(), at: Number((dl.line.match(/\[(\d+(?:\.\d+)?)s\]/) || [])[1] || 0) }));
  const out = [];
  for (const name of names) {
    // THE FIGURE IS MATCHED BY ITS OWN WORDS, NOT BY TWO OF THEM (dry-cave-local-19, 2026-09-13: "a figure in a bright red jacket and blue jeans walking hand-in-hand with a
    // smaller figure" matched the caretaker's "red corduroy jacket" at frame zero — two words — and was flagged silent at 0s while its own beat at 2s had the whir).
    // The beat that passes a figure is the beat carrying MOST of its distinctive words (a majority, or its longest word), as every other check reads a figure.
    const keys = pieceKeys(name); if (!keys.length) continue;
    const head = [...keys].sort((a, b) => b.length - a.length)[0];
    const hits = (t) => keys.filter((k) => new RegExp(`\\b${_re(k)}`, "i").test(t));
    const passes = (t) => { const h = hits(t); return h.length * 2 >= keys.length || (head.length >= 7 && h.includes(head)); };
    // EVERY PASS COUNTS, NOT THE FIRST ONE THAT TIES (2026-09-14, measured on draw 27's live draws): a figure the
    // take passes twice was pinned to the first beat that matched and judged only there, so a caretaker passed at
    // [2s] and again at [6s], speaking at [6s], was reported silent — a "ride" finding that buys a full corrective
    // writer pass on a draft that obeyed the law. A figure passes silent only when NO pass carries its sound and no
    // pass's window carries its line; the finding still names its first pass.
    const passing = lines.map((l, j) => (passes(l.text) ? j : -1)).filter((j) => j >= 0);
    if (!passing.length) continue;   // an absent figure is the ledger's matter
    // a speaker LABEL is short by nature: "the figure in a bright red jacket" names the pair with three of its eight words (draw 23, 2026-09-13 — flagged silent while it spoke); two distinctive words in the label at the figure's beat are the figure
    const heard = passing.some((j) => { const from = lines[j].at, to = j + 1 < lines.length ? lines[j + 1].at : Infinity;
      return SOUND_WORDS.test(lines[j].text) || spoken.some((s) => s.at >= from && s.at < to && (passes(s.label) || hits(s.label).length >= 2)); });
    if (heard) continue;
    out.push({ name, at: lines[passing[0]].at });
  }
  return out;
}
export const menaceIn = (line) => MENACE.test(String(line || ""));
const PORTAL = /\b(?:doors?|archway|arch|gate|mouth|curtain|portal)\b[^.;]{0,80}\b(?:opens?|opening|opened|swing|swings|swung|slides?|sliding|slid|parts?|parting|parted|crack|cracks|cracking)\b|\b(?:parting|opening|swinging|sliding) (?:red |wooden |double |heavy )?(?:elevator |wooden |double )?doors\b|\b(?:into|through) (?:the|a|its own) (?:black|dark|darkness)\b/i;
const TRANSFORM = /\b(?:becomes?|becoming|(?<!\b(?:sharp|hard|sudden|forced|left|right|a|the|its|another|tight|wide|slow|fast|blind)\s)turns? into|turning into|transforms?(?: into)?|transforming|morphs?(?: into)?|morphing|(?:is|are|be|being) replaced (?:by|with)|changes? into|changing into|dissolves? into|melts? into|gives? way to)\b/i;   // "a sharp turn into hedge walls" is a motion, not a change (draw 17)
const REPLACEMENT_VERB = /\b(?:becomes?|became|is now|are now|in place of|in the place of|where [^.;,]{0,60} (?:stood|stands|was|were)|stands? where|replaced by|taken over by|gives? way to|instead of)\b/i;
// THE FINALE IS FELT BY THE SEAT (owner 2026-09-11): the vehicle reacts, or the riders do — else the spectacle passed nobody
const SEAT_FEELS = /\b(?:swallow(?:s|ed|ing)? (?:the|it|them)|engulf(?:s|ed|ing)? (?:the|it|them)|plung(?:e|es|ed|ing) (?:through|into) the|through the (?:deluge|flood|surge|spray|torrent)|sways?|swaying|swayed|jolts?|jolting|jolted|lurch(?:es|ing|ed)?|dips?|dipping|bucks?|bucking|rocks?|rocking|rocked|shudders?|shuddering|shakes?|shaking|shook|tilts?|tilting|swerves?|swerving|is (?:splashed|sprayed|drenched|showered|thrown|shoved|pushed|tipped|turned|spun|jostled|rocked|shaken|derailed)|splash(?:es|ing)? (?:over|across|onto) the|sprays? (?:over|across|onto) the|(?:gasps?|screams?|shrieks?|laughter|laughs?|cheers?|whoops?|yelps?) (?:from|in|rise|ring|erupt|burst)|(?:from|in) the rows? ahead|riders?(?:'|’)? (?:gasp|scream|shriek|laugh|cheer|whoop|yelp|duck|flinch)|arms (?:fly|thrown|go|shoot) up|hands (?:fly|go|shoot) up)\b/i;
export function seatFeels(line) { return SEAT_FEELS.test(String(line || "")); }
/** Test hook (batteries only): the older fixtures pin their own rules; the finale and the golden-opening checks are skipped when on. Production never sets it. */
export const CORE_ONLY = { on: false };
const WAY_END = /\b(?:rails?|track|tracks|channel|flume|way|path|road) (?:end|ends|ended|ending|stop|stops|stopped|stopping|terminat(?:e|es|ed|ing)|run(?:s)? out|ran out|running out|give(?:s)? out|gave out|giving out|dead-?end(?:s|ed|ing)?|halt(?:s|ed|ing)?|com(?:e|es|ing) to (?:a|an) (?:end|stop|halt))\b/i;   // job 4aa764e1: "the rails terminating in a snowy hedge maze" shipped
const HARD_CUT = /\bhard cuts?\s+to\b/i;
// THE MOUNT (owner 2026-09-07): the opening beat may see the train from outside AS IT ARRIVES AT THE CAMERA and take the camera up
const MOUNT = /\b(?:toward|towards|to|at|straight at|right at|up to|onto) the (?:camera|lens|frame)\b|\breach(?:es|ing)? the (?:camera|lens)\b|\bnears? the (?:camera|lens)\b|\b(?:the camera|the lens|the frame|the view|the shot) (?:is )?(?:taken up|taken aboard|picked up|swept up|swept aboard|carried along|carried aboard|climbs aboard|drops into the (?:front |back )?seat|becomes the (?:front |back )?seat|is aboard|rides from here|goes aboard)\b|\btakes (?:it|the camera|the lens|us) up\b|\bfrom (?:that|this) moment (?:on )?(?:aboard|the seat|the ride|we ride|it rides)\b|\bfrom the (?:front |back )?seat from then on\b/i;
// WHATEVER THE RAILS REACH IS MET AT SPEED (coaster only, owner 2026-09-07): a stillness phrase + a passage-close phrase + no reaction
const STILL = /\b(?:stands?|standing|stood) (?:where|still|motionless|there|at|by|in|beside|on)\b|\b(?:holds? (?:still|position)|motionless|frozen (?:in place|still)|unmoving|does not move|doesn't move|without moving|not moving|waits? there|waiting|lets? it (?:go|pass|rush|roll) by|without turning|does not turn|doesn't turn)\b/i;
const CLOSE_PASS = /\b(?:clatters?|rattles?|roars?|rushes?|races?|sweeps?|whips?|passes?|goes|hurtles?|barrels?) (?:past|by)\b|\bclose enough\b|\binches? (?:from|past)\b|\bbrush(?:es|ing)? (?:past|by)\b|\bnear(?:ly)? (?:his|her|their) (?:boots|feet|shoulder|face|coat)\b|\bpast (?:him|her|them)\b/i;
const REACTS = /\b(?:steps? (?:back|aside|away|clear|off)|leaps?|lunges?|dives?|ducks?|flinch(?:es|ing)?|recoils?|staggers?|stumbles?|scrambles?|swings? (?:the|his|her|at|it|round|around)|spins?|wheels? (?:round|around)|is (?:thrown|knocked|swept|shoved|blown|spun)|blown back|(?:coat|hair|scarf|hat|dress|sleeves?) (?:whips?|snaps?|lifts?|flies|tears?)|snatches?|jumps? (?:back|aside|clear)|bolts?|throws? (?:himself|herself|themselves)|shoved aside|pushed aside|knocked aside)\b/i;
export function statueIn(text) { const t = String(text || ""); const s = t.match(STILL); return s && CLOSE_PASS.test(t) && !REACTS.test(t) ? s[0] : null; }

// the seat's own objects — a seat cue is an OBJECT, never a motion word (owner 2026-09-06: "the turn" alone let a ballroom cut through);
// the list is the class's plus the plate's own way and vehicle words
const SEAT_OBJECTS = ["rails", "rail", "tracks", "track", "bow", "the bow", "gunwale", "channel", "flume", "the water ahead", "lap bar", "restraint", "harness", "handlebars", "grab bar", "safety bar", "restraint bar", "bar across the lap", "car nose", "nose of the car", "the car's nose", "the car's front", "hood", "visor", "goggles", "the seat", "from the seat", "rows ahead", "row ahead", "the row in front", "backs of heads", "backs of riders", "behind the riders", "behind the passengers", "passengers ahead", "passengers in front", "the front row", "the back row", "train ahead", "car ahead", "seats ahead", "the bow", "boat's bow", "dashboard", "windshield", "steering wheel", "water channel", "the channel", "the flume", "the groove", "the floor ahead", "the way ahead", "the path ahead", "the road ahead", "the car", "the boat", "the vehicle", "the pod", "the train", "the omnimover", "the kart", "the gondola", "the tram"];
export function seatCue(line, d = null) {
  const w = d ? rideWords(d) : { way: "", vehicle: "" };
  const words = [...SEAT_OBJECTS, w.way, w.vehicle, `the ${w.way}`, `the ${w.vehicle}`].filter(Boolean);
  const rx = new RegExp(`\\b(?:${[...new Set(words)].map(_re).join("|")})\\b`, "i");
  return rx.test(String(line || ""));
}
// THE RIDE IS SENT ON — semantic, any word order (owner 2026-09-07: "the rails never end on screen"; job 2b2e1496: "the vehicle plunges
// through the red deluge onto the continuing track" was refused by a noun-then-verb regex without "vehicle"). The last sentence
// carries a ride noun AND a motion of the ride or the way, in either order; being engulfed at speed is a ride.
const RIDE_NOUNS = ["rails", "rail", "track", "tracks", "way", "path", "channel", "water", "flume", "floor", "groove", "road", "car", "cars", "train", "coaster", "ride", "vehicle", "boat", "pod", "omnimover", "kart", "gondola", "tram", "bow", "nose", "camera", "seat", "frame", "lens", "view"];
const RIDE_MOTION = /\b(?:runs?|running|ran|carr(?:y|ies|ying|ied)|continu(?:e|es|ing|ed)|rac(?:e|es|ing)|rush(?:es|ing)?|stretch(?:es|ing)?|curv(?:e|es|ing)|bank(?:s|ing)?|drop(?:s|ping)?|climb(?:s|ing)?|lead(?:s|ing)?|plung(?:e|es|ing)|div(?:e|es|ing)|hurtl(?:e|es|ing)|barrel(?:s|ing)?|tear(?:s|ing)?|vanish(?:es|ing)?|disappear(?:s|ing)?|go(?:es|ing)?|roll(?:s|ing)?|glid(?:e|es|ing)|sweep(?:s|ing)?|speed(?:s|ing)?|slid(?:e|es|ing)|surg(?:e|es|ing)|shoot(?:s|ing)?|swallow(?:s|ed|ing)?|engulf(?:s|ed|ing)?|submerg(?:e|es|ed|ing)|swept|carried|drawn|pulled|onward|onwards|ahead|beyond|out of (?:the )?frame|out of view|into the (?:dark|black|blackout|distance|next))\b/i;
export function rideSentOn(sentence, d = null) {
  const t = String(sentence || "");
  const w = d ? rideWords(d) : { way: "", vehicle: "" };
  const nouns = [...RIDE_NOUNS, ...String(w.way).split(/\s+/), ...String(w.vehicle).split(/\s+/)].filter((x) => x && x.length >= 3);
  const nounRx = new RegExp(`\\b(?:${[...new Set(nouns)].map(_re).join("|")})\\b`, "i");
  return nounRx.test(t) && RIDE_MOTION.test(t);
}
const lastSentenceOf = (line) => { const s = String(line || "").replace(/^\s*\[\d+(?:\.\d+)?s\]\s*/i, "").split(/(?<=[.!?])\s+/).filter(Boolean); return s[s.length - 1] || String(line || ""); };

/** The form's noun used as a PLACE ("into the dark ride", "a dark ride's interior", "the next scene of a dark ride") — never as the vehicle's adjective
 *  ("the dark-ride car") nor as the ride's own voices or music. null when the decision carries no noun. Pure. */
export function formNameAsPlace(d) {
  const noun = String(d?.noun || "").trim().toLowerCase(); if (!noun) return null;
  const n = noun.split(/\s+/).map(_re).join("[ -]");
  return new RegExp(String.raw`\b(?:into|inside|through|toward|towards|to|within|beyond|enters?|entering|reach(?:es|ing)?|scene of|interior of)\s+(?:the|a|an|this|its(?: own)?)\s+${n}(?:'s)?\b(?!\s*(?:car|cart|carts|vehicle|train|boat|coaster|seat|bar|track|rails?|way|riders?|speakers?|voices?|show|own))|\b(?:a|the|this)\s+${n}'s\s+(?:interior|next scene|dark|passage|tunnel|scene)\b`, "i");
}
/** THE FINDINGS — the run's ledger shape ({ rule, figure, at }), fatal-class every one: a wrong video, never a style note.
 *  @fed the beats text and the ride decision; workTitles for the world-room ban under a theme. */
export function rideFindings(text, d, { workTitles = [], secs = Number(process.env.BEAT_DURATION || 0), userWords = process.env.RAW_USER_PROMPT || "" } = {}) {
  const out = []; if (!d) return out;
  const w = rideWords(d);
  const lines = beatLines(text);   // the beats only — never the Dialogue block's stamped lines (dry-cave-local-2)
  // THE CLIMAX IS RIDDEN, NOT TAPPED (owner 2026-09-11, draw 6: the last beat at [8s] of 9 — a jolt, a burst, screams and the exit doors in one second):
  // the ride never ends itself; every spoken line says how it is said. The ride's own flaws. THE CLIMAX'S OPENING IS NO LONGER READ OFF THE LAST STAMP (owner 2026-09-15:
  // the climax owns at least four seconds and may run over more than one beat — the stop, the blow, the surprise, the way running on) — _judge_climax asks where it opens;
  // a six-beat 9 s draft whose last beat opened by [5s] could only sit on a one-second grid, which the grid law below forbids.
  if (d.kind === "ridden" && !CORE_ONLY.on && lines.length >= 2) {
    const lastLine = lines[lines.length - 1], lastAt = Number((lastLine.match(/^\s*\[(\d+(?:\.\d+)?)s\]/) || [])[1] || 0);
    // A BEAT LASTS AS LONG AS ITS WEIGHT (owner 2026-09-11: "the lurch could comprise more space than others, like occurring from 8s till 13s … we seem to always produce equidistance which is too mechanical"):
    // the stamps never sit on a grid, and the climax is the longest span of the take
    if (secs >= 6 && lines.length >= 3) {
      const at = lines.map((l) => Number((l.match(/^\s*\[(\d+(?:\.\d+)?)s\]/) || [])[1] || 0));
      const gaps = at.slice(1).map((v, i) => v - at[i]);
      if (gaps.length >= 4 && gaps.every((g) => g === gaps[0]) && secs - at[at.length - 1] <= gaps[0]) out.push({ rule: "ride", figure: `camera (the beats sit on a grid — every stamp ${gaps[0]}s apart: a beat lasts as long as its weight (a passage a second, a tableau two, the held stop two), the stamps fall where the ride's events fall)`, at: at[1] || 0 });
    }
    const e = makerEndsRide(userWords) ? null : lastLine.match(RIDE_END);
    lines.forEach((line) => { const bs = line.match(BACKSTAGE); if (bs) out.push({ rule: "ride", figure: `camera (the ride's backstage shows: "${bs[0]}" — operators, spare cars, storage and the queue are the ride's own operations, never in the take; the world is what the seat passes)`, at: Number((line.match(/^\s*\[(\d+(?:\.\d+)?)s\]/) || [])[1] || 0) }); }); if (e) out.push({ rule: "ride", figure: `camera (the ride ends itself: "${e[0]}" — the last beat is the climax ridden, never the exit, the unload or a wink)`, at: lastAt });
    for (const x of linesOutrun(text, secs)) out.push({ rule: "ride", figure: x.kind === "last second" ? `camera (a line begins in the take's last second — "${x.label}" at [${x.at}s] of ${secs}s: it cannot be heard out; move it earlier or cut it)` : `camera (a line outruns its beat — "${x.label}" at [${x.at}s]: ${x.words} words need about ${x.need}s in a ${x.window}s window; a spoken line never outruns the beat that carries it — shorten it or move its stamp earlier)`, at: x.at });
    for (const dl of dialogueLines(text)) if (!saysHow(dl.line)) out.push({ rule: "ride", figure: `camera (a line does not say how it is said — "${dl.label}": the speaker label ends in a parenthetical of manner, two or three words — (sing-song, mocking))`, at: Number((dl.line.match(/\[(\d+(?:\.\d+)?)s\]/) || [])[1] || 0) });
  }
  // rule "apparatus" = a WRONG video (fatal after the re-asks); rule "ride" = the ride's own flaw — re-asked once, never refused (owner 2026-09-11: draws refused on a static figure or a flat finale while everything else was right)
  const add = (line, why, rule = "apparatus") => { const m = line.match(/^\s*\[(\d+(?:\.\d+)?)s\]/); out.push({ rule, figure: `camera (${why})`, at: m ? Number(m[1]) : 0 }); };
  lines.forEach((line, i) => {
    const first = i === 0, last = i === lines.length - 1;
    const opener = first || HARD_CUT.test(line) || /^\s*\[\d+(?:\.\d+)?s\]\s*cut\b/i.test(line);
    const mounting = first && MOUNT.test(line);
    // A DRIVEN OR WORN FORM IS READ AGAINST THE PLAIN LAW ONLY (owner 2026-09-14) — but its take is still ONE take from ONE camera, and the
    // form's own block says so ("never a view OF the car from outside"). The laws that belong to no form are read for every kind; the
    // seat's own — the seat cue, the rows, the vehicle leading, the ride sent on, the finale felt — stay the ride's.
    const ridden = d.kind === "ridden";
    const dm = line.match(ridden ? DISMOUNT : OUTSIDE);
    if (dm && !mounting) add(line, `dismounted: "${dm[0]}" — the camera rides; riders appear only as the seat sees them, never looked at from outside`);
    else if (HARD_CUT.test(line) && !mounting) add(line, `"hard cut" — a travelling take never cuts between its places; its own motion carries into the next scene`);
    else if (ridden && opener && !mounting && !seatCue(line, d)) add(line, "no seat cue — the opening names the seat's own objects (the way ahead, the bar or nose, the rows ahead)");
    else if (d.family === "coaster" && statueIn(line)) add(line, `a figure the ride reaches is held still: "${statueIn(line)}" — the ride is the event; whatever the rails pass close is acted upon`, "ride");
    else if ((LEAVES_WAY.test(line) && !RAILS_KEPT.test(line)) || LEAVES_RAILS.test(line)) add(line, `the ${w.vehicle} leaves its ${w.way}: "${(line.match(LEAVES_WAY) || line.match(LEAVES_RAILS))[0]}" — every floor thing lies under the ${w.way}, which continue across it; the ride rides onto nothing but its own ${w.way}`, "ride");
    else if (WAY_END.test(line)) add(line, `the way ends: "${line.match(WAY_END)[0]}" — the ride's way never ends on screen`);
    else if (ridden && last && !rideSentOn(lastSentenceOf(line), d)) add(line, "the payoff does not send the ride on — the last words say where the ride goes: on, through, out of the frame, or swallowed by what the payoff releases");
    else if (d.kind === "ridden" && !vehicleLeads(line, d)) add(line, `the ride vehicle does not lead this beat — the ${w.vehicle || "vehicle"} is what each beat does; figures and things are what it passes`, "ride");
    else if (d.interior && INVERSION.test(line)) add(line, `inverted indoors: "${line.match(INVERSION)[0]}" — a corridor or room hosts straight runs, dips and banks, never a loop`, "ride");
    else if (last && FACEFILL.test(line)) add(line, `payoff stops on a face: "${line.match(FACEFILL)[0]}" — the ride passes through or by at speed`, "ride");
  });
  // NO OPENING FINDING (owner 2026-09-11): the take opens in the seat photograph whether photographs ride or not — repairFrameZero appends the plate's
  // replacements to beat zero as facts, so no check polices the opening (the retired "opens inside the first riding photograph" law produced a slideshow).
  // EVERY RIDING PHOTOGRAPH IS ARRIVED AT (owner 2026-09-11: the maze rode as the third reference and no beat travelled into it — the hedges never appeared)
  for (const p of (d.dressing?.photographed || [])) {
    const qs = (p?.qualities || []).map((q) => [...new Set(_words(q))]).filter((k) => k.length);
    if (!qs.length) continue;
    const arrived = qs.some((keys) => lines.some((line) => keys.filter((k) => new RegExp(`\\b${_re(k)}`, "i").test(line)).length >= Math.min(2, Math.ceil(keys.length / 2))));
    if (!arrived) out.push({ rule: "ride", figure: `camera (a riding photograph is never arrived at: ${p.name} — its qualities (${(p.qualities || []).join(", ")}) appear in no beat; the take arrives in each riding photograph, in order, without a cut)`, at: 0 });
  }
  lines.forEach((line) => { const m = line.match(COSTUMED_ROWS) || line.match(SEATED_FIGURE); if (m) add(line, `the rows ahead are costumed or described: "${m[0]}" — the other riders are the backs of heads, shoulders and raised arms; a figure cast as the riders is carried by the ride's address to the seat, never by dressing the rows (draw 14: two robed riders became the twins)`, "ride"); });
  lines.forEach((line) => { const m = line.match(MENACE); if (m) add(line, `menace toward the seat: "${m[0]}" — a weapon or a strike aimed at the ${w.vehicle || "vehicle"} or the rows is what the provider's gate refuses; the figure's threat lives in its words, its grin and its stance (the axe on the shoulder, the free hand gesturing)`, "ride"); });
  if (d.family === "dark ride" && !CORE_ONLY.on) for (const f of silentFigures(text, d)) out.push({ rule: "ride", figure: `camera (a figure passes silent: "${f.name}" — every figure has its turn as the seat passes it: its own words where the work gave it any (a Dialogue line at this beat), else the sound it would make, written in the beat)`, at: f.at });
  if (d.family === "dark ride") for (const f of stillFigures(text, d)) out.push({ rule: "ride", figure: `camera (a figure of the world is passed without performing: "${f.name}" — on a dark ride every figure is an animatronic: one motion timed to the pass, and the ride's voices as it is passed)`, at: f.at });
  // THE FORM'S NAME IS THE PHOTOGRAPH'S (measured 2026-09-11, A/B on one sidecar: "into a dark ride's interior … the next scene of a dark ride" leaked the seat
  // plate's rock into frame zero; the same ending by construction, the class unnamed, did not). The noun may describe the vehicle; it never names a place.
  { const rx = formNameAsPlace(d); if (rx) lines.forEach((line) => { const m = line.match(rx); if (m) add(line, `the form's name is used for a place the take produces: "${m[0]}" — the words "${d.noun}" name the photograph and call it back; write the stretch by its construction (the black-painted walls of the ride's own building, a track-lit passage, a tableau under a spot)`, "ride"); }); }
  if (d.world?.mode === "theme") {
    // A REPLACEMENT IS A STANDING FACT, NEVER A CHANGE ON SCREEN (dry-cave-local-1: "the stalagmite formations become hedge walls" at 0s and a [1s] beat of its own
    // where two more "became" — a morph the vehicle did not lead). The ride's own flaw: re-asked once, never a refusal.
    if ((d.dressing?.placements || []).length) lines.forEach((line) => { const m = line.match(TRANSFORM); if (m) add(line, `a replacement is written as a change on screen: "${m[0]}" — frame zero's replacements are standing facts (the world's thing where the set piece stood), already in place, never becoming`, "ride"); });
    // (the "interior scene is not built" check — two stage words per scene beat — was DROPPED 2026-09-13 with the template; what surrounds the rails is the riding photograph's to show, and only the booth is a flaw)
    lines.forEach((line, i) => { if (i === 0) return; const b = line.match(BOOTH); if (b) add(line, `a booth, not a scene: "${b[0]}" — a platform beside the ${w.way} or a flat or screen with figures before it renders flat; the ${w.vehicle} passes THROUGH what surrounds the ${w.way}, as the photographs that ride show it`, "ride"); });
    // the work's TITLE is the one lexical check left (one string, never a list); the world's places are the place judge's (_judge_places, run by _run)
    out.push(...worldNameFindings(text, [...(Array.isArray(workTitles) ? workTitles : []), d.world?.title].filter(Boolean)));
    // A REPLACED SET PIECE IS NAMED ONCE, IN ITS REPLACEMENT, AND NEVER AGAIN AS PRESENT (owner 2026-09-09: "if the mushroom is replaced … its still named"):
    // frame zero may name it (as what it becomes); a later beat that writes it as still there is the other ride kept (job 9127e915: "beside the giant illuminated mushroom" at 0s was a PLACEMENT, allowed now; the same words at 4s are not)
    for (const p of replacedSetPieces(d)) {
      const keys = pieceKeys(p); if (keys.length < 2) continue;   // a surface has no presence to police
      lines.forEach((line, i) => {
        if (i === 0) return;
        const hit = keys.filter((k) => new RegExp(`\\b${_re(k)}`, "i").test(line)).length;
        // a set piece of ONE or TWO distinctive words returns only as the WHOLE phrase (draw 24, 2026-09-13: "the curved tunnel ceiling" read back as present in "the darkness of the tunnel" on the word tunnel alone, a false FATAL that refused the run)
        const need = keys.length <= 2 ? keys.length : Math.ceil(keys.length / 2);
        if (hit >= need && !REPLACEMENT_VERB.test(line)) out.push({ rule: "plate-thing", figure: `"${p}" is written as still present after frame zero — it was replaced at frame zero by the world's thing; the other ride's set piece is gone`, at: Number((line.match(/^\s*\[(\d+(?:\.\d+)?)s\]/) || [])[1] || 0) });
      });
    }
  }
  return out;
}

/** The names a theme bans: each room's name, its common tail without the work's proper nouns ("Overlook Hotel lobby" → "hotel lobby";
 *  job 57f0eb5d wrote "into the ride's hotel lobby scene"), and the work's titles. Pure. */
export function roomBanList(d, workTitles = []) {
  const rooms = Array.isArray(d?.world?.rooms) ? d.world.rooms : [];
  const tails = rooms.map((r) => { const ws = String(r || "").split(/\s+/); for (let i = 1; i <= ws.length - 2; i++) { if (!/^[A-Z]/.test(ws[i - 1])) break; return ws.slice(i).join(" ").toLowerCase(); } return ""; }).filter((t) => t && t.split(" ").length >= 2);
  return [...new Set([...rooms, ...tails, ...(Array.isArray(workTitles) ? workTitles : []), d?.world?.title].filter(Boolean))];
}
/** FRAME ZERO'S PLACEMENTS ARE FACTS OF BEAT ZERO (owner 2026-09-08: "the hedge should get attached … its how its prompted into the
 *  plate used"). A placement the writer left out of beat zero is APPENDED to it as a fact — nothing rewritten. Theme mode only. */
export function repairFrameZero(text, d) {
  const t = String(text || "");
  if (!d || d.world?.mode !== "theme") return { text: t, added: [] };
  const lines = t.split("\n");
  const i = lines.findIndex((l) => /^\s*\[\d+(?:\.\d+)?s\]/.test(l));
  if (i < 0) return { text: t, added: [] };
  const facts = (d.dressing?.placements || []).map((l) => String(l).replace(/^[^:]{0,80}\(frame zero[^)]*\):\s*/i, "").replace(/^the seat photograph[^:]*:\s*/i, "").trim()).filter(Boolean);
  const added = [];
  for (const f of facts) {
    const m = f.match(/^(.*?)\s+becomes\s+(.+)$/i) || f.match(/^(.+?)\s+at\s+(.+)$/i);
    // A REPLACEMENT NAMES THE SET PIECE IT TOOK THE PLACE OF (owner 2026-09-10: "if the mushroom is replaced … its still named"; dry-shining-3 wrote the
    // hedge walls and never the mushroom they stood in for): both sides of "X becomes Y" must be in beat zero, else the fact is appended.
    const sides = m ? (/ becomes /i.test(f) ? [m[1], m[2]] : [m[1]]) : [f];
    const inZero = (s) => { const keys = _words(s); if (!keys.length) return true; const hit = keys.filter((k) => new RegExp(`\\b${_re(k)}`, "i").test(lines[i])).length; return hit * 2 >= keys.length; };
    if (sides.every(inZero)) continue;   // the set piece and what it became are both there
    const fact = replacementFact(f, rideWords(d).way);   // the golden grammar: "<the world's thing> where <the set piece> stood"
    lines[i] = lines[i].replace(/\.?\s*$/, `; ${fact}.`);
    added.push(fact);
  }
  // A KEPT SET PIECE IS NAMED AS ITSELF (owner 2026-09-09: "if not [replaced] its still named. frame0 is always grounded"): a set piece of the
  // photograph that nothing of the world takes over, and that beat zero left out, is appended in its place — the photograph's contents, stated.
  const replaced = new Set(replacedSetPieces(d));
  for (const p of (d.dressing?.plateThings || []).filter(Boolean)) {
    if (replaced.has(p)) continue;
    const keys = _words(p); if (!keys.length) continue;
    const hit = keys.filter((k) => new RegExp(`\\b${_re(k)}`, "i").test(lines[i])).length;
    if (hit * 2 >= keys.length) continue;
    const fact = `the ${p.replace(/^(?:the|a|an)\s+/i, "")}, as photographed`;
    lines[i] = lines[i].replace(/\.?\s*$/, `; ${fact}.`);
    added.push(fact);
  }
  // THE WAY IS KEPT (owner 2026-09-11, draw 5: a runner carpet where the floor beside the rails was, and no rails for three seconds): a floor's replacement
  // at frame zero carries the way across it — when the [0s] line replaces a floor and never says so, the fact is appended.
  { const way = rideWords(d).way; const vehicle = rideWords(d).vehicle || "vehicle";
    const floorReplaced = facts.some((f) => { const m = f.match(/^(.*?)\s+becomes\s+/i); return m && FLOOR_PIECE.test(m[1]); });
    if (way && floorReplaced && !wayAcrossFloor(lines[i], way)) {
      const fact = `the ${way} ${/s$/.test(way) ? "run" : "runs"} on ahead across that floor under the ${vehicle}, kept as in the photograph`;
      lines[i] = lines[i].replace(/\.?\s*$/, `; ${fact}.`); added.push(fact);
    } }
  return { text: lines.join("\n"), added };
}
