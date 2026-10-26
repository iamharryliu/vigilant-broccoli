# Built from projects/nx-workspace after `nx run job-applications-next:build`,
# which also assembles the skill workdir. Personal data never enters the image:
# the build swaps the lib's resume.json for templates/resume.json, and the
# user's files arrive through the /career and /data mounts.
FROM node:24-bookworm-slim

ARG PLAYWRIGHT_VERSION=1.61.1

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    JOB_APPLICATIONS_DIR=/data \
    CAREER_DIR=/career \
    STATE_DIR=/state \
    TEMPLATES_DIR=/app/templates \
    SKILL_WORKDIR=/opt/skill-workdir \
    PLAYWRIGHT_BROWSERS_PATH=/opt/ms-playwright

# Claude Code reads project skills from the working directory's .claude/skills.
RUN npm install -g '@anthropic-ai/claude-code@>=2.1.277'

# The bundled scripts keep Playwright external; installing it next to them lets
# `node skill-scripts/<script>.cjs` resolve it and its Chromium.
WORKDIR /opt/skill-workdir
RUN npm init -y >/dev/null \
    && npm install --omit=dev "@playwright/test@${PLAYWRIGHT_VERSION}" \
    && npx playwright install --with-deps chromium \
    && rm -rf /var/lib/apt/lists/*
COPY dist/apps/ui/job-applications-next/skill-workdir ./

WORKDIR /app
COPY dist/apps/ui/job-applications-next/.next/standalone ./
COPY dist/apps/ui/job-applications-next/.next/static ./dist/apps/ui/job-applications-next/.next/static
COPY apps/ui/job-applications-next/templates ./templates

RUN mkdir -p /data /career /state \
    && chown -R node:node /data /career /state /opt/skill-workdir

USER node

EXPOSE 3000

CMD ["node", "apps/ui/job-applications-next/server.js"]
