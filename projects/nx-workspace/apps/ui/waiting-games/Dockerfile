# Build context is the app's Vite dist folder; the unprivileged image serves it on 8080.
FROM docker.io/nginxinc/nginx-unprivileged:1-alpine

COPY . /usr/share/nginx/html

EXPOSE 8080
