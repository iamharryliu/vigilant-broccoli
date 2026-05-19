# pnpm

## Commands

```sh
npm install -g pnpm          # install pnpm globally via npm
pnpm init                    # create a new package.json
pnpm install                 # install all dependencies
pnpm install --frozen-lockfile  # install exactly what's in pnpm-lock.yaml (use in CI)

pnpm add <package>           # add a runtime dependency
pnpm add -D <package>        # add a dev dependency
pnpm add -w <package>        # add to workspace root (monorepo)
pnpm add -wD <package>       # add dev dep to workspace root (monorepo)
pnpm remove <package>        # remove a dependency
pnpm update                  # update deps within semver ranges
pnpm up                      # alias for pnpm update
pnpm run <script>            # run a script from package.json
pnpm list                    # list installed packages

pnpm audit                   # check for known CVEs in dependencies
pnpm peers check             # list peer dependency issues

pnpm exec COMMAND
```

## Corepack (Docker / CI)

```sh
corepack enable                              # enable corepack (ships with Node 16+)
corepack prepare pnpm@11.1.2 --activate      # install and activate specific pnpm version
```

## Migration from npm

```sh
# 1. create pnpm-workspace.yaml
# 2. add "packageManager": "pnpm@x.x.x" to package.json
# 3. remove package-lock.json (add to .gitignore)
# 4. pnpm install  — generates pnpm-lock.yaml
# 5. update scripts: npm run → pnpm run, npx → pnpm exec
# 6. update Dockerfiles: use corepack to activate pnpm
# 7. update CI: use pnpm/action-setup@v4, cache: 'pnpm', cache-dependency-path: pnpm-lock.yaml
```
