FROM docker.io/node:22-alpine

ENV HOST=0.0.0.0
ENV PORT=3000

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY . .

RUN corepack enable && corepack prepare pnpm@11.1.2 --activate && pnpm init && pnpm add better-sqlite3 \
    && mkdir -p /app/build/Release \
    && cp /app/node_modules/better-sqlite3/build/Release/better_sqlite3.node /app/build/Release/

RUN chown -R node:node /app

USER node

CMD [ "node", "main.js" ]
