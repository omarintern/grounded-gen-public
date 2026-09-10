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
  const plural = /s$/.test(w.way), runs = plural ? "run" : "runs", ends = plural ? "END" : "ENDS";
  const carrier = d.kind === "driven" ? `the ${w.vehicle} the camera drives` : d.kind === "worn" ? `the wearer's own apparatus (${w.vehicle})` : `the ${w.vehicle} the camera rides in`;
  const placements = (d.dressing?.placements || []).map((l) => String(l).replace(/^[^:]{0,80}\(frame zero[^)]*\):\s*/i, "").replace(/^the seat photograph[^:]*:\s*/i, "")).filter(Boolean);
  const later = (d.dressing?.later || []).filter(Boolean);
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
    s += `THE WORLD IS BUILT INTO THE RIDE: the seat photograph IS the ride — its ${w.vehicle}, its ${w.way} and its scene architecture are the frame's constant from frame zero to the end. ` +
      (photographed.length
        ? `PHOTOGRAPHS OF THE WORLD RIDE WITH THIS FRAME, in story order — ${photographed.map((p) => `${p.name}${(p.qualities || []).length ? ` (${p.qualities.join(", ")})` : ""}`).join("; ")}: the take ARRIVES in each without a cut, the ${w.way} running on through it and the ${w.vehicle} never leaving the ${w.way}; each is written as its qualities — its floor, its walls, its fixtures, its figures — never by name; the photograph carries the rest. ` +
          `⚠ THE TAKE OPENS INSIDE THE FIRST RIDING PHOTOGRAPH (owner 2026-09-11, the golden take): frame zero is ${photographed[0].name} entered from the seat — the seat photograph's ${w.way}${vehicleShown ? ` and ${w.vehicle}` : ""} run into it, its qualities around the ${w.way} — and every riding photograph is arrived at by a beat of its own, in order. The seat photograph's OWN scene comes LATER in the take, never first; when it is on screen its set pieces are the world's things (the Set line), never the other ride's. `
        : `No photograph of the world rides with it: the world arrives as THINGS on the ride's own surfaces. `) +
      `FRAME ZERO NAMES EVERY SET PIECE OF THIS PHOTOGRAPH${plateThings.length ? ` — ${plateThings.join(", ")} —` : ""} (owner: frame zero is always grounded): each either as WHAT IT BECOMES — a replacement names the set piece it takes the place of ("where the <set piece> stands, <the world's thing> stands") — or as ITSELF, in its place, when nothing of the world takes its place; a set piece that is replaced is named once, in its replacement, and never again as present; the ${w.vehicle}, the ${w.way} and the show building's own walls, floor and ceiling remain as photographed. ` +
      (placements.length ? `FRAME ZERO'S REPLACEMENTS, already in place at [0s] and stated as facts of the scene, never as changes: ${placements.join(" | ")}. ` : "") +
      (later.length ? `LATER THINGS arrive further along the same continuous take, in this order, each as the ride's own set piece: ${later.map((x) => FLOOR_THING.test(x) ? `${x} (a floor thing: it lies under and around the ${w.way}, with the ${w.way} continuing across it)` : x).join(" → ")}. ` : "") +
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
  if (d.kind === "ridden") s += `THE RIDE VEHICLE LEADS EVERY BEAT (owner 2026-09-09, the mushroom take's grammar): the ${w.vehicle || "vehicle"} is what each beat's sentence does — it glides, turns toward, rolls on, passes, slows before, looks to; the figures and the things are what it passes, never the subject of a beat on their own. ` +
    `THE RIDE'S OWN REGISTER — DECIDE, THEN WRITE (the decision is never written out): the ${w.vehicle}'s own motion grammar (an omnimover turns its seat to face each tableau; a boat drifts, bumps and drops; a coaster climbs, drops and banks; a trackless car pivots and reverses; a dark-ride car glides, slows before a tableau and jerks on); the trajectory through the scenes; and the ride's SOUND — the mechanism's hum and clatter, the ride's own music from its speakers, a narrator or announcer heard over the speakers, speaking animatronics — and which of these THIS take carries. Let the motion shape the beats and end with the Sound line naming the ride's own sound. ` +
    `THE RIDE'S OWN VOICES: a ride narrator or announcer heard from the speakers, and a speaking animatronic in a tableau, are the form's own — they need no listener in frame and never address the camera as an audience; write them as Dialogue lines with a named speaker — the label "Ride narrator" for the ride's own voice (never the bare word "Narrator", which names nobody) and an animatronic by the figure it is — words the ride itself would play. A FIGURE THAT IS PASSED SPEAKS ITS OWN LINE (owner 2026-09-11: "narration is only where necessary"), timed to the beat it is passed in — its [Ns] is that beat's stamp; the Ride narrator speaks only when no figure of the scene can carry the words. `;
  s += `THE RIDE NEVER CUTS: no "hard cut", no new camera setup — the ${w.way} carries the ${w.vehicle} into each next scene inside the same take. ` +
    `THE MOUNT (the opening only): the ride MAY open outside the ${w.vehicle} as it comes down the ${w.way} toward the camera and takes it up; from that moment every beat rides, and there is never a dismount after it. ` +
    (coaster ? `WHATEVER THE RAILS REACH IS MET AT SPEED: a figure the ride passes close is ACTED UPON by the passage — steps back, is blown, swings, turns with it — never a statue; a figure may stand only far off, unreached. ` : dark ? `EVERY FIGURE OF THE WORLD ON THIS RIDE IS AN ANIMATRONIC, AND IT PERFORMS AS THE SEAT PASSES: one motion each, timed to the pass — a head turns to follow the rider, an arm beckons or swings, a body lurches forward, rises or drops, eyes light — and the ride's own voices sound as it is passed (a Ride narrator line or the figure's own line, as Dialogue). A figure never merely stands, waits or is held still; a maker's word such as "frozen" describes how the figure LOOKS (frost, ice, snow on it), never its stillness. ` : "") +
    `THE RIDE NEVER STOPS AND THE ${w.way.toUpperCase()} NEVER ${ends} ON SCREEN: in the final image the ride is still moving — the last words of the last beat say where it goes (the ${w.way} on through the doors, around the bend, out of the frame, or the ${w.vehicle} diving through what the payoff releases and swallowed by it). ` +
    `THE ${w.vehicle.toUpperCase()} NEVER LEAVES THE ${w.way.toUpperCase()}: a floor thing of the world — a carpet, tiles, boards, a rug — lies under and around the ${w.way}, with the ${w.way} continuing across it; the ${w.vehicle} never glides, rolls or drives onto anything but its own ${w.way}. ` +
    (d.interior ? `THE MOTION IS WHAT THIS PLACE CAN HOST: straight runs, dips, banks at corners, a doorway taken at speed; never a loop, inversion or corkscrew indoors. ` : "") +
    `THE FINALE IS SPECTACLE THAT ACTS ON THE RIDE (owner 2026-09-11): the last scene is an EVENT the world releases — a flood, a burst, a collapse, a lunge, a swing — and the seat FEELS it: the ${w.vehicle} sways, jolts, dips, bucks, is splashed or sprayed as it passes through; and THE RIDERS REACT, never seen but always heard and felt — gasps, screams or laughter from the rows ahead, arms thrown up in the rows ahead, the rider's own breath. ` +
    `THE PAYOFF IS PASSED THROUGH OR BY AT SPEED: the frame never ends on a face, nothing fills the lens, and every figure keeps the scene's scale to the last frame.\n`;
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
const ANIMATE = /\b(?:walks?|walking|wanders?|wandering|strolls?|strolling|march(?:es|ing)?|shuffles?|shuffling|turns?|turning|swivels?|beckons?|beckoning|waves?|waving|lunges?|lunging|rises?|rising|lifts?|lifting|raises?|raising|swings?|swinging|nods?|nodding|reach(?:es|ing)?|steps?|stepping|lurch(?:es|ing)?|jerks?|snaps?|tilts?|rotates?|rotating|opens?|opening|blinks?|points?|pointing|gestures?|gesturing|sways?|swaying|rocks?|rocking|bows?|bowing|leans?|leaning|lights? up|flicker(?:s|ing)?|flash(?:es|ing)?|glows? (?:on|alive|brighter)|mouths? mov\w*|jaws? (?:open|drop|snap|work)\w*|speaks?|speaking|sings?|singing|laughs?|laughing|shrieks?|screams?|calls?|whispers?|growls?|roars?|cackles?|creaks? (?:up|forward|to life|alive)|springs? (?:up|forward|to life|alive)|comes? (?:alive|to life)|whirs?|thrash(?:es|ing)?|claws?|clawing|strikes?|slams?|pounds?|shudders?|twitch(?:es|ing)?|drops? (?:down|from|toward)|swoops?|charges?|follows? the (?:rider|car|cart|seat|camera|lens)|tracks? the (?:rider|car|cart|seat|camera|lens)|eyes (?:snap|flick|follow|light|open|glow)|heads? (?:turn|snap|swivel|tilt|lift)|arms? (?:rise|lift|swing|reach)|hands? (?:rise|lift|reach|beckon))\b/i;
/** Figures of the world the take mentions but never makes perform: [{ name, at }]. Pure. */
export function stillFigures(text, d) {
  const names = (d?.dressing?.figures || []).filter(Boolean);
  if (!names.length) return [];
  const lines = String(text || "").split("\n").map((l) => { const m = l.match(/^\s*\[(\d+(?:\.\d+)?)s\]\s*(.*)$/); return m ? { at: Number(m[1]), text: m[2] } : null; }).filter(Boolean);
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
const VEHICLE_MOTION = /\b(?:glid(?:e|es|ing)|turn(?:s|ing)?|roll(?:s|ing)?|pass(?:es|ing)?|slow(?:s|ing)?|look(?:s|ing)?|swing(?:s|ing)?|climb(?:s|ing)?|drop(?:s|ping)?|bank(?:s|ing)?|pivot(?:s|ing)?|jerk(?:s|ing)?|drift(?:s|ing)?|bump(?:s|ing)?|creep(?:s|ing)?|eas(?:e|es|ing)|swivel(?:s|ling)?|round(?:s|ing)?|travel(?:s|ling|ing)?|mov(?:e|es|ing)|dip(?:s|ping)?|lurch(?:es|ing)?|rumbl(?:e|es|ing)|rattl(?:e|es|ing)|coast(?:s|ing)?|carr(?:y|ies|ying)|com(?:e|es|ing)|approach(?:es|ing)?|enter(?:s|ing)?|near(?:s|ing)?|veer(?:s|ing)?|curv(?:e|es|ing)|sweep(?:s|ing)?|plung(?:e|es|ing)|div(?:e|es|ing)|rush(?:es|ing)?|rac(?:e|es|ing)|hurtl(?:e|es|ing)|descend(?:s|ing)?|rise(?:s)?|rising|run(?:s|ning)?|advanc(?:e|es|ing)|push(?:es|ing)? (?:on|forward|through)|press(?:es|ing)? (?:on|forward)|nose(?:s|ing)? (?:into|through|toward)|edg(?:e|es|ing) (?:forward|past|into)|sail(?:s|ing)?|float(?:s|ing)?|whip(?:s|ping)?|swoop(?:s|ing)?)\b/i;
const WAY_NOUNS = ["rails", "rail", "track", "tracks", "way", "channel", "flume", "path"];
export function vehicleLeads(line, d) {
  const w = d ? rideWords(d) : { vehicle: "", way: "" };
  const nouns = [...VEHICLE_NOUNS, ...WAY_NOUNS, ...String(w.vehicle || "").toLowerCase().split(/\s+/).filter((x) => x.length >= 3), ...String(w.way || "").toLowerCase().split(/\s+/).filter((x) => x.length >= 3)];
  // SUBJECT THEN VERB, close together: "the ride vehicle glides", "the car slowly enters", "the rails run on" — never "the rider turns … beside the rails"
  const rx = new RegExp(`\\b(?:${[...new Set(nouns)].map(_re).join("|")})\\b(?:\\s+\\w+){0,2}?\\s+${VEHICLE_MOTION.source.replace(/^\\b|\\b$/g, "")}`, "i");
  return rx.test(String(line || ""));
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

/** THE FINDINGS — the run's ledger shape ({ rule, figure, at }), fatal-class every one: a wrong video, never a style note.
 *  @fed the beats text and the ride decision; workTitles for the world-room ban under a theme. */
export function rideFindings(text, d, { workTitles = [] } = {}) {
  const out = []; if (!d) return out;
  const w = rideWords(d);
  const lines = String(text || "").split("\n").filter((l) => /^\s*\[\d+(?:\.\d+)?s\]/.test(l));
  const add = (line, why) => { const m = line.match(/^\s*\[(\d+(?:\.\d+)?)s\]/); out.push({ rule: "apparatus", figure: `camera (${why})`, at: m ? Number(m[1]) : 0 }); };
  lines.forEach((line, i) => {
    const first = i === 0, last = i === lines.length - 1;
    const opener = first || HARD_CUT.test(line) || /^\s*\[\d+(?:\.\d+)?s\]\s*cut\b/i.test(line);
    const mounting = first && MOUNT.test(line);
    const dm = line.match(DISMOUNT);
    if (dm && !mounting) add(line, `dismounted: "${dm[0]}" — the camera rides; riders appear only as the seat sees them, never looked at from outside`);
    else if (HARD_CUT.test(line) && !mounting) add(line, `"hard cut" — a travelling take never cuts between its places; its own motion carries into the next scene`);
    else if (opener && !mounting && !seatCue(line, d)) add(line, "no seat cue — the opening names the seat's own objects (the way ahead, the bar or nose, the rows ahead)");
    else if (d.family === "coaster" && statueIn(line)) add(line, `a figure the ride reaches is held still: "${statueIn(line)}" — the ride is the event; whatever the rails pass close is acted upon`);
    else if ((LEAVES_WAY.test(line) && !RAILS_KEPT.test(line)) || LEAVES_RAILS.test(line)) add(line, `the ${w.vehicle} leaves its ${w.way}: "${(line.match(LEAVES_WAY) || line.match(LEAVES_RAILS))[0]}" — every floor thing lies under the ${w.way}, which continue across it; the ride rides onto nothing but its own ${w.way}`);
    else if (WAY_END.test(line)) add(line, `the way ends: "${line.match(WAY_END)[0]}" — the ride's way never ends on screen`);
    else if (last && !rideSentOn(lastSentenceOf(line), d)) add(line, "the payoff does not send the ride on — the last words say where the ride goes: on, through, out of the frame, or swallowed by what the payoff releases");
    else if (d.kind === "ridden" && !vehicleLeads(line, d)) add(line, `the ride vehicle does not lead this beat — the ${w.vehicle || "vehicle"} is what each beat does (glides, turns toward, rolls on, passes, looks to); figures and things are what it passes`);
    else if (d.interior && INVERSION.test(line)) add(line, `inverted indoors: "${line.match(INVERSION)[0]}" — a corridor or room hosts straight runs, dips and banks, never a loop`);
    else if (last && d.family === "dark ride" && !CORE_ONLY.on && !seatFeels(line)) add(line, `the finale is not felt by the seat — the ${w.vehicle} sways, jolts, dips or is splashed as the spectacle passes, and the riders gasp, scream or laugh from the rows ahead (owner: spectacle acts on the ride; the riders react)`);
    else if (last && FACEFILL.test(line)) add(line, `payoff stops on a face: "${line.match(FACEFILL)[0]}" — the ride passes through or by at speed`);
  });
  // THE TAKE OPENS INSIDE THE FIRST RIDING PHOTOGRAPH, AND THE RIDE'S OWN SCENE IS PASSED LATER (owner 2026-09-11, the golden take; dry-cave-1's writer
  // opened on the plate's replacements and never passed the plate's scene later)
  if ((d.dressing?.photographed || []).length && lines.length && !CORE_ONLY.on) {
    const first = d.dressing.photographed[0];
    const qs0 = (first?.qualities || []).map((q) => [...new Set(_words(q))]).filter((k) => k.length);
    const opens = !qs0.length || qs0.some((keys) => keys.filter((k) => new RegExp(`\\b${_re(k)}`, "i").test(lines[0])).length >= Math.min(2, Math.ceil(keys.length / 2)));
    if (!opens) out.push({ rule: "opening", figure: `camera (the take does not open inside the first riding photograph: ${first.name} (${(first.qualities || []).join(", ")}) — frame zero is that photograph entered from the seat, its qualities around the ${w.way}; the ride's own scene comes later)`, at: 0 });
    const replaced = replacedSetPieces(d).map((p) => pieceKeys(p)).filter((k) => k.length >= 2);
    if (replaced.length) {
      const mentions = (line) => replaced.filter((keys) => keys.filter((k) => new RegExp(`\\b${_re(k)}`, "i").test(line)).length * 2 >= keys.length).length;
      const atZero = mentions(lines[0]), later = lines.slice(1).some((l) => mentions(l) > 0);
      if (atZero > 0 && !later) out.push({ rule: "opening", figure: `camera (the ride's own scene is written at frame zero and nowhere later — the take opens inside ${first.name}; the seat photograph's scene, with its set pieces replaced, is passed LATER in the take)`, at: 0 });
    }
  }
  // EVERY RIDING PHOTOGRAPH IS ARRIVED AT (owner 2026-09-11: the maze rode as the third reference and no beat travelled into it — the hedges never appeared)
  for (const p of (d.dressing?.photographed || [])) {
    const qs = (p?.qualities || []).map((q) => [...new Set(_words(q))]).filter((k) => k.length);
    if (!qs.length) continue;
    const arrived = qs.some((keys) => lines.some((line) => keys.filter((k) => new RegExp(`\\b${_re(k)}`, "i").test(line)).length >= Math.min(2, Math.ceil(keys.length / 2))));
    if (!arrived) out.push({ rule: "apparatus", figure: `camera (a riding photograph is never arrived at: ${p.name} — its qualities (${(p.qualities || []).join(", ")}) appear in no beat; the take arrives in each riding photograph, in order, without a cut)`, at: 0 });
  }
  if (d.family === "dark ride") for (const f of stillFigures(text, d)) out.push({ rule: "apparatus", figure: `camera (a figure of the world is passed without performing: "${f.name}" — on a dark ride every figure is an animatronic: one motion timed to the pass, and the ride's voices as it is passed)`, at: f.at });
  if (d.world?.mode === "theme") {
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
  if ((d.dressing?.photographed || []).length) return { text: t, added: [] };   // photographs ride: the take opens inside the first of them, the Set line carries the plate's replacements (owner 2026-09-11)
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
    const fact = / becomes /i.test(f) ? f.replace(/\s+becomes\s+/i, " is ") : f;
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
  return { text: lines.join("\n"), added };
}
