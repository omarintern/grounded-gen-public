// ⭐⭐ WHAT A REMIX CARRIES IS READ FROM THE PARENT VIDEO (owner 2026-09-23/24: "by default you are carrying the relationship between the generated video
// (film strip) and the remix prompt (what it requests or does not request of the film strip). typically whats carried over is carried over from the
// video (so not just the face of lil caesar but more specifically the lil caesar in that remixed video). so description would carry from the frame
// chosen from the film strip, or frames if its a video with cuts and the character sought for preservation are frames apart. so its an overall
// intelligence system.")
//
// WHY. Remix 70127605 ("Pizza party in the car") lost the parent's Lil Caesar: the parent's saved cast (written 09-22) listed only the man in the
// hoodie, the old frame step looked only for the names on that list, and the mascot, standing in the very frame it picked, was drawn again from photos
// of the brand's mascot (an orange toga where the parent's wore white). Here the VIDEO decides: one reader looks at a strip that covers every shot
// together with the remix text, lists every character the video shows (the saved cast is a hint, never the list), and says for each whether the remix
// keeps it (the default), changes it or drops it, and which frame shows it best. Each kept character is then described from its own full-size frame.
// Fails OPEN everywhere: no video, no ffmpeg, a pick that answers nothing, a budget stop or an outage leaves the remix exactly as it was without it.
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { providerJson, textPart, imagePart } from "./provider-llm.mjs";
import { castFrameReadPrompt, handleCarriesName, CARRY_MAX_REFS } from "./_cast_frame.mjs";   // the frame limit is ONE number, kept with the frames (2026-09-25)

export const CARRY_FRAMES = 6;      // the strip's frames: one per shot first, the rest spread across the take
export { CARRY_MAX_REFS };   // at most two of the parent's frames ride the gen, outside the cap (_cast_frame.mjs holds the number)

/** The cut points ffmpeg's scene score finds in a video, in seconds; [] when it finds none or cannot run (the caller spreads frames evenly). */
export function sceneCuts(videoPath, { threshold = 0.35 } = {}) {
  try {
    const r = spawnSync("ffmpeg", ["-hide_banner", "-i", videoPath, "-vf", `select='gt(scene,${threshold})',showinfo`, "-f", "null", "-"], { encoding: "utf8", timeout: 60000 });
    return [...String(r.stderr || "").matchAll(/pts_time:(\d+(?:\.\d+)?)/g)].map((m) => Number(m[1])).filter((t) => Number.isFinite(t) && t > 0);
  } catch { return []; }
}

/** Frame times that cover every shot: an even spread across the take first; then every shot that holds no frame gets its middle, in place of a frame
 *  from the most crowded shot (the one nearest that middle), so a character who only appears after a cut is still seen. Never in the last 0.25 s. Pure. */
export function timesFromCuts(cuts = [], duration = 9, n = CARRY_FRAMES) {
  const d = Number(duration) > 0 ? Number(duration) : 9;
  const edges = [0, ...[...new Set(cuts.map(Number))].filter((t) => t > 0.2 && t < d - 0.2).sort((a, b) => a - b), d];
  const shots = edges.slice(0, -1).map((s, i) => ({ s, e: edges[i + 1], mid: (s + edges[i + 1]) / 2, len: edges[i + 1] - s }));
  const shotOf = (t) => shots.findIndex((x) => t >= x.s && t < x.e);
  const times = Array.from({ length: n }, (_, i) => ((i + 0.5) * d) / n);
  for (const sh of shots.slice().sort((a, b) => b.len - a.len)) {
    if (times.some((t) => t >= sh.s && t < sh.e)) continue;
    const count = (i) => times.filter((t) => shotOf(t) === i).length;
    const spare = times.map((t, i) => ({ t, i, c: count(shotOf(t)) })).filter((x) => x.c > 1).sort((a, b) => b.c - a.c || Math.abs(a.t - sh.mid) - Math.abs(b.t - sh.mid))[0];
    if (!spare) break;
    times[spare.i] = sh.mid;
  }
  return times.map((t) => +Math.min(t, d - 0.25).toFixed(2)).sort((a, b) => a - b);
}

const cast = (list = []) => (list.length ? list.map((k, i) => `${i + 1}. ${k.name}${k.look ? ` — ${String(k.look).replace(/\s+/g, " ").trim()}` : ""}`).join("\n") : "(none recorded)");

/** The strip question, as the reasoning vision model is asked it. Pure. */
export const carryPickPrompt = ({ remix = "", parentWords = "", known = [], n = CARRY_FRAMES, place = "" } = {}) =>
  `These are ${n} frames from ONE video, tiled in a grid and numbered 1 to ${n}: left to right, top row first. A REMIX of this video asks: ` +
  `${JSON.stringify(String(remix).replace(/\s+/g, " ").trim().slice(0, 700))}.\n` +
  `The words that made this video: ${JSON.stringify(String(parentWords).replace(/\s+/g, " ").trim().slice(0, 1600))}.\n` +
  `The characters it was recorded as carrying (numbered; a hint only: the video may show others, or show these differently):\n${cast(known)}\n` +
  `List every CHARACTER the video features: a person, an animal, a figure or a mascot the video is about or shows doing something. Not a crowd, not ` +
  `passers-by, not background extras. For each:\n` +
  `- "recorded": its number on the recorded list when it is one of those, else 0;\n` +
  `- "name": that list's name exactly as written when it is recorded, else the name the words that made the video give it, else a short plain label;\n` +
  `- "also_called": a proper name the words that made the video or the remix give it (a brand's character, a nickname), else empty;\n` +
  `- "kind": person, character or animal;\n` +
  `- "frames": the frames it appears in, and "best": the ONE frame that shows it largest, sharpest and most fully, face included;\n` +
  `- "carry": "drop" only when the remix removes it or puts someone or something else in its place ("replace him with a clown", "a dog instead of ` +
  `the mascot"); otherwise "keep". What the remix asks a character to DO, where it goes or what it says never drops it;\n` +
  `- "look_change": only what the remix changes about how this character LOOKS or WHAT it is (its body, face, clothes, kind); empty when the remix ` +
  `changes only what it does, where it is, or what it says.\n` +
  // ⭐⭐ THE KIND OF PLACE, ASKED ON THE SAME LOOK (owner 2026-09-26: a remix whose place is the same kind as the strip's reaches into the canon for a strip
  // from a different place): given the remix's place in words, the reader says what kind of place the frames show and whether a photograph of the
  // remix's place would show that kind. A kind is what a place is and what it is made of; the light, the hour, the weather, the camera and the people
  // belong to the recording.
  (String(place || "").trim()
    ? `The remix's place, in words: ${JSON.stringify(String(place).replace(/\s+/g, " ").trim().slice(0, 200))}. Also answer "place": "shows" is the kind of place these ` +
      `frames show, in a few words; "same" is true when a photograph of the remix's place would show that same kind of place. A kind of place is what the ` +
      `place is and what it is made of; the light, the hour, the weather, the camera and the people belong to the recording.\n`
    : "") +
  `Return ONLY JSON {"characters":[{"recorded":0,"name":"…","also_called":"","kind":"person|character|animal","frames":[n],"best":n,"carry":"keep|drop",` +
  `"look_change":""}]${String(place || "").trim() ? `,"place":{"shows":"…","same":true}` : ""}}, characters [] when the video features no character.`;

const KIND = { person: "real_person", character: "ip", animal: "real_entity" };
const key = (x) => String(x || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/**
 * → { characters: [{ name, recorded, also, kind, carry, change, frame, handle, rides }], frames: [the paths that ride], found: [every character listed,
 *   with its frames], place: { shows, same } | null (asked only when `place` is given), allFrames: [every frame's path] } | null.
 * `known` is the saved cast ([{ name, look, kind }]), a hint; a character the video shows and the list lacks is found all the same. Each kept or
 * changed character is described from ITS best frame (full size); at most CARRY_MAX_REFS distinct frames are used, the characters they show first.
 */
export async function readCarry({ strip, frames = [], remix = "", parentWords = "", known = [], place = "", describe = true } = {}, { judge = providerJson, log = () => {} } = {}) {
  if (!strip || !frames.length) return null;
  const b64 = (p) => readFileSync(p).toString("base64");
  // room to think: the pick reasons over six frames and a remix at once (the fast model reasons before it answers; a cut-off call is billed and re-asked)
  const pick = await judge([textPart(carryPickPrompt({ remix, parentWords, known, n: frames.length, place })), imagePart("image/jpeg", b64(strip))], { maxTokens: 4000, temperature: 0, tag: "carry-pick" });
  // the kind answer and every character's own frames ride out with the result (the strip choice reads them: _strip_choice.mjs)
  const placeKind = pick?.place && typeof pick.place === "object" ? { shows: String(pick.place.shows || "").replace(/\s+/g, " ").trim().slice(0, 120), same: typeof pick.place.same === "boolean" ? pick.place.same : null } : null;
  const found = (Array.isArray(pick?.characters) ? pick.characters : []).map((c) => {
    const best = Math.round(Number(c?.best)), no = Math.round(Number(c?.recorded)) || 0;
    const rec = no >= 1 && no <= known.length ? known[no - 1] : known.find((k) => key(k.name) && key(k.name) === key(c?.name));
    return { name: rec ? rec.name : String(c?.name || "").replace(/\s+/g, " ").trim(), recorded: !!rec, also: String(c?.also_called || "").replace(/\s+/g, " ").trim(),
      kind: rec?.kind || KIND[String(c?.kind || "").toLowerCase()] || "real_person", carry: String(c?.carry) === "drop" ? "drop" : "keep",
      change: String(c?.look_change || "").replace(/\s+/g, " ").trim(), best: best >= 1 && best <= frames.length ? best : 0,
      frames: (Array.isArray(c?.frames) ? c.frames : []).map((x) => Math.round(Number(x))).filter((x) => x >= 1 && x <= frames.length) };
  }).filter((c) => c.name && c.best);
  // another gen of the canon is read for who it shows, in which frames, and in what kind of place; its characters are never described again (the parent's
  // own reading describes them: _strip_choice.mjs)
  if (!describe) return { characters: [], frames: [], found, place: placeKind, allFrames: frames };
  const kept = found.filter((c) => c.carry === "keep");
  if (!kept.length) { log(`  carry: the remix carries no character the video features${found.length ? ` (${found.map((c) => `${c.name}: ${c.carry}`).join(", ")})` : ""}`); return found.length ? { characters: found.map((c) => ({ ...c, frame: null, handle: "", rides: false })), frames: [], found, place: placeKind, allFrames: frames } : null; }
  // the frames that RIDE the gen: the best frames of the characters kept as they are (the frame showing the most of them first, at most CARRY_MAX_REFS). A
  // character whose look the remix changes is described from its own frame, but that frame never rides for it: it would pin the look being changed.
  const same = kept.filter((c) => !c.change), changed = kept.filter((c) => c.change);
  const count = new Map(); for (const c of same) count.set(c.best, (count.get(c.best) || 0) + 1);
  const ride = [...count.keys()].sort((a, b) => count.get(b) - count.get(a) || a - b).slice(0, CARRY_MAX_REFS);
  for (const c of same) if (!ride.includes(c.best)) { log(`  carry: ${c.name} is best in frame ${c.best}; only ${CARRY_MAX_REFS} frames ride, so it is read from frame ${ride[0]}`); c.best = ride[0]; }
  const readOn = [...new Set([...ride, ...changed.map((c) => c.best)])];
  const out = [];
  for (const n of readOn) {
    const who = kept.filter((c) => c.best === n);
    const read = await judge([textPart(castFrameReadPrompt(who.map((c) => ({ name: c.name, look: (known.find((k) => key(k.name) === key(c.name)) || {}).look || "" })))), imagePart("image/jpeg", b64(frames[n - 1]))],
      { maxTokens: 1800, temperature: 0, tag: "carry-read" });
    const list = Array.isArray(read?.characters) ? read.characters : [];
    who.forEach((c, i) => {
      const h = list.find((x) => Number(x?.n) === i + 1) || list[i];
      const handle = h && h.visible !== false ? String(h.handle || "").replace(/\s+/g, " ").trim() : "";
      out.push({ ...c, frame: frames[n - 1], rides: ride.includes(n) && !c.change, handle: handle && !handleCarriesName(handle, [c.name, c.also].filter(Boolean)) ? handle : "" });
    });
  }
  for (const c of found.filter((x) => x.carry === "drop")) out.push({ ...c, frame: null, handle: "", rides: false });
  log(`  carry: ${out.map((c) => `${c.name}${c.also ? ` (${c.also})` : ""} ${c.carry.toUpperCase()}${c.change ? ` with a new look: ${c.change}` : ""}${c.handle ? ` → "${c.handle}"` : ""}${c.rides ? " [its frame rides]" : ""}`).join(" · ")}`);
  return { characters: out, frames: ride.map((n) => frames[n - 1]), found, place: placeKind, allFrames: frames };
}
