FROM docker.io/node:lts-alpine

WORKDIR /app

COPY dist/apps/consumers/email-consumer .

RUN npm --omit=dev -f install

CMD [ "node", "main.js" ]
