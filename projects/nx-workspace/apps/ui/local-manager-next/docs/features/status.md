# Status

## Navigation

- Open Status from the right sidebar, Home quick links or Search to navigate to `/status`; the sidebar highlights the route and the browser title identifies Status.
- Direct visits, reloads and browser back/forward use the same application route.

## Embedded status site

- The existing `VB_MONITORING_URL.STATUS` destination fills the main content viewport edge to edge, with an accessible iframe title and scrolling inside the embedded document.
- Navigation and the right sidebar remain available as the window resizes; other routes keep their existing padding and scrolling.
- Local quick links use the application route instead of the shared Status embed dialog; shared quick links and dialog consumers remain unchanged.
- The destination retains its existing frame and authentication policies; this page adds no iframe permissions.
