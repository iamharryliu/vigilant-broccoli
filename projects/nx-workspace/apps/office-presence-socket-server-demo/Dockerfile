FROM docker.io/node:22-alpine

ENV HOST=0.0.0.0
ENV PORT=3000
ENV BETTER_SQLITE3_VERSION=12.10.0

WORKDIR /app

COPY . .

RUN apk add --no-cache --virtual .build-deps python3 make g++ \
    && corepack enable \
    && corepack prepare pnpm@11.1.2 --activate \
    && pnpm init \
    && pnpm add better-sqlite3@${BETTER_SQLITE3_VERSION} \
    && mkdir -p /app/build/Release \
    && cp /app/node_modules/better-sqlite3/build/Release/better_sqlite3.node /app/build/Release/ \
    && apk del .build-deps \
    && chown -R node:node /app

USER node

CMD [ "node", "main.js" ]
