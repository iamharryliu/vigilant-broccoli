# CLAUDE

## Coding Conventions

- Prefer simple code implementation.
- Prefer functional programming patterns over OOP.
- Avoid excessive try/catch blocks; only add error handling when explicitly needed.
- Avoid comments and blocks, only if really necessary do inline comments.
- Avoid string literals, prefer having consts.
- Do not write tests unless explicitly asked.
- Do not write markdown reports, summaries, or documentation unless explicitly asked.
- Follow these guidelines unless explicitly told otherwise.

## Folder Structure

- [Notes](./notes/) - Collection of markdown notes linked with relative file paths.
- [Projects](./projects/) - Software projects.
  - [nx-workspace](./projects/nx-workspace) - Nx workspace for Typescript projects
    - [vb-manager-next](./projects/nx-workspace/apps/ui/vb-manager-next) - Next.js management dashboard app (Tailwind, NextAuth, PM2 deployed)
