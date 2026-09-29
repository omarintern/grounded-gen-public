// THE LEAK GUARD (owner 2026-09-29: "it should not work against us in such a way that this info leaks or anything about the engine").
// What leaves for the video model is scanned, at the one hand that finishes every draft and again at every submission, for what can never belong in
// a take: a web address, a host, a file name, a path, an environment name, a wallet-shaped string, a provider's or a photo library's name, and a phrase
// that is the engine's own instruction and nobody's prose. THE MAKER'S WORDS ARE NEVER READ AS INPUT AND NEVER JUDGED: a direction ("give him a dress",
// "a sign that reads OPEN 24 HOURS") passes whole, and lettering the maker typed themselves is theirs, never a leak, because it cannot carry anything
// from the engine (the reviewer, review 2026-09-29). The sentence that carries a leak leaves; every other sentence, and every clean line, stays byte for byte.
// Our own domain (example.com stands in for it here) is a brand and never a leak. Pure; no model, no file.
const URL_RX     = /\bhttps?:\/\/[^\s"'<>)\]]+/gi;
const WWW_RX     = /\bwww\.[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:\/[^\s"')]*)?/gi;
const DOMAIN_RX  = /\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|net|org|io|ai|app|dev|xyz|co|sh|cloud|storage|workers)\b(?:\/[^\s"')]*)?/gi;
const FILE_RX    = /\b[\w.-]+\.(?:jpe?g|png|webp|gif|mp4|mov|webm|json|mjs|cjs|js|ts|tsx|txt|md|env|log)\b/gi;
const PATH_RX    = /(?:^|[\s"'(])(?:\/(?:Users|home|app|tmp|private|var|etc|opt)\/[^\s"')]*|out\/_[\w-]+[^\s"')]*|~\/[^\s"')]*)/g;
const ENV_RX     = /\b[A-Z][A-Z0-9]+(?:_[A-Z0-9]{2,})+\b/g;          // OTHER_SERVICE_KEY, GROUNDED_GEN_KEY: two or more upper words joined by _
const WALLET_RX  = /\b[1-9A-HJ-NP-Za-km-z]{32,44}\b/g;                // base58 at a Solana address's length
const HEX_RX     = /\b[0-9a-f]{32,}\b/gi;
/** Names that are ours or a photo library's and nobody's story word. Some vendor names are English words (a gondola, a platform, rain) and are
 *  caught only as hosts (provider.example, host.app) by DOMAIN_RX. */
const PROVIDER_RX = /\b(?:seedance|flickr|shutterstock|alamy|istock(?:photo)?|unsplash|pexels|wikimedia|imgur|getty images)\b/gi;
/** Phrases that are the engine's instruction text and nobody's prose. Whole words only; nothing a story could need ("these instructions" is a flight
 *  attendant's line, "kill shot" a hunter's, "world ref" a referee: none of those is here). */
export const CANARIES = [
  "system prompt", "frame zero is this photograph", "reconcile the request with the photograph", "do not describe the scene or setting",
  "a kept belonging rides", "your previous draft", "your previous attempt", "house default wins", "input-guard", "shot notes", "return json",
  "beat law", "world-ref", "the maker's words",
];
const esc = (c) => c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");   // a hyphen stays a hyphen: "world-ref" is ours, "world ref" is a referee
const CANARY_RX = new RegExp(`\\b(?:${CANARIES.map(esc).join("|")})\\b`, "gi");
const BRAND_RX = /(?:^|[^a-z0-9-])(?:www\.)?example\.com(?![a-z0-9-])/i;
const KINDS = [["url", URL_RX], ["www", WWW_RX], ["domain", DOMAIN_RX], ["file", FILE_RX], ["path", PATH_RX], ["env", ENV_RX], ["wallet", WALLET_RX], ["hex", HEX_RX], ["provider", PROVIDER_RX], ["canary", CANARY_RX]];

/** Every leak in one piece of text: [{ kind, match }]. The brand is never one; nor is anything the maker typed themselves (makerWords). */
export function leaksIn(text, { makerWords = "" } = {}) {
  const out = [], maker = String(makerWords || "").toLowerCase();
  for (const [kind, rx] of KINDS) {
    rx.lastIndex = 0;
    for (const m of String(text || "").matchAll(rx)) {
      const hit = String(m[0]).trim();
      if (!hit) continue;
      if ((kind === "url" || kind === "www" || kind === "domain") && BRAND_RX.test(hit)) continue;
      if (maker && maker.includes(hit.toLowerCase())) continue;
      out.push({ kind, match: hit.slice(0, 80) });
    }
  }
  return out;
}

const SENTENCE_SPLIT = /(?<=[.!?;])\s+/;
const TAG_SPLIT = /(?=\[\d+(?:\.\d+)?s\])/;
const TAG_AT_START = /^\s*\[\d+(?:\.\d+)?s\]\s*/;
const UTTER_RX = /^\s*[^:"“'\n]{1,90}:\s*["“']/;            // Name [1s] (manner): "…"  ·  Name (manner) [1s]: "…"
const HEADER_RX = /^\s*Dialogue\s*:\s*$/i;
const SOUND_SET_RX = /^(\s*(?:Sound|Set|Telling)\b[^:\n]{0,40}:\s*)([\s\S]*)$/i;   // "Sound:", "Sound (distant):", "Set:", "Telling:" keep their head (the reviewer, review 2026-09-29)
const SOUND_FALLBACK = "Sound: Natural ambient room tone of the scene; no music.";   // the engine's own fallback line, never invented here

/** Close a quotation a cut opened: an odd count of straight quotes loses its last one; an unmatched curly opener or closer leaves. */
function balanceQuotes(s) {
  let t = s;
  if ((t.match(/"/g) || []).length % 2) t = t.replace(/"(?=[^"]*$)/, "");
  const opens = (t.match(/“/g) || []).length, closes = (t.match(/”/g) || []).length;
  if (opens > closes) t = t.replace(/“(?=[^“]*$)/, ""); else if (closes > opens) t = t.replace(/”(?=[^”]*$)/, "");
  return t.replace(/\s{2,}/g, " ").trim();
}
const scrubSentences = (body, opts, hits) => {
  const stay = [];
  for (const s of body.split(SENTENCE_SPLIT)) { const h = leaksIn(s, opts); if (h.length) hits.push(...h); else stay.push(s); }
  return balanceQuotes(stay.join(" "));
};

/** The text with every leaking sentence removed, and the hits. An utterance (a speaker's line) leaves whole; a Sound or Set line keeps its label and
 *  its clean sentences, and a Sound line with nothing left becomes the engine's own fallback; a beat on a shared line is its own unit; a beat whose
 *  every sentence left leaves with its tag. Lines that carried nothing are kept as they were, byte for byte. */
export function scrubLeaks(text, opts = {}) {
  const hits = [];
  const kept = [];
  for (const line of String(text ?? "").split("\n")) {
    if (!line.trim() || !leaksIn(line, opts).length || HEADER_RX.test(line)) { kept.push(line); continue; }
    const ss = line.match(SOUND_SET_RX);
    if (ss) {
      const body = scrubSentences(ss[2], opts, hits);
      if (body) kept.push(ss[1] + body); else if (/^\s*Sound/i.test(ss[1])) kept.push(SOUND_FALLBACK);
      continue;
    }
    if (UTTER_RX.test(line)) { hits.push(...leaksIn(line, opts)); continue; }
    const segments = [];
    for (const seg of line.split(TAG_SPLIT)) {
      const tag = (seg.match(TAG_AT_START) || [""])[0];
      const body = scrubSentences(seg.slice(tag.length), opts, hits);
      if (body) segments.push(tag + body);
    }
    if (segments.length) kept.push(segments.join(" "));
  }
  return { text: kept.join("\n"), hits };
}

/** True when a draft still has a take in it: its opening beat (the [0s] line, frame zero: the photograph) of three words or more; or, in a draft
 *  written without tags, forty characters of prose that are neither a speaker's line nor a Sound, Set or Dialogue line. A Sound line alone is never
 *  a take, and a draft that lost its opening beat is not one either (the reviewer, review 2026-09-29). */
export function stillATake(text) {
  const lines = String(text || "").split("\n");
  const words = (l) => l.replace(TAG_AT_START, "").trim().split(/\s+/).filter(Boolean).length;
  if (lines.some((l) => TAG_AT_START.test(l))) return lines.some((l) => /^\s*\[0(?:\.0+)?s\]/.test(l) && words(l) >= 3);
  const prose = lines.filter((l) => l.trim() && !UTTER_RX.test(l) && !SOUND_SET_RX.test(l) && !/^\s*Dialogue\s*:/i.test(l)).join(" ").replace(/\s+/g, " ").trim();
  return prose.length >= 40;
}
