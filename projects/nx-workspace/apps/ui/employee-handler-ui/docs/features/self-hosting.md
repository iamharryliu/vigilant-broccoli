# Self-Hosting

Run Employee Handler from the `iamharryliu/employee-handler-next` image.

## Table of Contents

- [Run from Registry](#run-from-registry)
- [Environment Variables](#environment-variables)
- [Nuances](#nuances)

## Run from Registry

The `deploy-container` target in `project.json` builds and pushes the image for `linux/amd64` (Apple Silicon runs it under emulation). To try it with the bundled mock data and no sign-in:

```
docker run --platform linux/amd64 \
  -p 127.0.0.1:3000:3000 \
  -e DEMO_MODE=true \
  iamharryliu/employee-handler-next:latest
```

Open `http://localhost:3000`. For real use, drop `DEMO_MODE`, point it at a Supabase project for Google sign-in and at an employee-handler service:

```
docker run -d --name employee-handler --restart unless-stopped \
  --platform linux/amd64 \
  -p 3000:3000 \
  -e SUPABASE_URL=https://<project>.supabase.co \
  -e SUPABASE_PUBLISHABLE_KEY=<publishable key> \
  -e EMPLOYEE_HANDLER_URL=https://<employee-handler service> \
  -e ALLOWED_EMAIL_DOMAINS=<your domain> \
  iamharryliu/employee-handler-next:latest
```

The container is stateless, listens on 3000 and runs as a non-root user.

## Environment Variables

| Variable | Purpose |
| --- | --- |
| `ALLOWED_EMAILS`, `ALLOWED_EMAIL_DOMAINS` | Comma-separated emails and domains allowed to call the API after sign-in. With both unset, any user who can sign in to the Supabase project is allowed. |
| `DEMO_MODE` | `true` skips sign-in and serves the bundled mock to anyone. Ignored when `EMPLOYEE_HANDLER_URL` is set ([Demo Mode](./demo-mode.md)). |
| `EMPLOYEE_HANDLER_URL` | Upstream employee-handler service; every `/api/*` request is proxied to it. Unset, the API runs the bundled mock in-process. |
| `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_URL` | Supabase project for Google sign-in. Read at runtime through `/api/config`, so one image works with any project. Required unless `DEMO_MODE` is on. |

## Nuances

- The bundled mock keeps its data in memory: every visitor of one container shares it, and it resets when the container restarts.
- The image carries no Supabase or upstream settings; nothing is baked in at build time, so the published image needs no rebuild per deployment.
