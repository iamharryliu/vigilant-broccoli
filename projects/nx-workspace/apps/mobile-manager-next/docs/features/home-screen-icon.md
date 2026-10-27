# Home Screen Icon

The app uses a green broccoli illustration on an opaque dark-green square. Next.js serves `src/app/apple-icon.png` (180×180) for Safari's Add to Home Screen and `src/app/icon.png` (512×512) as the matching browser icon through its file-based metadata convention. iOS applies the rounded corners.

The artwork was generated with the built-in image generation tool, using a centered sculptural broccoli with a chunky pale-green branching stalk, an emerald crown, soft highlights and a dark forest-green background, with no text or border. `icon.png` is the reusable source for the smaller Apple icon.

Regenerate the Apple size from the app directory with ImageMagick:

```sh
convert src/app/icon.png -resize 180x180 -alpha off -strip PNG24:src/app/apple-icon.png
```

After deployment, verify `/apple-icon.png` returns a PNG without authentication. In iPhone Safari, use Share → Add to Home Screen and check the broccoli is centered and legible. Remove and re-add an existing shortcut to refresh its cached icon.
