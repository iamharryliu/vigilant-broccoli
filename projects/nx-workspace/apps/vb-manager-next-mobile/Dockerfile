FROM node:lts-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY dist/apps/vb-manager-next-mobile/.next/standalone ./
COPY dist/apps/vb-manager-next-mobile/.next/static ./.next/static
COPY dist/apps/vb-manager-next-mobile/public ./public

RUN apk add --no-cache python3 make g++ && \
    npm rebuild better-sqlite3 && \
    apk del python3 make g++

RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
