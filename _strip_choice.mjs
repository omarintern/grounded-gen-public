// WHICH FILM STRIP CARRIES A REMIX'S CHARACTERS (owner 2026-09-26). "whatever a remix is of, it is grabbing that filmstrip, but my idea was to source
// outside of that if location of remix is same as that being remixed, in which case it can reach into another gen in the cannon for film strip if it
// uses a different place"; "if not then to reuse instead of source new"; "the camcorder gen is part of stale code that made a mistake in writing form";
// "i just hope that another parent in the canon can be used too if it contains the character(s)".
// Why: a character frame competes with the new place photo only when it shows the same KIND of place the remix puts its characters in. The Denzel car
// remix carried the store frames against a car photo and the car won; the penguin take carried the parent's summit frame against an Everest photo and
// the summit won. The strip's reader names each kind of place its frames show and whether the remix puts its characters there; code decides the mode
// from those answers. One record of the choice rides into the run: { mode, from, why, names, who }.
//   carry  the parent's frames carry the characters (they show another kind of place), and the new place is sourced: the path before this rule
//   canon  another gen of the canon carries them in frames of another kind of place, every carried character and no one else; the new place is sourced
//   reuse  nothing in the canon qualifies and the words keep the place: the parent's own frame is the scene, no new place is sourced
//   anew   nothing qualifies and the words name a new place, or the parent is stale (its script wrote the camera's chrome), or no frame of it shows them
//          alone: no frame rides, the place is sourced, and the characters are written as the parent recorded them

const key = (x) => String(x || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const framesOf = (c) => new Set((Array.isArray(c?.frames) ? c.frames : []).map((n) => Math.round(Number(n))).filter((n) => n >= 1));

/** Up to `max` frames (1-based) that together show every one of `carried`, each showing no other character the reader listed, taken from `among` (a Set)
 *  when given: the earliest frame holding them all first, else the earliest pair (owner 2026-09-24: "or frames if its a video with cuts and the character
 *  sought for preservation are frames apart"). `found` is the reader's list: [{ name, also, frames: [n] }]. [] when none. Pure. */
export function onlyThemFrames(found = [], carried = [], among = null, max = 2) {
  const want = [...new Set((Array.isArray(carried) ? carried : []).map(key).filter(Boolean))];
  if (!want.length) return [];
  const list = Array.isArray(found) ? found : [];
  const theirs = want.map((w) => list.find((c) => key(c?.name) === w || key(c?.also) === w));
  if (theirs.some((c) => !c)) return [];
  const blocked = new Set(list.filter((c) => !theirs.includes(c)).flatMap((c) => [...framesOf(c)]));
  const clean = [...new Set(theirs.flatMap((c) => [...framesOf(c)]))].filter((n) => !blocked.has(n) && (!among || among.has(n))).sort((a, b) => a - b);
  const one = clean.find((n) => theirs.every((c) => framesOf(c).has(n)));
  if (one) return [one];
  if (max < 2) return [];
  for (let i = 0; i < clean.length; i++) for (let j = i + 1; j < clean.length; j++)
    if (theirs.every((c) => framesOf(c).has(clean[i]) || framesOf(c).has(clean[j]))) return [clean[i], clean[j]];
  return [];
}

/** The one frame that shows every carried character and no one else (frame zero holds them all at once); 0 when none. Pure. */
export const onlyThemFrame = (found = [], carried = [], among = null) => onlyThemFrames(found, carried, among, 1)[0] || 0;

/** THE PARENT'S EMPTY FRAME (owner 2026-10-01: a remix that keeps the place and carries no character opens on "an empty frame of the parent"): the earliest
 *  frame that shows no character the reader listed, one of the remix's own kind of place first; 0 when every frame shows someone. Pure. */
export function emptyFrame(found = [], places = [], total = 0, peopled = []) {
  const listed = new Set([...(Array.isArray(found) ? found : []).flatMap((c) => [...framesOf(c)]), ...(Array.isArray(peopled) ? peopled : []).map((n) => Math.round(Number(n)))]);
  const sameAt = new Set((Array.isArray(places) ? places : []).filter((p) => p && p.same === true).flatMap((p) => (Array.isArray(p.frames) ? p.frames : []).map((n) => Math.round(Number(n)))));
  const empties = Array.from({ length: Math.max(0, Math.floor(Number(total) || 0)) }, (_, i) => i + 1).filter((n) => !listed.has(n));
  return empties.find((n) => sameAt.has(n)) || empties[0] || 0;
}

/** THE PARENT'S OWN ANSWER, from its reading (both build checks: this had only been matched as source text). Pure.
 *  same:  do the frames that would ride (`riding`, 1-based) show the kind of place the remix puts its characters in; null with no answer
 *  frame: its one frame of them alone in that kind, for frame zero; of any kind when the words keep the place (the place is the parent's; the reviewer)
 *  own:   its own frames of them alone in another kind: the parent is the first gen of the canon to carry them, at no read (both build checks) */
export function parentKinds({ found = [], places = [], riding = [], names = [], keepExplicit = false } = {}) {
  const at = (k) => new Set((Array.isArray(places) ? places : []).filter((p) => p && p.same === k).flatMap((p) => (Array.isArray(p.frames) ? p.frames : [])));
  const sameAt = at(true), otherAt = at(false), ride = Array.isArray(riding) ? riding : [];
  const same = ride.some((n) => sameAt.has(n)) ? true : ride.length > 0 && ride.every((n) => otherAt.has(n)) ? false : null;
  return { same, frame: onlyThemFrame(found, names, keepExplicit ? null : sameAt), own: same === true ? onlyThemFrames(found, names, otherAt) : [] };
}

/** The mode, from the readers' answers. Pure.
 *  parent: { same: true|false|null (do the frames that would ride show the kind of place the remix puts its characters in), frame: n (its one frame of
 *          them alone, in that kind) }
 *  canon:  [{ id, framePaths }] the canon candidates actually read, in search order; framePaths are their frames of them alone in another kind of place
 *  stale:  the parent's script wrote the camera's chrome; keepExplicit: the remixer's own words keep the place; named: the remixer's words name a new place */
export function chooseStrip({ parent = null, canon = [], stale = false, keepExplicit = false, named = false } = {}) {
  if (keepExplicit) {
    // the remixer's own words keep the place (owner 09-25: "the film-strip should use that"); a stale parent's frame never becomes the scene
    if (!stale && parent?.frame) return { mode: "reuse", why: "the remixer's words keep the place: the parent's own frame is the scene" };
    return { mode: "carry", why: stale ? "the words keep the place, but the parent is stale: its frame never becomes the scene" : "the words keep the place and no frame shows every carried character alone: the parent's frames carry as before" };
  }
  if (!parent || parent.same !== true) return { mode: "carry", why: parent?.same === false ? "the parent's frames show another kind of place: they carry, and the new place is sourced" : "no kind answer: the parent's frames carry as before" };
  const hit = (Array.isArray(canon) ? canon : []).find((c) => c && Array.isArray(c.framePaths) && c.framePaths.length);
  if (hit) return { mode: "canon", from: hit.id, why: `the parent's frames show the kind of place the remix puts its characters in; ${hit.id} shows them in another kind` };
  // a place the words name is sourced, never the parent's frame in its stead (owner 2026-09-26, on "now they ride in a limo": "source the new place")
  if (named) return { mode: "anew", why: "the remix names a new place of the parent's kind and nothing in the canon shows the characters elsewhere: the named place is sourced, the characters as recorded" };
  if (!stale && parent.frame > 0) return { mode: "reuse", why: "the parent's frames show the kind of place the remix puts its characters in and nothing in the canon shows them elsewhere: its own frame is the scene" };
  return { mode: "anew", why: stale ? "the parent's frames show the remix's kind of place, nothing shows the characters elsewhere, and the parent is stale: sourced anew, the characters as recorded" : "no frame of the parent shows every carried character alone: sourced anew, the characters as recorded" };
}

/** The canon's search order (owner 2026-09-26; both reviews): the parent's own ancestors nearest first, then every other gen, the ones whose records name
 *  more of the carried characters first (`rankOf`, a count; records rank, never exclude), newest first within a rank. `rows` are the app's rows of one
 *  root, [{ id, parent_id, created_at }]; the parent's own row is left out. Pure. */
export function canonOrder(rows = [], parentRow = "", rankOf = () => 0) {
  const list = (Array.isArray(rows) ? rows : []).filter((r) => r && r.id);
  const byId = new Map(list.map((r) => [String(r.id), r]));
  const up = [];
  for (let at = String(byId.get(String(parentRow))?.parent_id || ""), guard = 0; at && byId.has(at) && guard < 64; at = String(byId.get(at).parent_id || ""), guard++) up.push(byId.get(at));
  const rest = list.filter((r) => String(r.id) !== String(parentRow) && !up.includes(r))
    .sort((a, b) => (Number(rankOf(b)) || 0) - (Number(rankOf(a)) || 0) || Date.parse(b.created_at || 0) - Date.parse(a.created_at || 0));
  return [...up, ...rest];
}

/** Whether a gen on the lineage path between two gens of one canon (every gen after their nearest common ancestor, on both sides) changed the look of
 *  one of `names`. `changed` maps a row id to the names whose look that gen's remix changed, as its record says. Pure. */
export function lookChangedBetween(rows = [], a = "", b = "", names = [], changed = new Map()) {
  const byId = new Map((Array.isArray(rows) ? rows : []).filter((r) => r && r.id).map((r) => [String(r.id), r]));
  const line = (id) => { const out = []; for (let at = String(id || ""), guard = 0; at && byId.has(at) && guard < 64; at = String(byId.get(at).parent_id || ""), guard++) out.push(at); return out; };
  const la = line(a), lb = line(b);
  const common = la.find((x) => lb.includes(x));
  const upTo = (l) => (common ? l.slice(0, l.indexOf(common)) : l);
  const want = new Set((Array.isArray(names) ? names : []).map(key).filter(Boolean));
  return [...upTo(la), ...upTo(lb)].some((id) => [...(changed.get(id) || [])].some((n) => want.has(key(n))));
}

/** THE PINS, FROM THE CHOICE (the reviewer's build check: the decision was only ever read as source text). Pure.
 *  plate: the parent's place photograph when the words keep the place (null when they change it); frame0: the parent's one frame of them alone (reuse);
 *  parent: the parent's reading { frames, handles }; canon: the canon's { frames, handles } (its frames, its own descriptions); presence: every carried
 *  character a frame pins as it is. → { env, handles }: the run's env and the characters as they ride (REMIX_KEPT_FIGURES reads them). */
export function pinsFor({ mode = "carry", from = "", why = "", plate = null, keepsPlace = false, frame0 = "", parent = { frames: [], handles: [] }, canon = null, presence = [] } = {}) {
  const env = {};
  // the place: the parent's own frame is the scene (reuse); the words keep the parent's photograph; else the place is sourced and the photograph stands
  // behind a hunt that finds nothing (the 09-09 law), when the words kept it at all
  if (mode === "reuse" && frame0) env.WORLD_PIN = frame0;
  else if (plate && keepsPlace) env.WORLD_PIN = plate;
  else if (plate) { env.WORLD_SKIP = plate; env.WORLD_FALLBACK = plate; }
  // the one bit that says the place is the parent's (the writer keeps the parent's whole script then); WORLD_PIN alone cannot say it, since a borrowed camera
  // pins the kept FORM plate the same way (the reviewer's build check of a6b3155)
  if ((mode === "reuse" && frame0) || (plate && keepsPlace)) env.REMIX_PLACE_KEPT = "1";
  const ph = Array.isArray(parent?.handles) ? parent.handles : [];
  const handles = mode === "carry" ? ph
    : mode === "canon" ? [...(Array.isArray(canon?.handles) ? canon.handles : []), ...ph.filter((h) => h.change).map((h) => ({ ...h, rides: false, frame: null }))]
    : mode === "reuse" ? ph.map((h) => ({ ...h, rides: !h.change && !!frame0, frame: !h.change && frame0 ? frame0 : null }))
    : ph.map((h) => ({ ...h, rides: false, frame: null }));
  const frames = mode === "carry" ? (Array.isArray(parent?.frames) ? parent.frames : []) : mode === "canon" ? (Array.isArray(canon?.frames) ? canon.frames : []) : [];
  if (frames.length) {
    env.CAST_FRAME = frames[0]; env.CAST_FRAMES = JSON.stringify(frames);
    env.CAST_FRAME_NOTE = handles.filter((h) => h.rides).map((h) => h.handle).join("; ");
    env.CAST_FRAME_NAMES = JSON.stringify(Object.fromEntries(frames.map((fp) => [fp, handles.filter((h) => h.rides && h.frame === fp).map((h) => h.name)])));   // who each frame shows (2026-09-25)
  }
  // who stands in frame zero (reuse) or rides a frame: each by the description it rides with, never by its name (both build checks: an owned name reached
  // the writer); one with no description at all is left out of the words, and the frame still shows it
  const riding = mode === "reuse" ? (Array.isArray(presence) ? presence : []) : handles.filter((h) => h.rides).map((h) => h.name);
  const who = riding.map((n) => (handles.find((h) => key(h.name) === key(n) && h.handle) || {}).handle || "").filter(Boolean);
  env.REMIX_STRIP = JSON.stringify({ mode, ...(from ? { from } : {}), why, names: riding, who });
  return { env, handles };
}
