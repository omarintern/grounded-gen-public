[← Back to the skills](../README.md)

# Remix

*A page about the engine, not a skill to install.*

A remix is a sentence that changes a finished video. The engine reads what the sentence changes against the parent video, decides how deep the change goes, and comes back in at the layer that change reaches. Everything the sentence doesn't touch is kept, read from the parent itself rather than assumed.

## Example: the bear becomes a T-rex

| Parent | Remix |
| --- | --- |
| *"cctv footage of a bear chasing a man for his cereal. the bear ends up grabbing the cereal and sees the camera and starts celebrating with tiktok dances"* | *"Its a T-rex instead of a bear and the man running holds the cereal box while running then drops it"* |
| <a href="examples/bear.mp4"><img src="examples/bear.webp" width="300" alt="CCTV: a bear grabs the cereal"></a> | <a href="examples/trex.mp4"><img src="examples/trex.webp" width="300" alt="The same kitchen: a T-rex grabs the cereal"></a> |

<img src="examples/kitchen-found.jpg" width="360" alt="The kitchen CCTV still both videos were made from">

The remix changed the figure and the action. The kitchen stayed: both videos were made from this same CCTV still.

## How deep a change goes

- **Surgery.** A new action, a prop or a line of dialogue is an edit to the parent's script. Every photograph is reused, and the opening frame's rules hold.
- **Reframe.** A new place, a new cast, new cuts, or a switch between candid and cinematic runs the whole engine again on a sentence compiled from the parent and the change. What is kept is pinned, and kept characters ride the parent's own frames. If a fresh search finds nothing, it falls back to the parent's photograph.

## Its own checks

- A video from another engine cannot be remixed.
- A famous or owned figure named in the change is declined on the change alone. Everything kept keeps its earlier verdicts.
- A name that is only referenced ("talks like X") is carried as a manner and puts no one on screen.
- A change the engine can't type (vague, empty, or words it had to drop) goes to a planner, whose plan is then checked by the same rules. If no plan works, nothing is claimed.

Code: [`_remix_intent.mjs`](../_remix_intent.mjs) · [`_carry_reader.mjs`](../_carry_reader.mjs) · [`_strip_choice.mjs`](../_strip_choice.mjs) · [`_gen_state.mjs`](../_gen_state.mjs)
