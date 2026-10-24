# Insta360 Studio

Desktop editor for footage shot on Insta360 cameras. Its job is reframing: a 360 clip has no fixed frame, so the edit decides where the flat output video is pointing at every moment.

## Table of Contents

- [Framing](#framing)
  - [Framing Tools](#framing-tools)
- [Stabilization](#stabilization)
- [Links](#links)

## Framing

Framing is choosing the view direction (pan/tilt) and field of view for each frame of a 360 clip. Every tool below is a different way of authoring that camera path.

### Framing Tools

| Tool           | What it does                                                                            | Good for                                                                  | How to access                                                                                     |
| -------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Auto Frame     | Picks a view path automatically from the scene                                          | A fast first pass to see what is in the clip                              | Media page > Right-click clip > Start Auto Frame > Wait for the Auto Frame icon (bottom right)    |
| Deep Track     | AI subject tracking — select a subject and the view follows it for the rest of the clip | Following a person, a board, a pet, or a vehicle through the frame        | Select clip > Deep Track icon (toolbar below preview, or right editing panel) > Drag over subject |
| Direction Lock | Pins the view to a fixed world direction so camera rotation no longer turns the shot    | Handheld or mounted shots where the camera spins but the subject does not | Select clip > Stabilization settings > Direction Lock                                             |
| Keyframes      | Manual view points at chosen times; the view is interpolated between them               | Deliberate reveals and pans, and fixing up an automatic path              | Timeline > Move playhead > Mark as keyframe > Set framing in preview window                       |
| ViewFinder     | Drag the preview to set the view live while the clip plays                              | Roughing out a path by feel before committing keyframes                   | Insta360 mobile app > Editor (not desktop Studio)                                                 |

## Stabilization

- FlowState stabilization smooths camera shake using the camera's gyro data.
- Horizon levelling keeps the horizon flat regardless of how the camera is tilted, and is separate from stabilization.
- Both are applied after framing, so a jittery framing path stays jittery — fix the path, not the stabilizer.

## Links

- [Insta360 Studio download](https://www.insta360.com/download)
