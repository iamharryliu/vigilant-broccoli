FROM docker.io/node:20-alpine

ENV HOST=0.0.0.0
ENV PORT=3000

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY . .

RUN npm init -y && npm install better-sqlite3 \
    && mkdir -p /app/build/Release \
    && cp /app/node_modules/better-sqlite3/build/Release/better_sqlite3.node /app/build/Release/

RUN chown -R node:node /app

USER node

CMD [ "node", "main.js" ]
