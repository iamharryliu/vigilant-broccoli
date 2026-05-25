FROM docker.io/node:lts-alpine

ENV HOST=0.0.0.0
ENV PORT=3000

RUN corepack enable

WORKDIR /app

COPY . .

RUN pnpm install

CMD [ "node", "main.js" ]
