// THE WORLD'S PLACES ARE WRITTEN AS THEIR QUALITIES — THE CHECK (owner 2026-09-09: "instead of a ban list which sounds primitive, cant we
// just add a rule that states reducing specificity to their qualities"). The law lives in _ride_writer's block; this is its backstop: one
// question to the text judge per draft, no list of names to maintain. It returns the exact words that name a place and the beat they sit
// in; _run feeds them back to the writer exactly as the old ban did (re-ask, then the mechanical swap, then refusal). Fails OPEN on a
// judge outage — a check that cannot run never invents a finding — and says so.
import { providerJson, textPart } from "./provider-llm.mjs";

export const PLACE_QUESTION = (title) =>
  `These are the beats (and any Dialogue) of a video written as ONE continuous ride-through from a seat, themed on the work "${title || "a named work"}". ` +
  `THE RULE: a place of the world is written as its QUALITIES — the pattern of its floor, the finish of its walls, its fixtures, its figures, its light — ` +
  `never as a NAME and never as somewhere the ride is or goes. List every phrase that breaks it: a proper-noun location (a hotel, a house, a room by its name, ` +
  `a numbered room), a named room of the work, or a bare room noun written as where the ride is or goes ("into the lobby", "through the hallway", "in the maze", ` +
  `"the ballroom"). A THING beside the way is NOT a place: a carpet, wallpaper, chandeliers, hedge walls, elevator doors, a door, a wall, a set of stairs, a tableau. THE RIDE'S OWN PASSAGES ARE NOT PLACES OF THE WORLD: a tunnel, cave, cavern, corridor, hall, bend, dark stretch or "next scene" the ride itself travels through is the ride's architecture — never list it. THE RIDE'S OWN CONSTRUCTION IS NOT A PLACE EITHER: a room or scene BUILT around the rails, a built section, the black-painted walls of the ride's building, a platform, a flat, a backdrop, a tableau — the ride's staging, never listed. ` +
  `The work's title is a name. Return ONLY JSON {"places":[{"words":"<the exact words as written>","at":<the beat's stamp in seconds, a number>}]} — ` +
  `{"places":[]} when nothing names a place.`;

/** Pure shaping of a judge answer: [{ words, at }] with junk dropped. */
export function shapePlaces(answer, text = "") {
  const list = Array.isArray(answer?.places) ? answer.places : [];
  const out = [];
  for (const p of list) {
    const words = String(p?.words || "").replace(/\s+/g, " ").trim();
    if (words.length < 3 || words.length > 80) continue;
    if (/\b(?:built|black-painted|show-building|tableau|backdrop|painted flat|platform|staging|the ride's own)\b/i.test(words)) continue;   // the ride's own construction is never a place (velocal10)
    if (text && !new RegExp(words.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(text)) continue;   // the judge quotes what is there, or nothing
    const at = Number(p?.at); out.push({ words, at: Number.isFinite(at) ? at : 0 });
  }
  return out;
}

/** The named places in a beats text: [{ words, at }] — [] on a judge outage (fail open, logged). */
export async function namedPlaces(text, { title = "", judge = null, log = console.log } = {}) {
  const t = String(text || ""); if (!t.trim()) return [];
  try {
    const ask = judge || (async (q, body) => providerJson([textPart(`${q}\n\n${body}`)], { maxTokens: 500, temperature: 0 }));
    const answer = await ask(PLACE_QUESTION(title), t);
    return shapePlaces(answer, t);
  } catch (e) {
    log(`  ⚠ the place judge could not run (${String(e?.message || e).slice(0, 80)}) — the qualities law stands untested this draft`);
    return [];
  }
}
