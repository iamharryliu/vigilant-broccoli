# Nx

## Commands

```
npx create-nx-workspace@latest [workspace-name]

# https://nx.dev/features/automate-updating-dependencies
nx migrate latest
nx migrate --run-migrations

npm install -D @nx/angular

nx run-many -t=[type]
nx build [library] --with-deps
--skip-nx-cache

nx reset
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
