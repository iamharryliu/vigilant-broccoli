# Chat

Private OpenAI chatbot for the owner, gated by Vercel Authentication.

## Table of Contents

- [Stack](#stack)
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
  - `common-browser`
  - `common-js`
  - `common-node`
  - `infrastructure`
  - `react-lib`
- Cloud services
  - ElevenLabs - text-to-speech of replies and speech-to-text fallback
  - OpenAI - chat completions and embeddings
  - Supabase - knowledge base vector search
  - Vercel - Vercel Authentication

## Environment

- [.env.example](./.env.example)
