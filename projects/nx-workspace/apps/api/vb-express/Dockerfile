FROM docker.io/node:22-alpine

ENV HOST=0.0.0.0
ENV PORT=3000

WORKDIR /app

# Shared cache so the non-root app user reuses the pinned pnpm instead of downloading the latest.
ENV COREPACK_HOME=/usr/local/share/corepack
RUN corepack enable && corepack prepare pnpm@11.1.2 --activate

RUN addgroup --system vb-express && \
          adduser --system --home /home/vb-express --shell /sbin/nologin -G vb-express vb-express && \
          mkdir -p /home/vb-express

COPY . vb-express/
RUN chown -R vb-express:vb-express /app /home/vb-express

USER vb-express

RUN cd vb-express && pnpm install --frozen-lockfile --prod --ignore-scripts

CMD [ "node", "vb-express" ]
