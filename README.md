# grounded-gen

**A video engine built on realism. A Seedance adapter.**

It was built on an understanding of Seedance 2.0 and updated to Seedance 2.5. It knows how Seedance handles its parameters: what it does with a set of references, how it reads a prompt, what it needs for aspect, duration and audio, how it refuses. It uses that knowledge to steer the output toward realism. It reads a sentence, finds the real world first, writes the scene to the photograph, and hands Seedance the photographs and the script.

A video model asked to invent a place invents it: the room is nobody's room, the street is a composite, the camera floats. This engine never asks it to. Before anything is written, real photographs are found of the place, of the media form the video was "caught on", and of the figures in it. The scene is then written to those photographs, and the model is handed the photographs and the script together. The result looks caught rather than generated, because the ground under it was.

The repository is a showcase of the engine's parts, with their history. It is not an installable tool: the modules that handle payment, capacity and deployment were removed, and the modules here import some of them. See [the history](#the-history) at the end.

## Two videos, and how they were made

The photographs the engine found are not reproduced here; each is described and its source named. The videos are the engine's.

### "The Odyssey ride"

<p align="center"><a href="docs/examples/odyssey.mp4"><img src="docs/examples/odyssey.webp" alt="A first-person dark ride through the Odyssey: a giant cyclops animatronic, then Ulysses tied to the mast beside a winged Siren" width="300"></a></p>

Three words typed. The reading: a first-person theme park ride themed after the Odyssey; the work is *The Odyssey*, so the world is built on it (appropriation, in the theme mode: the work's scenes are sources, read for their things). The media form: rollercoaster POV footage. Nobody famous, nothing owned: the figures of a two-thousand-year-old poem are the ride's own animatronics.

What it searched, from the work: a Polyphemus statue, a Sirens mosaic, a Greek galley replica, a Scylla and Charybdis painting; and for the figures, the muscular one-eyed giant, the bearded man in bronze armour tied to the mast, the winged woman-faced creature on the rock.

What it found and used: a photograph of the Sperlonga sculpture group, the blinding of Polyphemus, in its museum hall (a travel site); the Roman mosaic of Ulysses tied to the mast among the Sirens, from the Bardo (a reproduction print shop's image); a photograph of the Olympias, the reconstructed Athenian trireme, under sail (Reddit). Read off them: a Greek key pattern for the walls, a wooden ship's bow with a carved eye, a giant cyclops head with a glowing eye.

The seat: a real rider's-seat frame of a dark ride, from the engine's seat-plate cache. Frame zero put the giant where the photograph's own set piece stood, and the story was written from there: fifteen seconds, the cyclops, then Ulysses at the mast with a Siren on her rock, riders in the vehicle ahead. [The video](docs/examples/odyssey.mp4).

### "A dark ride through a haunted cruise ship"

<p align="center"><a href="docs/examples/pirate-a.mp4"><img src="docs/examples/pirate-a.webp" alt="A first-person dark ride: a skeleton captain animatronic beside the ride vehicle, then a ghost projection in a timbered passage" width="300"></a></p>

The whole sentence: "A dark ride through a haunted cruise ship. The cart passes a drowned captain animatronic who croaks abandon ship. The cart rolls through a flooded ballroom where skeletons waltz. The ride ends in the engine room where a ghost engineer bangs a pipe and screams she's gonna blow as steam blasts the riders."

The reading: a first-person dark ride with three stops, the corridor, the flooded ballroom, the engine room. The media form: onboard ride footage. No work is named, so the world is a setting: the seat photograph carries it, and the maker's stops are hunted as places of their own.

What it searched, in the compiler's order: the open library first with the bare names ("flooded ballroom dark ride", "engine room dark ride"), then the paid indexes with the footage words ("flooded ballroom dark ride pov footage"), one of them limited to Reddit, where real ride footage is posted.

What it found and used: for the stops, a scene from a ride designer's portfolio, a mine-themed dark ride with a numbered ore cart under timber beams (danielswoodland.com); and the same real rider's-seat frame for the seat. The captain, the waltzing skeletons and the ghost engineer were conjured from the beats, described rather than sourced, because no reference of them exists to find. [The video](docs/examples/pirate-a.mp4).

## How it decides

<p align="center"><img src="docs/stack.svg" alt="The engine as four layers on the video model: reading, grounding, direction, the model; the gates and the remix as rails beside it." width="960"></p>

Four layers, each built on the one below, with Seedance as the foundation. A sentence enters at the top; a video leaves at the bottom. The gates are not a layer: a refusal can happen at every level, each for its own reason, and doubt never refuses. A remix enters as a sentence that changes a video and comes back in at the layer its change reaches.

## 1. Reading

**What the maker meant, decided once, before anything is searched.**

Every hunt downstream needs to know what it is looking for, and the engine refuses to let each hunt re-read the maker's words for itself. One reading is made at the start and stored on the plan. For each thing the maker named it records what the thing reads as (a named place, a chain, a kind of place, a work, a broadcast set), the name an image index would caption it by, the maker's own fallback when their words hedge, and which words are written into the take rather than searched. A direction such as "a sign that reads OPEN 24 HOURS" is never a search.

The planner then decides what must be real, where the scene happens, who is in it, and the beats. Two of its answers set the kind of story the writer will be held to: does the story need a plot, and does it need drama? Yes gives a narrative take, with a payoff, a climax and a twist. No gives an observational one: a view held, no twist. A bare "dark ride" is a view unless the words ask for an event.

**The media form.** The engine's first principle is that the form leads and the prompt guides. A doorbell camera, a CCTV feed, a dashcam, a bodycam, a trail camera, a phone, a broadcast: each has a native way of seeing, and the video should be caught the way that device catches things. When the maker names a capture device, it is broken into its primitives (lens, vantage, overlay) and the search is aimed at real footage from that device, so the photograph found has the right point of view before anything is written. Overlay text such as a timestamp or a camera label is expected and tolerated by the judges. A phone, a broadcast or a screen passes through unchanged. A ride the maker names is ridden: the seat becomes the opening frame, and the world reaches the ride one of four ways (see Grounding).

**Appropriation.** When the request names a work, a show or a venue, the world is built on that property's own scene. Its scene becomes the plate. Its people may stay in the frame, because a figure that is never invoked by the script does not render, and a staged frame of the right place is usually the better plate. The search is never allowed to broaden away from the name, since "a marine park" is not the request that was made. A drawn property is sourced as drawn, because a photograph of it cannot exist. Naming a film asks for that scene, not for a look to apply elsewhere; a general medium such as claymation rides as a word in the prompt instead.

**The cast.** Each named figure is resolved to what it is, and routed four ways. A meme or a free character has its reference photo sourced. A public-domain figure is named and described in prose and never sourced. A famous person or an owned character is declined. An ordinary name with nothing behind it is a nobody, conjured from the beats. The take carries at most ten characters, four of them from photographs, and a figure the maker named outranks one the planner invented when the cap bites.

Modules: `_search_intent.mjs`, `_pregate.mjs`, `entityResolve.mjs`, `_prose_capable.mjs`, `_look_change.mjs`, `_ride.mjs`, `forms.json`.

## 2. Grounding

**The real world is found first.**

Nothing is searched until the engine has judged, per subject, that a real photograph of it can exist. The probe answers for each subject separately (a form and its place are two subjects), and a subject the judge is sure cannot be photographed declines the run with nothing searched, rather than letting an off-subject plate win later. Doubt never declines. Every verdict is logged, and the probe can run in shadow, deciding without acting, so its accuracy is measurable before it is trusted.

**The query compiler.** One module owns every search string. It turns the reading's subjects into each index's own phrasing: an open, licensed photo library gets the bare name; a paid image index gets the name plus the footage words; a chain gets its interior; a device form gets the footage phrasing people actually write. A wrong query fails quietly and expensively, so no hunt is allowed to compose its own.

**The hunts, in order.** On a ride the seat is hunted first, before anything else, because frame zero is a real photograph from the rider's own seat. A second location holds its share before the world hunt spends. In a cinematic mood, cut targets are conjured rather than hunted. Figures reserve their share so the world hunt cannot starve them. Two rules shape what is hunted: at night with no light at the camera, only the place is sourced, because a silhouette cannot be animated (infrared, flash, a bodycam lamp and headlights are light at the lens, so the subject can be sourced); and a subject the model draws in at scene scale, an owned-style or costumed figure, gets a plain scene as its plate and renders into it, while a real animal or person has a stand-in occupant sought in the photo.

**The world hunt is adaptive.** A pool is pulled from several indexes, placeholder and spam images are dropped, and the pool is judged. If no frame is both candid and a fit for the place, the brain proposes a refined query: broaden when nothing candid came back, re-steer when the candid frames are off-subject. The loop is bounded, and when it ends without a confident frame it fails clean rather than shipping a wrong plate.

**The judges, cheapest first.** A kill-shot pass asks only the three questions that eliminate most candidates (a real photograph? AI-made? does it show the subject?), measured to kill more than half of a pool at a fraction of the full rubric's cost. Survivors get the identity read, a twelve-field categorical and graded pass. Then the requirements judge asks whether the frame physically holds what the story needs, and the frame-zero judge whether the opening action can physically happen in this photograph. Under appropriation the candid test stands down, because a frame of a work is produced by construction. For a ride, a seat judge looks once at each candidate and returns evidence, never a verdict; the ranking is code.

**The world by mode.** A themed dark ride treats the work's rooms as sources, read for their things, and the seat plate is read for where the first of them sit beside or ahead of the rider; the rest arrive later along the take. A coaster of a named work keeps its own architecture and colours it with the work's things. Another travelling form of a named world carries the world's photographs behind the seat in story order. An unnamed world lets the seat plate carry its world, with the maker's places hunted as informant plates.

Modules: `_sourceability.mjs`, `_query.mjs`, `library.mjs`, `_source_entity.mjs`, `_ride_seat.mjs`, `_ride_world.mjs`, `_placeholder_card.mjs`, `_plate_dressing.mjs`, the eight `_judge_*.mjs`, `redact_any.mjs` with `detect_prompt.txt` (a detector for a reference that cannot travel as it is, held in reserve; the current rule is that references ride unchanged).

## 3. Direction

**The scene is written to the photograph, never before it.**

The planner's prompt is only a draft. The script that reaches the model is written after the plate is chosen, by a writer that reads the photograph: what is actually there, where the action spot is, who stands in it. If the photograph's occupant is already the subject, it is animated as it is. If not, the beats direct the swap: the stand-in becomes the subject, taking its exact place and pose.

**Frame zero is a stage of its own.** On a ride, the world's things take the seat photograph's set pieces, and that composition is made first, before the story is written, from the placements the plate read produced. It is one small call, validated by code (every replacement has both sides, the way is named first), with the mechanical facts as a loud fallback. The writer receives it as the ground it opens from. It used to be one instruction among sixty, repaired by string surgery when ignored; a recovery tool that always succeeds is a bug report.

**The beat law** says how many beats a take holds and when each lands. A narrative take earns its payoff and gives its climax at least four seconds; an observational take holds a view in two or four beats, with no twist. The cast ledger compiles who appears when into a call sheet the writer receives as one line, and the finished beats are held to it before anything is submitted.

**The reviews** check the draft for faults a prose rule cannot catch: a figure on screen at the wrong time, a place of the world named instead of told by its qualities, a sentence about the video rather than in it, a climax cut short. A story fault re-asks the writer once, with the faults named. A words fault is edited in place, because nothing about the staging is wrong and a fresh draft is a different take. Sourced figures reach the writer as their photographs; concept figures reach it as their signatures, one clause at first mention.

Modules: `_frame_zero.mjs`, `_ground_prompt.mjs`, `_beat_law.mjs`, `_beat_edit.mjs`, `_writer_contract.mjs`, `_ride_writer.mjs`, `_swap_check.mjs`.

## 4. Seedance

**Seedance 2.5, directed. It is handed the photographs and the script. It is never asked to invent the world.**

The adapter's value is what it knows about Seedance, learned on 2.0 and carried to 2.5:

- **References.** Seedance conditions on all of its references together, as one flat set, with no per-image binding. The bag holds at most four sourced references, plates and characters together, and the order is not treated as meaningful because it was never shown to be.
- **Aspect.** The world plate is padded to the requested aspect before it is sent, so Seedance outpaints the edges of a real place instead of cropping it.
- **The prompt.** Beats are stamped with their second, a capture sentence names the camera once, and the prompt carries no framing words at all: Seedance reads the camera from the references, and prose about the camera fights them. The writer's contract holds every script to that shape.
- **Audio.** Seedance writes its own audio track, and an empty audio slot is filled with invented, often copyrighted, music. The slot is always written.
- **Resolution and duration** are per model and are sent as Seedance lists them, never assumed.
- **What it invents.** Given a silhouette, Seedance has nothing to animate, so it invents the subject and then the whole frame; that is why the night rule sources the place alone. Given a produced frame of a named work, it stays in that world.
- **Refusals.** A content-policy refusal is free and repairable; a trip of the output gate is walked back one feature at a time.

Realism is steered rather than requested: candid capture over polish, the device's own way of seeing, and the same handful of real photographs holding the whole take.

**The leak guard** scans what leaves, at the hand that finishes every draft and again at every submission, for anything that could never belong in a take: an address, a host, a file name, a path, an environment name, a wallet-shaped string, a provider's name, a sentence that is the engine's own instruction. The sentence that carries a leak leaves; every other line stays byte for byte. The maker's own words are never read as input and never judged: a direction they typed passes whole.

**Submit, and read the answer once.** Accepted is the video. A refusal on content policy enters a repair ladder, each rung an edit, stopping at the first acceptance: first the words policies refuse most reliably, then every name and every weapon. A trip of the output gate walks the look back one feature at a time, and a figure that a short description can carry rides in prose. Anything else is the honest failure, reported as what it is, never as a verdict it was not.

Modules: `_multiref_gen.mjs`, `_leak_guard.mjs`.

## The gates

A refusal can happen at every layer, each with its own reason, and the design leans one way throughout: a miss costs what it already costs, because the next gate is still behind, while a false refusal turns away a maker for a legitimate request and is invisible. So every gate fails open on doubt, logs every verdict, and can run in shadow.

- **The door.** Before anything is looked up, a cheap pre-check declines a sentence that itself names a famous person or an owned character. A name the model merely associates with a work is not in the request, and a named work, show or venue is not a character. On a park ride an owned character is the ride's own animatronic, and the name goes through.
- **The cast check**, in Reading, routes each figure four ways.
- **Sourceability**, in Grounding, declines a run that cannot be grounded, with nothing searched.
- **The reviews**, in Direction, re-ask or edit.
- **The leak guard** before Seedance; **the output gate** after it.

## Remix

A remix is a sentence that changes a video. It has its own pre-checks: a video from another engine cannot be remixed; a famous or owned figure named in the change is declined on the change alone, while everything kept keeps its earlier verdicts; a name that is only referenced ("talks like X") is carried as a manner and puts no one on screen.

The diff reads what changed against the parent video and types it: figures, world, cuts, each with its operation. A demand the ontology cannot type (vague, empty, or words it had to drop) goes to the reasoning planner, whose plan the mechanical laws then validate; if it is not solvable, the remix is not remixable and nothing is claimed.

What a remix keeps is read from the parent video itself, not assumed. Which film strip carries the kept characters is decided by what the parent's frames show: if they show another kind of place than the one the remix puts the characters in, they carry, and the new place is sourced; if the same kind, the frames are reused, or another video in the same canon that has the characters is used instead.

How deep the change is decides the path. An action, a prop or a line is surgery on the parent's script, with every photograph reused and frame zero's laws held. A new place, a new cast, new cuts, or a flip between candid and cinematic (a register is a whole grammar, so a flip can never be surgery) is a reframe: the whole pipeline runs again on the compiled sentence, with the kept things pinned and the kept cast riding the parent's own frame. A fresh hunt that finds nothing falls back to the parent's plate.

Modules: `_remix_intent.mjs`, `_carry_reader.mjs`, `_strip_choice.mjs`, `_gen_state.mjs`.

## The full circuitry

Every decision above, drawn as a question and its arms.

<p align="center"><img src="docs/circuitry.svg" alt="Every decision as a question and its arms: the door and its pre-check, reading and planning, sourcing, writing, rendering, and the remix lane." width="960"></p>

## What is here

| Layer | Files |
| --- | --- |
| Reading | `_search_intent.mjs` `_pregate.mjs` `entityResolve.mjs` `_prose_capable.mjs` `_look_change.mjs` `_ride.mjs` `forms.json` |
| Grounding | `_sourceability.mjs` `_query.mjs` `library.mjs` `_source_entity.mjs` `_ride_seat.mjs` `_ride_world.mjs` `_placeholder_card.mjs` `_plate_dressing.mjs` `_judge_killshot.mjs` `_judge_identity.mjs` `_judge_requirements.mjs` `_judge_frame_zero.mjs` `_judge_seat.mjs` `_judge_places.mjs` `_judge_meta.mjs` `_judge_climax.mjs` `redact_any.mjs` `detect_prompt.txt` |
| Direction | `_frame_zero.mjs` `_ground_prompt.mjs` `_beat_law.mjs` `_beat_edit.mjs` `_writer_contract.mjs` `_ride_writer.mjs` `_swap_check.mjs` |
| Seedance | `_multiref_gen.mjs` `_leak_guard.mjs` |
| Remix | `_remix_intent.mjs` `_carry_reader.mjs` `_strip_choice.mjs` `_gen_state.mjs` |

The orchestrator that runs the layers in order, the scrapers that pull pools from the paid indexes, the adaptive world sourcer and the pure gate rules are not published: their logic is interleaved with budget handling, and a file's history cannot be cut in half. They are described above.

The prompts the modules carry are the ones the engine uses. Most are written as positive law: what to do, never a list of cases, because a general rule generalises and an enumeration misses the next case.

## The history

The commits are real and their dates are kept: daily work from 2 August 2026. Before publishing, the history was rewritten once: every commit message was replaced by the same line, the modules named above and every photograph, key, host and figure of cost were removed from every commit, and the author was set to one address throughout. A commit that touched only removed files therefore shows no changes. Nothing was added to the past.
