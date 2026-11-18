# Self-Hosting

Run Bookmarks from the `iamharryliu/bookmarks-react` image and seed it with your team's bookmarks.

## Run from Registry

The `deploy-container` target in `project.json` pushes the image for `linux/amd64` and `linux/arm64`: the app's static Vite build on `nginx-unprivileged`, listening on 8080.

```
docker run -d --name bookmarks --restart unless-stopped \
  -p 8080:8080 \
  iamharryliu/bookmarks-react:latest
```

Open `http://localhost:8080`. There is no backend: bookmarks live in each visitor's browser.

## Team Bookmarks

On a visitor's first visit (no saved list in their browser) the app fetches `default-bookmarks.json` from the server and uses it as their starting list; the Import dialog's "Set to default JSON" button loads the same file. The image ships the public starter list; mount your own file over it, with no rebuild:

```
docker run -d --name bookmarks --restart unless-stopped \
  -p 8080:8080 \
  -v "$PWD/team-bookmarks.json:/usr/share/nginx/html/default-bookmarks.json:ro" \
  iamharryliu/bookmarks-react:latest
```

The file is an array in the same shape Export produces; start from the Import dialog's sample or an exported list:

```json
[
  {
    "label": "Wiki",
    "target": "https://wiki.example.com",
    "type": "browser",
    "subgroup": "Team"
  }
]
```

Each entry needs a non-empty label, an `http://` or `https://` target and type `browser`; subgroup is optional. An invalid file leaves new visitors with an empty list. Edits to the file reach new visitors immediately; people who already have a saved list keep it until they use Import > "Set to default JSON" (then Merge or Replace).

To update, `docker pull iamharryliu/bookmarks-react:latest` and recreate the container.
