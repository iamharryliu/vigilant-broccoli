# Email Subscription Service

Email subscription management and broadcast.

## Table of Contents

- [Stack](#stack)

## Stack

- Language - TypeScript
- Framework - Fastify
- Build Tool - esbuild
- External libs
  - `amqplib`
  - `@supabase/supabase-js`
- Internal libs
  - `common-js`
  - `fastify`
  - `messaging`
- Cloud services
  - Supabase (subscriptions table)
  - RabbitMQ (email queue)
  - Email Service (HTTP)
  - Docker Hub
  - Fly.io
