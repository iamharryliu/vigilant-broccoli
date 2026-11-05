# Self-Hosting

Run Utilities UI from the `iamharryliu/utilities-ui` image.

## Run from Registry

The `deploy-container` target in `project.json` pushes the image for `linux/amd64` and `linux/arm64`: the app's static Vite build on `nginx-unprivileged`, listening on 8080.

```
docker run -d --name utilities-ui --restart unless-stopped \
  -p 8080:8080 \
  iamharryliu/utilities-ui:latest
```

Open `http://localhost:8080`. There is nothing to configure: every utility runs in the browser. The currency converter fetches exchange rates from `api.fxratesapi.com`, so it needs internet access; the rest works offline.

To update, `docker pull iamharryliu/utilities-ui:latest` and recreate the container.
