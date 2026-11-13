# CMS

## Overview

- `/cms` page (sidebar entry `SIDEBAR_ROUTE.CMS` with a `Cloud` icon, below Language Learning) browses the default Cloudflare R2 bucket in the shared `FileExplorer` ([docs](../../../../../libs/@vigilant-broccoli/react-lib/docs/features/file-explorer.md)), with upload into the open folder and delete of the selected files behind one confirmation
- Shift+click and Cmd/Ctrl+click select several items in list or grid view. Right-clicking an item opens Open and Delete (files only), or `Delete N files` for a multi-selection; the explorer calls `deleteFile` once per file, so each deleted file gets its own toast
- Folders are derived from key prefixes, since R2 keys are flat. Folder deletion is not offered
- The `photography/` folder feeds [photography.harryliu.dev](../../../photography-react/docs/features/photography.md): each subfolder is a public album (`photography/<album>/<image>`), so uploading or deleting images here changes the public site

## API

- `GET /api/cms?path=<folder>` lists the folder's direct children: files from keys directly under `<folder>/`, and one folder per next path segment with its direct child count and latest descendant `updatedAt`
- `POST /api/cms?path=<folder>` uploads the multipart `files` to `<folder>/<name>`
- `DELETE /api/cms?path=<key>` deletes one object
- `GET /api/cms/file?path=<key>` returns the object's bytes with a Content-Type from its extension so previews render
- Paths with a leading `/`, empty segments or `..` are rejected
- Every route goes through vb-express `/api/storage/*` to bucket-service with `provider=cloudflare-r2` and no `bucketName`, so bucket-service's default `CLOUDFLARE_BUCKET_NAME` applies. local-manager holds no R2 credentials. Uploads use bucket-service's `folder` query param, because it basenames part filenames
