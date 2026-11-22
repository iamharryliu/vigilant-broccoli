# VB Express

## Table of Contents

- [Stack](#stack)
- [App Dependencies](#app-dependencies)
- [Environment](#environment)

## Stack

- Language - TypeScript
- Framework - Fastify
- Build Tool - esbuild
- External libs
  - better-auth
  - node-postgres
  - Supabase JS
- Internal libs
  - `common-js`
  - `common-node`
  - `fastify`
  - `infrastructure`
  - `@harry/personal`
  - `llm-schemas`
  - `messaging`
- Cloud services
  - ElevenLabs
  - Google OAuth
  - Google reCAPTCHA
  - Google Tasks
  - Supabase
  - Twilio

## App Dependencies

- [Bucket Service](../bucket-service) - calls
- [Email Service](../email-service) - calls
- [LLM Service](../llm-service) - calls

## Environment

- [.env.example](./.env.example)
