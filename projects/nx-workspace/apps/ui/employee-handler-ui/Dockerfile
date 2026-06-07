FROM node:lts-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY dist/apps/ui/employee-handler-ui/.next/standalone ./
COPY dist/apps/ui/employee-handler-ui/.next/static ./projects/nx-workspace/dist/apps/ui/employee-handler-ui/.next/static
COPY apps/ui/employee-handler-ui/public ./projects/nx-workspace/apps/ui/employee-handler-ui/public

RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

CMD ["node", "projects/nx-workspace/apps/ui/employee-handler-ui/server.js"]
