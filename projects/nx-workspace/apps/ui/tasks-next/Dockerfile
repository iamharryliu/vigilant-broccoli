# Built from projects/nx-workspace after `nx run tasks-next:build`. The image
# carries no deployment settings: Supabase, Google and framing all come from
# the container environment (docs/features/self-hosting.md).
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# The standalone output is rooted at the nx workspace, so server.js and the
# paths it resolves static files from sit under apps/ and dist/.
COPY dist/apps/ui/tasks-next/.next/standalone ./
COPY dist/apps/ui/tasks-next/.next/static ./dist/apps/ui/tasks-next/.next/static

RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

CMD ["node", "apps/ui/tasks-next/server.js"]
