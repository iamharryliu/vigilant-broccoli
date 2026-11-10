# Chat

Private live chat room for the owner's Cloudflare Access identities.

## Table of Contents

- [Stack](#stack)
- [Environment](#environment)

## Stack

- Language - TypeScript
- Framework - Next.js
- Build Tool - Next.js
- External libs
  - `jose`
  - Socket.IO
  - Tailwind CSS
- Internal libs
  - `common-js`
  - `common-node`
  - `react-lib`
  - `react-lib-higher-level`
- Cloud services
  - Cloudflare Access
  - Socket Server - called over HTTP and Socket.IO
  - Vercel

## Environment

- [.env.example](./.env.example)
