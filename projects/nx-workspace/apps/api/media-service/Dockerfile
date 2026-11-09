FROM docker.io/node:22-alpine

ENV HOST=0.0.0.0
ENV PORT=3000

WORKDIR /app

# Shared cache so the non-root app user reuses the pinned pnpm instead of downloading the latest.
ENV COREPACK_HOME=/usr/local/share/corepack
RUN corepack enable && corepack prepare pnpm@11.1.2 --activate

RUN addgroup --system media-service && \
          adduser --system --home /home/media-service --shell /sbin/nologin -G media-service media-service && \
          mkdir -p /home/media-service

COPY . media-service/
RUN chown -R media-service:media-service /app /home/media-service

USER media-service

RUN cd media-service && pnpm install --frozen-lockfile --prod --ignore-scripts

CMD [ "node", "media-service" ]
