# Office Presence Socket Server Demo

## Build & Run

```
nx docker:build office-presence-socket-server-demo

docker run -p 3000:3000 \
  -e SLACK_BOT_TOKEN=xoxb-... \
  -e SLACK_APP_TOKEN=xapp-... \
  office-presence-socket-server-demo:latest
```

## Deploy & Run from Registry

```
nx deploy-container office-presence-socket-server-demo

docker run -p 3000:3000 \
  -e SLACK_BOT_TOKEN=xoxb-... \
  -e SLACK_APP_TOKEN=xapp-... \
  iamharryliu/office-presence-socket-server-demo:latest
```

### With Optional Args

```
docker run -p 3000:3000 \
  -e SLACK_BOT_TOKEN=xoxb-... \
  -e SLACK_APP_TOKEN=xapp-... \
  -e OFFICES=London,Stockholm,NYC \
  -e ENABLE_REMINDERS=true \
  -e INCLUDE_WEEKENDS=true \
  -e DAYS_AHEAD=14 \
  iamharryliu/office-presence-socket-server-demo:latest
```

## Environment Variables

| Variable           | Required | Default | Description                     |
| ------------------ | -------- | ------- | ------------------------------- |
| `SLACK_BOT_TOKEN`  | Yes      | -       | Slack bot token                 |
| `SLACK_APP_TOKEN`  | Yes      | -       | Slack app token                 |
| `OFFICES`          | No       | `[]`    | Comma-separated list of offices |
| `ENABLE_REMINDERS` | No       | `false` | Enable reminders                |
| `INCLUDE_WEEKENDS` | No       | `false` | Include weekends                |
| `DAYS_AHEAD`       | No       | `14`    | Number of days ahead            |
