Audit Node.js version usage across this repo:

- Scan all Dockerfiles for `FROM node:...` lines.
- Scan `.github/workflows/` for `actions/setup-node` `node-version:` values and any other Node version references.
- Scan `package.json` files for `engines.node` constraints.
- Flag floating tags (`lts`, `lts-alpine`, `lts-slim`, `latest`, bare `node`, `current`) — they silently jump majors when upstream LTS designation changes and have caused real production bugs.
- Flag EOL Node majors against today's date using the Node release schedule (https://nodejs.org/en/about/previous-releases).
- Flag version inconsistencies across services in the same monorepo.
- Surface findings as a table: file, current value, status (pinned-LTS / floating / EOL / odd-major), recommendation.
- Do not edit. Report only; await confirmation before applying any fixes. When recommending a target version, pick the latest Active LTS that all services in the repo can plausibly support.
