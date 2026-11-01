# Embed

- Registry links flagged `embed: true` (Deployments, Status, Uptime, Docs, Agent Context, Resume, Utilities and any future flagged link) open in an in-app `/embed?target=<url>` page instead of an external tab, from the Quick Links tab and from Apps tiles whose `webUrl` matches one. Which links embed comes from the shared registry; nothing is hardcoded here.
- `/embed` renders a full-panel `<iframe>` (titled with the link label, `border-0`, bottom safe-area padding) under the app shell topbar and sidebar (the way back), pinned to the viewport like other pages, and sets the document title to `<label> | Mobile Manager Next`.
- `findEmbedLink` in `src/app/constants/quick-links.ts` accepts only registry links with `embed: true` on a public `https` host; any other `target` renders nothing, so there is no arbitrary framing. Localhost, LAN, IP-literal and bare hosts are never embedded and have their `embed` flag cleared in `QUICK_LINKS`, so they open externally. Non-embed links open externally as before.
- `EMBED_ROUTE_PATH`, `EMBED_TARGET_PARAM` and `toEmbedRoute` live in `@vigilant-broccoli/common-js` and are shared with `local-manager-next`.
