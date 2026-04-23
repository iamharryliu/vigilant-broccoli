FROM docker.io/node:20-alpine

ENV HOST=0.0.0.0
ENV PORT=3000

WORKDIR /app

COPY . .

RUN chown -R node:node /app

USER node

CMD [ "node", "main.js" ]
