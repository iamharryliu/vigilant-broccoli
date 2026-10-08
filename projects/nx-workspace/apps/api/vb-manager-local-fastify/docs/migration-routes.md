# VB Manager API Route Migration

All original API URLs and methods remain registered beneath the Fastify `/api` prefix; dynamic segments use `:param`.

| Original URL                                 | Methods                  | Fastify registration                        |
| -------------------------------------------- | ------------------------ | ------------------------------------------- |
| `/api/api-keys`                              | GET, POST                | `src/routes/api-keys/index.ts`              |
| `/api/api-keys/:id`                          | DELETE, PATCH            | `src/routes/api-keys/index.ts`              |
| `/api/auth/google-token`                     | POST                     | `src/routes/auth/index.ts`                  |
| `/api/aws/profiles`                          | GET                      | `src/routes/aws/index.ts`                   |
| `/api/bucket`                                | DELETE, GET, POST        | `src/routes/bucket/index.ts`                |
| `/api/calendar/events`                       | GET, POST                | `src/routes/calendar/index.ts`              |
| `/api/calendar/parse`                        | POST                     | `src/routes/calendar/index.ts`              |
| `/api/chat`                                  | POST                     | `src/routes/chat/index.ts`                  |
| `/api/chat/publish`                          | POST                     | `src/routes/chat/index.ts`                  |
| `/api/disk-space`                            | GET                      | `src/routes/disk-space/index.ts`            |
| `/api/dj/download`                           | POST                     | `src/routes/dj/index.ts`                    |
| `/api/dj/open-rekordbox`                     | POST                     | `src/routes/dj/index.ts`                    |
| `/api/dj/playlists`                          | GET                      | `src/routes/dj/index.ts`                    |
| `/api/docker/containers`                     | GET                      | `src/routes/docker/index.ts`                |
| `/api/docker/remove`                         | POST                     | `src/routes/docker/index.ts`                |
| `/api/docker/start`                          | POST                     | `src/routes/docker/index.ts`                |
| `/api/docker/stop`                           | POST                     | `src/routes/docker/index.ts`                |
| `/api/event-calendars`                       | GET, POST                | `src/routes/event-calendars/index.ts`       |
| `/api/event-calendars/:id`                   | DELETE, PATCH            | `src/routes/event-calendars/index.ts`       |
| `/api/event-calendars/:id/sync`              | GET, POST                | `src/routes/event-calendars/index.ts`       |
| `/api/event-calendars/untracked`             | GET                      | `src/routes/event-calendars/index.ts`       |
| `/api/event-calendars/untracked/:calendarId` | DELETE                   | `src/routes/event-calendars/index.ts`       |
| `/api/flyio/apps`                            | GET                      | `src/routes/flyio/index.ts`                 |
| `/api/flyio/auth/login`                      | POST                     | `src/routes/flyio/index.ts`                 |
| `/api/gcloud/auth-status`                    | GET                      | `src/routes/gcloud/index.ts`                |
| `/api/gcloud/projects`                       | GET                      | `src/routes/gcloud/index.ts`                |
| `/api/gcloud/reauth-needed`                  | GET                      | `src/routes/gcloud/index.ts`                |
| `/api/gcloud/set-account`                    | POST                     | `src/routes/gcloud/index.ts`                |
| `/api/gcloud/set-project`                    | POST                     | `src/routes/gcloud/index.ts`                |
| `/api/gcloud/vault-token`                    | POST                     | `src/routes/gcloud/index.ts`                |
| `/api/generate-secret`                       | GET                      | `src/routes/generate-secret/index.ts`       |
| `/api/github/organization-members`           | DELETE, POST             | `src/routes/github/index.ts`                |
| `/api/github/organization-structure`         | GET                      | `src/routes/github/index.ts`                |
| `/api/github/organization/members`           | GET                      | `src/routes/github/index.ts`                |
| `/api/github/organization/meta`              | GET                      | `src/routes/github/index.ts`                |
| `/api/github/organization/repositories`      | DELETE, GET, POST        | `src/routes/github/index.ts`                |
| `/api/github/organization/teams`             | DELETE, GET, POST        | `src/routes/github/index.ts`                |
| `/api/github/pages`                          | GET                      | `src/routes/github/index.ts`                |
| `/api/github/user/organizations`             | GET                      | `src/routes/github/index.ts`                |
| `/api/kanban/boards`                         | GET, PUT                 | `src/routes/kanban/index.ts`                |
| `/api/language-learning/define`              | POST                     | `src/routes/language-learning/index.ts`     |
| `/api/language-learning/history`             | GET                      | `src/routes/language-learning/index.ts`     |
| `/api/language-learning/mastered`            | DELETE, GET, POST        | `src/routes/language-learning/index.ts`     |
| `/api/language-learning/reset`               | DELETE                   | `src/routes/language-learning/index.ts`     |
| `/api/language-learning/words`               | POST                     | `src/routes/language-learning/index.ts`     |
| `/api/llm-test`                              | POST                     | `src/routes/llm-test/index.ts`              |
| `/api/local-ip`                              | GET                      | `src/routes/local-ip/index.ts`              |
| `/api/local-machine`                         | GET                      | `src/routes/local-machine/index.ts`         |
| `/api/local-services`                        | GET                      | `src/routes/local-services/index.ts`        |
| `/api/network-monitor/lan-devices`           | GET                      | `src/routes/network-monitor/index.ts`       |
| `/api/network-monitor/outbound-connections`  | GET                      | `src/routes/network-monitor/index.ts`       |
| `/api/network-monitor/scan-device`           | POST                     | `src/routes/network-monitor/index.ts`       |
| `/api/notepad`                               | GET, POST                | `src/routes/notepad/index.ts`               |
| `/api/outfit-recommendation`                 | GET                      | `src/routes/outfit-recommendation/index.ts` |
| `/api/pm2/delete`                            | POST                     | `src/routes/pm2/index.ts`                   |
| `/api/pm2/processes`                         | GET                      | `src/routes/pm2/index.ts`                   |
| `/api/pm2/restart`                           | POST                     | `src/routes/pm2/index.ts`                   |
| `/api/pm2/start`                             | POST                     | `src/routes/pm2/index.ts`                   |
| `/api/pm2/stop`                              | POST                     | `src/routes/pm2/index.ts`                   |
| `/api/public-ip`                             | GET                      | `src/routes/public-ip/index.ts`             |
| `/api/qr-code`                               | POST                     | `src/routes/qr-code/index.ts`               |
| `/api/recipe/scrape`                         | POST                     | `src/routes/recipe/index.ts`                |
| `/api/recipe/scrape-preview`                 | POST                     | `src/routes/recipe/index.ts`                |
| `/api/resume`                                | GET, PUT                 | `src/routes/resume/index.ts`                |
| `/api/resume/chat`                           | POST                     | `src/routes/resume/index.ts`                |
| `/api/resume/pdf`                            | POST                     | `src/routes/resume/index.ts`                |
| `/api/send-email-message`                    | POST                     | `src/routes/send-email-message/index.ts`    |
| `/api/send-text-message`                     | POST                     | `src/routes/send-text-message/index.ts`     |
| `/api/shell/execute`                         | POST                     | `src/routes/shell/index.ts`                 |
| `/api/speech-to-text`                        | POST                     | `src/routes/speech-to-text/index.ts`        |
| `/api/speed-test`                            | GET                      | `src/routes/speed-test/index.ts`            |
| `/api/ssh-key`                               | GET                      | `src/routes/ssh-key/index.ts`               |
| `/api/stripe/checkout-session`               | POST                     | `src/routes/stripe/index.ts`                |
| `/api/tailscale/machines`                    | GET                      | `src/routes/tailscale/index.ts`             |
| `/api/tasks`                                 | DELETE, GET, PATCH, POST | `src/routes/tasks/index.ts`                 |
| `/api/tasks/create`                          | POST                     | `src/routes/tasks/index.ts`                 |
| `/api/tasks/lists`                           | DELETE, GET, PATCH, POST | `src/routes/tasks/index.ts`                 |
| `/api/tasks/move`                            | POST                     | `src/routes/tasks/index.ts`                 |
| `/api/tasks/parse-image`                     | POST                     | `src/routes/tasks/index.ts`                 |
| `/api/tasks/parse-text`                      | POST                     | `src/routes/tasks/index.ts`                 |
| `/api/terraform/status`                      | GET                      | `src/routes/terraform/index.ts`             |
| `/api/text-to-speech`                        | POST                     | `src/routes/text-to-speech/index.ts`        |
| `/api/todo`                                  | GET, PUT                 | `src/routes/todo/index.ts`                  |
| `/api/todo/solve`                            | POST                     | `src/routes/todo/index.ts`                  |
| `/api/vercel/projects`                       | GET                      | `src/routes/vercel/index.ts`                |
| `/api/voice-list`                            | POST                     | `src/routes/voice-list/index.ts`            |
| `/api/weather`                               | GET                      | `src/routes/weather/index.ts`               |
| `/api/wireguard/status`                      | GET                      | `src/routes/wireguard/index.ts`             |
| `/api/wrangler/login`                        | POST                     | `src/routes/wrangler/index.ts`              |
| `/api/wrangler/pages`                        | DELETE, GET              | `src/routes/wrangler/index.ts`              |
