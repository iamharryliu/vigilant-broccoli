# Image Gallery

`ImageGallery` renders one list of images in a chosen layout. It holds no data and no layout choice: callers pass `items` and `layout` and own each image's call to action.

## Props

- `items`: `ImageGalleryItem[]`, each `{ id, imageUrl, label, href?, onSelect? }`. `label` is the tile's accessible name. With `href` the tile is a link, and when `onSelect` is also set a plain left click calls it instead of following the link (`interceptPlainClick`), so an SPA can navigate in-app while modified clicks still open a new tab. Without `href` the tile is a button calling `onSelect`
- `layout`: `IMAGE_GALLERY_LAYOUT.MASONRY | JUSTIFIED | STACK`; `isImageGalleryLayout` validates stored values
- `stackLabels`: `{ previous, next }` for the Stack buttons' accessible names (English defaults), since the lib has no i18n

## Layouts

- **Masonry**: CSS columns at natural height, no crop; order runs down each column
- **Justified**: centered flex rows about 240px tall. Each image's `flex-grow`/`flex-basis` follow its aspect ratio, measured on load (4:3 until then), and an image never grows past 300px tall, so a short last row is centered instead of stretched
- **Stack**: a pile of unframed images, the current one straight on top and the next five fanned beneath at tilts and offsets hashed from the id. ← / → (ignored by `shouldIgnoreShortcutKeystroke`, so text fields and open dialogs keep their arrows) or the previous / next buttons cycle with wrap-around. Each step animates the moving card with the Web Animations API, swinging it out beside the pile and swapping its layer at the midpoint; this is skipped under `prefers-reduced-motion`. Cards under the top one are `inert`

The component-library demo is at `/image-gallery` (`react-sandbox`'s `ImageGalleryDemo`, local SVG placeholders in mixed sizes), switching layouts with `react-lib-higher-level`'s `TabbedView`, the same icon-only tabs as the manager apps' home panels.
