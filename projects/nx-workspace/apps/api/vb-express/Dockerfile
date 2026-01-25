FROM docker.io/node:lts-alpine

ENV HOST=0.0.0.0
ENV PORT=3000

WORKDIR /app

RUN addgroup --system vb-express && \
          adduser --system -G vb-express vb-express

COPY dist/apps/api/vb-express vb-express/
RUN chown -R vb-express:vb-express .

# You can remove this install step if you build with `--bundle` option.
# The bundled output will include external dependencies.
RUN npm --prefix vb-express --omit=dev -f install

CMD [ "node", "vb-express" ]
