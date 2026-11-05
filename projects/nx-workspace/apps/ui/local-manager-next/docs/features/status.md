# Status

## Navigation

- Open Status from Home quick links or Search (it has no right-sidebar entry) to navigate to `/status`; the browser title identifies Status.
- Direct visits, reloads and browser back/forward use the same application route.

## Embedded status site

- The existing `VB_MONITORING_URL.STATUS` destination fills the main content viewport edge to edge, with an accessible iframe title and scrolling inside the embedded document.
- Navigation remains available as the window resizes; other routes keep their existing padding and scrolling.
- Local quick links use the application route instead of the shared Status embed dialog; shared quick links and dialog consumers remain unchanged.
- The destination retains its existing frame and authentication policies; this page adds no iframe permissions.
