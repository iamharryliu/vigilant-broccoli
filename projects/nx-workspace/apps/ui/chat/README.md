# Chat

Private OpenAI chatbot for the owner, gated by Vercel Authentication.

## Table of Contents

- [Stack](#stack)
- [App Dependencies](#app-dependencies)
- [Environment](#environment)

## Stack

- Language - TypeScript
- Framework - Next.js
- Build Tool - Next.js
- External libs
  - OpenAI SDK
  - Supabase JS
  - Tailwind CSS
- Internal libs
  - `chatbot`
  - `common-browser`
  - `common-js`
  - `common-node`
  - `infrastructure`
  - `react-lib`
- Cloud services
  - OpenAI - chat completions and embeddings
  - Supabase - knowledge base vector search
  - Vercel - Vercel Authentication

## App Dependencies

- [VB Express](../../api/vb-express) - calls

## Environment

- [.env.example](./.env.example)
