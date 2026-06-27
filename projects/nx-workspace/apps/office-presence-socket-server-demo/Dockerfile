FROM docker.io/node:22-alpine

ENV HOST=0.0.0.0
ENV PORT=3000
ENV BETTER_SQLITE3_VERSION=12.10.0
ENV NODE_CRON_VERSION=4.5.0

WORKDIR /app

COPY . .

RUN apk add --no-cache --virtual .build-deps python3 make g++ \
    && npm install --no-package-lock --no-save better-sqlite3@${BETTER_SQLITE3_VERSION} \
    && mkdir -p /app/build/Release \
    && cp /app/node_modules/better-sqlite3/build/Release/better_sqlite3.node /app/build/Release/ \
    && rm -rf /app/node_modules \
    && apk del .build-deps \
    && npm install --no-package-lock --no-save node-cron@${NODE_CRON_VERSION} \
    && chown -R node:node /app

USER node

CMD [ "node", "main.js" ]
