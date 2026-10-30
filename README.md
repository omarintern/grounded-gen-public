# Realism on Seedance

**Skills for directing Seedance toward realism, learned building a video engine on it.**

<p align="center"><img src="docs/index/catch-it-on-a-device.webp" alt="CCTV footage of a bear grabbing a box of cereal in a kitchen" width="280"></p>

Seedance is a strong video model with habits. Ask it for a place and it invents one. Ask it for CCTV and it draws its idea of CCTV. Hand it four references and it blends them as one set, whatever order they came in.

This engine was built by learning those habits on Seedance 2.0 and carrying them to 2.5. Each habit has a skill that answers it. Together they make one way of working: find the real world first, write the scene to it, and hand Seedance both.

Each skill is a real skill file. Give one to your agent and it will write Seedance prompts the same way. Every example is a finished video from the engine, shown with the photograph it was given and the lines it was written.

**To use a skill:** copy its folder into your agent's skills folder (for Claude Code, `~/.claude/skills/`).

## The skills

### Seeing

| | Skill | Use it when |
| --- | --- | --- |
| <img src="docs/index/catch-it-on-a-device.webp" width="90" alt=""> | [**catch-it-on-a-device**](skills/catch-it-on-a-device/SKILL.md) | The request names a camera: CCTV, a doorbell, a trail cam, a dashcam, a bodycam. |
| <img src="docs/index/find-the-place-first.webp" width="90" alt=""> | [**find-the-place-first**](skills/find-the-place-first/SKILL.md) | Always. Find a real photograph of the place before writing anything, then write the scene to what is in it. Even a bar inside a UFO starts as a real bar. |
| <img src="docs/index/night-shots.webp" width="90" alt=""> | [**night-shots**](skills/night-shots/SKILL.md) | The video is at night. A subject photographed in the dark is a silhouette, which Seedance can't animate. Unless the camera has its own light (a flash, infrared, headlights), find the empty place and write the subject in. |

### Worlds

| | Skill | Use it when |
| --- | --- | --- |
| <img src="docs/index/world-building-and-appropriation.webp" width="90" alt=""> | [**world-building-and-appropriation**](skills/world-building-and-appropriation/SKILL.md) | The request names a work, a film, a myth or a venue. Its world becomes the ground. |
| <img src="docs/index/ride-it.webp" width="90" alt=""> | &emsp;↳ [ride-it](skills/world-building-and-appropriation/SKILL.md#rides) | Part of world-building-and-appropriation, not a skill of its own. The request names a ride. The seat is the opening frame, and the work's things are placed along the track. |
| <img src="docs/index/swap-the-stand-in.webp" width="90" alt=""> | [**swap-the-stand-in**](skills/swap-the-stand-in/SKILL.md) | The photograph already has someone where the subject should be. |
| <img src="docs/index/sort-the-characters.webp" width="90" alt=""> | [**sort-the-characters**](skills/sort-the-characters/SKILL.md) | The request names characters. Each is handled by what it is: a meme has its photo found, a figure from myth or folklore is named, a celebrity or an owned character is declined, anyone else is described. |

### Telling

| | Skill | Use it when |
| --- | --- | --- |
| <img src="docs/index/observation-or-plot.webp" width="90" alt=""> | [**observation-or-plot**](skills/observation-or-plot/SKILL.md) | Deciding whether the take is an observation (a view held, nothing has to happen) or a plot (an event with a payoff). |
| <img src="docs/index/stamp-the-beats.webp" width="90" alt=""> | [**stamp-the-beats**](skills/stamp-the-beats/SKILL.md) | Every take. Each beat lands on its second. |
| <img src="docs/index/no-camera-directions.webp" width="90" alt=""> | [**no-camera-directions**](skills/no-camera-directions/SKILL.md) | Every take. Write what happens, never how it's filmed: no close-ups, pans or zooms. Seedance takes the camera from the photographs, and camera words fight them. |
| <img src="docs/index/one-bag-of-four.jpg" width="90" alt=""> | [**one-bag-of-four**](skills/one-bag-of-four/SKILL.md) | Choosing references. Seedance reads them as one flat set. |

### Remix

A page about how the engine changes a finished video. It isn't a skill to install.

| | Page | What it covers |
| --- | --- | --- |
| <img src="docs/index/remix.webp" width="90" alt=""> | [**Remix**](engine/remix.md) | A sentence that changes a finished video, and how deep the change goes. |

## Inside the engine

The modules here are the engine's own, the code that runs the skills above. A sentence goes in, a video comes out. The engine does not run from this repository: the modules that handle payment, capacity and deployment were removed.

| Layer | Files |
| --- | --- |
| Reading | `_search_intent.mjs` `_pregate.mjs` `entityResolve.mjs` `_prose_capable.mjs` `_look_change.mjs` `_ride.mjs` `forms.json` |
| Grounding | `_sourceability.mjs` `_query.mjs` `library.mjs` `_source_entity.mjs` `_ride_seat.mjs` `_ride_world.mjs` `_placeholder_card.mjs` `_plate_dressing.mjs` `_judge_*.mjs` `redact_any.mjs` `detect_prompt.txt` |
| Direction | `_frame_zero.mjs` `_ground_prompt.mjs` `_beat_law.mjs` `_beat_edit.mjs` `_writer_contract.mjs` `_ride_writer.mjs` `_swap_check.mjs` |
| Seedance | `_multiref_gen.mjs` `_leak_guard.mjs` |
| Remix | `_remix_intent.mjs` `_carry_reader.mjs` `_strip_choice.mjs` `_gen_state.mjs` |

Every decision the engine makes, drawn as a question and its arms: [the full circuitry](docs/circuitry.svg).

The commits are real, daily from 2 August 2026. Removed files were taken out of every commit, and every message was set to one line.
