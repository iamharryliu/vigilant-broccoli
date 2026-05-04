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

RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

CMD ["node", "projects/nx-workspace/apps/vb-manager-next-mobile/server.js"]
