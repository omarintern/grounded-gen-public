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
export function rideBlock(d = rideFromEnv()) {
  if (!d) return "";
  const w = rideWords(d), r = d.seat?.reading || {}, mode = d.world?.mode || "setting";
  const vehicleShown = r.vehicle_in_foreground === true;
  const env = r.environment && r.environment !== "other" ? r.environment : "";
  const dark = d.family === "dark ride", coaster = d.family === "coaster";
  const secs = Number(process.env.BEAT_DURATION || 0);   // the take's length, when the run has told it (the climax's third is counted from it)
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
    `Compose EVERY beat from inside it — what the rider sees, never a view OF the ride from outside; the seat is never introduced, explained or looked at; the camera's own rider is never seen (no hands, clothing, legs or body); other riders appear only as the seat sees them — the backs of heads, shoulders and raised arms in the rows ahead — never a rider or vehicle looked at from outside. ` +
    `Motion is the ride's own (the climb, the drop, the turn, the glide) and never a camera instruction; a ${d.kind === "ridden" ? "ride on its own way never steers, swerves or aims a wheel" : "driver's or wearer's motion is the ride's own"}. ` +
    `The opening names the seat's own objects — the ${w.way}, ${vehicleShown ? `the ${w.vehicle}` : "the bar or nose"}, the rows ahead — so frame zero is the photograph. `;
  if (mode === "theme") {
    const photographed = (d.dressing?.photographed || []).filter((p) => p && p.name);
    // THE TAKE NEVER OPENS INSIDE A RIDING PHOTOGRAPH (owner 2026-09-11, measured on the same plate and words: frame zero naming the plate's set pieces
    // as what they became = the plate grounds the take (its way, its vehicle, its scale) and the photographs dress it, one continuous track (draw 5 render 1,
    // golden); frame zero naming only a photograph = that photograph with a lap bar, a hard cut at every next photograph, the plate arriving last, whole and
    // unreplaced (dry-cave-3 render). What frame zero names is the ground of the take; a replacement only takes at frame zero.)
    s += `THE WORLD IS BUILT INTO THE RIDE: the seat photograph IS the ride — its ${w.vehicle} and its ${w.way} are the frame's constant from frame zero to the end; its scenery is the world's from frame zero. ` +
      (photographed.length
        ? `PHOTOGRAPHS OF THE WORLD RIDE WITH THIS FRAME, in story order — ${photographed.map((p) => `${p.name}${(p.qualities || []).length ? ` (${p.qualities.join(", ")})` : ""}`).join("; ")}: references for the world's things, never scenes the take opens in — the take opens in the seat photograph with every set piece named as what it becomes (the replacements are these photographs' own things), then ARRIVES at what each photograph carries without a cut, the ${w.way} running on through it and the ${w.vehicle} never leaving the ${w.way}; each is written as its qualities — its floor, its walls, its fixtures, its figures — never by name; the photograph carries the rest. `
        : `No photograph of the world rides with it: the world arrives as THINGS on the ride's own surfaces. `) +
      `FRAME ZERO NAMES EVERY SET PIECE OF THIS PHOTOGRAPH${plateThings.length ? ` — ${plateThings.join(", ")} —` : ""} (owner: frame zero is always grounded): each either as WHAT IT BECOMES — a replacement names the set piece it takes the place of ("<the world's thing> where the <set piece> stood") — or as ITSELF, in its place, when nothing of the world takes its place; a set piece that is replaced is named once, in its replacement, and never again as present; the ${w.vehicle}, the ${w.way} and any NEUTRAL surface of the show building (plain dark walls, a bare floor, darkness) remain as photographed; a THEMED surface — rock, painted scenery, a themed floor, coloured light — is a set piece like any other and becomes the world's own wall, ceiling, floor or light. ` +
      // THE WAY IS KEPT (owner 2026-09-11, draw 5: "the first carpet has no rails, its just carpet which we managed to prevent till now" — a runner carpet
      // where the floor beside the rails was took the rails' place for three seconds): the [0s] line opens with the way itself, and a floor's replacement is
      // written with the way running on across it.
      `THE ${w.way.toUpperCase()} ${plural ? "ARE" : "IS"} KEPT AND NAMED FIRST: the [0s] line opens with the ${w.way} running on ahead under the ${w.vehicle}, as in the photograph — never replaced, never covered; a floor's replacement lies under and around the ${w.way}, written "with the ${w.way} running on across it". ` +
      (placements.length ? `FRAME ZERO'S REPLACEMENTS, already in place at [0s], stated as standing facts of the scene in this grammar — the world's thing where the set piece stood — never as a change (nothing becomes, turns into or is replaced on screen): ${placements.map((f) => replacementFact(f, w.way)).join(" | ")}. ` : "") +
      `THE RIDE'S OWN INTERIOR IS THE BODY OF THE TAKE (owner 2026-09-11): within the first third of the take the ${w.way} reaches a PORTAL of the world — a door, an archway, a mouth — what the world releases there spills ACROSS THE FLOOR around the ${w.way} (never only over the lens), and the portal opens onto the ride's own building, written by its CONSTRUCTION — the black-painted walls and ceiling of the ride's own building, the ${w.way} running on, a theatrical spot on the track — and by the seat photograph's own darkness and track lighting with its scenery gone: none of its set pieces, none of its light, never the words "${d.noun}" for a place. ` +
      `EVERY SCENE INSIDE IS STAGED, IN THE BEAT THAT PASSES IT (the staging grammar is law): a lit tableau on a low platform beside the ${w.way}; its figure or thing under a spot; a painted flat of its own place behind it; the black-painted walls and ceiling all around and above; and ONE device of the craft chosen for this world — fog lit from beneath, a projection hanging in the air, a mirror room, a barrel tunnel turning around the fixed ${w.way}, a forced-perspective flat, a moving flat, a strobe, an air blast. A beat inside that names none of these is a passage, not a scene. ` +
      `INSIDE, THE WORLD IS STAGED AS TABLEAUX${later.length ? `: these things, in this order, each staged as above — ${later.map((x) => FLOOR_THING.test(x) ? `${x} (a floor thing: its pattern lies under and around the ${w.way}, with the ${w.way} continuing across it)` : x).join(" → ")}` : ""}${figures.length ? `; THE WORLD'S FIGURES ARE HELD FOR THE INTERIOR — ${figures.join(", ")} — never spent before the portal: each is passed inside as an animatronic in a staged scene, performing as the seat passes, its line at its beat` : ""}. ` +
      (finale ? `THE FINALE'S TABLEAU IS NEW: ${finale} is held back for the last scene — the ride's largest device acts on the ${w.vehicle} there and the riders react. ` : `THE FINALE'S TABLEAU IS NEW: the last scene stages a thing of the world not yet passed, the ride's largest device acting on the ${w.vehicle} and the riders reacting. `) +
      `WHERE THINGS SIT: beside the ${w.way} — on the scene's walls, on raised platforms or banks next to it — or AHEAD, as a tableau the ${w.vehicle} approaches and veers away from before reaching it; a figure of the world stands where a thing would, described by clothing and posture. The ${w.way}, the floor or bed the ride travels on, and the ${w.vehicle} are never dressed. ` +
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
  if (dark) s += `THE CAMERA IS THE RIDER'S OWN, HANDHELD — a dark ride alone lifts the no-camera rule (owner 2026-09-09: a rider on a slow dark ride films with a phone and PEERS AROUND — "less a sway than a peer around with the camera"): the rider turns the camera to LOOK at what the ride passes — to a tableau on the left, up at a figure on a platform, across to the far wall, back to the ${w.way} ahead — written as the rider's own unhurried look ("the camera turns to the left toward …", "the view drifts up to …", "the camera comes back to the ${w.way} ahead") — continuous and small, never a cut, a zoom, a push-in, a crane, a dolly or a reframe, and the seat's own objects (the ${w.way} ahead, the bar or nose) return to the frame within the beat. The ride's motion remains the frame's motion; a coaster and every other ride keep the camera fixed as their form does. `;
  if (d.kind === "ridden") s += `THE RIDE VEHICLE LEADS EVERY BEAT (owner 2026-09-09, the mushroom take's grammar): the ${w.vehicle || "vehicle"} is what each beat's sentence does — it glides, turns toward, rolls on, passes, slows before, halts before, holds, lurches back, looks to; the figures and the things are what it passes, never the subject of a beat on their own. ` +
    `THE RIDE'S OWN REGISTER — DECIDE, THEN WRITE (the decision is never written out): the ${w.vehicle}'s own motion grammar (an omnimover turns its seat to face each tableau; a boat drifts, bumps and drops; a coaster climbs, drops and banks; a trackless car pivots and reverses; a dark-ride car glides, slows before a tableau and jerks on); the trajectory through the scenes; and the ride's SOUND — the mechanism's hum and clatter, the ride's own music from its speakers, a narrator or announcer heard over the speakers, speaking animatronics — and which of these THIS take carries. Let the motion shape the beats and end with the Sound line naming the ride's own sound. ` +
    `THE RIDE'S OWN VOICES: a ride narrator or announcer heard from the speakers, and a speaking animatronic in a tableau, are the form's own — they need no listener in frame and never address the camera as an audience; write them as Dialogue lines with a named speaker — the label "Ride narrator" for the ride's own voice (never the bare word "Narrator", which names nobody) and an animatronic by the figure it is — words the ride itself would play. A FIGURE THAT IS PASSED SPEAKS ITS OWN LINE (owner 2026-09-11: "narration is only where necessary"), timed to the beat it is passed in — its [Ns] is that beat's stamp, written in the Dialogue block as <speaker> [Ns]: "…" and never as a beat line; the Ride narrator speaks only when no figure of the scene can carry the words. EVERY LINE SAYS HOW IT IS SAID (owner 2026-09-11): the speaker label ends in a short parenthetical of manner — the caretaker in the red plaid jacket (sing-song, mocking, through a grin) [2s]: "…" — two or three words of delivery, the figure's character compiled to voice; never a stage direction of the body, never a mood word in the beats. `;
  s += `THE RIDE NEVER CUTS: no "hard cut", no new camera setup — the ${w.way} carries the ${w.vehicle} into each next scene inside the same take. ` +
    `THE FORM'S NAME IS THE PHOTOGRAPH'S: the words "${d.noun}" name THIS ride — the photograph's own ${w.vehicle} and ${w.way} — and may describe the ${w.vehicle} ("the ${d.noun} ${w.vehicle}"); they never name a scene, a passage or a destination the take produces anew ("into the ${d.noun}", "a ${d.noun}'s interior"), which are written by their construction — the black-painted walls of the ride's own building, a track-lit passage, a tableau on a low platform under a spot — or the photograph returns whole. ` +
    `THE MOUNT (the opening only): the ride MAY open outside the ${w.vehicle} as it comes down the ${w.way} toward the camera and takes it up; from that moment every beat rides, and there is never a dismount after it. ` +
    (coaster ? `WHATEVER THE RAILS REACH IS MET AT SPEED: a figure the ride passes close is ACTED UPON by the passage — steps back, is blown, swings, turns with it — never a statue; a figure may stand only far off, unreached. ` : dark ? `EVERY FIGURE OF THE WORLD ON THIS RIDE IS AN ANIMATRONIC, AND IT PERFORMS AS THE SEAT PASSES: one motion each, timed to the pass — a head turns to follow the rider, an arm beckons or swings, a body lurches forward, rises or drops, eyes light — and the ride's own voices sound as it is passed (a Ride narrator line or the figure's own line, as Dialogue). A figure never merely stands, waits or is held still; a maker's word such as "frozen" describes how the figure LOOKS (frost, ice, snow on it), never its stillness. NO FIGURE CARRIES AN AGE OR CHILD WORD (not young, little, small, girl, boy, child, kid or teen — in the beats and in a speaker label alike): a pair of children in the work is "the twins" or "two identical figures in matching dresses", a child is "a small figure" by build and clothing. ` : "") +
    // THE RIDE IS PROGRAMMED (owner 2026-09-11, on draw 5: "rides can often stop, look at something which performs, then an unpredictable move occurs, or a turn
    // not expected. whereas these gens are linear forward, not stopping — an element of ride ingenuity"): the old law said the ride NEVER stops, and every
    // draft glided forward from first beat to last. A dark ride halts at a scene, holds while the figure performs, then moves in a way the rider did not expect;
    // only the LAST image must still be moving.
    (dark ? `THE RIDE IS PROGRAMMED — IT STOPS, WATCHES, THEN SURPRISES: at least one scene inside is met at a FULL STOP — the ${w.vehicle} halts before the tableau and holds while the figure performs its one motion — and then moves in a way the rider did not expect (lurches backward, spins to face the other way, swings hard into a turn, drops, rocks back, shoots forward), the surprise timed to the performance; the motion changes from beat to beat — never the same forward glide three beats running; the stop is never the last beat. ` : "") +
    `THE LAST IMAGE IS STILL MOVING AND THE ${w.way.toUpperCase()} NEVER ${ends} ON SCREEN: in the final image the ride is moving — the last words of the last beat say where it goes (the ${w.way} on through the doors, around the bend, out of the frame, or the ${w.vehicle} diving through what the payoff releases and swallowed by it). ` +
    `THE ${w.vehicle.toUpperCase()} NEVER LEAVES THE ${w.way.toUpperCase()}: a floor thing of the world — a carpet, tiles, boards, a rug — lies under and around the ${w.way}, with the ${w.way} continuing across it; the ${w.vehicle} never glides, rolls or drives onto anything but its own ${w.way}. ` +
    (d.interior ? `THE MOTION IS WHAT THIS PLACE CAN HOST: straight runs, dips, banks at corners, a doorway taken at speed; never a loop, inversion or corkscrew indoors. ` : "") +
    `THE FINALE IS SPECTACLE THAT ACTS ON THE RIDE (owner 2026-09-11): the last scene is an EVENT the world releases — a flood, a burst, a collapse, a lunge, a swing — and the seat FEELS it: the ${w.vehicle} sways, jolts, dips, bucks, is splashed or sprayed as it passes through; and THE RIDERS REACT, never seen but always heard and felt — gasps, screams or laughter from the rows ahead, arms thrown up in the rows ahead, the rider's own breath. ` +
    // THE CLIMAX IS RIDDEN, NOT TAPPED (owner 2026-09-11, on draw 6's render: "the ending is abrupt and doesn't let the climax sit … you want to experience the
    // climax instead of end on an ironic note"): the last beat opened at [8s] of 9 — five events in one second, then the exit doors. The climax gets the last third.
    (d.ending === "quick"
      ? `THE PAYOFF IS A BUTTON (the plan's decision, from the maker's words): the build takes the time and the payoff lands late and clean — one event in the last second or two, the ${w.vehicle} still moving as it lands; quick shortens the landing, never the event. `
      : `THE CLIMAX IS RIDDEN, NOT TAPPED (the plan's decision: held): the last beat opens ${secs >= 6 ? `by [${secs - 3}s]` : "with the last third of the take"} and the seat rides THROUGH the spectacle to the last frame — it unfolds across those seconds (the burst, then its heat and light on the rows ahead, then the ${w.way} running on through it), the ${w.vehicle} still inside it at the final image — the climax is experienced, not glanced at. `) +
    `${makerEndsRide(process.env.RAW_USER_PROMPT) ? `The ride ends because the maker's words end it — ridden to the last frame, the ending itself the payoff` : `The ride never ends itself — no exit doors, no unload, no station`}; THE STAMPS FALL WHERE THE RIDE'S EVENTS FALL, never on a grid — a passage a second, a tableau two, the held stop two. ` +
    `THE PAYOFF NEVER ENDS ON A FACE: nothing fills the lens for long, and every figure keeps the scene's scale to the last frame.\n`;
  return s;
}

// ── THE FINDINGS ──────────────────────────────────────────────────────────────────────────────────────────
// APPARATUS LAW (owner 2026-09-05/06): in a ridden or worn form the camera IS the rider. A beat that looks AT the rider or the vehicle
// from outside, or that carries no seat cue at its opening, has dismounted. Riders ARE seen in a POV when the camera sits mid-train or
// at the back (the backs of heads, shoulders, arms up in the rows ahead); what dismounts is a rider or vehicle looked at from OUTSIDE
// (a kid on a tricycle watched from a doorway) or a rider doing a driver's work (pumping, pedalling, steering — impossible on rails).
const DISMOUNT_PARTS = [
  String.raw`\b(?:(?:a|the|one|another|some)\s+(?:[\w-]+\s+)?(?:rider|riders|cyclist|driver|passenger|boy|girl|kid|child|man|woman|figure)\s+(?:on|astride|aboard)\s+(?:a|the|his|her|their|its)\s+(?:trike|tricycle|bike|bicycle|kart|sled|board|skateboard|scooter|wagon|big wheel))\b`,
  String.raw`\b(?:trike|tricycle|bike|bicycle|kart|sled|scooter)-borne\b`,
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
const FLOOR_ONTO = /\b((?:cars?|carts?|vehicles?|omnimover|boats?|trains?|coaster|ride|pods?|gondolas?|carriages?|trams?|karts?)\s+(?:\w+\s+){0,2}?)(glides?|gliding|rolls?|rolling|drives?|driving|moves?|moving|travels?|travelling|traveling|slides?|sliding|coasts?|eases?|rides?|runs?|passes?)\s+(?:up |down |out |off |on |forward |straight )?onto\s+((?:a|an|the|its|this|that)\s+(?:[\w-]+\s+){0,4}?(?:carpets?|rugs?|tiles?|tiled floor|floorboards?|boards?|parquet|linoleum|paving|cobbles?|cobblestones?|grass|gravel|earth|dirt|sand|snow|ice))\b/i;
/** THE WAY REPAIR (owner 2026-09-11, mechanical like repairFrameZero): "<vehicle> rolls onto the carpet" becomes "<vehicle> rolls on over the carpet lying
 *  under the <way>" — the writer's sentence kept, the rails kept, no re-ask spent. A beat that already keeps the rails is left alone. Pure. */
export function repairWay(text, d) {
  const w = d ? rideWords(d) : { way: "rails" };
  const way = w.way || "rails";
  const lines = String(text || "").split("\n"); const fixed = [];
  const out = lines.map((line) => {
    if (!/^\s*\[\d+(?:\.\d+)?s\]/.test(line) || RAILS_KEPT.test(line)) return line;
    const m = line.match(FLOOR_ONTO); if (!m) return line;
    const repaired = line.replace(FLOOR_ONTO, (all, subj, verb, obj) => `${subj}${/^(?:glides?|gliding)$/i.test(verb) ? verb : /^rolls?$|^rolling$/i.test(verb) ? verb : verb} on over ${obj} lying under the ${way}`);
    if (repaired !== line) fixed.push(m[0].trim());
    return repaired;
  });
  return { text: out.join("\n"), fixed };
}
const LEAVES_RAILS = /\b(?:leaves?|leaving|left|jumps? off|comes? off|off) the (?:rails?|track|tracks)\b|\b(?:cars?|carts?|vehicles?|omnimover|boats?|trains?|coaster|ride|pods?|gondolas?|carriages?|trams?|karts?)\s+(?:\w+\s+){0,2}?(?:drifts?|drifting|settles?|settling|sinks?|sinking|lowers?|lowering|drops?|dropping|descends?|descending|comes?|coming|eases?|easing|dips?|dipping)\s+(?:back\s+)?down\s+(?:on)?to\s+(?:a|an|the|its)\s+(?:\w+\s+){0,3}?(?:floor|ground|carpet|rug|tiles|boards|earth|pavement)\b/i;   // "the omnimover drifts down to the patterned floor" (dry-shining-5) leaves the rails as surely as rolling onto it
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
const VEHICLE_NOUNS = ["car", "cars", "cart", "carts", "vehicle", "omnimover", "boat", "boats", "train", "coaster", "pod", "pods", "gondola", "tram", "kart", "carriage", "sled", "ride", "trolley", "buggy", "rover", "capsule", "seat"];
const VEHICLE_MOTION = /\b(?:glid(?:e|es|ing)|turn(?:s|ing)?|roll(?:s|ing)?|pass(?:es|ing)?|slow(?:s|ing)?|look(?:s|ing)?|swing(?:s|ing)?|climb(?:s|ing)?|drop(?:s|ping)?|bank(?:s|ing)?|pivot(?:s|ing)?|jerk(?:s|ing)?|drift(?:s|ing)?|bump(?:s|ing)?|creep(?:s|ing)?|eas(?:e|es|ing)|swivel(?:s|ling)?|round(?:s|ing)?|travel(?:s|ling|ing)?|mov(?:e|es|ing)|dip(?:s|ping)?|lurch(?:es|ing)?|rumbl(?:e|es|ing)|rattl(?:e|es|ing)|coast(?:s|ing)?|carr(?:y|ies|ying)|com(?:e|es|ing)|approach(?:es|ing)?|enter(?:s|ing)?|near(?:s|ing)?|veer(?:s|ing)?|curv(?:e|es|ing)|sweep(?:s|ing)?|plung(?:e|es|ing)|div(?:e|es|ing)|rush(?:es|ing)?|rac(?:e|es|ing)|hurtl(?:e|es|ing)|descend(?:s|ing)?|rise(?:s)?|rising|run(?:s|ning)?|advanc(?:e|es|ing)|push(?:es|ing)? (?:on|forward|through)|press(?:es|ing)? (?:on|forward)|nose(?:s|ing)? (?:into|through|toward)|edg(?:e|es|ing) (?:forward|past|into)|sail(?:s|ing)?|float(?:s|ing)?|whip(?:s|ping)?|swoop(?:s|ing)?|jolt(?:s|ing)?|sway(?:s|ing)?|buck(?:s|ing)?|shudder(?:s|ing)?|judder(?:s|ing)?|rock(?:s|ing)?|bounc(?:e|es|ing)|shak(?:e|es|ing)|tilt(?:s|ing)?|tip(?:s|ping)?|lunge(?:s)?|lunging|accelerat(?:e|es|ing)|speed(?:s|ing)?|surg(?:e|es|ing)|shoot(?:s|ing)?|burst(?:s|ing)?|crash(?:es|ing)?|tear(?:s|ing)?|barrel(?:s|ing)?|charg(?:e|es|ing)|blast(?:s|ing)?|plow(?:s|ing)?|plough(?:s|ing)?|splash(?:es|ing)?|skim(?:s|ming)?|thread(?:s|ing)?|squeez(?:e|es|ing)|wind(?:s|ing)?|snak(?:e|es|ing)|weav(?:e|es|ing)|brush(?:es|ing)? past|scrap(?:e|es|ing) (?:past|along)|crawl(?:s|ing)?|inch(?:es|ing)?|trundl(?:e|es|ing)|chug(?:s|ging)?|spin(?:s|ning)?|rotat(?:e|es|ing)|revers(?:e|es|ing)|brak(?:e|es|ing)|stall(?:s|ing)?|halt(?:s|ing)?|stop(?:s|ping)?|hold(?:s|ing)?|paus(?:e|es|ing)|wait(?:s|ing)?|sit(?:s|ting)? still|stand(?:s|ing)? still|idl(?:e|es|ing)|swerv(?:e|es|ing)|slid(?:e|es|ing)|skid(?:s|ding)?|glanc(?:e|es|ing) off|(?:is|are|gets?|being) (?:splashed|sprayed|soaked|drenched|showered|swallowed|engulfed|thrown|shoved|rocked|jolted|buffeted|swept|carried|pulled|dragged|lifted|dropped|tipped|spun|whipped|battered|struck|hit))\b/i;   // the finale's own verbs — jolt, sway, buck, is splashed — lead a beat (dry-cave-local-2: 'accelerates' and 'jolts' were flagged)
const WAY_NOUNS = ["rails", "rail", "track", "tracks", "way", "channel", "flume", "path"];
// THE RIDE IS PROGRAMMED (owner 2026-09-11): the vehicle's full stop, and the move the rider did not expect after it
const STOPS = new RegExp(`\\b(?:${VEHICLE_NOUNS.join("|")})\\b[^.;,]{0,40}?\\b(?:halts?|halting|halted|stops?(?: dead| short)?|stopping|stopped|comes? to a (?:stop|halt|standstill)|to a (?:stop|halt|standstill)|holds? (?:still|there|motionless|for a (?:moment|beat))|holding still|pauses?|pausing|paused|stands? still|sits? still|at a standstill)\\b`, "i");
const SURPRISES = /\b(?:lurch(?:es|ing|ed)? (?:backward|backwards|back|sideways|forward)|(?:rolls?|glides?|slides?|jerks?|shoots?|is (?:pulled|dragged|yanked)) (?:backward|backwards|back)|revers(?:es|ing|ed)|in reverse|backwards?|spins?|spinning|spun|whips? (?:round|around|about)|wheels? (?:round|around)|swings? (?:hard|sharply|round|around|away|suddenly)|swung (?:hard|round|around)|turns? (?:sharply|hard|suddenly|away|abruptly)|veers?|banks? hard|drops?(?: away| suddenly)?|dropping|plunges?|plunging|falls? away|tilts? back|rocks? back|pitches?|shoots? forward|lunges? forward|jolts? (?:forward|sideways)|(?:sudden|unexpected|abrupt) (?:turn|drop|lurch|spin|jolt|dip))\b/i;
export const rideStops = (line) => STOPS.test(String(line || ""));
// THE CLIMAX IS RIDDEN (owner 2026-09-11): the ride never ends itself in the last beat; every spoken line carries its manner
const RIDE_END = /\b(?:exit doors?|the exit|exit gates?|unload(?:ing)?(?: area| station)?|the station|(?:end|close) of the ride|ride ends|gift shop|(?:back |out )?into (?:the )?daylight)\b/i;
export const rideEndsItself = (line) => RIDE_END.test(String(line || ""));
// …unless the MAKER ends it (owner 2026-09-11: "the ride can end if user prompts for it, it all depends"): the maker's own words asking for the exit, the unload, the station or the end stand the ban down
const MAKER_ENDS = /\b(?:ends?|ending|exits?|exiting|unloads?|unloading|the station|gets? off|getting off|steps? off|the end of the ride|last stop|pulls? in(?:to)?)\b/i;
export const makerEndsRide = (words) => MAKER_ENDS.test(String(words || ""));
const MANNER_TAG = /\([^)\n]{2,60}\)\s*\[\d+(?:\.\d+)?s\]\s*:/;
/** The Dialogue block's spoken lines: [{ label, line }] — the text after the Dialogue header, each "<label> [Ns]: …" line. */
export function dialogueLines(text) {
  const parts = String(text || "").split(/^\s*Dialogue\s*:/im); if (parts.length < 2) return [];
  return parts.slice(1).join("\n").split("\n").map((l) => { const m = l.match(/^\s*(.+?)\s*\[\d+(?:\.\d+)?s\]\s*:\s*\S/); return m ? { label: m[1].trim(), line: l } : null; }).filter(Boolean);
}
export const saysHow = (line) => MANNER_TAG.test(String(line || ""));
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
// THE STAGING GRAMMAR (owner 2026-09-11: "make the staging grammar a law per interior scene"): a scene inside the ride's own building names at least two of these
const STAGING = [/\bplatform\b/i, /\bspot(?:light|lit)?s?\b/i, /\b(?:painted )?flats?\b/i, /\bblack(?:-painted)? (?:walls?|ceiling|void)\b|\bdarkness all around\b|\bblack darkness\b/i, /\bfog\b/i, /\bprojection\b|\bprojected\b/i, /\bmirrors?\b/i, /\b(?:barrel|spinning|rotating) tunnel\b/i, /\bforced-perspective\b/i, /\bmoving flat\b/i, /\bstrobe\b/i, /\bair blast\b/i, /\blamps? along\b/i];
const PORTAL = /\b(?:doors?|archway|arch|gate|mouth|curtain|portal)\b[^.;]{0,80}\b(?:opens?|swing|swings|slides?|parts?|crack)\b|\b(?:into|through) (?:the|a|its own) (?:black|dark|darkness)\b/i;
export const stagingHits = (line) => STAGING.filter((rx) => rx.test(String(line || ""))).length;
const LIGHT_WORDS = /^(?:blacklight|blacklit|ultraviolet|uv|neon|fluorescent|strobe|strobing|lasers?|spotlights?|floodlights?|incandescent|halogen|candlelight|candlelit|firelight|moonlight|glow|glowing)$/i;   // the plate's LIGHT by its own words — never a colour
const LIGHT_FAMILY = [["blacklight", "blacklit", "ultraviolet", "uv", "fluorescent"], ["strobe", "strobing"], ["candlelight", "candlelit"], ["glow", "glowing"]];   // a synonym of the plate's light IS the plate's light
const lightFamily = (k) => LIGHT_FAMILY.find((f) => f.includes(String(k).toLowerCase())) || [String(k).toLowerCase()];
const TRANSFORM = /\b(?:becomes?|becoming|turns? into|turning into|transforms?(?: into)?|transforming|morphs?(?: into)?|morphing|(?:is|are|be|being) replaced (?:by|with)|changes? into|changing into|dissolves? into|melts? into|gives? way to)\b/i;
const REPLACEMENT_VERB = /\b(?:becomes?|became|is now|are now|in place of|in the place of|where [^.;,]{0,60} (?:stood|stands|was|were)|stands? where|replaced by|taken over by|gives? way to|instead of)\b/i;
// THE FINALE IS FELT BY THE SEAT (owner 2026-09-11): the vehicle reacts, or the riders do — else the spectacle passed nobody
const SEAT_FEELS = /\b(?:swallow(?:s|ed|ing)? (?:the|it|them)|engulf(?:s|ed|ing)? (?:the|it|them)|plung(?:e|es|ed|ing) (?:through|into) the|through the (?:deluge|flood|surge|spray|torrent)|sways?|swaying|swayed|jolts?|jolting|jolted|lurch(?:es|ing|ed)?|dips?|dipping|bucks?|bucking|rocks?|rocking|rocked|shudders?|shuddering|shakes?|shaking|shook|tilts?|tilting|swerves?|swerving|is (?:splashed|sprayed|drenched|showered|thrown|shoved|jostled|rocked|shaken)|splash(?:es|ing)? (?:over|across|onto) the|sprays? (?:over|across|onto) the|(?:gasps?|screams?|shrieks?|laughter|laughs?|cheers?|whoops?|yelps?) (?:from|in|rise|ring|erupt|burst)|(?:from|in) the rows? ahead|riders?(?:'|’)? (?:gasp|scream|shriek|laugh|cheer|whoop|yelp|duck|flinch)|arms (?:fly|thrown|go|shoot) up|hands (?:fly|go|shoot) up)\b/i;
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
const SEAT_OBJECTS = ["rails", "rail", "tracks", "track", "lap bar", "restraint", "harness", "handlebars", "grab bar", "safety bar", "restraint bar", "bar across the lap", "car nose", "nose of the car", "the car's nose", "the car's front", "hood", "visor", "goggles", "the seat", "from the seat", "rows ahead", "row ahead", "the row in front", "backs of heads", "backs of riders", "behind the riders", "behind the passengers", "passengers ahead", "passengers in front", "the front row", "the back row", "train ahead", "car ahead", "seats ahead", "the bow", "boat's bow", "dashboard", "windshield", "steering wheel", "water channel", "the channel", "the flume", "the groove", "the floor ahead", "the way ahead", "the path ahead", "the road ahead", "the car", "the boat", "the vehicle", "the pod", "the train", "the omnimover", "the kart", "the gondola", "the tram"];
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
  // the last beat opens by [secs−3] and the seat rides through the spectacle; the ride never ends itself; every spoken line says how it is said. The ride's own flaws.
  if (d.kind === "ridden" && !CORE_ONLY.on && lines.length >= 2) {
    const lastLine = lines[lines.length - 1], lastAt = Number((lastLine.match(/^\s*\[(\d+(?:\.\d+)?)s\]/) || [])[1] || 0);
    if (d.ending !== "quick" && secs >= 6 && lastAt > secs - 3) out.push({ rule: "ride", figure: `camera (the climax has ${secs - lastAt}s — the plan decided it is HELD: the last beat opens by [${secs - 3}s] and the seat rides THROUGH the spectacle to the last frame, the ${w.vehicle || "vehicle"} still inside it at the final image)`, at: lastAt });
    // A BEAT LASTS AS LONG AS ITS WEIGHT (owner 2026-09-11: "the lurch could comprise more space than others, like occurring from 8s till 13s … we seem to always produce equidistance which is too mechanical"):
    // the stamps never sit on a grid, and the climax is the longest span of the take
    if (secs >= 6 && lines.length >= 3) {
      const at = lines.map((l) => Number((l.match(/^\s*\[(\d+(?:\.\d+)?)s\]/) || [])[1] || 0));
      const gaps = at.slice(1).map((v, i) => v - at[i]);
      if (gaps.length >= 4 && gaps.every((g) => g === gaps[0])) out.push({ rule: "ride", figure: `camera (the beats sit on a grid — every stamp ${gaps[0]}s apart: a beat lasts as long as its weight (a passage a second, a tableau two, the held stop two), the stamps fall where the ride's events fall)`, at: at[1] || 0 });
    }
    const e = makerEndsRide(userWords) ? null : lastLine.match(RIDE_END); if (e) out.push({ rule: "ride", figure: `camera (the ride ends itself: "${e[0]}" — the last beat is the climax ridden, never the exit, the unload or a wink)`, at: lastAt });
    for (const dl of dialogueLines(text)) if (!saysHow(dl.line)) out.push({ rule: "ride", figure: `camera (a line does not say how it is said — "${dl.label}": the speaker label ends in a parenthetical of manner, two or three words — (sing-song, mocking))`, at: Number((dl.line.match(/\[(\d+(?:\.\d+)?)s\]/) || [])[1] || 0) });
  }
  // rule "apparatus" = a WRONG video (fatal after the re-asks); rule "ride" = the ride's own flaw — re-asked once, never refused (owner 2026-09-11: draws refused on a static figure or a flat finale while everything else was right)
  const add = (line, why, rule = "apparatus") => { const m = line.match(/^\s*\[(\d+(?:\.\d+)?)s\]/); out.push({ rule, figure: `camera (${why})`, at: m ? Number(m[1]) : 0 }); };
  lines.forEach((line, i) => {
    const first = i === 0, last = i === lines.length - 1;
    const opener = first || HARD_CUT.test(line) || /^\s*\[\d+(?:\.\d+)?s\]\s*cut\b/i.test(line);
    const mounting = first && MOUNT.test(line);
    const dm = line.match(DISMOUNT);
    if (dm && !mounting) add(line, `dismounted: "${dm[0]}" — the camera rides; riders appear only as the seat sees them, never looked at from outside`);
    else if (HARD_CUT.test(line) && !mounting) add(line, `"hard cut" — a travelling take never cuts between its places; its own motion carries into the next scene`);
    else if (opener && !mounting && !seatCue(line, d)) add(line, "no seat cue — the opening names the seat's own objects (the way ahead, the bar or nose, the rows ahead)");
    else if (d.family === "coaster" && statueIn(line)) add(line, `a figure the ride reaches is held still: "${statueIn(line)}" — the ride is the event; whatever the rails pass close is acted upon`, "ride");
    else if ((LEAVES_WAY.test(line) && !RAILS_KEPT.test(line)) || LEAVES_RAILS.test(line)) add(line, `the ${w.vehicle} leaves its ${w.way}: "${(line.match(LEAVES_WAY) || line.match(LEAVES_RAILS))[0]}" — every floor thing lies under the ${w.way}, which continue across it; the ride rides onto nothing but its own ${w.way}`, "ride");
    else if (WAY_END.test(line)) add(line, `the way ends: "${line.match(WAY_END)[0]}" — the ride's way never ends on screen`);
    else if (last && !rideSentOn(lastSentenceOf(line), d)) add(line, "the payoff does not send the ride on — the last words say where the ride goes: on, through, out of the frame, or swallowed by what the payoff releases");
    else if (d.kind === "ridden" && !vehicleLeads(line, d)) add(line, `the ride vehicle does not lead this beat — the ${w.vehicle || "vehicle"} is what each beat does (glides, turns toward, rolls on, passes, looks to); figures and things are what it passes`, "ride");
    else if (d.interior && INVERSION.test(line)) add(line, `inverted indoors: "${line.match(INVERSION)[0]}" — a corridor or room hosts straight runs, dips and banks, never a loop`, "ride");
    else if (last && d.family === "dark ride" && !CORE_ONLY.on && !seatFeels(line)) add(line, `the finale is not felt by the seat — the ${w.vehicle} sways, jolts, dips or is splashed as the spectacle passes, and the riders gasp, scream or laugh from the rows ahead (owner: spectacle acts on the ride; the riders react)`, "ride");
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
  if (d.family === "dark ride") for (const f of stillFigures(text, d)) out.push({ rule: "ride", figure: `camera (a figure of the world is passed without performing: "${f.name}" — on a dark ride every figure is an animatronic: one motion timed to the pass, and the ride's voices as it is passed)`, at: f.at });
  // THE FORM'S NAME IS THE PHOTOGRAPH'S (measured 2026-09-11, A/B on one sidecar: "into a dark ride's interior … the next scene of a dark ride" leaked the seat
  // plate's rock into frame zero; the same ending by construction, the class unnamed, did not). The noun may describe the vehicle; it never names a place.
  { const rx = formNameAsPlace(d); if (rx) lines.forEach((line) => { const m = line.match(rx); if (m) add(line, `the form's name is used for a place the take produces: "${m[0]}" — the words "${d.noun}" name the photograph and call it back; write the stretch by its construction (the black-painted walls of the ride's own building, a track-lit passage, a tableau under a spot)`, "ride"); }); }
  if (d.world?.mode === "theme") {
    // A REPLACEMENT IS A STANDING FACT, NEVER A CHANGE ON SCREEN (dry-cave-local-1: "the stalagmite formations become hedge walls" at 0s and a [1s] beat of its own
    // where two more "became" — a morph the vehicle did not lead). The ride's own flaw: re-asked once, never a refusal.
    if ((d.dressing?.placements || []).length) lines.forEach((line) => { const m = line.match(TRANSFORM); if (m) add(line, `a replacement is written as a change on screen: "${m[0]}" — frame zero's replacements are standing facts (the world's thing where the set piece stood), already in place, never becoming`, "ride"); });
    // FIGURES ARE HELD FOR THE INTERIOR (owner 2026-09-11: "in this logic we wouldn't spend the grady twins before entering"): a figure of the world named at frame zero is spent before the portal — the ride's own flaw
    if (lines.length) for (const f of (d.dressing?.figures || [])) { const keys = pieceKeys(f); if (keys.length < 2) continue; const hit = keys.filter((k) => new RegExp(`\\b${_re(k)}`, "i").test(lines[0])).length; if (hit * 2 >= keys.length) add(lines[0], `a figure of the world is spent at frame zero: "${f}" — the world's figures are held for the ride's own interior, passed after the portal as animatronic tableaux`, "ride"); }
    // THE PLATE'S OWN LIGHT NEVER RETURNS (2026-09-11: a hand-written ending said "under ultraviolet" and "under the blacklight" and re-imported the blacklit cave that frame zero had replaced with daylight): one light-word of the seat photograph's light after frame zero is the other ride's look kept — fatal like any set piece; colour words never count
    for (const p of (d.dressing?.plateThings || [])) { const keys = [...new Set(pieceKeys(p).filter((k) => LIGHT_WORDS.test(k)).flatMap(lightFamily))]; if (!keys.length) continue; lines.forEach((line, i) => { if (i === 0) return; const m = keys.find((k) => new RegExp(`\\b${_re(k)}`, "i").test(line)); if (m && !REPLACEMENT_VERB.test(line)) out.push({ rule: "plate-thing", figure: `the seat photograph's own light returns after frame zero ("${m}" — ${p}) — the other ride's look; the ride's interior is lit by its own construction, never the photograph's`, at: Number((line.match(/^\s*\[(\d+(?:\.\d+)?)s\]/) || [])[1] || 0) }); }); }
    // EVERY SCENE INSIDE IS STAGED (owner 2026-09-11): after the portal, a beat that passes a figure or a thing of the world names the staging grammar — a platform, a spot, a flat, the black walls, a device — at least two of them; fewer is a passage written as a scene
    { const iPortal = lines.findIndex((l) => PORTAL.test(l));
      if (iPortal >= 0) { const subjects = [...(d.dressing?.figures || []), ...(d.dressing?.later || []), ...(d.dressing?.finale ? [d.dressing.finale] : [])].filter(Boolean);
        lines.forEach((line, i) => { if (i <= iPortal) return; const passes = subjects.some((s) => { const keys = pieceKeys(s); return keys.length && keys.filter((k) => new RegExp(`\\b${_re(k)}`, "i").test(line)).length * 2 >= keys.length; }); if (passes && stagingHits(line) < 2) add(line, `an interior scene is not staged — every scene inside the ride's own building is a lit tableau on a low platform under a spot, a painted flat behind it, the black-painted walls all around, and one device of the craft; this beat names ${stagingHits(line)} of them`, "ride"); }); } }
    // the work's TITLE is the one lexical check left (one string, never a list); the world's places are the place judge's (_judge_places, run by _run)
    out.push(...worldNameFindings(text, [...(Array.isArray(workTitles) ? workTitles : []), d.world?.title].filter(Boolean)));
    // A REPLACED SET PIECE IS NAMED ONCE, IN ITS REPLACEMENT, AND NEVER AGAIN AS PRESENT (owner 2026-09-09: "if the mushroom is replaced … its still named"):
    // frame zero may name it (as what it becomes); a later beat that writes it as still there is the other ride kept (job 9127e915: "beside the giant illuminated mushroom" at 0s was a PLACEMENT, allowed now; the same words at 4s are not)
    for (const p of replacedSetPieces(d)) {
      const keys = pieceKeys(p); if (keys.length < 2) continue;   // a surface has no presence to police
      lines.forEach((line, i) => {
        if (i === 0) return;
        const hit = keys.filter((k) => new RegExp(`\\b${_re(k)}`, "i").test(line)).length;
        if (hit * 2 >= keys.length && !REPLACEMENT_VERB.test(line)) out.push({ rule: "plate-thing", figure: `"${p}" is written as still present after frame zero — it was replaced at frame zero by the world's thing; the other ride's set piece is gone`, at: Number((line.match(/^\s*\[(\d+(?:\.\d+)?)s\]/) || [])[1] || 0) });
      });
    }
  }
  // THE RIDE IS PROGRAMMED (owner 2026-09-11, draw 5: "rides can often stop, look at something which performs, then an unpredictable move occurs, or a turn
  // not expected. whereas these gens are linear forward"): a dark ride halts before a scene, holds while the figure performs, then moves in a way the rider
  // did not expect. A draft that glides forward from first beat to last is the ride's own flaw (re-asked once, never a refusal); the stop is never the last beat.
  if (d.family === "dark ride" && d.kind === "ridden" && !CORE_ONLY.on && lines.length >= 3) {
    const iStop = lines.findIndex((l, i) => i < lines.length - 1 && STOPS.test(l));
    if (iStop < 0) add(lines[lines.length - 1], `the ride never stops — a dark ride halts before a scene, holds while the figure performs, then moves in a way the rider did not expect (lurches backward, spins to face the other way, swings hard into a turn, drops); this take glides forward from first beat to last`, "ride");
    else if (!lines.slice(iStop).some((l) => SURPRISES.test(l))) add(lines[iStop], `the ride stops but leaves as it came — after the hold the ${w.vehicle || "vehicle"} moves in a way the rider did not expect (lurches backward, spins to face the other way, swings hard into a turn, drops, shoots forward)`, "ride");
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
