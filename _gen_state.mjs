// GEN-STATE — the remix substrate (owner 2026-08-21: «remixes should allow users to remix a video with the
// input box being their intent … the key is correctly changing the prompt of that which is remixed»).
//
// A remix is a DIFF against a stored state, never a fresh prompt — so every gen persists, at the moment of
// generation, the exact inputs that made it: the verbatim prompt text seedance received, the ref bag in
// ORDER (order 0 is the world by the PAD_WORLD law), and the plan digest including the CLEARANCE FACTS
// (figure kinds, canonical names, public_domain verdicts) so a remix re-clears only the intent's DELTA —
// kept elements inherit the parent's clearance (owner: scoped, not the entire doctrine re-run).
//
// ⚠ WHY THIS MODULE EXISTS AT ALL: the pipeline's own artifacts are keyed by prompt SLUG and clobbered on
// re-run, and the container's out/ dies on redeploy — nothing on disk was remix-grade. This record is keyed
// by JOB ID, written by the gen itself (which alone knows its refs), enriched by the server (which alone
// knows the job), and archived to the app's clip store by the delivery hook (the cross-lane seam) — status
// walks pending_archive → archived as the durable URLs land.
//
// ⚠ ENGINE-TAGGED AND ENGINE-LOCKED: engine "grounded-1.0" here; another engine's video can never remix a 1.0 state
// and vice versa (owner ruling) — the tag is the lock.

/** Role by the pipeline's own naming law. Order 0 is ALWAYS the world (frame zero) — that is positional
 *  law (PAD_WORLD pads refs[0]), not filename inference; filenames classify the rest. */
export function refRole(file, order) {
  if (order === 0) return "world";
  const p = String(file || "");
  const f = p.split("/").pop() || "";
  if (/^entity_/.test(f) || /refs_redacted|\bipref_/.test(p)) return "figure";
  if (/_cut(?:early)?\d+\.jpg$/i.test(f)) return "cut";
  if (/^world_/.test(f)) return "world";
  return "ref";
}

/** The core record, written by the gen at submission time — everything the child alone knows. */
export function assembleGenState({ id, slug, prompt_text, refs, refNames = [], aspect, duration, resolution, endpoint, queue_id, engine = "grounded-1.0" }) {
  return {
    id: String(id || slug || ""),
    engine,
    slug: String(slug || ""),
    prompt_text: String(prompt_text || ""),
    // ⚠ FLAT BASENAMES, PER THE ARCHIVE HOOK'S CONTRACT (billing lane): role and order live in FIELDS,
    // never filenames; the hook fetches exactly these filenames from GET /gen/:id/ref/:filename and
    // uploads to gen-state/<id>/<filename>. A basename collision (two refs, one name) is disambiguated
    // by an order prefix — deterministic, still flat.
    refs: (() => {
      const seen = new Set();
      return (Array.isArray(refs) ? refs : []).map((file, order) => {
        let filename = String(file).split("/").pop() || `ref${order}.jpg`;
        if (seen.has(filename)) filename = `${order}_${filename}`;
        seen.add(filename);
        // whom this picture shows, by its place in the bag (2026-09-25: a photo shows one, a parent's frame may show two, and is marked a frame so a later
        // remix never takes it for a character's own photo; a path is no key, the gen re-encodes some files)
        const who = Array.isArray(refNames) ? refNames[order] : null;
        const names = (Array.isArray(who) ? who : Array.isArray(who?.names) ? who.names : []).filter((n) => typeof n === "string" && n.trim());
        return { order, file: String(file), filename, role: refRole(file, order), ...(names.length ? { names } : {}), ...(who?.frame === true ? { frame: true } : {}) };
      });
    })(),
    aspect: String(aspect || ""),
    duration: String(duration || ""),
    resolution: String(resolution || ""),   // the quality rendered (2026-09-20: 480p, 720p, 1080p); shown on the video by the app
    endpoint: String(endpoint || ""),
    queue_id: queue_id || null,
    parent_id: null,
    root_id: null,
    status: "pending_archive",
  };
}

/** The clearance column's content — the figure verdicts a remix INHERITS for kept elements (owner's
 *  scoped-clearance ruling): identity + kind + public_domain/drawn. Falsy-safe. */
export function clearanceFacts(digest) {
  if (!digest) return null;
  return {
    figures: (digest.figures || []).map((f) => ({
      name: f?.name ?? null, canonical_name: f?.canonical_name ?? null, kind: f?.kind ?? null,
      public_domain: f?.public_domain === true ? true : undefined, drawn: f?.drawn === true ? true : undefined,
    })),
  };
}

/** The two-writer table (billing lane's migration 0048, applied 2026-08-21): the ENGINE inserts the row at
 *  enrichment; their 2-minute sweep archives refs to R2, writes urls into the entries, flips archived.
 *  ON CONFLICT DO NOTHING — an insert is idempotent, never an update; the sweep owns all later writes.
 *  A failed insert is loud and terminal for remixability of that one gen: the sweep can only archive rows
 *  it can see. Absent DATABASE_URL (local dev) → no-op false. */
export async function insertGenState(st, env = process.env) {
  if (!env.DATABASE_URL || !st?.id) return false;
  const { default: postgres } = await import("postgres");
  const sql = postgres(env.DATABASE_URL, { ssl: /localhost|127\.0\.0\.1/.test(env.DATABASE_URL) ? false : "require", max: 1 });
  try {
    // aspect/duration ride the row as of the billing lane's 0052 (measured missing 2026-08-22: every
    // DB-loaded parent remixed at the 9s/9:16 defaults — and ALL 14 feed clips were 6s, one 16:9, so the
    // "dormant" assumption was false twice over).
    await sql`INSERT INTO gen_state (id, engine, prompt_text, refs, plan, clearance, parent_id, root_id, status, aspect, duration)
      VALUES (${st.id}, ${st.engine}, ${st.prompt_text}, ${sql.json(st.refs)}, ${sql.json(st.plan ?? null)}, ${sql.json(clearanceFacts(st.plan))}, ${st.parent_id}, ${st.root_id}, ${st.status}, ${st.aspect || null}, ${st.duration || null})
      ON CONFLICT (id) DO NOTHING`;
    return true;
  } finally { await sql.end({ timeout: 2 }).catch(() => {}); }
}

/** The plan digest the server joins in at completion — identity, canon and clearance facts only; the full
 *  plan stays on disk for forensics, this is what a remix NEEDS. Falsy-safe: no plan → null digest. */
/** ⭐⭐ THE CAST AS THE TAKE SAW IT (remix f99f79a5, 2026-09-23): the run writes each figure's look as it rode the take into plan.cast_realized
 *  (edited, dressed, de-named — and the owned figures carried only in prose, which the planner's figures never held). A digested figure takes its
 *  realized look; a realized figure the planner never cast joins the digest, so a remix can keep it. A plan without the record digests as before. Pure. */
export function realizedFigures(figs = [], realized = []) {
  const key = (x) => String(x || "").toLowerCase().replace(/\s+/g, " ").trim();
  const real = (Array.isArray(realized) ? realized : []).filter((r) => r && key(r.name) && String(r.promptRef || "").trim());
  if (!real.length) return figs;
  const out = figs.map((f) => { const r = real.find((x) => key(x.name) === key(f.name) || (f.canonical_name && key(x.name) === key(f.canonical_name))); return r ? { ...f, promptRef: String(r.promptRef).trim(), realized: true } : f; });
  for (const r of real) if (!out.some((f) => key(f.name) === key(r.name) || (f.canonical_name && key(f.canonical_name) === key(r.name))))
    out.push({ name: r.name, kind: r.kind || "ip", canonical_name: r.canonical_name || null, promptRef: String(r.promptRef).trim(), canon: null, what_it_is: (typeof r.what_it_is === "string" && r.what_it_is.trim()) || undefined, realized: true });
  return out;
}
export function planDigest(plan) {
  if (!plan || typeof plan !== "object") return null;
  const d = _digest(plan);
  d.figures = realizedFigures(d.figures, plan.cast_realized);
  return d;
}
function _digest(plan) {
  return {
    subject: plan.subject || null,
    form_device: plan.form?.mediaForm || plan.appropriation?.form || null,   // the capture form the request named (2026-09-21): a reframing remix keeps it
    figures: (Array.isArray(plan.figures) ? plan.figures : []).map((f) => ({
      name: f?.name || null, kind: f?.kind || null, canonical_name: f?.canonical_name || null,
      promptRef: f?.promptRef || null, canon: (f?.canon && typeof f.canon === "object") ? f.canon : null,
      public_domain: f?.public_domain === true ? true : undefined, drawn: f?.drawn === true ? true : undefined,
      // THE REST OF THE REALIZATION (owner 2026-09-21, "time in a bottle"): a reframing remix adopts a kept figure as the parent realized it —
      // the same de-naming, the same signatures, the same standing — instead of resolving it again. Set-if-present, falsy-safe.
      term: (typeof f?.term === "string" && f.term.trim()) || undefined, what_it_is: (typeof f?.what_it_is === "string" && f.what_it_is.trim()) || undefined,
      defining_signatures: (typeof f?.defining_signatures === "string" && f.defining_signatures.trim()) || undefined,
      basic_guise: typeof f?.basic_guise === "boolean" ? f.basic_guise : undefined, canonical: typeof f?.canonical === "boolean" ? f.canonical : undefined,
      meme_in_context: typeof f?.meme_in_context === "boolean" ? f.meme_in_context : undefined,
      public_figure: typeof f?.public_figure === "boolean" ? f.public_figure : undefined,
      household_name: typeof f?.household_name === "boolean" ? f.household_name : undefined,
      // a look this remix changed (owner 2026-09-26, the canon strip rule): a frame made before the change never carries the character again
      look_changed: f?.look_changed === true ? true : undefined,
    })),
    places: Array.isArray(plan.form?.places) ? plan.form.places : [],
    // the film strip that carried this remix's characters (owner 2026-09-26): { mode: carry|canon|reuse|anew, from } (_strip_choice.mjs)
    carried_from: plan.carried_from && typeof plan.carried_from === "object" && plan.carried_from.mode ? { mode: String(plan.carried_from.mode), ...(plan.carried_from.from ? { from: String(plan.carried_from.from) } : {}) } : undefined,
    // (the figures above are then overlaid with the cast AS THE TAKE SAW IT — realizedFigures, below)
    vantage: (Array.isArray(plan.slots?.vantage) ? plan.slots.vantage : []).map((v) => ({ beat: v?.beat ?? null, scope: v?.scope || null, queries: Array.isArray(v?.queries) ? v.queries : [], kernel: v?.kernel || null })),
    scene_requirements: Array.isArray(plan.scene_requirements) ? plan.scene_requirements : [],
    cuts: plan.execution?.cuts === true,
  };
}
