FROM docker.io/node:22-alpine

ENV HOST=0.0.0.0
ENV PORT=3000

RUN corepack enable && corepack prepare pnpm@11.1.2 --activate

WORKDIR /app
RUN chown node:node /app

COPY --chown=node:node . .

USER node

RUN pnpm install --frozen-lockfile --prod --ignore-scripts

CMD [ "node", "main.js" ]
