// ═══ THE SEAT JUDGE — ONE LOOK PER CANDIDATE, EVIDENCE NEVER A VERDICT (owner 2026-09-09) ══════════════════════════════════
// The old hunt asked two looks (a 19-field identity rubric with an aboard yes/no, then a second look at 768px only for frames the
// first called aboard) and anchored the FIRST passer. It was strict where it should be open — a real POV frame with no bar in view
// was refused, a neon or blacklight video still was called "AI" — and open where it should be strict: a press photo taken beside
// the car with four riders' faces passed twice. Owner: "correct on open where strict and strict where open. pov prefers the
// vehicle in foreground and such signs, but even without is fine because we prompt it."
// So ONE rubric answers the safety clauses (shared, verbatim — gateClauses) and the seat's evidence: where the photographer is,
// how the riders are seen, whether the carrier's own part is in the foreground, whether the way recedes, what surrounds the
// camera, what the ride travels on and in, and what text is baked into the frame. seatVerdict turns the evidence into aboard /
// outside by rules the gate can pin; seatScore ranks the aboard frames; the hunt takes the best of the WHOLE pool.
import sharp from "sharp";
import { providerJson, textPart, imagePart, PROVIDER_VLM_MODEL } from "./provider-llm.mjs";
import { gateClauses } from "./_judge_identity.mjs";

async function viewAt(fp, px) {
  return (await sharp(fp).resize(px, px, { fit: "inside", withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer()).toString("base64");
}
export const SEAT_AI_CEILING = Number(process.env.AI_CEILING ?? 0.3);
const OUTSIDE_POSITIONS = new Set(["platform", "beside", "ground", "queue"]);
const TEXT_TOLERATED = new Set(["none", "viewer_chrome", "device_overlay"]);

/** The rubric, by kind: the carrier's name and the way's name are the class's. @fed { noun, kind, family } from the ride decision. */
export function seatRubric({ noun = "ride", kind = "ridden", family = "other ridden" } = {}) {
  const carrier = kind === "driven" ? "vehicle" : kind === "worn" ? "wearer" : "ride vehicle";
  const wayWord = kind === "driven" ? "road" : kind === "worn" ? "path" : "track, water channel or floor";
  const own = kind === "driven" ? "a dashboard, a hood, a windshield edge" : kind === "worn" ? "handlebars, a helmet brim or visor, the wearer's own arms" : "a lap bar, a restraint, a car's nose, a boat's bow";
  return `Return ONLY JSON {"real_photo":bool,"ai_generated":0..1,"shows_minor":bool,"content_flag":"none|nudity|distress|personal_data|third_party_media|symbol","shows_subject":bool,"footing":"seat|walkway or platform|ground|unclear","own_part":bool,"walkway_or_footprint_markings":bool,"hazard_stripes":bool,"queue_railing":bool,"people_beside_track":bool,"empty_seats_looked_at":bool,"vehicle_seen_from_outside":bool,"camera_position":"aboard|platform|beside|ground|queue|other","riders":"none|backs only|faces or profiles","way_recedes":bool,"lighting":"dim theatrical|dark|lit show scene|station or work lighting|daylight","environment":"indoor show scene|tunnel|outdoor daylight|outdoor night|station|other","way":"rails|water channel|groove in the floor|trackless floor|road|unseen","vehicle":"car|boat|omnimover|kart|other|unseen","text":"none|caption|title|watermark|logo|viewer_chrome|device_overlay","text_edge":"top|bottom|left|right|middle|none","set_pieces":0..5,"why":string}. ` +
    `set_pieces: how many PROMINENT set pieces of this ride's OWN theme stand beside or ahead of the ${wayWord} — props, figures, plants, tableaux, signs — that a different world would have to replace (0 for a bare tunnel, a corridor, or the show building's walls, floor and ceiling alone; count up to 5). ` +
    gateClauses(`a frame taken from aboard a ${noun} — the ${carrier}'s own vantage, the ${wayWord} ahead`) + ` ` +
    `⚠ ON THIS HUNT the candidates are mostly stills from riders' own videos. Theatrical colour, blacklight, neon, glow, haze, low light and motion blur are the ride's own light and the camera's own motion, not synthesis: a real video still of a neon or blacklight ride is real. Judge synthesis by the physics alone (geometry that repeats or melts, crowds that dissolve, parts that never resolve), never by colour or darkness. ` +
    `footing is WHERE THE PHOTOGRAPHER'S BODY IS: "seat" when the bottom of the frame is the inside of the ${carrier} the camera rides in — its own restraint, nose, bow, dashboard or the rider's own lap and knees; "walkway or platform" when the bottom of the frame is a floor a person walks on — a loading walkway, footprint markings, hazard stripes, a platform edge, a queue floor — even when a ride vehicle stands right beside it; "ground" when the camera is outside the ride altogether. own_part: the ${carrier} the camera is IN shows its own part spanning the bottom edge, seen from the rider's position (${own}) — a vehicle standing beside, ahead of or below the camera with its SIDE, ROOF or WHOLE BODY visible is NOT the camera's own part, however close it is. THE SIX SIGNS are each answered on their own, TRUE only when that exact thing is visible in this frame and FALSE otherwise (a clean seat frame answers all six FALSE): walkway_or_footprint_markings — a loading walkway or painted footprints or a marked standing area at the bottom of the frame; hazard_stripes — yellow-and-black or yellow stripes along a platform edge; queue_railing — a railing or fence between the camera and the vehicles; people_beside_track — guests or staff standing next to the track or the vehicles; empty_seats_looked_at — the camera looks DOWN or ACROSS into empty seats of a vehicle (not the backs of the rows ahead); vehicle_seen_from_outside — a ride vehicle that is not the camera's own, seen from OUTSIDE with its side, roof or whole body visible, standing beside, below or across from the camera (the back of the car ahead on the same track is NOT this). ` +
    `camera_position is WHERE THE PHOTOGRAPHER IS. "aboard" when the picture was taken from INSIDE or ON the moving ${carrier}: the ${wayWord} runs AWAY from the camera's own position into the distance, and what is nearest is the ${carrier}'s own part or the scene the seat faces. The ${carrier}'s own part MAY show at the bottom edge and often does not — its absence never makes the camera not aboard. "platform" when taken from a loading area or a station. "beside" when standing next to the ${wayWord}; "ground" when the ride is seen from below or from outside; "queue" from a queue line. A bar, a restraint, rails or a whole vehicle VISIBLE in the picture do not make the camera aboard when they belong to a vehicle the photographer is not in. ` +
    `riders: "none" when no rider is visible; "backs only" when riders are seen from behind — the backs of heads, shoulders, raised arms in the rows ahead, the seat's own view; "faces or profiles" when any rider's face or profile is visible, which means the photographer is looking AT riders from outside or across the vehicle. ` +
    `way_recedes: the ride's path leads away from the camera's own position. lighting: the light the camera sits in — "dim theatrical" (a show scene lit by its own scenery, blacklight, spot or glow), "dark" (near black, a tunnel), "lit show scene" (a themed scene under general light), "station or work lighting" (the even flat light of a loading area, a queue, a workshop), "daylight". environment: what surrounds the camera. way: what the ride travels ON as THIS photograph shows it. vehicle: the carrier the camera rides in, if any of it is visible. text: lettering baked into the frame — a caption, a burned-in title, a stock watermark, a channel logo, a video player's own chrome, a device's own timestamp overlay — and text_edge: where it sits. why: one sentence naming what decided footing and camera_position.`;
}

/** One look at one frame. null on an unreadable frame or no opinion (the hunt drops it); a provider infra error is rethrown. */
export async function judgeSeat(filePath, opts = {}) {
  const px = Number(opts.viewPx || process.env.SEAT_VIEW_PX || 768);
  try {
    const b64 = await viewAt(filePath, px);
    const j = await providerJson([textPart(seatRubric(opts)), imagePart("image/jpeg", b64)], { maxTokens: 900, temperature: 0.1, model: opts.model || PROVIDER_VLM_MODEL });
    return j && typeof j === "object" ? j : null;
  } catch (e) {
    if (e?.name === "ProviderInfraError") throw e;
    return null;
  }
}

/** ABOARD OR OUTSIDE, from the evidence (pure; the gate pins it). Strict where open: riders' faces or profiles, a platform, a walkway,
 *  a queue, vehicles at rest, a synthetic or composite frame, a minor, a content flag, a stock watermark, text mid-frame — never the
 *  seat. Open where strict: the way receding from the camera's own position is the seat, bar or no bar; a camera the judge could not
 *  place is aboard when the way recedes and nothing places it outside. A dark ride's seat is inside its show building: a daylight
 *  exterior is not it (owner 2026-09-08: "its also not dark, its outdoor slightly, and third person"). */
const PLATFORM_SIGNS = ["walkway_or_footprint_markings", "hazard_stripes", "queue_railing", "people_beside_track", "empty_seats_looked_at"];
export function seatVerdict(j, { family = "other ridden" } = {}) {
  if (!j || typeof j !== "object") return { aboard: false, why: "unjudged" };
  if (j.real_photo !== true) return { aboard: false, why: "not a real photograph" };
  const ai = Number(j.ai_generated);
  if (Number.isFinite(ai) && ai > SEAT_AI_CEILING) return { aboard: false, why: `synthetic (${ai.toFixed(2)})` };
  if (j.shows_minor === true) return { aboard: false, why: "a minor in frame" };
  const flag = String(j.content_flag || "none").toLowerCase();
  if (flag && flag !== "none") return { aboard: false, why: `content flag: ${flag}` };
  const riders = String(j.riders || "").toLowerCase();
  if (riders === "faces or profiles") return { aboard: false, why: "riders looked at from outside (faces or profiles)" };
  // THE PLATFORM'S OWN EVIDENCE DECIDES FIRST (job 641d55ca, 2026-09-09: the judge called a loading walkway "aboard · omnimover in
  // foreground" — the egg car stood beside the walkway and touched the frame's edge). A walkway underfoot, a platform tell, or a
  // vehicle looked at from outside with nothing of the rider's own under the camera is a photographer standing, whatever it says
  const footing = String(j.footing || "").toLowerCase();
  if (footing === "walkway or platform" || footing === "ground") return { aboard: false, why: `footing: ${footing}${j.why ? ` — ${String(j.why).slice(0, 90)}` : ""}` };
  const signs = PLATFORM_SIGNS.filter((k) => j[k] === true);
  if (signs.length) return { aboard: false, why: `platform signs: ${signs.map((k) => k.replace(/_/g, " ")).join(", ")}` };
  if (j.vehicle_seen_from_outside === true && j.own_part !== true) return { aboard: false, why: "a vehicle looked at from outside and nothing of the rider's own under the camera" };
  const pos = String(j.camera_position || "").toLowerCase();
  if (OUTSIDE_POSITIONS.has(pos)) return { aboard: false, why: `camera ${pos}${j.why ? ` — ${String(j.why).slice(0, 90)}` : ""}` };
  if (pos !== "aboard" && j.way_recedes !== true) return { aboard: false, why: `camera ${pos || "unplaced"} and the way does not recede from it` };
  const env = String(j.environment || "").toLowerCase(), light = String(j.lighting || "").toLowerCase();
  if (family === "dark ride" && (env === "outdoor daylight" || env === "station" || light === "daylight" || light === "station or work lighting")) return { aboard: false, why: `${env === "station" || light === "station or work lighting" ? "station light" : "daylight"} — a dark ride's seat is inside its show scene, in the scene's own light` };
  const text = String(j.text || "none").toLowerCase(), edge = String(j.text_edge || "none").toLowerCase();
  if (text === "watermark") return { aboard: false, why: "stock watermark" };
  if (!TEXT_TOLERATED.has(text) && edge === "middle") return { aboard: false, why: `${text} text mid-frame` };
  return { aboard: true, why: "" };
}

/** THE RANK (pure). Aboard first — a rejected frame never ranks. Then: the carrier's own part in the foreground (the owner's
 *  preference: "pov prefers the vehicle in foreground"); the way receding; inside for a dark ride (an indoor show scene or a tunnel);
 *  no riders over backs only; clean of text over text to crop; a lower synthesis score; a larger frame. Ties keep pool order — the
 *  first query before the second, the engine's own order within it. */
export function seatScore(rec, { family = "other ridden" } = {}) {
  const j = rec?.j || {}; let s = 0;
  if (j.own_part === true) s += 40;                                   // the owner's preference: "pov prefers the vehicle in foreground" — the rider's OWN vehicle
  if (j.way_recedes === true) s += 20;
  const env = String(j.environment || "").toLowerCase(), light = String(j.lighting || "").toLowerCase();
  if (family === "dark ride" && (light === "dim theatrical" || light === "dark")) s += 15;   // the plate reads as the ride's own scene (owner 2026-09-09: "its not a night ride in the plate")
  if (family === "dark ride" && (env === "indoor show scene" || env === "tunnel")) s += 12;
  if (String(j.riders || "").toLowerCase() === "none") s += 4;
  // FEWER FOREIGN SET PIECES (owner 2026-09-11: "foreign set pieces could be the culprit" — the mushroom forest's own props rode into every render): on a
  // themed dark ride a bare seat outranks a furnished one, so there is less to replace and less in the first frame; 6 points per set piece, up to 5
  if (family === "dark ride") { const sp = Number(j.set_pieces); if (Number.isFinite(sp)) s -= Math.min(5, Math.max(0, Math.round(sp))) * 6; }
  if (TEXT_TOLERATED.has(String(j.text || "none").toLowerCase())) s += 6;
  const ai = Number(j.ai_generated); if (Number.isFinite(ai)) s += Math.max(0, 3 - ai * 10);
  const side = Math.min(Number(rec?.W) || 0, Number(rec?.H) || 0); if (side >= 720) s += 2; else if (side >= 540) s += 1;
  return s;
}
export function rankSeats(recs, opts = {}) {
  return (Array.isArray(recs) ? recs : []).map((r, i) => ({ r, i, s: seatScore(r, opts) })).filter((x) => x.r?.aboard === true)
    .sort((a, b) => (b.s - a.s) || (a.i - b.i)).map((x) => x.r);
}
/** DIFFUSED SCRAPING (owner 2026-09-10: "we set it up so that it greenboxes many and chooses randomly … 'diffused scraping'"): the rewrite of
 *  2026-09-09 served ranked[0] — an argmax — and the same dark ride came back on every Shining run (same query, same web rows, same top
 *  score). The scene hunt already shuffles its equal tiers (diffuseTies); the seat does the same: every aboard frame within SEAT_BAND
 *  points of the best is an equally correct seat, and one of them is served at random. Pure given `rand`. */
export const SEAT_BAND = 12;   // one "indoor" (12) or "no riders + clean text" (10) below the best still rides; a seat without its own vehicle (−40) or way (−20) never does
export function diffuseSeat(ranked, { band = SEAT_BAND, rand = Math.random, family = "other ridden" } = {}) {
  const list = Array.isArray(ranked) ? ranked.filter((r) => r?.aboard === true) : [];
  if (!list.length) return { pick: null, tier: [] };
  const top = seatScore(list[0], { family });
  const tier = list.filter((r) => top - seatScore(r, { family }) <= band);
  const k = Math.min(tier.length - 1, Math.max(0, Math.floor(rand() * tier.length)));
  return { pick: tier[k], tier, index: k };
}
/** One log line's worth of evidence. */
export function seatLabel(rec) {
  const j = rec?.j || {};
  if (rec?.aboard !== true) return `✗ ${rec?.why || "outside"}`;
  return `✓ aboard · set pieces ${Number.isFinite(Number(j.set_pieces)) ? Math.round(Number(j.set_pieces)) : "?"} · footing ${j.footing || "?"} · ${j.own_part === true ? `own ${j.vehicle && j.vehicle !== "unseen" ? j.vehicle : "vehicle"} under the camera` : "no vehicle of the rider's in view (written)"} · ${j.way && j.way !== "unseen" ? j.way : "way"}${j.way_recedes === true ? " receding" : " not receding"} · ${j.lighting || "?"} · ${j.environment || "?"}${j.riders && j.riders !== "none" ? ` · riders: ${j.riders}` : ""}${j.text && j.text !== "none" ? ` · text: ${j.text}${j.text_edge && j.text_edge !== "none" ? `@${j.text_edge}` : ""}` : ""}`;
}
