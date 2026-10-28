# Apps

- `/apps` (sidebar entry) is a phone home-screen style picker: a grid of brand-coloured rounded-square tiles (4 columns on phones, more on wider screens) with the name underneath. The page is pinned to the viewport and only the list scrolls, so section headings scroll with their tiles.
- Tiles are grouped into ordered sections in the typed `APP_SECTIONS` list in `src/app/constants/apps.ts`: an untitled personal group (Photos, Camera, Google Maps, Spotify, YouTube, Gmail, Proton Mail) then a "Development" section (GitHub, Pulls, Actions, Docs, Status, Projects, Deployments), each with its own grid under an optional `title` heading. Each app has a label, tile colour and lucide icon, plus either a `webUrl` (optional `iosUrl` and `androidPackage`) or a native-only `shortcutName`; add an entry to a section to add a tile.
- Web-backed tiles are plain `<a href={webUrl}>` links; `onClick` prevents default and calls `openApp` (`src/app/utils/open-app.ts`), so long-press and no-JS still work.
- Desktop: `webUrl` opens in a new tab.
- iOS (including iPadOS reporting as Mac with touch): with `iosUrl`, navigates to the scheme and falls back to `webUrl` after about 1.2s only if the page is still visible (`visibilitychange`/`pagehide` cancel it); without it, opens `webUrl`.
- Android: with `androidPackage`, navigates to an `intent://` URL with `S.browser_fallback_url` so Android handles the fallback; without one, opens `webUrl`, which an installed PWA captures within its scope.
- Pulls and Actions open the repository's GitHub pulls and actions pages by `webUrl` only, with no native scheme; the GitHub app captures them as universal/app links where installed.
- Docs, Projects and Deployments (the pages-index preview deployments page) have no native app. Home-screen web apps cannot be launched from another app on iOS, so they open in Safari.
- Google Maps opens the generic app/home using `comgooglemaps://` on iOS and package `com.google.android.apps.maps` on Android, with `https://www.google.com/maps` as the web fallback and desktop URL. These identifiers follow the official [iOS URL scheme](https://developers.google.com/maps/documentation/urls/ios-urlscheme), [Android intents](https://developer.android.com/guide/components/google-maps-intents) and [Maps URLs](https://developers.google.com/maps/documentation/urls/get-started) documentation. It uses the existing launcher without a destination, directions, API key or embedded map.

## Photos and Camera

Photos and Camera are native-only buttons with the same tile layout and keyboard activation. They run `shortcuts://run-shortcut?name=Mobile%20Manager%20Photos` and `shortcuts://run-shortcut?name=Mobile%20Manager%20Camera` synchronously from the click on iOS, including touch-Mac iPad detection. They have no web URL, fallback timer, Android intent or desktop launch. The picker always shows a Requires setup caption and expandable iPhone shortcut setup instructions. Activating either tile expands its setup instructions, including on Android/desktop where it does not navigate. The first server/client render is identical and platform detection runs only on activation.

### Setup on each iPhone or iPad

1. Install or restore Apple's Shortcuts app if needed.
2. Create a shortcut named exactly `Mobile Manager Photos`. Add one **Open App** action and choose **Photos**.
3. Create a shortcut named exactly `Mobile Manager Camera`. Add one **Open App** action and choose **Camera**. Do not substitute Take Photo, which runs a capture action rather than opening the Camera app.
4. Run each shortcut inside Shortcuts to verify the selected Apple app opens. Then return to `/apps`, tap its tile and accept any system prompt to open Shortcuts.

If the target cannot be selected or opened on the device, open it manually. Missing/renamed shortcuts, removed apps, restrictions and OS/browser behavior can prevent launching. The website cannot inspect the shortcut collection or determine whether the Apple app opened. Shortcuts may stay visible or report an error; no timed redirect claims success or sends the user elsewhere.

### Sources and verification limits

Apple documents [running a saved shortcut by URL-encoded name](https://support.apple.com/guide/shortcuts/run-a-shortcut-from-a-url-apd624386f42/ios) and [Open App as an action for launching another app](https://support.apple.com/guide/shortcuts/apdaf74d75a5/ios). This establishes the mechanism, not that every device permits these two targets. The [Apple URL Scheme Reference](https://developer.apple.com/library/archive/featuredarticles/iPhoneURLScheme_Reference/Introduction/Introduction.html) and [Shortcuts URL scheme introduction](https://support.apple.com/guide/shortcuts/intro-to-url-schemes-apd621a1ad7a/ios) do not establish official direct Photos/Camera launch URLs. No primary-source verification was found for `photos-redirect://`; it is deliberately unused, as is the unsubstantiated `camera://`.

Real iPhone Safari and an installed home-screen web app require manual verification: create both shortcuts, verify their Open App targets, launch each tile, try a missing shortcut and denied prompt, return to the picker, and confirm existing Google Maps/web fallback behavior still works. Native launches have not been verified on physical hardware in this environment.
