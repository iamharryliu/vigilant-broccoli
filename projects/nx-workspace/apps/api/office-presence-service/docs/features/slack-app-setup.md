# Slack App Setup

Manifests and the manual console steps for running the Office Presence app in Socket Mode or HTTP mode.

## Table of Contents

- [Manifests](#manifests)
- [Switch the Demo App to HTTP](#switch-the-demo-app-to-http)
- [Switch Back to Socket Mode](#switch-back-to-socket-mode)

## Manifests

| File | Mode | Difference |
| --- | --- | --- |
| [okin-manifest-socket.yml](../../../../../libs/@vigilant-broccoli/slackbots/docs/okin-manifest-socket.yml) | Socket | `socket_mode_enabled: true`, no Request URLs |
| [okin-manifest-http.yml](../../../../../libs/@vigilant-broccoli/slackbots/docs/okin-manifest-http.yml) | HTTP | `socket_mode_enabled: false` and Request URLs on the demo service host |

Scopes, the Home tab, the `/preview-reminder` command and the `app_home_opened` event are identical. Self-hosters replace `demo-office-presence-service.fly.dev` with their own host.

## Switch the Demo App to HTTP

Slack console steps are manual and are not automated. A Slack app can use **only one mode at a time**.

> **Warning:** the moment Socket Mode is disabled, any running Socket Mode instance of the demo app (`SLACK_MODE=socket`, a local `nx serve`, the Docker image) stops receiving events. Stop it first, or it keeps running as a dead process.

1. Stop every Socket Mode instance using this app's tokens.
2. Make sure the Fly service is deployed with its secrets (`SLACK_BOT_TOKEN`, `SLACK_SIGNING_SECRET`, `OFFICE_PRESENCE_INTERNAL_TOKEN`) and the `office_presence_data` volume exists (see [demo-deployment.md](./demo-deployment.md)).
3. **Basic Information → App Credentials:** copy the **Signing Secret** into Vault as `SLACK_SIGNING_SECRET`, then redeploy secrets.
4. **Socket Mode:** disable it.
5. **Event Subscriptions:** enable, set Request URL `https://demo-office-presence-service.fly.dev/slack/events` (it must show **Verified**), and keep the `app_home_opened` bot event.
6. **Interactivity & Shortcuts:** enable, Request URL `https://demo-office-presence-service.fly.dev/slack/interactivity`.
7. **Slash Commands → `/preview-reminder`:** Request URL `https://demo-office-presence-service.fly.dev/slack/commands`.
8. **OAuth & Permissions:** confirm the scopes from the manifest (`commands`, `chat:write`, `users:read`, `im:write`, `groups:write`, `mpim:write`, `channels:read`, `channels:write.invites`, `channels:write.topic`).
9. **Install App:** reinstall to the workspace (Request URL and scope changes require it) and refresh the bot token in Vault if it changed.
10. Open the app's Home tab in Slack and check the change appears in the demo UI (and vice versa).

Slack's URL verification reaches the service on a possibly suspended machine; if step 5 times out, retry once the machine has resumed.

## Switch Back to Socket Mode

Reverse steps 4–7 (enable Socket Mode, remove the Request URLs), make sure the app has an app-level token with `connections:write` (`SLACK_APP_TOKEN`), reinstall, then run the service or image with `SLACK_MODE=socket`.
