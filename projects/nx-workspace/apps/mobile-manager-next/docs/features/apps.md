# Apps

- `/apps` (sidebar entry) is a phone home-screen style picker: a grid of brand-coloured rounded-square tiles (4 columns on phones, more on wider screens) with the name underneath. The page is pinned to the viewport and only the list scrolls, so section headings scroll with their tiles.
- Tiles are grouped into ordered sections in the typed `APP_SECTIONS` list in `src/app/constants/apps.ts`: an untitled personal group (YouTube, Gmail, Proton Mail) then a "Development" section (GitHub, Pulls, Actions, Docs, Status, Projects, Deployments), each with its own grid under an optional `title` heading. Each app has (`label`, `webUrl`, optional `iosUrl` and `androidPackage`, tile colour and lucide icon); add an entry to a section to add a tile.
- Tiles are plain `<a href={webUrl}>` links; `onClick` prevents default and calls `openApp` (`src/app/utils/open-app.ts`), so long-press and no-JS still work.
- Desktop: `webUrl` opens in a new tab.
- iOS (including iPadOS reporting as Mac with touch): with `iosUrl`, navigates to the scheme and falls back to `webUrl` after about 1.2s only if the page is still visible (`visibilitychange`/`pagehide` cancel it); without it, opens `webUrl`.
- Android: with `androidPackage`, navigates to an `intent://` URL with `S.browser_fallback_url` so Android handles the fallback; without one, opens `webUrl`, which an installed PWA captures within its scope.
- Pulls and Actions open the repository's GitHub pulls and actions pages by `webUrl` only, with no native scheme; the GitHub app captures them as universal/app links where installed.
- Docs, Projects and Deployments (the pages-index preview deployments page) have no native app. Home-screen web apps cannot be launched from another app on iOS, so they open in Safari.
