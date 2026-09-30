# Nx

## Table of Contents

- [Commands](#commands)
- [Workflows](#workflows)
  - [Storybook](#storybook)
- [Gotchas](#gotchas)
- [References](#references)

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

## Gotchas

- **`--parallel` defaults to 3.** Worth raising when a `run-many` target is dominated by network waits (deploys, uploads) rather than CPU, since three slots occupied by waiting tasks starve everything else in the graph. Raising it for CPU-bound builds instead risks memory exhaustion on a small CI runner.
- **A task whose command re-enters Nx can abort the whole run** with `Recursive task invocation detected`, printing the chain it found. Nx tracks invocations in a local database keyed on `NX_INVOCATION_ROOT_PID`, which it injects into every task's environment so nested runs join the same tracker. Two details matter when diagnosing it: entries are released when a task completes, so a dependency that already finished does **not** block a later nested invocation of the same task; and the guard fires on _simultaneous_ duplicates, so it can also mean two concurrent tasks were each told to build the same project — a symptom of shared configuration being clobbered rather than of genuine recursion.

## References

- [Folder Structure](https://nx.dev/concepts/more-concepts/folder-structure)
- [Nx scripts](https://www.youtube.com/watch?v=PRURABLaS8s)
- [Run single NX script](https://stackoverflow.com/questions/67692895/how-to-run-a-single-typescript-file-with-nx)
