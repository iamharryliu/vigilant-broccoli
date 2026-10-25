# Developer Nuances

- Barrel files
- Token vs Keys
- Event Driven Architecture vs Request Response
- Static vs Dynamic Imports
- Firmware vs Software
  - Firmware is low-level code written to a device's non-volatile memory that directly controls its hardware (e.g. a microcontroller) and is tightly coupled to that specific hardware.
  - Software (in the general sense) is run from a general-purpose OS on general-purpose hardware and can be updated, replaced, or swapped independently of the hardware it runs on.
  - Firmware is a form of embedded software; not all embedded software is firmware (some runs under a full OS, e.g. embedded Linux).
- **Languages**
  - GoLang vs Python
    - GoLang has more power under the hood. Compiled vs interpreted.
- **Database**
  - SQL vs NoSQL
    - SQL for relational storage
    - NoSQL for non relational storage
  - ORM vs Raw SQL Queries
    - ORM for straightforward CRUD and simple things.
    - SQL for reporting and more complex things.
- VPN vs IP/Port Whitelisting
  - ✅ VPN (e.g., WireGuard) — better for secure, encrypted, flexible remote access; works with dynamic IPs and multiple services.
  - ⚙️ IP/Port Whitelisting — simpler but limited; good only for single, low-risk services with fixed IPs.
  - 💡 In general: use a VPN for modern, scalable setups; use whitelisting for small, static ones.
- Socket vs REST Based Architecture
  - Use sockets when you need real-time, push-style updates.
  - Use APIs when you need on-demand data exchange or simple CRUD operations.
  - Rest is easier to scale statelessly as sockets use persistent connections.
- REST vs gRPC APIs
  - REST (HTTP + JSON) for anything browsers, third parties, `curl`, or CI call directly; every client and tool already speaks it, and OpenAPI/Swagger docs come for free.
  - gRPC (HTTP/2 + Protocol Buffers) for internal service-to-service calls where you need strict typed contracts, streaming, or high call volume across several languages.
  - gRPC needs codegen, and browsers need gRPC-Web or a proxy, so it rarely replaces a public API.
  - At low traffic the serialization savings are negligible next to the work each call does (a database query, an LLM call), so gRPC mostly costs tooling.
  - A typed contract does not require gRPC: a shared schema (zod, OpenAPI, ts-rest) gives typed clients and validation while keeping plain REST.
  - See [Service Communication](../web-dev/service-communication.md) for the comparison tables.

## Web Applications

- CSR vs SSR
- Static Page vs Single Page Application (SPA)

  - Static Page
    - Low user interactivity.
    - Content does not change while viewing.
    - better SEO
  - Single Page Application
    - High user interactivity
    - Content changes while viewing.

- [Session Vs JWT: The Differences You May Not Know!](https://www.youtube.com/watch?v=fyTxwIa-1U0)
- REST vs GraphQL
  - GraphQL provides a contract between front and backend.
  - Enables user to request for exactly what they want.
  - GraphQL requires more overhead to setup.

# Frontend

## Rendering

### **SSG vs SSR vs CSR** (Static Site Generation, Server-Side Rendering, Client-Side Rendering)

| Feature | **SSG** (Static Site Generation) | **SSR** (Server-Side Rendering) | **CSR** (Client-Side Rendering) |
| :-: | --- | --- | --- |
| **Rendering Time** | Build time (pre-rendered) | Request time (server-rendered) | Browser renders after fetching JavaScript |
| **Performance** | Very fast (static files served by CDN) | Slower (server processes each request) | Depends on device/browser capabilities |
| **Data Freshness** | Requires a rebuild for updates | Always up-to-date | Updates dynamically via API calls |
| **SEO** | Excellent (HTML pre-generated) | Excellent (HTML rendered server-side) | Can be poor without server-side hydration |
| **Hosting** | Simple (CDN, static hosting) | Requires a server | Simple (static hosting + API) |
| **Best Use Cases** | Blogs, marketing sites, documentation | E-commerce, dynamic dashboards | SPAs (e.g., dashboards, interactive apps) |
| **Complexity** | Low | Medium | High |

**Key Differences**

1. **SSG**: Pre-rendered during build, best for static content.
2. **SSR**: Rendered dynamically per request, ideal for real-time updates and SEO.
3. **CSR**: Fully rendered in the browser, best for highly interactive applications.

## URI vs URL

A URI identifies a resource by name, location, or both. A URL is a URI that also says how to locate the resource (the scheme and address, such as `https://example.com/page`). Every URL is a URI, but not every URI is a URL (e.g. `urn:isbn:0451450523` names a book without saying where to find it). See [URI Anatomy](../web-dev/networking/networking.md#uri-anatomy) for the parts of a URI.
