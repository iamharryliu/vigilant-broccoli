FROM docker.io/node:22-alpine

ENV HOST=0.0.0.0
ENV PORT=3000
# socket needs no public URL; http (Events API) needs a public HTTPS URL in front of PORT.
ENV SLACK_MODE=socket
ENV BETTER_SQLITE3_VERSION=12.10.0
ENV NODE_CRON_VERSION=4.5.0

WORKDIR /app

COPY . .

# main.js requires both at runtime (they are esbuild externals), so they must stay in node_modules.
RUN apk add --no-cache su-exec \
    && apk add --no-cache --virtual .build-deps python3 make g++ \
    && npm install --no-package-lock --no-save --omit=dev \
       better-sqlite3@${BETTER_SQLITE3_VERSION} node-cron@${NODE_CRON_VERSION} \
    && npm cache clean --force \
    && apk del .build-deps \
    && chown -R node:node /app

# Mount a volume at /data and set OFFICE_PRESENCE_DB=/data/state.db to keep the SQLite state.
# Volumes (Fly, Docker) mount root-owned; chown at boot, then drop to the node user.
CMD [ "sh", "-c", "mkdir -p /data && chown node:node /data && exec su-exec node node main.js" ]
