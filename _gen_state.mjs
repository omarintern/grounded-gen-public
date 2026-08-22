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
export function assembleGenState({ id, slug, prompt_text, refs, aspect, duration, endpoint, queue_id, engine = "grounded-1.0" }) {
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
        return { order, file: String(file), filename, role: refRole(file, order) };
      });
    })(),
    aspect: String(aspect || ""),
    duration: String(duration || ""),
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
export function planDigest(plan) {
  if (!plan || typeof plan !== "object") return null;
  return {
    subject: plan.subject || null,
    figures: (Array.isArray(plan.figures) ? plan.figures : []).map((f) => ({
      name: f?.name || null, kind: f?.kind || null, canonical_name: f?.canonical_name || null,
      promptRef: f?.promptRef || null, canon: (f?.canon && typeof f.canon === "object") ? f.canon : null,
      public_domain: f?.public_domain === true ? true : undefined, drawn: f?.drawn === true ? true : undefined,
    })),
    places: Array.isArray(plan.form?.places) ? plan.form.places : [],
    vantage: (Array.isArray(plan.slots?.vantage) ? plan.slots.vantage : []).map((v) => ({ beat: v?.beat ?? null, scope: v?.scope || null, queries: Array.isArray(v?.queries) ? v.queries : [], kernel: v?.kernel || null })),
    scene_requirements: Array.isArray(plan.scene_requirements) ? plan.scene_requirements : [],
    cuts: plan.execution?.cuts === true,
  };
}
