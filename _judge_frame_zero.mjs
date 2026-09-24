// FRAME-ZERO HOSTABILITY JUDGE — can the frame-zero action PHYSICALLY happen in this photograph?
//
// WHY THE TWO EXISTING SPACE FIELDS CANNOT ANSWER THIS (validated 2026-08-01). A dark-kitchen ref was chosen
// for "a man sneaks into the kitchen at midnight": a stool jammed against an oven, cabinets closing in on both
// sides, no visible floor, no doorway, nowhere to stand. It scored usable_stage="open" AND action_spot_room=
// "ample" — and both were defensible, because of what they actually ask:
//   • usable_stage asks "can you SEE THE PLACE around the action" — you can: cabinets, oven, microwave all
//     establish a kitchen. It passes on LEGIBILITY OF PLACE.
//   • action_spot_room asks "does the action spot have PLENTY OF PIXELS" — the stool is big in frame. It
//     passes on PIXEL SIZE.
// NEITHER asks whether a BODY FITS AND CAN MOVE. So the ref could not host the action, nothing noticed, and
// the model resolved the contradiction the only way it could: it INVENTED A CAMERA POSITION where the action
// did fit. That is the montage — an INVOLUNTARY cut, the one thing the fixed-camera doctrine exists to prevent.
//
// OWNER 2026-08-01, on why frame zero specifically: "frame0 is most important especially when it implies
// diegetic action which the frame cant satisfy". Frame zero IS the photograph — the only frame that is
// grounded rather than generated. A frame-zero action ASSERTS that a body is in that space, moving through it.
// If the geometry cannot host that assertion, the model does not abandon the action; it abandons the vantage.
//
// ISOLATED ON PURPOSE — this is NOT added to the 15-field identity rubric. Graded scores flatten when crowded
// (reference_vlm_prompt_crowding), and DEGRADE_FLOOR=0.6 is calibrated against that rubric's exact current
// wording, so appending a field there would risk silently re-scoring degrade. Own call, own question.
import sharp from "sharp";
import { providerJson, textPart, imagePart } from "./provider-llm.mjs";

async function view(fp, px) {
  return (await sharp(fp).resize(px, px, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 84 }).toBuffer()).toString("base64");
}

/**
 * Can the SPECIFIC frame-zero action happen in this frame, from this camera, without moving the camera?
 * @param {string} filePath   candidate frame
 * @param {string} action     the frame-zero action in plain words ("a man sneaks into the kitchen")
 * Returns {hosts, room_for_body, route_in, why} or null (caller fails CLOSED, as everywhere else).
 */
export async function judgeFrameZero(filePath, action, opts = {}) {
  const viewPx = Number(opts.viewPx ?? process.env.VIEW_PX ?? 512);
  try {
    const b64 = await view(filePath, viewPx);
    return await providerJson([
      textPart(
        `Return ONLY JSON {"room_for_body":bool,"route_in":bool,"hosts":0..1,"why":"the reason, in a few words"}. ` +
        `THE ACTION THAT MUST HAPPEN AT THE FIRST FRAME: "${action}". ` +
        `You are judging ONE thing: could that action physically occur in THIS photograph, filmed from THIS ` +
        `camera position, WITHOUT the camera moving or cutting. ` +
        `⚠ DO NOT judge whether the place is recognisable, whether it is well lit, whether it is pretty, or ` +
        `whether the subject would be big enough to see. Other judges cover all of that. Judge GEOMETRY AND ` +
        `OCCUPANCY only. ` +
        `room_for_body = is there physical space THE ACTOR NAMED IN THE ACTION could occupy and move through at ` +
        `the spot the action needs, AT THAT ACTOR'S OWN SCALE? ` +
        `\u26a0 THE SURFACE IS WHATEVER THE ACTION USES, NOT NECESSARILY FLOOR. Read the action and ask what the actor ` +
        `stands, sits, perches or moves ON. A person needs walkable ground; a small animal may need only a shelf, a ` +
        `counter, a sill, a branch, a bin lid or a car roof \u2014 and a frame with no visible floor at all can be perfectly ` +
        `hostable for one. Judge the space THAT actor needs, never a human's by default. ` +
        `\u26a0 STYLED OR PERIOD FIXTURES IN THE ACTION ARE CONJURED, NEVER REQUIRED. When the action names a styled, ` +
        `ornate, branded or period version of an ordinary fixture — an ornate royal bed, a throne-like chair, a ` +
        `vintage counter — judge hostability against the ORDINARY fixture of that kind in THIS photograph: any bed ` +
        `hosts an action written for an ornate bed, because the styling is rendered onto it, not found. Answer for ` +
        `the space and the geometry, never for whether the furniture matches the description. ` +
        `\u26a0 FILLED WITH OBJECTS IS NOT AUTOMATICALLY FALSE. Objects are what a small actor climbs on, walks between ` +
        `and knocks over, so a crowded shelf can be the STAGE rather than an obstruction. Answer FALSE only when the ` +
        `actor could not physically BE there, or could not perform the action from there. ` +
        `FALSE for a tight corner or a close-up with no room at the actor's scale (a stool wedged against an oven with ` +
        `cabinets on both sides is FALSE for a PERSON, even though the kitchen is legible and the stool is large in ` +
        `frame \u2014 the SAME frame may be TRUE for a cat). ` +
        `route_in = if the action involves ARRIVING (entering, sneaking in, walking up, coming through), is ` +
        `there a visible way IN — a doorway, an opening, an off-frame edge the performer could plausibly ` +
        `come from at this scale? TRUE automatically when the action does not involve arriving. ` +
        `hosts = 0..1, how completely this frame could host the action AS FILMED. 1.0 = it happens here with ` +
        `the camera untouched. 0.0 = the camera would HAVE to reposition, cut or push in for the action to be ` +
        `possible at all. ⚠ SCORE LOW WHEN THE MODEL WOULD BE FORCED TO MOVE: a frame that requires a new ` +
        `vantage produces an involuntary cut, which breaks the single-take capture this whole pipeline is ` +
        `built on. When genuinely unsure, score LOWER — a ref that cannot host frame zero costs the entire ` +
        `generation, so this judgement fails CLOSED like the others.` +
        (process.env.ALLOW_CUTS === "1"
          ? ` ⚠ THIS STORY IS PERMITTED TO MOVE TO ANOTHER PLACE LATER, so judge ONLY the opening action ` +
            `above. A later location being absent from this frame is NOT a failure - it is the premise, and ` +
            `it is reached by a cut, not by this camera. Do not lower the score because somewhere the story ` +
            `goes afterwards is not visible here.`
          : ``)
      ),
      imagePart("image/jpeg", b64),
    ], { maxTokens: 3000, temperature: 0.1, reasoning: "low", tag: "frame-zero", ...(opts.model ? { model: opts.model } : {}) });
    // ⭐⭐ ON THE REASONING MODEL (2026-09-24, engine review B2). On the vision model this question answered with its own template
    // ({room true, route_in FALSE, hosts 1, why "short"}) on 12 of 12 frames whole or cropped, and route_in alone demoted real passers;
    // on the fast model at low thinking it answered 9/9 on clean crops that morning and route_in was true 20 of 20 in B0. Room to think (3000):
    // a reasoning model's thinking counts against max_tokens, and a call sized for its answer is cut off and asked again whole.
  } catch (e) {
    if (e?.ledgerCap || e?.name === "ProviderInfraError") throw e;   // our budget stop and an outage are not verdicts (see provider-llm.mjs)
    return null;
  }
}

/** Can this frame host its first beat? A RANK, never a bar (owner 2026-09-24, R1: "rank because of BOB"): the hunt keeps every frame and puts
 *  the ones that can host first. room_for_body false or hosts under the floor cannot; route_in no longer decides on its own (the vision model's
 *  template "false" demoted real passers), because an arrival the frame cannot give is already scored into hosts. An unjudged frame cannot. Pure. */
export function frameZeroHosts(v, floor = Number(process.env.FRAME_ZERO_FLOOR ?? 0.5)) {
  if (!v || v.room_for_body === false) return false;
  const h = Number(v.hosts);
  return Number.isFinite(h) && h >= floor;
}
