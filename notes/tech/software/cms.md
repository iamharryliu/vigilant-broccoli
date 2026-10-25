# Content Management Systems

How CMS architectures differ, and how the common products compare.

## Table of Contents

- [CMS Types](#cms-types)
- [CMS Products](#cms-products)
- [Choosing](#choosing)

## CMS Types

| Type | How it works | Pros | Cons | Best used for |
| --- | --- | --- | --- | --- |
| Decoupled / hybrid | Backend and frontend are separate, but the CMS can also render pages itself, so it serves both an API and a template. | Flexibility of an API with a built-in preview and rendering fallback. | Two ways to do everything; more moving parts than either pure model. | Teams migrating from traditional to headless one channel at a time. |
| Git-based | Content is Markdown/JSON files in a Git repository, edited through a UI that commits changes. | Versioned content, no database, free hosting, content travels with code. | Weak for relational or large content, editor workflows limited, merge conflicts. | Docs, blogs and small sites maintained by developers. |
| Headless | Content lives behind an API (REST/GraphQL) with no presentation layer; any frontend or app consumes it. | Multi-channel delivery, free choice of frontend, clean separation of concerns. | No built-in page rendering or visual preview; the frontend must be built and hosted. | Sites and apps sharing content across web, mobile and other channels. |
| SaaS / hosted headless | Headless CMS run by a vendor as a managed service, billed by seats, records or API usage. | No servers to run, built-in CDN, collaboration and scaling handled. | Vendor lock-in, usage-based pricing that grows, limited control over the backend. | Teams that want to ship content without operating infrastructure. |
| Traditional (monolith) | One system stores content, manages it and renders the pages, usually with themes and plugins. | Fast to launch, editors preview exactly what publishes, large plugin ecosystem. | Frontend tied to the CMS, harder to reuse content elsewhere, plugin security and bloat. | Marketing sites, blogs and shops where editors own the whole page. |

## CMS Products

| Product | Type | Hosting | Content model | Pricing | Strengths | Weaknesses |
| --- | --- | --- | --- | --- | --- | --- |
| Contentful | SaaS headless | Vendor-hosted | Structured content types, REST and GraphQL | Free tier, then expensive per-seat/usage plans | Mature, enterprise features, strong localization and workflows. | Costly at scale; rigid limits on content types and records. |
| Decap CMS | Git-based | Static site plus Git provider | Markdown/YAML files configured in a config file | Free, open source | No backend or database; simple to bolt onto a static site. | Basic editor, limited relations, needs an auth proxy for non-GitHub setups. |
| Directus | Headless, wraps an existing SQL schema | Self-hosted or cloud | Your own database tables exposed as an API | Free self-hosted; paid cloud | Works on top of an existing database; no lock-in to a schema. | Admin UI is generic; editorial workflow is less polished than Sanity. |
| Ghost | Traditional with headless API | Self-hosted or Ghost(Pro) | Posts, pages and members; fixed schema | Free self-hosted; paid managed | Publishing, newsletters and memberships built in; fast and focused. | Not a general content modeler; customization limited to its blog model. |
| Payload | Headless, code-first | Self-hosted, runs in Next.js | TypeScript config defines collections and fields | Free, open source; paid cloud | Code-defined schema, runs inside the Next.js app, strong typing and access control. | Developer-oriented; smaller ecosystem and fewer editor conveniences. |
| Sanity | SaaS headless | Vendor-hosted content lake | Schema in code, JSON documents, GROQ and GraphQL | Generous free tier, then usage- and seat-based | Real-time collaboration, fully customizable React Studio, flexible structured content. | GROQ to learn; usage-based pricing; content lives in the vendor's datastore. |
| Storyblok | SaaS headless with visual editor | Vendor-hosted | Component-based blocks with a live visual editor | Free tier, then per-seat plans | Visual editing that non-developers like, plus a headless API. | Per-seat pricing; nested block models take care to design. |
| Strapi | Headless | Self-hosted or Strapi Cloud | Content types built in an admin UI, REST/GraphQL | Free self-hosted; paid cloud | Open source, self-hostable, large community and plugin ecosystem. | You run and upgrade the server and database; major-version migrations hurt. |
| WordPress | Traditional (can be used headless) | Self-hosted or managed hosts | Posts, pages and custom post types; PHP and MySQL | Free software; hosting and premium plugins cost | Largest ecosystem, themes and plugins, editors already know it, REST API for headless use. | Plugin sprawl and security upkeep; headless use still carries the PHP backend. |

## Choosing

| Need | Pick |
| --- | --- |
| Content as files next to the code | Decap CMS |
| Editors who need a visual page builder | Storyblok or WordPress |
| Existing SQL database to expose | Directus |
| Fully custom editor UI with real-time collaboration | Sanity |
| Newsletter and membership publishing | Ghost |
| Self-hosted, code-defined schema in a Next.js app | Payload |
| Self-hosted headless with an admin UI | Strapi |
| Enterprise workflows and localization | Contentful |
| Fastest launch with the broadest plugin ecosystem | WordPress |
