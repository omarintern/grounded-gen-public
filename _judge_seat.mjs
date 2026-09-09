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
  return `Return ONLY JSON {"real_photo":bool,"ai_generated":0..1,"shows_minor":bool,"content_flag":"none|nudity|distress|personal_data|third_party_media|symbol","shows_subject":bool,"camera_position":"aboard|platform|beside|ground|queue|other","riders":"none|backs only|faces or profiles","vehicle_in_foreground":bool,"way_recedes":bool,"environment":"indoor show scene|tunnel|outdoor daylight|outdoor night|station|other","way":"rails|water channel|groove in the floor|trackless floor|road|unseen","vehicle":"car|boat|omnimover|kart|other|unseen","text":"none|caption|title|watermark|logo|viewer_chrome|device_overlay","text_edge":"top|bottom|left|right|middle|none","why":string}. ` +
    gateClauses(`a frame taken from aboard a ${noun} — the ${carrier}'s own vantage, the ${wayWord} ahead`) + ` ` +
    `⚠ ON THIS HUNT the candidates are mostly stills from riders' own videos. Theatrical colour, blacklight, neon, glow, haze, low light and motion blur are the ride's own light and the camera's own motion, not synthesis: a real video still of a neon or blacklight ride is real. Judge synthesis by the physics alone (geometry that repeats or melts, crowds that dissolve, parts that never resolve), never by colour or darkness. ` +
    `camera_position is WHERE THE PHOTOGRAPHER IS. "aboard" when the picture was taken from INSIDE or ON the moving ${carrier}: the ${wayWord} runs AWAY from the camera's own position into the distance, and what is nearest is the ${carrier}'s own part or the scene the seat faces. The ${carrier}'s own part (${own}) MAY show at the bottom edge and often does not — its absence never makes the camera not aboard. "platform" when taken from a loading area or a station: vehicles seen from the side or from the front while standing, empty seats looked at, vehicles at rest, a railing between the camera and the vehicles, a loading walkway, footprint markings or hazard stripes at the bottom of the frame. "beside" when standing next to the ${wayWord}; "ground" when the ride is seen from below or from outside; "queue" from a queue line. A bar, a restraint or rails VISIBLE in the picture do not make the camera aboard when they belong to a vehicle the photographer is not in. ` +
    `riders: "none" when no rider is visible; "backs only" when riders are seen from behind — the backs of heads, shoulders, raised arms in the rows ahead, the seat's own view; "faces or profiles" when any rider's face or profile is visible, which means the photographer is looking AT riders from outside or across the vehicle. ` +
    `vehicle_in_foreground: the ${carrier}'s own part crosses the bottom edge of the frame, close and large. way_recedes: the ride's path leads away from the camera's own position. environment: what surrounds the camera. way: what the ride travels ON as THIS photograph shows it. vehicle: the carrier the camera rides in, if any of it is visible. text: lettering baked into the frame — a caption, a burned-in title, a stock watermark, a channel logo, a video player's own chrome, a device's own timestamp overlay — and text_edge: where it sits. why: one sentence naming what decided camera_position.`;
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
  const pos = String(j.camera_position || "").toLowerCase();
  if (OUTSIDE_POSITIONS.has(pos)) return { aboard: false, why: `camera ${pos}${j.why ? ` — ${String(j.why).slice(0, 90)}` : ""}` };
  if (pos !== "aboard" && j.way_recedes !== true) return { aboard: false, why: `camera ${pos || "unplaced"} and the way does not recede from it` };
  const env = String(j.environment || "").toLowerCase();
  if (family === "dark ride" && env === "outdoor daylight") return { aboard: false, why: "daylight exterior — a dark ride's seat is inside its show building" };
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
  if (j.vehicle_in_foreground === true) s += 40;
  if (j.way_recedes === true) s += 20;
  const env = String(j.environment || "").toLowerCase();
  if (family === "dark ride" && (env === "indoor show scene" || env === "tunnel")) s += 12;
  if (String(j.riders || "").toLowerCase() === "none") s += 4;
  if (TEXT_TOLERATED.has(String(j.text || "none").toLowerCase())) s += 6;
  const ai = Number(j.ai_generated); if (Number.isFinite(ai)) s += Math.max(0, 3 - ai * 10);
  const side = Math.min(Number(rec?.W) || 0, Number(rec?.H) || 0); if (side >= 720) s += 2; else if (side >= 540) s += 1;
  return s;
}
export function rankSeats(recs, opts = {}) {
  return (Array.isArray(recs) ? recs : []).map((r, i) => ({ r, i, s: seatScore(r, opts) })).filter((x) => x.r?.aboard === true)
    .sort((a, b) => (b.s - a.s) || (a.i - b.i)).map((x) => x.r);
}
/** One log line's worth of evidence. */
export function seatLabel(rec) {
  const j = rec?.j || {};
  if (rec?.aboard !== true) return `✗ ${rec?.why || "outside"}`;
  return `✓ aboard · ${j.vehicle_in_foreground === true ? `${j.vehicle && j.vehicle !== "unseen" ? j.vehicle : "vehicle"} in foreground` : "no vehicle in view (written)"} · ${j.way && j.way !== "unseen" ? j.way : "way"}${j.way_recedes === true ? " receding" : " not receding"} · ${j.environment || "?"}${j.riders && j.riders !== "none" ? ` · riders: ${j.riders}` : ""}${j.text && j.text !== "none" ? ` · text: ${j.text}${j.text_edge && j.text_edge !== "none" ? `@${j.text_edge}` : ""}` : ""}`;
}
