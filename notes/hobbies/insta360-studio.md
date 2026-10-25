# Insta360 Studio

## Table of Contents

- [Workflow](#workflow)
  - [Workflow Tips](#workflow-tips)
- [Framing](#framing)
  - [Framing Tools](#framing-tools)
- [Stabilization](#stabilization)
- [Export](#export)
  - [Recommended Export](#recommended-export)
  - [Resolution](#resolution)
  - [Frame Rate](#frame-rate)
  - [Bitrate](#bitrate)
  - [Format and Encoding](#format-and-encoding)

## Workflow

| Action | Details |
| --- | --- |
| Import clips | Import the `.insv` clips from the camera or its SD card into Insta360 Studio |
| Open project | Create or open a project to edit the imported clips in |
| Select clips | Pick the clips to use and trim each to the part worth keeping |
| Reframe clips | Set keyframes on the timeline and aim the view at each one (see [Framing Tools](#framing-tools)) |
| Adjust FOV | Per keyframe: wider shows more scene, narrower zooms in; view mode presets (Natural View, Ultra Wide, Tiny Planet) set FOV and lens distortion together |
| Tune keyframe easing | Easing and timing between keyframes decide whether the view glides or snaps from one keyframe to the next |

### Workflow Tips

- Raise clip speed to 4x or more to skim footage quickly while placing keyframes, then set it back to 1x before export. Speed is a clip edit, not just a playback setting, so leaving it changes the exported video.

## Framing

### Framing Tools

| Tool | What it does | Good for | How to access |
| --- | --- | --- | --- |
| Auto Frame | Picks a view path automatically from the scene | A fast first pass to see what is in the clip | Media page > Right-click clip > Start Auto Frame > Wait for the Auto Frame icon (bottom right) |
| Deep Track | AI subject tracking — select a subject and the view follows it for the rest of the clip | Following a person, a board, a pet, or a vehicle through the frame | Select clip > Deep Track icon (toolbar below preview, or right editing panel) > Drag over subject |
| Direction Lock | Pins the view to a fixed world direction so camera rotation no longer turns the shot | Handheld or mounted shots where the camera spins but the subject does not | Select clip > Stabilization settings > Direction Lock |
| Keyframes | Manual view points at chosen times; the view is interpolated between them | Deliberate reveals and pans, and fixing up an automatic path | Timeline > Move playhead > Mark as keyframe > Set framing in preview window |
| ViewFinder | Drag the preview to set the view live while the clip plays | Roughing out a path by feel before committing keyframes | Insta360 mobile app > Editor (not desktop Studio) |

## Stabilization

- FlowState stabilization smooths camera shake using the camera's gyro data.
- Horizon levelling keeps the horizon flat regardless of how the camera is tilted, and is separate from stabilization.
- Both are applied after framing, so a jittery framing path stays jittery — fix the path, not the stabilizer.

## Export

### Recommended Export

| Setting | Value |
| --- | --- |
| Bitrate | Default |
| Encoding | H.264 (MP4); H.265 when file size matters more than compatibility |
| Frame rate | Match the source footage (usually 30 or 60 fps) |
| Resolution | 4K |

### Resolution

| Option | Dimensions | Use |
| --- | --- | --- |
| 1080p | 1920×1080 | Quick shares and social uploads; fastest export and smallest file |
| 2.7K | About 2704×1520; varies slightly by camera | Middle ground when 4K files are too large |
| 4K | 3840×2160 | Default for reframed video watched on large screens |
| Full 360 | 5760×2880 (5.7K) or 7680×3840 (8K) | Exporting the unreframed 360 video for 360 players; the ceiling depends on the camera |

### Frame Rate

| Option | Use |
| --- | --- |
| 24/25 fps | Cinematic look |
| 30 fps | General-purpose default |
| 50/60 fps | Fast action and smooth motion; needs footage shot at that rate or higher |

### Bitrate

| Option | Use |
| --- | --- |
| Lower | Smaller files for sharing; platforms re-compress uploads anyway |
| Default | Studio's suggestion for the chosen resolution; fine for most exports |
| Higher | Keeps detail in busy scenes (water, foliage, snow) at the cost of file size |

### Format and Encoding

| Encoding | Container | Use |
| --- | --- | --- |
| H.264 | MP4 | Most compatible; plays and uploads anywhere |
| H.265 | MP4 | About half the size of H.264 at similar quality; less compatible on older devices |
| ProRes 422 | MOV | Further editing or color grading in another editor; very large files |
