FROM docker.io/node:lts-alpine

ENV HOST=0.0.0.0
ENV PORT=3000

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.1.2 --activate

RUN addgroup --system llm-service && \
          adduser --system --home /home/llm-service --shell /sbin/nologin -G llm-service llm-service

COPY dist/apps/api/llm-service llm-service/
RUN chown -R llm-service:llm-service /app /home/llm-service

USER llm-service

RUN cd llm-service && pnpm install --frozen-lockfile --prod --ignore-scripts

CMD [ "node", "llm-service" ]
