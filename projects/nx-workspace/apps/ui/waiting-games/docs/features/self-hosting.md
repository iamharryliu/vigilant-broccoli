# Self-Hosting

Run Waiting Games from the `iamharryliu/waiting-games` image.

## Run from Registry

The `deploy-container` target in `project.json` pushes the image for `linux/amd64` and `linux/arm64`: the app's static Vite build on `nginx-unprivileged`, listening on 8080.

```
docker run -d --name waiting-games --restart unless-stopped \
  -p 8080:8080 \
  iamharryliu/waiting-games:latest
```

Open `http://localhost:8080`. There is nothing to configure and no backend: the games run entirely in the browser and work offline once loaded. See [Waiting Games](./waiting-games.md) for how the rounds and settings work.

To update, `docker pull iamharryliu/waiting-games:latest` and recreate the container.
