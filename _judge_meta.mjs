// A BEAT IS NEVER A SENTENCE ABOUT THE VIDEO — THE REVIEW (owner 2026-09-14, on the 9/11 re-run's "The creators themed this attraction to satire
// history as passengers ride through the exhibits.": "that is wrong, so we need to fix it" — and, on the first fix: "you made the frame0 meta a
// mechanical solution instead of an llm review step/filter?"). The law lives in the beat law (a sentence about the video is not in the video;
// narration is heard as a line or read on a thing); this is its backstop, one question to the text judge per draft, the way the places judge
// works: it returns the exact sentences that are ABOUT the video and the beat they sit in; _run feeds them to the writer as a finding (re-ask),
// then removes them mechanically as the last resort. Fails OPEN on a judge outage — a check that cannot run never invents a finding — and says so.
import { providerJson, textPart } from "./provider-llm.mjs";

export const META_QUESTION =
  `These are the beats (and any Dialogue) of a short video, one line per moment. ` +
  `THE RULE: a beat is what the frame SHOWS or what is HEARD — never a sentence ABOUT the video: its premise, its theme, its purpose, its makers or creators, ` +
  `its audience, its genre, what the attraction or the footage "is" or "was made to" do, or why it exists. A sentence about the video is not in the video. ` +
  `List every such sentence in the BEATS, exactly as written, with the beat's stamp. NOT a violation: any sentence describing something seen (a thing, a figure, ` +
  `the light, a sign's written words, the way ahead), any sound, and any line inside the Dialogue block (a narrator or a figure may say anything). ` +
  `Return ONLY JSON {"about":[{"words":"<the exact sentence as written>","at":<the beat's stamp in seconds, a number>}]} — {"about":[]} when every sentence is in the video.`;

/** Pure shaping of a judge answer: [{ words, at }] with junk dropped; the judge quotes what is there, or nothing. */
export function shapeMeta(answer, text = "") {
  const list = Array.isArray(answer?.about) ? answer.about : [];
  const out = [];
  const beats = String(text || "").split(/^\s*\**\s*Dialogue\s*\**\s*[:—–-]/im)[0];   // the beats only — a spoken line is never a finding
  for (const p of list) {
    const words = String(p?.words || "").replace(/\s+/g, " ").trim();
    if (words.length < 12 || words.length > 300) continue;
    if (beats && !new RegExp(words.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(beats)) continue;
    const at = Number(p?.at); out.push({ words, at: Number.isFinite(at) ? at : 0 });
  }
  return out;
}

/** The sentences about the video in a beats text: [{ words, at }] — [] on a judge outage (fail open, logged). */
export async function aboutSentences(text, { judge = null, log = console.log } = {}) {
  const t = String(text || ""); if (!t.trim()) return [];
  try {
    const ask = judge || (async (q, body) => providerJson([textPart(`${q}\n\n${body}`)], { maxTokens: 3000, temperature: 0, tag: "meta" }));
    const answer = await ask(META_QUESTION, t);
    return shapeMeta(answer, t);
  } catch (e) {
    if (e?.name === "ProviderInfraError" || e?.ledgerCap) throw e;
    log(`  ⚠ the meta judge could not run (${String(e?.message || e).slice(0, 80)}) — the about-the-video law stands untested this draft`);
    return [];
  }
}
