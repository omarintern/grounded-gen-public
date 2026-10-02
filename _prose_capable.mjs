// CONCEPT vs INSTANCE — decides whether a figure's identity can ride in PROSE or needs a CHARACTER REFERENCE.
//
// THE AXIS (owner 2026-07-30, REFINED 2026-08-04): DIFFUSE ARCHETYPE vs CANONICAL ORIGINAL.
//   PROSE    → a long-standing MYTHICAL / FOLK / LITERARY archetype with countless INDEPENDENT depictions and NO
//              single official original — Santa Claus, the White Rabbit, the Grim Reaper, Robin Hood. The model
//              holds a large diffuse prior, so the NAME summons it and any faithful version counts. A char-ref
//              actively HURTS (a Santa vector ref gave a cartoon; a Santa photo ref gave one stranger; PROSE BEAT
//              BOTH) and induces camera movement.
//   CHAR-REF → a CANONICAL ORIGINAL whose exact look lives in pixels — EITHER one particular real INSTANCE
//              ("Punch monkey" = ONE macaque, no name summons it) OR one CREATOR/STUDIO-OWNED DESIGN (Mickey,
//              Garfield, the Cat in the Hat, Disney's Peter Pan). ⚠ NOT keyed on public_domain: this is
//              REPRESENTABILITY, not ©. Early Mickey is public-domain yet STILL needs a ref — a generic
//              description renders a generic mouse, not THE canonical design (owner 2026-08-04, over the deconstruct
//              test: Mickey/Cat-in-Hat/Peter-Pan all read "describable" yet each needs its owner-defined original).
//
// WHY WE ASK THE MODEL RATHER THAN MEASURING DEPICTION VARIANCE. Variance (many different depictions = concept,
// same animal every frame = instance) is free from the scrape, but it is a SYMPTOM, and it breaks both ways:
//   • a concept with ONE dominant canonical look (Mickey, Hello Kitty) scrapes LOW variance → misread as instance
//   • an instance that has been widely remixed / photoshopped scrapes HIGH variance → misread as concept
// The question we actually care about is "will the NAME summon this?" — so ask the model that directly. It also
// interrogates the same model family that will do the generating, which no external statistic can.
//
// ⚠ WE TEST SPECIFICITY, NOT CONFIDENCE. Models assert fluently about things they do not know. A real prior
// returns CONCRETE FIXED SIGNATURES (species, colouring, garment, carried prop); a missing one returns hedged
// generalities ("a cute animal, often depicted in various ways"). So we require the signatures and count them.
import { providerJson, textPart } from "./provider-llm.mjs";

/**
 * Decide PROSE vs CHAR-REF for a figure, from its name (no image, no scrape), in the sense the maker's sentence gives it when `opts.context` carries
 * their words (owner 2026-10-02: "nordics" alone is a region; in their sentence, a being).
 * Returns { mode: "prose"|"charref", signatures: string[], reason: string } — never throws.
 */
export async function proseCapable(name, opts = {}) {
  const minSigs = Number(opts.minSignatures ?? 3);
  try {
    const j = await providerJson([
      textPart(
        `Return ONLY JSON {"known":bool,"has_canonical_original":bool,"signatures":["..."],"note":"one short line"}. ` +
        `The name is: "${name}".${opts.context ? ` The maker wrote it in: "${String(opts.context).replace(/\s+/g, " ").trim().slice(0, 600)}" — a name with several senses means the one THE SENTENCE GIVES IT; answer for that thing.` : ""} Answer from YOUR OWN knowledge — you are NOT being shown any picture.\n` +
        `known = do you reliably know what this looks like from the name alone, well enough that an illustrator ` +
        `following your description would draw the RIGHT thing? Answer false if you are guessing or if the name ` +
        `could refer to many unrelated things.\n` +
        `has_canonical_original = must a FAITHFUL rendering match ONE specific canonical original — EITHER one ` +
        `particular REAL thing (a single viral cat, one specific monkey, one named pet, identifiable only by having ` +
        `seen ITS photographs) OR one CREATOR/STUDIO-OWNED canonical DESIGN whose exact look its owner defines ` +
        `(Mickey Mouse, Garfield, Sonic, the Cat in the Hat, Disney's Peter Pan)? TRUE for BOTH — the exact original ` +
        `lives in pixels, so a reference is required; a generic description renders a GENERIC version, not THE ` +
        `character. FALSE only for a DIFFUSE folk / myth / literary ARCHETYPE with countless INDEPENDENT depictions ` +
        `and NO single official original, which anyone can picture and any faithful version counts (Santa Claus, the ` +
        `White Rabbit, the Grim Reaper, Robin Hood). ⚠ "the model knows what it looks like" is NOT the test — the ` +
        `model knows Mickey too; the test is whether ONE owner-defined canonical original exists that a generic ` +
        `description cannot reproduce.\n` +
        `signatures = the FIXED visual identifiers you would give an illustrator: species/build, colouring or ` +
        `markings, signature garment, carried prop. CONCRETE nouns only. ⚠ Do NOT pad this list — if you cannot ` +
        `name a signature with confidence, leave it out. An empty or vague list is the correct answer for ` +
        `something you do not actually know, and is far more useful to us than a confident guess.`
      ),
    ], { maxTokens: 3000, temperature: 0.1 });   // ROOM (2026-09-23, see provider-llm): cut off at 700 on live jobs, answers at 1170-1400

    // an answer that never says whether it knows the name is no answer: a failed read, never "the model does not know it" (build check, 2026-10-02)
    if (!j || typeof j !== "object" || typeof j.known !== "boolean") return { mode: "charref", signatures: [], failed: true, reason: "probe failed (no usable answer) → ref" };
    const sigs = (j?.signatures || []).filter((s) => typeof s === "string" && s.trim().length > 2);
    // PROSE requires BOTH: a real prior (known) AND that it is not a one-off individual, AND enough concrete
    // signatures to actually write the clause with. Any shortfall falls back to a reference — the safe error,
    // because a missing ref shows up loudly (you get a generic animal) while a wrong ref fails quietly.
    const prose = j?.known === true && j?.has_canonical_original === false && sigs.length >= minSigs;
    return {
      mode: prose ? "prose" : "charref",
      canonical: j?.has_canonical_original === true,   // one canonical original owns the name (read by describedLook)
      signatures: sigs,
      reason: prose
        ? `diffuse archetype, no canonical original (${sigs.length} signatures) → prose carries it`
        : j?.has_canonical_original === true ? "one canonical original (an owner-defined design or a real instance) — pixels carry it, not a description"
        : j?.known !== true ? "model does not reliably know it from the name"
        : `only ${sigs.length} concrete signature(s), need ${minSigs}`,
    };
  } catch (e) {
    // FAIL TOWARD THE REFERENCE: if we cannot tell, the loud failure is better than the quiet one.
    return { mode: "charref", signatures: [], failed: true, reason: `probe failed (${String(e.message).slice(0, 50)}) → ref` };
  }
}

/** THE LOOK OF A FIGURE CARRIED IN WORDS, read in the sense the maker's sentence gives its name (owner 2026-10-02, job e7ea8106). A figure is described only
 *  on a look that was actually read: `ok` is false when one canonical original owns the name (pixels carry it, never a description) and when the look could
 *  not be read (an outage proves nothing, and a name nobody checked is never written as the maker's own; both build checks). @fed the name and the maker's
 *  words; `look` is injected by the tests. */
export async function describedLook(name, context = "", { look = proseCapable } = {}) {
  let pc = null; try { pc = await look(name, { context }); } catch { pc = null; }
  const why = String(pc?.reason || "");
  if (!pc || pc.failed === true || /probe failed/i.test(why)) return { ok: false, why: "its look could not be read" };
  if (pc.canonical === true || (pc.mode === "charref" && /canonical original/i.test(why))) return { ok: false, why: "one canonical original owns it" };
  return { ok: true, signatures: (Array.isArray(pc.signatures) ? pc.signatures : []).filter(Boolean) };
}

// CLI: node _prose_capable.mjs "Santa Claus" "punch monkey" …
if (process.argv[1] && process.argv[1].endsWith("_prose_capable.mjs")) {
  for (const n of process.argv.slice(2)) {
    const r = await proseCapable(n);
    console.log(`  ${r.mode === "prose" ? "PROSE   " : "CHAR-REF"}  ${n.padEnd(34)} ${r.reason}`);
    if (r.signatures.length) console.log(`            ↳ ${r.signatures.join(" · ")}`);
  }
}
