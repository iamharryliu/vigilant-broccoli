FROM docker.io/node:lts-alpine

ENV HOST=0.0.0.0
ENV PORT=3000

WORKDIR /app

RUN addgroup --system personal-website-backend && \
          adduser --system -G personal-website-backend personal-website-backend

COPY dist/apps/personal-website/personal-website-backend personal-website-backend/
RUN chown -R personal-website-backend:personal-website-backend .

RUN npm --prefix personal-website-backend --omit=dev -f install

CMD [ "node", "personal-website-backend/main.js" ]
