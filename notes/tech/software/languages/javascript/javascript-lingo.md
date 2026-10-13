# Javascript Lingo

- [Runtimes](#runtimes)
- [Package Managers](#package-managers)
- [Bundlers](#bundlers)
- [Compilers](#compilers)
- [Monorepo Tools](#monorepo-tools)
- [Frontend Frameworks](#frontend-frameworks)
- [Module Interop](#module-interop)

## Runtimes

| Term    | Definition                                                                                                                                                                |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bun     | A fast JavaScript/TypeScript runtime, bundler, and package manager built on JavaScriptCore, aiming for drop-in Node.js compatibility.                                     |
| Deno    | A secure-by-default JavaScript/TypeScript runtime built on V8 and Rust, with built-in tooling (formatter, linter, test runner) and no implicit filesystem/network access. |
| Node.js | A JavaScript runtime built on Chrome's V8 engine for running JavaScript outside the browser, e.g. on servers.                                                             |

## Package Managers

| Term | Definition                                                                                              |
| ---- | ------------------------------------------------------------------------------------------------------- |
| npm  | Node Package Manager — the default package manager bundled with Node.js.                                |
| pnpm | Uses a global content-addressable store and symlinks for installs, avoiding duplicate packages on disk. |
| yarn | Installs packages in parallel, historically faster than classic npm.                                    |

## Bundlers

| Term    | Definition                                                                                          |
| ------- | --------------------------------------------------------------------------------------------------- |
| esbuild | An extremely fast JavaScript bundler and minifier written in Go.                                    |
| Rollup  | A bundler focused on tree-shaking and small output; more optimized than Webpack for libraries.      |
| Vite    | A build tool that uses Rollup to bundle for production and native ES modules for a fast dev server. |
| Webpack | A highly configurable bundler and module loader for JavaScript applications.                        |

## Compilers

| Term  | Definition                                                                                                  |
| ----- | ----------------------------------------------------------------------------------------------------------- |
| Babel | A JavaScript compiler that transforms modern/experimental syntax into backwards-compatible JavaScript.      |
| SWC   | Speedy Web Compiler — a Rust-based compiler/bundler used as a faster alternative to Babel.                  |
| tsc   | The official TypeScript compiler; transforms TypeScript to JavaScript but does not bundle or optimize code. |

## Monorepo Tools

| Term      | Definition                                                                                                                   |
| --------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Lerna     | A tool for managing JavaScript monorepos with multiple packages, historically focused on versioning and publishing.          |
| Nx        | A build system and monorepo tool with computation caching, task orchestration, and dependency-graph-aware "affected" builds. |
| Turborepo | A high-performance build system for JavaScript/TypeScript monorepos, with remote caching and declarative task pipelines.     |

## Frontend Frameworks

| Term | Definition                                                                           |
| ---- | ------------------------------------------------------------------------------------ |
| Next | An opinionated React framework with file-based routing, SSR/SSG, and API routes.     |
| Nuxt | An opinionated Vue framework with file-based routing and SSR/SSG, analogous to Next. |

## Module Interop

| Term            | Definition                                                                                                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| esModuleInterop | A TypeScript compiler option that enables interoperability between CommonJS and ES modules, resolving compatibility issues when importing CommonJS modules into an ES-module-based project. |
| tslib           | Shared runtime helpers for TypeScript-generated JS, mainly for reducing bundle size and avoiding code duplication.                                                                          |
