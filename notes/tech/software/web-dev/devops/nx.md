# Nx

## Commands

```
# Install Nx
npm add --global nx
npm list --global nx
npm rm --global nx

npx create-nx-workspace@latest [workspace-name]

# https://nx.dev/features/automate-updating-dependencies
nx migrate latest
nx migrate --run-migrations

npm install -D @nx/angular

nx run-many -t=[type]
nx build [library] --with-deps
--skip-nx-cache

nx run-many -t=build --skip-nx-cache
nx run APP_NAME:COMMAND


nx reset

nx release
nx run LIBRARY:nx-release-publish
nx run LIBRARY:nx-release-publish --otp=XXXXXX

npm add -D @nx/next
```

## Workflows

```
nx build LIBRARY_NAME && nx run LIBRARY_NAME:nx-release-publish
npm i && git add . && git commit -m "stash" --no-verify && gpush
git pull && npm i && npx tsx script.ts
```

### Storybook

```
npm add -D @nx/storybook
nx g @nx/storybook:configuration [project-name]
nx storybook [project-name]
nx build-storybook [project-name]
nx test-storybook [project-name]
```

## References

- [Folder Structure](https://nx.dev/concepts/more-concepts/folder-structure)
- [Nx scripts](https://www.youtube.com/watch?v=PRURABLaS8s)
- [Run single NX script](https://stackoverflow.com/questions/67692895/how-to-run-a-single-typescript-file-with-nx)
