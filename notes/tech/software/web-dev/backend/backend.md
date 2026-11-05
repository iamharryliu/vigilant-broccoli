# Backend Developer

## Table of Contents

- [Links](#links)
- [What is a backend](#what-is-a-backend)
- [Session Management](#session-management)
  - [Frontend Storage](#frontend-storage)
  - [Session Cookies](#session-cookies)
  - [JWT](#jwt)
- [Dont's](#donts)
- [API Development](#api-development)
  - [Rest API Design](#rest-api-design)
  - [GraphQL API Design](#graphql-api-design)
- [Microservices](#microservices)
- [Reference](#reference)

## Links

- [Node](./node/node.md)
- **Frameworks**
  - **Javascript/Typescript**
    - [Express](./express.md)
  - **Python**
    - [Flask](./frameworks/flask.md)
    - [Django](./frameworks/django.md)
  - **C#**
    - [Dotnet](./frameworks/dotnet.md)
- **APIs**
  - [GraphQL](./graphql.md)

## What is a backend

- serverside
- session cookies can only persist on the same domain

## Session Management

### Frontend Storage

#### Cookies

- sent with every HTTP request to the domain they belong to, including both the main domain and subdomains, making them suitable for maintaining user sessions across different pages or subdomains
- used for session management, user authentication, and tracking user preferences across different pages or subdomains
- vulnerable to [CSRF](../networking/network-security/network-security.md#types-of-attacks)

#### Local Storage

- can only be cleared by user or web app
- accessible from all pages within stored domain
- used for storing larger amounts of data that need to persist across sessions, such as user settings or cached data
- vulnerable to [XSS](../networking/network-security/network-security.md#types-of-attacks)

#### Session Storage

- stored for duration of page session, cleared when user closes the tab or browser
- accessible from all pages within stored domain
- userd for storing temporary data that should be cleared when the user leaves the page
- vulnerable to [XSS](../networking/network-security/network-security.md#types-of-attacks)

### Session Cookies

- stateful - stored clientside and requires server to store session data

### JWT

- stateless - stored clientside but does not require server to store session data
- contains user data

## Dont's

- never trust anything coming from the frontend application

## API Development

### Rest API Design

#### Types of HTTP Methods

- **GET**:
  - Generally used to **retrieve** a resource.
  - Commonly used with **query** parameters.
  - Example: **Get a user**
- **POST:**
  - Generally used to **create or update** a resource..
  - Commonly used with **request** parameters.
  - Example: **Create or update a user.**
- **PATCH**:
  - Generally used to **partially modify an existing** resource.
  - Commonly used with **request** parameters.
  - Example: **Create or update a user.**
- **PUT**:
  - Generally used to **create or replace** a resource.
  - Commonly used with **request** parameters.
- **DELETE**:
  - Generally used to delete a resource.
  - Commonly used with **query** parameters.
  - Example: ** Delete a user.**

| Methods | Query Parameters | Request Parameters | Idempotent |
| --- | --- | --- | --- |
| GET | ✅ | ❌ | ✅ |
| POST | ❌ | ✅ | ❌ |
| PATCH | ❌ | ✅ |
| PUT | ❌ | ✅ | ✅ |
| DELETE | ❌ | ✅ | ✅ |

A lot of REST API design is subjected and really depends on how the APIs are implemented by the developers. They will not always follow the rules above. Some examples would include:

- using only GET and POST requests
- using query parameters or a mix of query parameters and request parameters for POST, PATCH, PUT, DELETE
- idempotency can depend on implementation (ie, PATCH may override values or append, delete may delete a specified resource, ie _/delete/id_, which would be idempotent or the last resource, _/delete/last_, which can be idempotent if there is more than one resource)

#### HTTP Method Status Codes

HTTP methods return different response status codes depending on the outcome of the request.

- **200 - Okay**

- **201 - Create**

- **400 - Bad Request**: User has attempted to make a request using insufficient or bad data

- **401 - Unauthorized**: Unauthenticated user has attempted to make a request to an endpoint that requires credentials.

- **403 - Forbidden**: Authenticated user has attempted to make a request to an endpoint that requires credentials but **does not have permission** to access the requested endpoint.

- **404 - Not Found**: User has attempted to make a request to a non-existent endpoint.

- **500 - Internal Server Error**

### GraphQL API Design

## Microservices

A microservice architecture splits a backend into small services that each own one capability and its data, deploy independently, and talk over HTTP, gRPC, or a message queue. Hosting model comparisons: [Deployment compute models](../devops/deployment/deployment.md#deployment-compute-models).

| Runtime | Examples | Unit of Deploy | Scaling | Pros | Cons | Best Used For |
| --- | --- | --- | --- | --- | --- | --- |
| Edge functions | Cloudflare Workers, Deno Deploy, Vercel Edge Functions | Script running in a V8 isolate | Per request, globally, near-zero cold start | Lowest latency; cheapest per request; no regions to manage | Restricted runtime (no full Node APIs, tight CPU and memory); data often far from the edge | Auth, routing, rewrites, and light APIs in front of other services |
| Managed Kubernetes | GKE, EKS, AKS | Container in a pod | Horizontal pod and node autoscaling | Full control of networking, service mesh, sidecars, and stateful sets; portable | Highest operational and cost floor; cluster upgrades and YAML sprawl | Many services with platform staff and needs for mesh, custom networking, or GPUs |
| PaaS app hosting | Fly.io, Render, Heroku, App Engine | App or container per service | Instance counts, sometimes scale to zero | Simple deploys with long-running processes, WebSockets, and private networking | Less control than Kubernetes; pricing climbs with always-on instances | Small teams running a handful of always-on services |
| Serverless containers | Cloud Run, AWS Fargate / App Runner, Azure Container Apps | Container image | Per request or concurrency, scale to zero | Any language or binary; local Docker parity; longer timeouts; many requests per instance | Cold starts of seconds; billed while handling requests or for minimum instances; no node access | HTTP APIs and workers needing their own dependencies without cluster management |
| Serverless functions (FaaS) | AWS Lambda, Google Cloud Functions, Azure Functions | Single function handler | Per invocation, scale to zero | No servers; pay per invocation; native event triggers (queues, storage, schedules) | Cold starts; execution time and payload limits; vendor-specific handlers; hard to run locally | Event-driven glue, webhooks, scheduled jobs, and spiky low-traffic endpoints |
| Virtual machines | EC2, Compute Engine, Droplets | Process or Docker Compose on a VM | Manual or autoscaling groups | Full control; predictable cost; stateful and long-lived workloads | You patch, monitor, and scale it; no scale to zero | Databases, legacy services, and steady workloads where a fixed cost beats per-request billing |

## Reference

[HTTP Status Codes](https://kinsta.com/blog/http-status-codes/)
