FROM node:lts-alpine AS builder

WORKDIR /build

RUN apk add --no-cache python3 make g++

RUN npm install better-sqlite3

FROM node:lts-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY dist/apps/vb-manager-next-mobile/.next/standalone ./
COPY dist/apps/vb-manager-next-mobile/.next/static ./projects/nx-workspace/dist/apps/vb-manager-next-mobile/.next/static
COPY dist/apps/vb-manager-next-mobile/public ./projects/nx-workspace/apps/vb-manager-next-mobile/public

COPY --from=builder /build/node_modules/better-sqlite3/build/Release/better_sqlite3.node \
    ./projects/nx-workspace/node_modules/better-sqlite3/build/Release/better_sqlite3.node

RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

CMD ["node", "projects/nx-workspace/apps/vb-manager-next-mobile/server.js"]
