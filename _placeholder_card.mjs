// PLACEHOLDER-CARD DETECTOR — shared by every sourcer that downloads a scraped image.
//
// WHAT IT CATCHES: a hotlink-block card ("This site does not have permission to access or serve this
// content") is 200 OK, image/jpeg, 1280x720, decodes clean and clears any size floor — so nothing upstream
// rejects it, it reaches the VLM judge, burns a paid call, and can be PICKED. Measured leaking at ~3.6% of
// downloads. Only PIXELS catch it: a flat bright near-greyscale field with low variance is text-on-white,
// never a photograph.
//
// ⚠ TWO TESTS, BECAUSE WHOLE-FRAME STATS ALONE MISS THE COMMON CASE. Reddit serves the same card LETTERBOXED
// inside a wider composite (black bars + a dark title bar + white cards in a middle band), which drags the
// frame mean to ~150 so a brightness test never fires — 3 of 24 leaked into a live contact sheet exactly that
// way. So also measure FLAT PURE WHITE: real photographs essentially never carry large areas of literal
// 255,255,255; printed cards and app screenshots do.
// CALIBRATED on real frames: genuine night bedrooms 0.0–0.1%, genuine IR frames up to 13.7%, letterboxed
// permission cards 44.5–44.8%, product-listing screenshots 46–55%. The 30% threshold sits in the empty gap
// and also catches store screenshots (one of which showed an infant — a minors leak no title filter could see).
//
// ⚠ SHARED ON PURPOSE. This logic was written once for the scene sourcer and then simply absent everywhere
// else, so the entity path judged permission cards as if they were photographs of the entity. A detector
// calibrated against measured thresholds is exactly the thing that must not exist in more than one copy — a
// second copy drifts, and the drift is invisible because both still "work".
import sharp from "sharp";

/** Is this image buffer a hotlink-block / placeholder card rather than a photograph?
 *  Fails OPEN (returns false) if the buffer cannot be decoded — the caller's own decode step will reject it. */
export async function isPlaceholderCard(buf) {
  try {
    const st = await sharp(buf).resize(64, 64, { fit: "fill" }).removeAlpha().stats();
    const mean = st.channels.reduce((s, c) => s + c.mean, 0) / 3;
    const spread = Math.max(...st.channels.map((c) => c.mean)) - Math.min(...st.channels.map((c) => c.mean));
    const sd = st.channels.reduce((s, c) => s + c.stdev, 0) / 3;
    if (mean > 210 && spread < 6 && sd < 70) return true;            // full-frame white card

    const { data, info } = await sharp(buf).resize(96, 96, { fit: "fill" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    let flatWhite = 0;
    for (let i = 0; i < data.length; i += 3) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      if (r >= 246 && g >= 246 && b >= 246 && Math.max(r, g, b) - Math.min(r, g, b) <= 3) flatWhite++;
    }
    return (100 * flatWhite) / (info.width * info.height) > 30;      // letterboxed card / app screenshot
  } catch {
    return false;
  }
}

// ── PAID-STOCK HOSTS ────────────────────────────────────────────────────────────────────────────────
// The BASE reject list, shared. A paid-preview host serves a watermarked frame that is unusable whatever is
// underneath it, so the cheapest possible rejection is on the HOSTNAME — before the download, before the judge
// call the watermark field would have spent anyway.
//
// ⚠ IT WAS COPIED INTO EVERY SOURCER, AND ONE COPY HAS ALREADY SPECIALISED. Four production sourcers carried a
// byte-identical list; `_celeb_ref.mjs` carries a different one, adding `amazon`, `aliexpress` and `poster`.
// That is not drift — it sources CHARACTER refs, where a product listing or a poster reproduction is a real
// hazard that does not apply to a scene plate. A single flat list would either strip that specialisation or
// impose `amazon` on every kitchen scrape, so the shape is a shared BASE plus a per-caller EXTRA.
//
// ⚠⚠ THIS LIST IS AN OPTIMISATION, NOT A RULE — AND IT MUST NEVER BE TREATED AS THE GATE. The actual rule is
// GENERAL and lives in the VLM: `text_kind: "stock_watermark"` rejects a paid preview by APPEARANCE (tiled or
// overlaid branding), and `distinctiveness` in judgeImage catches promo art by what it IS. Neither knows a
// hostname. This list only lets us skip the download and the judge call for hosts we already know, so a MISSING
// host costs ~$… of judging and nothing else — never a leak. Measured: four Alamy frames in the brand_mark
// run came back `stock_watermark` from the judge alone, so they would have been rejected with or without the
// hostname. `alicdn` was absent until 2026-08-03 and the only consequence was paying to look.
// ⚠ SO DO NOT TRY TO MAKE IT EXHAUSTIVE. Enumerating every commerce and stock CDN is unbounded and would drift
// the moment one rebrands; the general rule already covers the tail. Add a host when it shows up often enough
// to be worth the saved call, and not otherwise.
//
// ⚠ KNOWN WART, PRESERVED DELIBERATELY: bare "getty" is broader than "gettyimages" and also matches
// getty.edu — the Getty Museum, whose photographs are legitimate. Kept because removing it would change
// four sourcers' behaviour under cover of a refactor; fix it as its own decision, with its own measurement.
export const PAID_STOCK_HOSTS = ["alamy", "shutterstock", "dreamstime", "gettyimages", "getty", "istockphoto",
  "123rf", "depositphotos", "stock.adobe", "adobestock", "canstockphoto", "picfair", "plus.unsplash",
  "freepik", "pond5", "stockcake", "ytimg"];

export const hostOf = (u) => (u || "").replace(/^https?:\/\//, "").split("/")[0];

/** Is this URL served by a paid-stock host? @param {string[]} extra caller-specific additions (see above). */
export const isPaidStock = (url, extra = []) => {
  const h = hostOf(url);
  return PAID_STOCK_HOSTS.some((d) => h.includes(d)) || extra.some((d) => h.includes(d));
};

// ⚠ A BARE fetch() LOSES A QUARTER OF THE POOL. Publisher-hosted origins 403 a request with no UA and no
// Referer; measured 95% success with these headers against 75% without. The content-type gate matters for the
// same reason: a blocked host commonly answers 200 with an HTML error page, which then gets written to disk
// with a .jpg name and fails much later, somewhere that reads like a content problem instead of a fetch one.
export const IMG_HEADERS = { "user-agent": "grounded-gen/1.0", referer: "https://www.example.com/" };

/** Fetch an image with the hardening every sourcer needs. Returns a Buffer, or null with a reason.
 *  @returns {Promise<{buf:Buffer}|{reason:string}>} */
export async function fetchImage(url, { timeoutMs = 15000, minBytes = 8000 } = {}) {
  let r;
  try {
    r = await fetch(url, { headers: IMG_HEADERS, signal: AbortSignal.timeout(timeoutMs) });
  } catch (e) {
    return { reason: /timeout|abort/i.test(String(e.message)) ? "timeout" : "net" };
  }
  if (!r.ok) return { reason: String(r.status) };
  if (!/^image\//.test(r.headers.get("content-type") || "")) return { reason: "not-an-image" };
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length < minBytes) return { reason: "too-small" };
  if (await isPlaceholderCard(buf)) return { reason: "placeholder-card" };
  return { buf };
}
