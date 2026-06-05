FROM docker.io/node:lts-alpine

ENV HOST=0.0.0.0
ENV PORT=3000

WORKDIR /app

RUN addgroup --system llm-service && \
          adduser --system -G llm-service llm-service

COPY dist/apps/api/llm-service llm-service/
RUN chown -R llm-service:llm-service .

RUN npm --prefix llm-service --omit=dev --ignore-scripts install

CMD [ "node", "llm-service" ]
