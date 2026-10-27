FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# The standalone output is rooted at the nx workspace, so server.js and the
# paths it resolves static and public files from sit under apps/ and dist/.
COPY dist/apps/ui/employee-handler-ui/.next/standalone ./
COPY dist/apps/ui/employee-handler-ui/.next/static ./dist/apps/ui/employee-handler-ui/.next/static
COPY apps/ui/employee-handler-ui/public ./apps/ui/employee-handler-ui/public

RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

CMD ["node", "apps/ui/employee-handler-ui/server.js"]
