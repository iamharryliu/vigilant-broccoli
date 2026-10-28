# Chromium browser verification

Evidence captured on 2026-10-28 for the browser setup fix and [PR #1319](https://github.com/iamharryliu/vigilant-broccoli/pull/1319), without changing that PR or copying its implementation into this branch.

## Environment and provisioning

- Ubuntu 24.04.4 ARM64, non-root `abc`, workspace Playwright 1.61.1, Chromium 149.0.7827.0.
- A plain `chromium.launch()` reproduced the missing `libglib-2.0.so.0` failure. Browser installation alone also reported missing GLib, NSS, ATK and other runtime libraries.
- Docker is unavailable and `sudo -n true` requires a password, so the new image layer and the privileged `pnpm screenshot:setup` command were not executed here. No image was deployed or recreated.
- For browser verification only, apt indexes, the installed Playwright version’s complete Ubuntu Chromium/tools package set and its missing dependency closure were downloaded to `/tmp/chromium-apt`; 86 packages were extracted under `/tmp/chromium-runtime` with `dpkg-deb -x`. `LD_LIBRARY_PATH=/tmp/chromium-runtime/usr/lib/aarch64-linux-gnu` and a temporary fontconfig file pointing at the extracted fonts made the same unmodified `chromium.launch()` succeed. No custom browser flags or executable overrides were added. This validates the runtime dependency set on a matching OS/architecture, not a completed Docker image build.
- Browser binaries were installed using workspace `playwright install chromium` as `abc`, in `/config/.cache/ms-playwright`. The Docker version extraction and `npm exec --package=playwright@<locked-version> -- playwright --version` both selected 1.61.1.
- The unchanged `pnpm screenshot:themes -- http://localhost:3027` succeeded with those temporary library/font environment variables and wrote all four PNGs under gitignored `projects/nx-workspace/screenshots/localhost-3027-{phone,desktop}-{light,dark}.png`. Those command-smoke captures use the browser’s default geolocation denial; the linked captures below use deterministic geolocation and intercepted responses instead. A separate invocation still rejected `https://example.com/` before launching a browser.

## Feature checks

The preview used a disposable detached checkout at commit `00346d198b1d3ad6b6dbc9010841f6119fde987e` of #1319, with `next dev --webpack --hostname 127.0.0.1 --port 3027` for weather-next. It shared installed packages but used the isolated checkout’s feature source. No live credentials were supplied. A temporary Playwright harness blocked remote requests, granted geolocation at 59.3293/18.0686, fixed the clock to 2026-10-28 10:30 UTC and used Europe/Stockholm time.

The harness intercepted `/api/weather?*` and `/api/preparation`. Weather requests were held until the loading assertions completed, then fulfilled with deterministic Stockholm weather (18°C, clear, 60% humidity, 12 km/h wind and a one-day forecast). Preparation requests remained pending through the ready-state assertions, then returned a sunglasses badge. A subsequent reload received HTTP 503 for weather; clicking Retry held another request before returning success. Duplicate mount requests from development Strict Mode were fulfilled together.

All eight combinations passed: phone 390×844 and desktop 1440×900, each in light/dark and normal/reduced motion. [Recorded computed styles and assertions](./results.json) preserve per-combination evidence:

- Loading had `aria-busy=true` and a visible `::before` highlight. Normal motion had a running loading animation and different opacity samples 450 ms apart; the clock container stayed at opacity 1.
- Success cleared `aria-busy` and removed the pseudo-element highlight while preparation remained pending for another 500 ms. Completing preparation showed the sunglasses badge.
- Weather failure displayed the card’s alert and removed the highlight. Retry restored loading/highlighting and then returned to the ready state.
- Reduced motion had `animation-name: none`, zero loading animations and the same static opacity 0.65 in both samples, including after retry.
- Each context matched its requested color scheme, had no page JavaScript errors and had no horizontal page overflow at initial loading.

## Reviewed captures

All twelve linked captures were opened and visually reviewed. Clock text remained legible while loading; ready content, attribution and preparation badges fit at both widths. Light and dark surfaces matched the requested scheme. Ready captures wait for the preparation expansion to settle. Static images supplement the lifecycle/computed-style assertions above; they do not establish animation behavior by themselves.

| Environment | Loading | Ready | Reduced-motion loading |
| --- | --- | --- | --- |
| Desktop dark | [PNG](./desktop-dark-no-preference-loading.png) | [PNG](./desktop-dark-no-preference-ready.png) | [PNG](./desktop-dark-reduce-loading.png) |
| Desktop light | [PNG](./desktop-light-no-preference-loading.png) | [PNG](./desktop-light-no-preference-ready.png) | [PNG](./desktop-light-reduce-loading.png) |
| Phone dark | [PNG](./phone-dark-no-preference-loading.png) | [PNG](./phone-dark-no-preference-ready.png) | [PNG](./phone-dark-reduce-loading.png) |
| Phone light | [PNG](./phone-light-no-preference-loading.png) | [PNG](./phone-light-no-preference-ready.png) | [PNG](./phone-light-reduce-loading.png) |

## Limits and rollout

The browser checks exercise the actual shared card through weather-next. The separate local-manager-next dashboard and mobile-manager-next Weather tab shells were not started. The temporary development preview is not a production build or a live weather-service check. No permanent tests or UI changes were added.

The ARM64 image still needs a real build and a scheduled rollout after merge. Lockfile changes now also trigger its existing image workflow; successful publication can lead the VM’s update timer to recreate code-server within 15 minutes, interrupting live tmux sessions. After recreation, install Chromium as the runtime user and rerun a launch/screenshot check without the temporary library paths. Debian agent-sandbox provisioning is unchanged; use the documented workspace setup command with apt privileges there.
