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
    s += `THE WORLD IS BUILT INTO THE RIDE: the seat photograph IS the ride — its ${w.vehicle}, its ${w.way} and its scene architecture are the frame's constant from frame zero to the end. No photograph of the world rides with it, and the world's PLACES ARE NEVER NAMED — not a room, a hall, a maze, nor the work's title: the world arrives only as THINGS on the ride's own surfaces. ` +
      `THE SEAT PHOTOGRAPH IS A SCENE OF ANOTHER RIDE, AND ITS OWN SET PIECES ARE REPLACED: everything it shows beside or ahead of the ${w.way} that is not of the world${plateThings.length ? ` — ${plateThings.join(", ")} —` : " (its props, figures, plants, tableaux, signs)"} is gone at frame zero, taken over by the world's things, and is NEVER NAMED; only the ${w.vehicle}, the ${w.way} and the show building's own walls, floor and ceiling remain from the photograph. ` +
      (placements.length ? `FRAME ZERO'S REPLACEMENTS, already in place at [0s] and stated as facts of the scene, never as changes: ${placements.join(" | ")}. ` : "") +
      (later.length ? `LATER THINGS arrive further along the same continuous take, in this order, each as the ride's own set piece: ${later.join(" → ")}. ` : "") +
      `WHERE THINGS SIT: beside the ${w.way} — on the scene's walls, on raised platforms or banks next to it — or AHEAD, as a tableau the ${w.vehicle} approaches and veers away from before reaching it; a figure of the world stands where a thing would, described by clothing and posture. The ${w.way}, the floor or bed the ride travels on, and the ${w.vehicle} are never dressed. The scenes stay unnamed (the next scene, a turn, a blackout); the ${w.way} runs on through every one of them. `;
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
  if (d.kind === "ridden") s += `THE RIDE'S OWN REGISTER — DECIDE, THEN WRITE (the decision is never written out): the ${w.vehicle}'s own motion grammar (an omnimover turns its seat to face each tableau; a boat drifts, bumps and drops; a coaster climbs, drops and banks; a trackless car pivots and reverses; a dark-ride car glides, slows before a tableau and jerks on); the trajectory through the scenes; and the ride's SOUND — the mechanism's hum and clatter, the ride's own music from its speakers, a narrator or announcer heard over the speakers, speaking animatronics — and which of these THIS take carries. Let the motion shape the beats and end with the Sound line naming the ride's own sound. ` +
    `THE RIDE'S OWN VOICES: a ride narrator or announcer heard from the speakers, and a speaking animatronic in a tableau, are the form's own — they need no listener in frame and never address the camera as an audience; write them as Dialogue lines with a named speaker — the label "Ride narrator" for the ride's own voice (never the bare word "Narrator", which names nobody) and an animatronic by the figure it is — words the ride itself would play. `;
  s += `THE RIDE NEVER CUTS: no "hard cut", no new camera setup — the ${w.way} carries the ${w.vehicle} into each next scene inside the same take. ` +
    `THE MOUNT (the opening only): the ride MAY open outside the ${w.vehicle} as it comes down the ${w.way} toward the camera and takes it up; from that moment every beat rides, and there is never a dismount after it. ` +
    (coaster ? `WHATEVER THE RAILS REACH IS MET AT SPEED: a figure the ride passes close is ACTED UPON by the passage — steps back, is blown, swings, turns with it — never a statue; a figure may stand only far off, unreached. ` : dark ? `The ride glides past standing figures and tableaux by design; they are the scene's, seen from the seat. ` : "") +
    `THE RIDE NEVER STOPS AND THE ${w.way.toUpperCase()} NEVER ${ends} ON SCREEN: in the final image the ride is still moving — the last words of the last beat say where it goes (the ${w.way} on through the doors, around the bend, out of the frame, or the ${w.vehicle} diving through what the payoff releases and swallowed by it). ` +
    (d.interior ? `THE MOTION IS WHAT THIS PLACE CAN HOST: straight runs, dips, banks at corners, a doorway taken at speed; never a loop, inversion or corkscrew indoors. ` : "") +
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
  String.raw`\b(?:the|a)\s+(?:rider|cyclist|driver|passenger)\s+(?:veers|swerves|pumps|pedals|steers|brakes|aims|weaves)\b`,
  String.raw`\bwatch(?:es|ing)?\s+(?:the|a)\s+(?:ride|rider|riders|cart|car|coaster|train)\b`,
  String.raw`\bfrom\s+the\s+(?:sidelines?|platform|ground|shore|balcony|doorway|curb|pavement)\b|\bon\s+the\s+(?:sidelines?|platform|shore|balcony|curb|pavement)\b`,   // "on the ground" is where a FIGURE stands, not where the camera is (job 9127e915's false positive)
  String.raw`\b(?:the|a)\s+(?:car|cart|coaster|train|ride|carriage)\s+(?:whips|carves|barrels|races|roars|plunges|swoops|tears|rips|hurtles|rockets|thunders|slaloms|spirals|screams|charges|blasts|slices|weaves)\s+(?:past|by|through|around|between|into)\s+(?:them|it|the crowd|the diners|the guests|the room|the tables|the figures|the people|everyone|the onlookers|the dancers|the patrons)\b`,
  String.raw`\b(?:the crowd|the diners|the guests|the room'?s?(?: gathered)? figures|the figures|the people|the onlookers|the patrons|the dancers|bystanders|everyone)\b[^.;]{0,50}\b(?:press(?:es|ed)? back|lean(?:s|ed|ing)? away|scatter(?:s|ed)?|part(?:s|ed)?|recoil(?:s|ed)?|flinch(?:es|ed)?|duck(?:s|ed)?|gasp(?:s|ed)?|startled|leap(?:s|ed)? (?:back|aside)|give(?:s)? (?:the turn|it|the car|the ride) room)\b`,
];
export const DISMOUNT = new RegExp(DISMOUNT_PARTS.join("|"), "i");
const INVERSION = /\b(?:loop(?:s|ing|ed)?|loop-the-loop|inversions?|upside[- ]down|inverted|corkscrews?|barrel[- ]rolls?)\b/i;
const FACEFILL = /\b(?:fills? the (?:frame|lens|screen|shot)|filling the (?:frame|lens|screen)|faces? (?:fill|loom)s?\b|inches from (?:a|the|her|his|their) faces?|straight into (?:a|the|her|his|their) faces?|close-up (?:of|on) (?:a|the|her|his|their) faces?|between the two (?:girls|twins|figures))/i;
const WAY_END = /\b(?:rails?|track|tracks|channel|flume|way|path|road) (?:end|ends|ending|stop|stops|stopping|terminate|terminates|run out|runs out|give out|gives out|dead-?end|dead-?ends|halt|halts)\b/i;
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
    else if (WAY_END.test(line)) add(line, `the way ends: "${line.match(WAY_END)[0]}" — the ride's way never ends on screen`);
    else if (last && !rideSentOn(lastSentenceOf(line), d)) add(line, "the payoff does not send the ride on — the last words say where the ride goes: on, through, out of the frame, or swallowed by what the payoff releases");
    else if (d.interior && INVERSION.test(line)) add(line, `inverted indoors: "${line.match(INVERSION)[0]}" — a corridor or room hosts straight runs, dips and banks, never a loop`);
    else if (last && FACEFILL.test(line)) add(line, `payoff stops on a face: "${line.match(FACEFILL)[0]}" — the ride passes through or by at speed`);
  });
  if (d.world?.mode === "theme") {
    out.push(...worldNameFindings(text, roomBanList(d, workTitles)));
    // the plate's own set pieces named = the other ride kept (job 9127e915: "beside the giant illuminated mushroom" kept the mushrooms in the video)
    for (const x of worldNameFindings(text, (d.dressing?.plateThings || []).filter(Boolean))) out.push({ ...x, rule: "plate-thing", figure: x.figure.replace("names a place of the world — the ride's scenes are unnamed; the world arrives only as things on the ride's own surfaces (beside the way, or ahead and veered from)", "names a set piece of the seat photograph's OWN ride — it is replaced by the world's things at frame zero and never named") });
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
    const name = m ? (/ becomes /i.test(f) ? m[2] : m[1]) : f;
    const keys = _words(name);
    if (!keys.length) continue;
    const hit = keys.filter((k) => new RegExp(`\\b${_re(k)}`, "i").test(lines[i])).length;
    if (hit * 2 >= keys.length) continue;   // half the thing's words already in beat zero: it is there
    const fact = / becomes /i.test(f) ? f.replace(/\s+becomes\s+/i, " is ") : f;
    lines[i] = lines[i].replace(/\.?\s*$/, `; ${fact}.`);
    added.push(fact);
  }
  return { text: lines.join("\n"), added };
}
