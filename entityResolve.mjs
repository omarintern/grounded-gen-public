// 🔒 CONFORMS TO GROUNDED_GEN_WORKFLOW.md (LOCKED doctrine) — change grounded-gen rules THERE first, then here.
// ENTITY RESOLVER (probe→remember) — the brain's front step that catches real, specific subjects the
// LLM's frozen memory doesn't know (recent / viral / niche). The manifest's fast-model brain confidently
// FLATTENS post-training entities to generic (validated: "punch monkey" → a chimpanzee, dropping the
// real viral macaque + its plush). Fix: before classifying, resolve named subjects against the LIVE
// web index — current where the model is stale.
//
// Two stages:
//   1. EXTRACT candidate named subjects (web-search OFF — cheap): the things a viewer recognizes AS
//      something; generic scene/action words are NOT candidates.
//   2. RESOLVE each unknown one with a web-search ON identity probe FRAMED TO HUNT for a specific
//      entity ("is there a specific X called this?" — NOT "what is X?", which defaults to the generic).
//      Validated: the hunt framing found Punch (Japanese macaque + orange plush) at confidence 1 with
//      no hint; "what is punch monkey" returned the boxing toy.
//
// probe→remember: the result is cached in remember.json keyed by the subject term. A store hit is a
// LOCAL read (0 tokens, 0 web-search) — so the (web-search-heavy) probe fires ~ONCE per never-seen
// subject, then never. Web search stays OFF on every other call (providerJson default). Same pattern as
// the clearance registry.
//   node entityResolve.mjs "<user prompt>"
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { providerJson, textPart } from "./provider-llm.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
// Paths are env-overridable so the seed/store merge can be exercised against real files in a test
// rather than asserted by grepping this source — the weakness that let two defects through today.
const STORE = process.env.ENTITY_STORE || join(HERE, "out", "_entities", "remember.json");
// ⚠ THE LEARNED STORE NEVER REACHED PRODUCTION, AND A COLD CACHE IS INVISIBLE. remember.json lives under
// out/, which is gitignored AND excluded from the deploy upload — and the deploy path is
// monorepo → `git subtree split` → grounded-gen → `deploy`, so ONLY GIT-TRACKED FILES SURVIVE. An
// untracked cache cannot reach the checkout that ships, whatever .railwayignore says about it. So every
// container run re-probed from scratch against LIVE WEB SEARCH — the one input that changes on its own —
// and two identical prompts could resolve differently for no reason the logs would show.
// (Same reasoning .railwayignore already gives for the ref caches: "a cold cache looks exactly like a subject
// nobody has sourced yet." ⚠ CORRECTED 2026-08-11, verified on the container: success_store/ IS tracked, 19/19
// since 4a14f2c, and all 19 files ARE present on the container — it does not have this problem. The two that
// do are ref_cache/ (0 tracked) and canonical_refs/ (0 tracked), both confirmed absent at runtime, for whom
// the .railwayignore exemption is inert because they were never in the checkout to exclude. They differ in
// KIND, so they want different fixes: canonical_refs is curated, so it should be TRACKED on the same reasoning
// as success_store; ref_cache is runtime-accumulated and persists on the volume, so it warms itself after the
// first runs and a seed there is an optimisation, not a correctness fix.)
//
// ⚠ AND SHIPPING IT INSIDE out/ WOULD NOT HAVE WORKED. The runtime volume mounts at /app/out, so anything the
// image carries there is MASKED at boot. The seed therefore lives at the engine ROOT, where the image keeps it.
//
// Two files, two jobs: SEED is tracked, ships, and is read-only at runtime; STORE is the volume-backed store
// the run writes. Reads merge seed-then-store so a learned verdict always beats a shipped one; writes only
// ever touch STORE, so a deploy can never clobber what production learned.
const SEED = process.env.ENTITY_SEED || join(HERE, "entity_seed.json");
// ⚠⚠ A CACHED VERDICT OUTLIVES THE CLASSIFIER THAT PRODUCED IT, AND A CACHE HIT SKIPS THE PROBE ENTIRELY.
// So changing the probe's schema changes NOTHING for any term already in the store or the shipped seed — the
// fix deploys, the run hits cache, and the old answer wins forever. Measured 2026-08-11: the `venue` bucket
// landed and "seaworld" was still cached generic on the container, with "camp nou" ("a famous football
// stadium") cached generic in the SEED. The fix would have been inert on the exact prompt that motivated it.
// BUMP THIS WHENEVER THE PROBE'S QUESTION OR ITS `kind` LIST CHANGES.
//   1 → the original classifier
//   2 → adds `venue` (named places / chains / organisations were unclassifiable and fell to generic)
// ⚠ ONLY *GENERIC* VERDICTS ARE INVALIDATED, and that is not laziness — it is what the change can affect.
// Adding a category can only move an answer FROM generic TO something; it cannot unmake a positive
// identification. Dropping the `true` entries too would re-probe the whole warm cache to relearn what it
// already knows correctly, which is real money for no change in answer.
const PROBE_VERSION = 2;
const norm = (s) => String(s || "").toLowerCase().trim().replace(/\s+/g, " ");
/** Entries the OLD thrown-probe path wrote, which are indistinguishable from a verdict except by SHAPE.
 *  ⚠ THE FIX FORWARD DOES NOT UNDO THE DAMAGE ALREADY PERSISTED. Before 2026-08-11 a thrown probe was
 *  coalesced to `{specific_entity_found:false}` and written to the store, where a cache hit short-circuits
 *  the probe forever — so those terms stay wrong for every future run on this volume. They are recognisable:
 *  the failure path could only ever write that ONE key, while a real generic verdict comes back carrying
 *  what_it_is / kind / confidence / defining_signatures. Measured across 63 resolved entries: genuine
 *  generics carried 5-12 fields; exactly one entry (`world cup trophy`) had the bare 1-field shape.
 *  Dropping it costs one re-probe; keeping it costs a permanently wrong answer, so the asymmetry is clear.
 *  A real verdict that happens to arrive minimal is also dropped — same cheap cost, and it will be re-asked. */
export const isPoisonedEntry = (v) =>
  // Boolean-coerced deliberately: `v && …` returns v itself for null, so the predicate answered `null` rather
  // than false. Harmless inside .filter(), wrong for anything that compares the result — and a gate whose
  // answer is not the type it claims is how a truthiness check drifts from an identity one.
  !!(v && typeof v === "object" && v.specific_entity_found === false && Object.keys(v).filter((k) => k !== "_pv").length < 2);

let storeHealed = false;   // set when loadStore drops a thrown-probe entry, so the heal is PERSISTED
const readJson = (p) => { try { return JSON.parse(readFileSync(p, "utf8")); } catch { return {}; } };

export const loadStore = () => {
  storeHealed = false;
  // Seed first, learned store second, so a verdict production actually probed always beats the shipped one.
  // The seed is never written back — see SEED above.
  const seed = readJson(SEED), live = readJson(STORE);
  const raw = { ...seed, ...live };
  const seedOnly = Object.keys(seed).filter((k) => !(k in live)).length;
  if (seedOnly) console.log(`[resolve] seed supplied ${seedOnly} entr${seedOnly === 1 ? "y" : "ies"} this run would otherwise have re-probed`);
  const stale = Object.keys(raw).filter((k) => {
    const v = raw[k];
    return v && typeof v === "object" && v.specific_entity_found === false && (Number(v._pv) || 1) < PROBE_VERSION;
  });
  if (stale.length) {
    for (const k of stale) delete raw[k];
    storeHealed = true;
    console.warn(`[resolve] \u26a0 dropped ${stale.length} GENERIC verdict${stale.length === 1 ? "" : "s"} from an older classifier (v<${PROBE_VERSION}) \u2014 they will be re-probed: ${stale.map((k) => `"${k}"`).join(", ")}`);
  }
  const bad = Object.keys(raw).filter((k) => isPoisonedEntry(raw[k]));
  if (bad.length) {
    for (const k of bad) delete raw[k];
    storeHealed = true;   // force a save even if this run probes nothing, or the poison survives to the next run
    console.warn(`[resolve] ⚠ dropped ${bad.length} cached entr${bad.length === 1 ? "y" : "ies"} written by a THROWN probe, not a verdict (${bad.map((k) => `"${k}"`).join(", ")}) — they will be re-probed`);
  }
  return raw;
};
// ⚠ NEVER WRITE THE SEED BACK INTO THE LIVE STORE. loadStore returns seed+live merged, so saving that object
// verbatim would copy every shipped entry into the volume — and because live overrides seed on read, a later
// CORRECTION to the seed could then never take effect: the stale copy would win forever. Persist only what
// this machine actually learned, i.e. entries the seed does not already hold identically.
export const saveStore = (s) => {
  const seed = readJson(SEED);
  const learned = {};
  for (const [k, v] of Object.entries(s)) {
    if (JSON.stringify(seed[k]) === JSON.stringify(v)) continue;   // identical to the shipped answer — not ours to keep
    learned[k] = v;
  }
  mkdirSync(dirname(STORE), { recursive: true });
  writeFileSync(STORE, JSON.stringify(learned, null, 2));
};

/** Build the shipped seed from what this machine has learned. The seed is TRACKED, so this is how a warm
 *  cache reaches production at all — an untracked file cannot survive the subtree split into grounded-gen.
 *  Poisoned entries are refused rather than baked in: shipping a thrown-probe verdict would make it permanent
 *  on every container at once, which is the same bug with a wider blast radius.
 *    node entityResolve.mjs --build-seed */
export function buildSeed() {
  const live = readJson(STORE), seed = readJson(SEED);
  const merged = { ...seed, ...live };
  const out = {}, refused = [];
  for (const [k, v] of Object.entries(merged)) {
    if (isPoisonedEntry(v)) { refused.push(k); continue; }
    out[k] = v;
  }
  writeFileSync(SEED, JSON.stringify(out, null, 2));
  return { written: Object.keys(out).length, refused };
}

// Stage 1 — candidate named subjects (web-search OFF). Generic scene/action words are NOT candidates.
/** EXPORTED FOR AUDIT. This is the input the branch router gates on: candidateCount === 0 is the ONE
 *  condition under which the copyright doctrine is dropped, so a FALSE NEGATIVE here (a celebrity the
 *  extractor does not notice) routes a real person to the non-copyright branch and produces a plan with
 *  redactRefs=true and strip:[] — blur on, nothing named to blur. A gate input that cannot be inspected
 *  cannot be trusted; this export exists so its recall can be measured directly, without paying for the
 *  web-search resolution step behind it. */
export async function extractCandidates(userPrompt) {
  try {
    const j = await providerJson([textPart(
      `Return ONLY JSON {"terms":["..."]}. From this video prompt, list the distinct terms that NAME something SPECIFIC. THE TEST IS GROUNDING: must the video be GROUNDED in this exact thing, or is it free to INVENT one? If a viewer would recognise a particular thing and being given a different one would be WRONG, it is a term; if any instance of it would do, it is not. Apply that test to WHO OR WHAT APPEARS and, equally, to WHAT WORK OR PLACE THE SCENE BELONGS TO — a named work qualifies HOWEVER IT IS INVOKED: as its people, or as its scene, setting, staging or props. ⚠ NAME A WORK BY ITS TITLE AND NOTHING ELSE — never wrap it in the scene, moment or action it is being invoked for, because the title is what identifies it and the rest is what the video is doing with it. A group of real people named collectively is ONE term. EXCLUDE anything the video may invent: generic scene and action words, which a viewer could not get wrong. \u26a0 A NAME IS A LABEL, NOT A DESCRIPTION. Ask what a reference work would file the thing under. If the phrase instead describes what something LOOKS LIKE, is WEARING, or is DOING, it is not a name however vivid or character-like it reads - strip the descriptive attributes and if what is left is an ordinary common noun, return nothing for it. A phrase introduced by an indefinite article is a description UNLESS the words inside it are themselves a proper name. WHY THIS MATTERS: an invented term cannot be verified against the web, and an unverifiable candidate is treated as an unconfirmed celebrity - so a costumed or personified ordinary animal gets routed into the copyright doctrine and priced there. Absurd and whimsical phrasing is EXPECTED in these prompts and is not evidence of a named character. ⚠ A QUALIFIER THAT DISAMBIGUATES IS PART OF THE NAME. When the prompt narrows a subject by its source or work - "X from Y", "the X in Y", "Y's X" - the WHOLE phrase is ONE term. The qualifier is doing the identifying work: a common name belongs to many different works at once, so the bare head noun names a DIFFERENT thing than the qualified phrase does. Never emit the head noun and its qualifier as two separate terms - that both discards the identification the user supplied and asserts the source work is itself a subject to be grounded. Keep each term exactly as the user phrased it; return [] if there are none.\n\nPROMPT:\n"""${userPrompt}"""`
    )], { maxTokens: 400, temperature: 0.1 });
    return Array.isArray(j?.terms) ? [...new Set(j.terms.filter((t) => typeof t === "string" && t.trim()).map((t) => t.trim()))] : [];
  } catch (e) {
    // ⚠ AN EMPTY ARRAY HERE MEANS "THIS PROMPT NAMES NOBODY", AND THAT ANSWER DROPS THE COPYRIGHT DOCTRINE.
    // Returning it on a THROWN error made a network hiccup, a 429 or a malformed JSON body indistinguishable
    // from a clean "a raccoon in a kitchen" — and branchOf reads candidateCount===0 as safely non-©. So a
    // failed extraction on "leo messi scoring in a kitchen" planned a real person on the branch that assumes
    // there is no real person: no blur, no distance rule, no de-naming. The verify-step safety net cannot
    // catch it either, because the failure happens BEFORE there is a name to fail to verify.
    // Mark the array instead. Callers that only read it as a list are unaffected.
    const failed = [];
    failed.failed = true;
    console.warn(`[resolve] ⚠ EXTRACTION FAILED (${String(e?.message || e).slice(0, 90)}) — cannot tell "names nobody" from "could not look"; failing CLOSED to the copyright branch`);
    return failed;
  }
}

// Stage 0 — COMPREHENSION. Runs BEFORE extraction, and exists because nothing used to.
// ⚠ WHY THIS IS FIRST. Until now the first question ever asked of a prompt was a narrow mechanical one
// ("which phrases name something specific?"), and its answer selected the doctrine every later stage reads.
// guardUserInput is a regex, extractCandidates is asked only about names, and probe() receives a term with no
// prompt attached at all — so the branch was committed by two context-free calls before anything read the
// REQUEST. Measured consequence (owner, 2026-08-11): "the chef in Ratatouille … but the chef is instead the
// white rabbit" resolved the chef as a figure to GROUND, and the char-ref loop sourced the character the
// prompt had just said was being replaced. No stage held the fact that a figure can be displaced; the whole
// chain only knew actor-vs-incidental, so a vacated slot sailed through as a performer.
// The fix is not another rule downstream — it is asking what the prompt MEANS before deciding what it IS.
//
// ⚠ TWO INDEPENDENT QUESTIONS, NOT A LIST OF INTENT TYPES. Enumerating intents ("appropriation", "swap",
// "montage") would sample at its edges exactly as the extractor's list of kinds did (see d5d9485). So this
// asks a TEST of every named thing instead: does the video SHOW it, and does naming it tell us what to FIND.
// Those are orthogonal — a thing can identify the material without appearing in it, which is precisely the
// case that had no representation.
export async function comprehend(userPrompt) {
  try {
    return await providerJson([textPart(
      `Return ONLY JSON {"reads":"string","subjects":[{"term":"string","renders":bool,"identifies_material":bool,"replaced_by":"string"}]}. For EVERY thing this video prompt NAMES, answer two INDEPENDENT questions.\n\nreads = one plain sentence describing what the finished video shows.\n\nrenders = will this thing BE IN the finished video? TRUE if a viewer watching it would see this thing.\n\nidentifies_material = does NAMING it tell us what footage or scene to GO AND FIND? TRUE when the name pins down a particular place, work, staging or moment that must be sourced rather than invented.\n\n⚠ THESE TWO ARE INDEPENDENT. Both can be true, both can be false, and either can be true alone. A thing can identify the material without ever appearing in it, and a thing can appear without identifying anything.\n\nreplaced_by = when the prompt puts SOMETHING ELSE in this thing's place — substituting it, swapping it, or saying it is instead something else — give that other thing's term, copied exactly as the user wrote it. Empty string when nothing displaces it.\n\n⚠ A DISPLACED THING STILL MATTERS AND MUST STILL BE LISTED. It will not be seen, but it usually identifies the material, because the scene is found by what was originally in it.\n\nCopy every term exactly as the user phrased it. Do not list generic scene or action words. Return an empty subjects array if the prompt names nothing.\n\nPROMPT:\n"""${userPrompt}"""`
    )], { maxTokens: 700, temperature: 0.1 });
  } catch (e) {
    // ⚠ FAILS TO TODAY'S BEHAVIOUR, NEVER TO "NO SPECIAL INTENT". A null here means we could not look, and the
    // callers below treat that as "every named thing is an ordinary candidate" — which is exactly what the
    // pipeline did before this function existed. Returning a confident empty structure instead would let an
    // outage silently assert that nothing is displaced, which is the borrowed-field failure in a new place.
    console.warn(`[comprehend] ⚠ FAILED (${String(e?.message || e).slice(0, 80)}) — proceeding without intent; every named thing stays an ordinary candidate`);
    return null;
  }
}

/** Is this resolved term a figure the video will NOT render because the prompt displaces it?
 *  ⚠ CONJUNCTION, DELIBERATELY. Suppressing a figure is the expensive direction — a false positive deletes a
 *  subject the user asked for and costs the whole generation. So it takes BOTH an explicit renders===false AND
 *  a named replacement that the prompt actually contains. One field alone never turns a figure off, and an
 *  absent or unparsed field leaves it on. */
export function displacedByPrompt(intent, term, userPrompt = "") {
  // ⚠ THE TWO STAGES DO NOT AGREE ON THE STRING, AND AN EXACT MATCH SILENTLY NEVER FIRES. Comprehension names
  // the thing as the sentence does ("the chef"); extraction applies the qualifier rule and returns "the chef in
  // Ratatouille". Keyed on equality this function would return false forever and read as "nothing is ever
  // displaced" — a gate that never fires looks exactly like a gate that always passes. Match on whole-word
  // containment in either direction, padded so a token boundary is required and "a boy" cannot match "boyhood".
  const t = norm(term), pad = (x) => ` ${x} `;
  const s = (intent?.subjects || []).find((x) => {
    const c = norm(x?.term);
    return c && (c === t || pad(t).includes(pad(c)) || pad(c).includes(pad(t)));
  });
  if (!s) return false;
  if (s.renders !== false) return false;
  const by = String(s.replaced_by || "").trim();
  if (!by) return false;
  return String(userPrompt).toLowerCase().includes(by.toLowerCase());
}

// Stage 2 — identity probe (web-search ON), framed to HUNT for a specific entity by this name.
// kind `ensemble` per GROUNDED_GEN_WORKFLOW.md: a show/film cast, band, or team is a GROUP OF PEOPLE
// (grounded as one cast group photo), NEVER an object — do not flatten it to `product`.
// ⚠ EXPORTED SO THE CLASSIFIER CAN BE TESTED FOR ONE TERM. Validating a probe change used to mean running the
// whole resolver (comprehension + extraction + every probe) or the 16-case tiered battery — both far more
// expensive than the question being asked, which pushes you toward not checking at all. One term, one call.
export async function probe(term) {
  try {
    const v = await providerJson([textPart(
      `Search the web for "${term}". Is it a GENUINELY RECOGNIZABLE, real, SPECIFIC entity — a real individual; a CAST / BAND / TEAM of real people (a TV/film cast, a music group, a sports team — a recognizable GROUP shown as people); a specific real animal; a WELL-KNOWN named fictional character; a real named PLACE, VENUE, CHAIN or ORGANISATION (SeaWorld, Starbucks, the Louvre, Wembley Stadium); a product; or a viral internet meme/sensation? Check recent viral content (2024-2026). ⚠ DEFAULT TO GENERIC. Return specific_entity_found=true ONLY when you can ACTUALLY VERIFY from the web that a real, specific, widely-recognizable entity goes by this exact name. DO NOT invent, guess, or infer a plausible-sounding identity for an unfamiliar name — a random / obscure / made-up name (an ordinary "Greg Dolan the plumber", "Margaret Voss the bookshop owner") is GENERIC, NOT a niche character to conjure. If the name is obscure or ambiguous, or you are relying on inference rather than verification, answer generic. confidence = how WELL-ATTESTED + widely-recognizable the entity is: reserve ≥0.8 for genuinely famous / verifiable entities, and use <0.5 whenever you are guessing or the name is obscure — a confident-sounding GUESS is still a guess, score it LOW. IMPORTANT: a TV show / film / band / team NAME, when it names PEOPLE to depict (its cast/members), is an ENSEMBLE — classify it \`ensemble\`, NOT \`product\`. Reserve \`product\` for an actual non-person good and \`generic\` when nothing specific verifiably matches. For an ensemble, defining_signatures = the group's collective recognizable look (era, wardrobe, lineup) so it can be scraped as a cast group photo. canonical_name = the SHORT COMMON NAME this entity is normally called, and nothing else: "Lionel Messi", "Central Perk", "Santa Claus", "Ring Video Doorbell", "Friends cast". ⚠ IT MUST BE THE SAME STRING EVERY TIME THIS ENTITY IS ASKED ABOUT, however the question was phrased — it is an identity label, not a description, so give the name a reference work would use as its title. NO sentences, NO explanation, NO parentheticals, NO qualifiers, NO article unless the name genuinely carries one ("The Beatles"). If the term is generic, repeat the term as given. carries_real_people = TRUE if PHOTOGRAPHS OF THIS ENTITY CHARACTERISTICALLY CONTAIN IDENTIFIABLE REAL PEOPLE — a TV show's set shot with its host or panel in it, a stadium with its players, a red carpet with its attendees, a talk-show desk with its guests. FALSE when the thing is normally photographed WITHOUT recognizable individuals: a product, a building, a landmark, a fictional character, an ordinary venue. ⚠ ASK WHETHER THE PEOPLE COME WITH THE PICTURE, not whether people could ever be near it — a supermarket has shoppers but no identifiable ones, so FALSE; the Shark Tank set is photographed with its judges, so TRUE. This decides whether a reference image sourced for this entity will arrive carrying faces that must be kept small, and it matters even when the video's own subject is nobody famous. ⚠⚠ A NAMED PLACE, VENUE, CHAIN OR ORGANISATION IS A SPECIFIC ENTITY — classify it \`venue\`. THIS BUCKET WAS MISSING AND IT MADE THE CHAIN DOCTRINE BELOW UNREACHABLE FOR EVERY CHAIN THAT HAS EVER EXISTED. The kind list offered no home for a place, so SeaWorld, Starbucks and Tesco — the very examples chain_venue is written around — came back \`generic\` with specific_entity_found=false, were dropped from the resolved list, and chain_venue was never read. Measured 2026-08-11: "seaworld" probed to specific_entity_found=false while its OWN what_it_is field read "A chain of marine mammal parks" — the probe identified it correctly and then threw it away for want of a label. A venue resolves like any other entity; canonical_name is what a reference work titles it ("SeaWorld", "the Louvre"). This does NOT loosen the DEFAULT-TO-GENERIC rule: an ordinary unnamed shop or an invented venue is still generic — \`venue\` is for a place a viewer would RECOGNISE and being given a different one would be WRONG. chain_venue = TRUE only for a CHAIN or FRANCHISE with MANY near-identical locations that ordinary people walk into and photograph incidentally: McDonald's, Starbucks, Subway, Tesco, a petrol-station brand, a bank branch. FALSE for a SINGULAR place people travel to and photograph deliberately - the Louvre, Wembley Stadium, Grand Central, a named hotel, a specific stadium or museum - and FALSE for anything that is not a venue at all. WHY: a chain interior is photographed by customers who are not trying to make a picture, so plain search reaches genuine ordinary interiors. A destination is photographed by people showing off the place, so the same search returns showpieces. The two want different queries. FAIL CLOSED: unsure -> FALSE, because the chain treatment REPLACES the scene query and getting that wrong on a landmark loses the scene. broadcast_only = TRUE when images of this thing exist ONLY as PROFESSIONAL BROADCAST OR PRESS OUTPUT, because no ordinary person with a phone can capture it: a TV show set or panel (the Shark Tank set), a televised sporting event (the 1986 World Cup final), a film scene, a stage a camera crew owns. FALSE whenever a CIVILIAN CAPTURE LAYER exists - anywhere the public walks in and photographs freely: a shop, a chain, a street, a museum or landmark tourists visit, an ordinary venue. WHY: you cannot get candidness out of a broadcast, so broadcast targets want the well-indexed general index, while anything with a civilian layer wants the user-upload corpora where the amateur frames actually live. ASK WHO HELD THE CAMERA, not whether the thing is famous - the Louvre is world-famous and photographed by millions of tourists, so FALSE. Unsure -> FALSE. drawn = TRUE when this entity's own imagery is DRAWN OR RENDERED rather than PHOTOGRAPHED — an animated series or film, a comic, a video game, an illustrated property. FALSE for anything shot with a camera, including live-action film and television, and including a real person however often they are caricatured. ⚠ ANSWER ABOUT THE ENTITY'S OWN MEDIUM, not about the scene being asked for: a real person placed INTO a cartoon is still drawn=FALSE, because the person is photographed; it is the CARTOON that is drawn. ⚠ WHY IT MATTERS: a drawn world has NO PHOTOGRAPH OF ITSELF, so everything downstream inverts — the plate is sourced from the general index rather than the civilian layer, it may not be reframed by an image model, and the usual photo gates would reject the only usable material. Getting this wrong is silent: the search runs, returns the wrong medium, and every candidate dies with no indication that the question was misread. is_set = TRUE when this entity HAS a RECOGNIZABLE PRODUCED SET / VENUE with DISTINCT FUNCTIONAL ZONES a scene is staged across - a TV or film show with an iconic set (Shark Tank, Friends' Central Perk), a broadcast event with a signature venue (UFC / the octagon, a game-show stage), a studio. ⚠ ORTHOGONAL TO the kind field: a title you classified as an ensemble (its cast) STILL HAS a set, so is_set is TRUE for it too - the cast and the set are two ASPECTS of the same title, and a scene staged in that place needs the SET, not the people. Such a place is best rendered by ASSEMBLING several shots of its zones, not one found photo, so it triggers the multi-component world-build path. ⚠ PRODUCED / BROADCAST ONLY: FALSE for an ordinary real place however large or famous - a generic cafe, a bar, a street, a shop, AND real public places like a museum, an airport, a mall, a landmark (the Louvre, Grand Central): those are ONE world-ref, source a single plate. FALSE also for a bare product / prop or a person. ASK: is this a PRODUCED environment (a show set, a broadcast venue) whose scene is STAGED across named areas a camera cuts between? Unsure -> FALSE (the single-ref path is the safe default). set_zones = when is_set, 2-4 of the set's SIGNATURE FUNCTIONAL ZONES as short plain noun phrases a camera could frame WIDE (Central Perk -> ["the orange couch and coffee table","the counter and menu board","the front entrance"]; a UFC arena -> ["the octagon from the crowd","the walkout tunnel","the announce desk"]). WIDE / establishing areas, NEVER close-ups. Empty [] when is_set is false. public_domain = TRUE only when this figure may be NAMED OUTRIGHT in a generated video because it is not anyone's protected property: folklore, myth, fairy tale, or a work whose copyright has expired. Santa Claus, Sinterklaas, Robin Hood, Dracula, King Arthur, the Easter Bunny, Baba Yaga are TRUE. A character owned by a studio or a company is FALSE however famous - Mario, Ronald McDonald, the Cat in the Hat, Mickey Mouse, Bugs Bunny, Spider-Man. FALSE for anything that is not a fictional character at all. WHY IT MATTERS: a public-domain figure is BETTER prompted by name - a video model resolves "Santa Claus" instantly, while describing him by signatures ("a heavyset bearded man in a red suit") is a strictly worse prompt AND loses the reading. A protected character must be de-named and carried by its signatures instead. FAIL CLOSED: when the status is contested or you are unsure, answer FALSE. Several famous cases are genuinely contested (Sherlock Holmes, Winnie-the-Pooh, early Mickey), and the costs are not symmetric - de-naming a public-domain figure only costs a clumsier prompt, while naming a protected one can trip the output gate and lose the whole generation. Return ONLY JSON {"specific_entity_found":bool,"canonical_name":"string","what_it_is":"string","kind":"real_person|ensemble|real_animal|ip_character|venue|product|meme|generic","carries_real_people":bool,"public_domain":bool,"chain_venue":bool,"broadcast_only":bool,"drawn":bool,"is_set":bool,"set_zones":["..."],"defining_signatures":"string","confidence":0-1}.`
    )], { maxTokens: 900, temperature: 0.1, webSearch: "on" });
    // Stamp the verdict with the classifier that produced it — see PROBE_VERSION.
    if (v && typeof v === "object") v._pv = PROBE_VERSION;
    return v;
  } catch (e) {
    // ⚠⚠ A THROWN PROBE IS NOT A VERDICT, AND IT USED TO BECOME A PERMANENT ONE. This catch returned null, the
    // caller coalesced it to {specific_entity_found:false}, and that object was written to remember.json — so a
    // 429, a timeout or a malformed body became a durable "this name is generic", never re-probed because a
    // store hit short-circuits the probe (only FRESH_PROBE=1 bypasses it). Every later run replayed the outage
    // as fact. Hard evidence found 2026-08-11: of 63 resolved entries, exactly ONE was the bare 1-field shape
    // this path writes — `world cup trophy` — while every genuine generic verdict carried 5-12 fields.
    // Worse than the transient version of this bug elsewhere, because it survives the process.
    //
    // ⚠ AND THE BARE CATCH SWALLOWED THE TYPED ERRORS TOO. ProviderInfraError exists precisely so an outage is
    // not read as content (provider-llm.mjs:24), and every sibling judge re-throws it to reach exit 5; a ledger
    // cap is a budget fact the run must stop on. Both were being converted into "generic" here.
    if (e?.name === "ProviderInfraError" || e?.ledgerCap) throw e;
    // Anything else: mark the failure so the caller can tell it from an answer. Returning a plain null would
    // be indistinguishable from a probe that ran and found nothing.
    console.warn(`[resolve] ⚠ PROBE FAILED for "${term}" (${String(e?.message || e).slice(0, 80)}) — NOT cached; the term stays UNVERIFIED, which keeps the full doctrine`);
    return { probeFailed: true };
  }
}

/** Resolve the named entities in a prompt (probe→remember). Returns the ones that resolved to a
 *  specific entity at confidence ≥ minConfidence: [{term, what_it_is, kind, defining_signatures, ...}].
 *  Never throws — degrades to [] so a gen is never blocked. */
export async function resolveEntities(userPrompt, { minConfidence = 0.7 } = {}) {   // raised 0.6→0.7: filter borderline confabulations (the probe now scores guesses <0.5)
  // ⚠ COMPREHENSION RUNS FIRST, AND ITS FAILURE IS NOT A VERDICT. Attached as a property like candidateCount
  // so every existing caller that treats this as a plain array is unaffected. A null intent means "we could
  // not read the request", which leaves every named thing an ordinary candidate — the behaviour that shipped
  // before this existed. It must never be allowed to mean "nothing is displaced".
  const intent = await comprehend(userPrompt);
  if (intent?.subjects?.length) {
    const displaced = intent.subjects.filter((s) => s?.renders === false && String(s?.replaced_by || "").trim());
    console.log(`[comprehend] ${intent.subjects.length} named · ${displaced.length} displaced${displaced.length ? ` (${displaced.map((s) => `${s.term}→${s.replaced_by}`).join(", ")})` : ""}`);
  }
  const terms = await extractCandidates(userPrompt);
  // ⚠ THE CANDIDATE COUNT IS PART OF THE ANSWER, NOT AN INTERNAL DETAIL. This function returns only the
  // entities it could VERIFY, so an empty result means two very different things: "the prompt names nothing
  // that could be a specific entity" and "it named something and the probe could not confirm it". The branch
  // router has to tell those apart, because it fails CLOSED: no candidates at all is safely non-copyright,
  // while an unverified candidate must still carry the full copyright doctrine — "generic" here means COULD
  // NOT VERIFY, never VERIFIED NOT A CELEBRITY. Attached as a property rather than changing the return type,
  // so every existing caller that treats this as a plain array keeps working unchanged.
  // ⚠ ORDER MATTERS: a FAILED extraction is not an EMPTY one. Only a clean look that found nothing may set
  // candidateCount = 0, because that value is the single condition under which the copyright doctrine is dropped.
  if (terms.failed) { const unknown = []; unknown.extractionFailed = true; unknown.intent = intent; return unknown; }   // candidateCount left UNSET on purpose
  if (!terms.length) { const none = []; none.candidateCount = 0; none.intent = intent; return none; }
  const store = loadStore();
  let dirty = storeHealed;
  const resolved = [];
  for (const term of terms) {
    const key = norm(term);
    let r = store[key];
    // ⚠ A CLASSIFIER VALIDATION THAT READS THE CACHE VALIDATES NOTHING. The store is keyed on the user's term, so
    // any term ever probed replays its OLD verdict and the LLM is never called — a validation set of familiar
    // names would report clean passes while a broken probe prompt sat behind them, and the pass would look
    // identical either way. Measured: 6 of 9 terms in the staged validation set were cache hits, including every
    // one whose expected value a doctrine change had just moved. FRESH_PROBE=1 forces the probe and still WRITES,
    // so a validation run also refreshes the store rather than leaving it stale.
    if (process.env.FRESH_PROBE === "1") r = undefined;
    if (r === undefined) {                                   // never seen → probe once (web search), then remember
      r = await probe(term);
      // ⚠ NEVER PERSIST A VERDICT THE PROBE DID NOT GIVE. This is the whole fix: a failed probe is skipped
      // rather than cached, so the next run asks again instead of replaying an outage forever. The term is
      // left UNRESOLVED, which is the honest state — it is still counted in candidateCount, so branchOf sees
      // resolved.length < candidateCount and keeps the full copyright doctrine (1bb84c4). Paying for one
      // re-probe next run is the cheap error; a permanent wrong "generic" is the expensive one.
      if (!r || r.probeFailed) continue;
      store[key] = r; dirty = true;
      console.log(`[resolve] probe "${term}" → ${r.specific_entity_found ? `${r.what_it_is} (conf ${r.confidence})` : "generic"}`);
    } else {
      console.log(`[resolve] cache "${term}" → ${r.specific_entity_found ? r.what_it_is : "generic"}`);
    }
    if (r?.specific_entity_found && (Number(r.confidence) || 0) >= minConfidence) resolved.push({ term, ...r });
  }
  if (dirty) saveStore(store);
  // ── RESOLVE WHAT IDENTIFIES THE MATERIAL, NOT ONLY WHAT MIGHT BE COPYRIGHTED ──────────────────────────────
  // ⚠ THE GOOD QUERY WAS AN ACCIDENT OF THE BRAIN'S MEMORY. Measured across two identical container runs:
  //   run 1 → "Ratatouille Gusteau cookbook scene"   (correct: names the chef whose page it is)
  //   run 2 → "Ratatouille cookbook scene"            (same prompt, same code, Gusteau simply absent)
  // Gusteau appears in NEITHER resolver output, because on this phrasing the chef is never an extracted term —
  // so he is never probed and no canonical for him exists anywhere in the run. Whether the query names him was
  // left to whether the brain happened to recall him. That is the reported inconsistency, exactly.
  //
  // Comprehension already answers this and nothing consumed it: `identifies_material` is the model saying THIS
  // IS HOW YOU FIND THE PLATE. Extraction asks a different question — what might be a protected subject — and
  // the two do not have the same answer. A figure can identify the material without being a copyright risk
  // (the chef), and vice versa.
  //
  // ⚠ KEPT OFF candidateCount, DELIBERATELY. That count is the copyright signal: branchOf compares it against
  // resolved.length and fails CLOSED when they differ. Folding material-identifiers into it would route to celeb
  // whenever a location failed to verify, which is an expensive answer to a question nobody asked. Extraction
  // decides the BRANCH; comprehension decides the QUERY. Separate inputs, separate consumers.
  const already = new Set(terms.map(norm));
  const idTerms = (intent?.subjects || [])
    .filter((s) => s?.identifies_material === true && String(s?.term || "").trim())
    .map((s) => String(s.term).trim())
    .filter((t) => !already.has(norm(t)));
  const materialIdentifiers = [];
  for (const term of idTerms) {
    const key = norm(term);
    let r = store[key];
    if (process.env.FRESH_PROBE === "1") r = undefined;
    if (r === undefined) {
      r = await probe(term);
      if (!r || r.probeFailed) continue;          // same contract as above: a thrown probe is never cached
      store[key] = r; dirty = true;
    }
    if (r?.specific_entity_found && (Number(r.confidence) || 0) >= minConfidence) materialIdentifiers.push({ term, ...r });
  }
  if (materialIdentifiers.length) console.log(`[resolve] material identifiers: ${materialIdentifiers.map((e) => `${e.term}→${e.canonical_name}`).join(", ")}`);
  if (dirty) saveStore(store);

  resolved.candidateCount = terms.length;
  resolved.materialIdentifiers = materialIdentifiers;   // drives the world QUERY, never the branch
  resolved.intent = intent;              // null when comprehension could not run — see comprehend()
  return resolved;
}

// ── CLI ──
if (process.argv[1] && process.argv[1].endsWith("entityResolve.mjs")) {
  const p = process.argv.slice(2).join(" ");
  if (process.argv.includes("--build-seed")) {
    const { written, refused } = buildSeed();
    console.log(`✓ entity_seed.json — ${written} entr${written === 1 ? "y" : "ies"} written${refused.length ? `; REFUSED ${refused.length} thrown-probe entr${refused.length === 1 ? "y" : "ies"} (${refused.map((k) => `"${k}"`).join(", ")})` : ""}`);
    console.log(`  commit it: this is a TRACKED file, and an untracked cache cannot survive the subtree split into grounded-gen.`);
    process.exit(0);
  }
  if (!p) { console.error('usage: node entityResolve.mjs "<user prompt>"   |   node entityResolve.mjs --build-seed'); process.exit(1); }
  console.log(JSON.stringify(await resolveEntities(p), null, 2));
}
