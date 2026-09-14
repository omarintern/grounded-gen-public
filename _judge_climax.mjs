// THE CLIMAX OWNS AT LEAST FOUR SECONDS — THE REVIEW (owner 2026-09-15, live 2516f272: "i never like for the last turns / climaxes of the ride to be 2-3
// seconds … a minimum of 4 seconds … i dont mean last turn is 4 seconds, i mean the climax of a rider should be that at least"). The law lives in the
// ride's block; this is its backstop. The 09-11 check read the LAST STAMP as the climax's opening, and the owner's climax is not the last turn: it may
// run over more than one beat (the stop before the figure, its blow, the vehicle's surprise move, the way running on through it), and at 9 s a six-beat
// draft whose last beat opens by [5s] can only sit on a one-second grid. So where the climax OPENS is asked, not counted: one text-judge question per
// draft, the way the places and meta judges work; _run compares the stamp with the seconds the climax owns and feeds a late one to the writer as a
// finding (re-ask). Fails OPEN on a judge outage — a check that cannot run never invents a finding — and says so.
import { providerJson, textPart } from "./provider-llm.mjs";
import { climaxSecs } from "./_ride_writer.mjs";

export const CLIMAX_QUESTION = (secs) =>
  `These are the beats (and any Dialogue) of a ${secs}-second video written as ONE continuous ride-through from a seat, one line per moment, each opening at its [Ns] stamp. ` +
  `THE CLIMAX is the ride's last event acting on the seat — the moment the story's turn reaches the riders (a figure's move against them, a blow, a push, a release, a reveal) — ` +
  `and everything from that moment to the end is inside it. At which stamp does the climax OPEN? The stop before the figure that then performs, and the vehicle's surprise ` +
  `move that follows, are the climax's own beats when that figure's turn is the last event; a passage or a scene the ride merely passes before the last event is not. ` +
  `Return ONLY JSON {"climax_at":<the stamp in seconds where the climax opens, a number from the beats>,"words":"<the first few words of that beat>"} — {"climax_at":null} when no event acts on the seat (a view held).`;

/** Pure: the judge's stamp, kept only when it is a beat stamp of the text; null otherwise (a judge that points at nothing points at nothing). */
export function shapeClimax(answer, text = "") {
  const at = Number(answer?.climax_at);
  if (!Number.isFinite(at)) return null;
  const stamps = (String(text || "").split(/^\s*\**\s*Dialogue\s*\**\s*[:—–-]/im)[0].match(/^[ \t]*\[(\d+(?:\.\d+)?)s\]/gm) || []).map((x) => Number(x.replace(/[^\d.]/g, "")));
  return stamps.includes(at) ? at : null;
}

/** Pure: does a climax opening at `at` leave fewer seconds than it owns, in a take of `secs` under a HELD ending? null = fail open; QUICK owes no span. */
export const climaxLate = (at, secs, ending = "held") => ending !== "quick" && Number.isFinite(at) && Number(secs) >= 6 && at > Number(secs) - climaxSecs(secs);

/** Where the climax opens in a beats text: a stamp, or null on a judge outage / no answer (fail open, logged). */
export async function climaxOpens(text, { secs = 9, judge = null, log = console.log } = {}) {
  const t = String(text || ""); if (!t.trim()) return null;
  try {
    const ask = judge || (async (q, body) => providerJson([textPart(`${q}\n\n${body}`)], { maxTokens: 200, temperature: 0, tag: "climax" }));
    return shapeClimax(await ask(CLIMAX_QUESTION(secs), t), t);
  } catch (e) {
    if (e?.name === "ProviderInfraError" || e?.ledgerCap) throw e;
    log(`  ⚠ the climax judge could not run (${String(e?.message || e).slice(0, 80)}) — the four-second climax stands untested this draft`);
    return null;
  }
}
