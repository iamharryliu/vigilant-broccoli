# Insta360 Studio

Desktop editor for footage shot on Insta360 cameras. Its job is reframing: a 360 clip has no fixed frame, so the edit decides where the flat output video is pointing at every moment.

## Table of Contents

- [Workflow](#workflow)
- [Framing](#framing)
  - [Framing Tools](#framing-tools)
  - [Combining Tools](#combining-tools)
- [Stabilization](#stabilization)
- [Export](#export)
- [Links](#links)

## Workflow

1. Import the `.insv` / `.insp` files straight from the camera.
2. Pick the lens mode and aspect ratio for the output.
3. Reframe the clip — see [Framing](#framing).
4. Apply stabilization and horizon levelling.
5. Colour grade, then export a flat video for a normal editor.

Insta360 Studio is a reframing and export stage, not a full NLE — cutting, audio, and titles are usually done afterwards in a regular video editor.

## Framing

Framing is choosing the view direction (pan/tilt) and field of view for each frame of a 360 clip. Every tool below is a different way of authoring that camera path.

### Framing Tools

| Tool           | What it does                                                                            | Good for                                                                  | Watch out for                                                                                         |
| -------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Auto Frame     | Picks a view path automatically from the scene                                          | A fast first pass to see what is in the clip                              | Generic results; treat it as a draft to refine, not a finished framing                                |
| Deep Track     | AI subject tracking — select a subject and the view follows it for the rest of the clip | Following a person, a board, a pet, or a vehicle through the frame        | Drops the lock when the subject leaves frame, is occluded, or changes appearance; re-select to resume |
| Direction Lock | Pins the view to a fixed world direction so camera rotation no longer turns the shot    | Handheld or mounted shots where the camera spins but the subject does not | Locks direction only — the subject still drifts out of frame if it moves                              |
| Keyframes      | Manual view points at chosen times; the view is interpolated between them               | Deliberate reveals and pans, and fixing up an automatic path              | Sparse keyframes give loose, floaty motion; add more where the motion is quick                        |
| ViewFinder     | Drag the preview to set the view live while the clip plays                              | Roughing out a path by feel before committing keyframes                   | Hand motion is shaky; clean it up with keyframes afterwards                                           |

### Combining Tools

- Direction Lock and Deep Track answer different questions: Direction Lock holds a _direction_ steady, Deep Track holds a _subject_ in frame. Use Direction Lock when the camera moves and the subject does not; use Deep Track when the subject moves.
- Any automatic path (Deep Track, Auto Frame, ViewFinder) can be refined afterwards by editing keyframes.
- Keyframes are the fallback whenever tracking loses the subject mid-clip.

## Stabilization

- FlowState stabilization smooths camera shake using the camera's gyro data.
- Horizon levelling keeps the horizon flat regardless of how the camera is tilted, and is separate from stabilization.
- Both are applied after framing, so a jittery framing path stays jittery — fix the path, not the stabilizer.

## Export

- Export a flat (non-360) video once reframing is done; the view path is baked in and cannot be changed later.
- Keep the project file if the framing may need revisiting.
- Exporting the 360 clip unframed preserves all directions but leaves the reframing to whoever plays it back.

## Links

- [Insta360 Studio download](https://www.insta360.com/download)
