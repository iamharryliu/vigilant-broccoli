# Hearth

Shared life for homes, communes, and communities.

## Table of Contents

- [Stack](#stack)

## Stack

- Language - TypeScript
- Framework - Next.js
- Build Tool - Next.js
- External libs
  - AWS SDK (S3 client, for Cloudflare R2)
  - FullCalendar
  - Leaflet / react-leaflet
  - lucide-react
  - recharts
  - Zod
- Internal libs
  - `common-js`
  - `common-node`
  - `react-lib`
- Cloud services
  - Cloudflare R2 (`home-docs` and `where-is` buckets)
  - Supabase (auth + data)
  - VB Express LLM endpoint (Anthropic Claude Haiku) for food chat, grocery extraction and recipe tagging
