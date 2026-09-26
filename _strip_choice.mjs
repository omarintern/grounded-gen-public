// WHICH FILM STRIP CARRIES A REMIX'S CHARACTERS (owner 2026-09-26). "whatever a remix is of, it is grabbing that filmstrip, but my idea was to source
// outside of that if location of remix is same as that being remixed, in which case it can reach into another gen in the cannon for film strip if it
// uses a different place"; "if not then to reuse instead of source new"; "the camcorder gen is part of stale code that made a mistake in writing form".
// Why: a character frame competes with the new place photo only when it shows the same KIND of place the words describe. The Denzel car remix carried
// the store frames against a car photo and the car won; the penguin take carried the parent's summit frame against an Everest photo and the summit won.
// The words decide the kind (the remix's own record: world keep or change); the strip's reader says what kind of place its frames show; code decides
// the mode from those answers. One record of the choice rides into the run: { mode, from, frames, names, why }.
//   carry  the parent's strip carries the characters (a different kind of place), and the new place is sourced: today's path
//   canon  another gen of the canon carries them (a different kind of place, every carried character and no one else in its frame), new place sourced
//   reuse  nothing in the canon qualifies: the parent's own frame is the scene, no new place is sourced
//   anew   nothing qualifies and the parent is stale (its script wrote the camera's chrome): no strip, the new place sourced, the characters in words

const key = (x) => String(x || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/** The frame (1-based) that shows every one of `carried` and no other character the reader listed, earliest first; 0 when none does. `found` is the
 *  reader's list: [{ name, frames: [n] }]. Pure. */
export function onlyThemFrame(found = [], carried = []) {
  const want = [...new Set((Array.isArray(carried) ? carried : []).map(key).filter(Boolean))];
  if (!want.length) return 0;
  const list = Array.isArray(found) ? found : [];
  const framesOf = (c) => new Set((Array.isArray(c?.frames) ? c.frames : []).map((n) => Math.round(Number(n))).filter((n) => n >= 1));
  const theirs = want.map((w) => list.find((c) => key(c?.name) === w || key(c?.also) === w));
  if (theirs.some((c) => !c)) return 0;
  const others = list.filter((c) => !theirs.includes(c));
  const blocked = new Set(others.flatMap((c) => [...framesOf(c)]));
  const sets = theirs.map(framesOf);
  const common = [...sets[0]].filter((n) => sets.every((s) => s.has(n)) && !blocked.has(n)).sort((a, b) => a - b);
  return common[0] || 0;
}

/** The mode, from the readers' answers. Pure.
 *  parent: { same: true|false|null, frame: n (its only-them frame), frames: [paths] }; the parent strip's kind answer and its frames
 *  canon:  [{ id, same, frame, framePath }] the canon candidates actually read, in search order
 *  stale:  the parent's script wrote the camera's chrome; keepExplicit: the remixer's own words keep the place */
export function chooseStrip({ parent = null, canon = [], stale = false, keepExplicit = false } = {}) {
  if (keepExplicit) {
    // the remixer's own words keep the place (owner 09-25: "the film-strip should use that"); a stale parent's frame never becomes the scene
    if (!stale && parent?.frame) return { mode: "reuse", why: "the remixer's words keep the place: the parent's own frame is the scene" };
    return { mode: "carry", why: stale ? "the words keep the place, but the parent is stale: its frame never becomes the scene" : "the words keep the place and no frame shows every carried character: the parent's strip carries as before" };
  }
  if (!parent || parent.same !== true) return { mode: "carry", why: parent?.same === false ? "the parent's strip shows a different kind of place: it carries, and the new place is sourced" : "no kind answer: the parent's strip carries as before" };
  const hit = (Array.isArray(canon) ? canon : []).find((c) => c && c.same === false && c.frame > 0 && c.framePath);
  if (hit) return { mode: "canon", from: hit.id, why: `the parent shows the same kind of place; ${hit.id} carries every character in a different kind of place` };
  if (!stale && parent.frame > 0) return { mode: "reuse", why: "the parent shows the same kind of place and nothing in the canon carries them elsewhere: its own frame is the scene" };
  return { mode: "anew", why: stale ? "the parent shows the same kind of place, nothing carries them elsewhere, and the parent is stale: sourced anew, the characters in words" : "no frame of the parent shows every carried character alone: sourced anew, the characters in words" };
}

/** The canon's search order (owner 2026-09-26; both design reviews): the parent's own ancestors nearest first, then every other gen of the canon newest
 *  first. `rows` are the app's rows of one root, [{ id, parent_id, created_at }]; the parent's own row is left out. Pure. */
export function canonOrder(rows = [], parentRow = "") {
  const list = (Array.isArray(rows) ? rows : []).filter((r) => r && r.id);
  const byId = new Map(list.map((r) => [String(r.id), r]));
  const up = [];
  for (let at = String(byId.get(String(parentRow))?.parent_id || ""), guard = 0; at && byId.has(at) && guard < 64; at = String(byId.get(at).parent_id || ""), guard++) up.push(byId.get(at));
  const rest = list.filter((r) => String(r.id) !== String(parentRow) && !up.includes(r)).sort((a, b) => Date.parse(b.created_at || 0) - Date.parse(a.created_at || 0));
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
