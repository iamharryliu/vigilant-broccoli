FROM docker.io/node:22-alpine

ENV HOST=0.0.0.0
ENV PORT=3000

RUN corepack enable && corepack prepare pnpm@11.1.2 --activate

RUN apk add --no-cache su-exec

WORKDIR /app
RUN chown node:node /app

COPY --chown=node:node . .

USER node

RUN pnpm install --frozen-lockfile --prod --ignore-scripts

USER root

# Fly volumes mount root-owned; chown the local-provider bucket path at boot then drop to the app user.
CMD [ "sh", "-c", "mkdir -p /data && chown node:node /data && exec su-exec node node main.js" ]
