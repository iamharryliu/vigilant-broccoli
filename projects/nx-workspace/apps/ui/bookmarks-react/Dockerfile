# Build context is the app's Vite dist folder; the unprivileged image serves it on 8080.
# Mount a JSON file over /usr/share/nginx/html/default-bookmarks.json to replace the default bookmarks.
FROM docker.io/nginxinc/nginx-unprivileged:1-alpine

COPY . /usr/share/nginx/html

EXPOSE 8080
