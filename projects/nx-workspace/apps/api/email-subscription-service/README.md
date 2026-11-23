# Email Subscription Service

Email subscription management and broadcast.

## Table of Contents

- [Stack](#stack)
- [App Dependencies](#app-dependencies)
- [Environment](#environment)

## Stack

- Language - TypeScript
- Framework - Fastify
- Build Tool - esbuild
- External libs
  - `@supabase/supabase-js`
  - `amqplib`
- Internal libs
  - `common-js`
  - `fastify`
  - `messaging`
- Cloud services
  - RabbitMQ
  - Supabase

## App Dependencies

- [Email Service](../email-service) - calls

## Environment

- [.env.example](./.env.example)
