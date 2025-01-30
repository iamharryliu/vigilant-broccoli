# Developer Nuances

- CPU bound and IO bound
- Token vs Keys
- Event Driven Architecture vs Request Responese

## Paradigms

- Functional Programming vs Object Oriented Programming (OOP)
  - Functional programming for simplicity and state immutability.
  - OOP is clean when done correctly.
- GoLang vs Python
  - GoLang has more power under the hood. Compiled vs interpreted.

### Database

- SQL vs NoSQL
  - SQL for relational storage
  - NoSQL for non relational storage
- ORM vs Raw SQL Queries
  - ORM for straightforward CRUD and simple things.
  - SQL for reporting and more complex things.

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

# Backend

- POST vs PUT vs PATCH

# Frontend

## Rendering

### **SSG vs SSR vs CSR** (Static Site Generation, Server-Side Rendering, Client-Side Rendering)

|      Feature       | **SSG** (Static Site Generation)       | **SSR** (Server-Side Rendering)        | **CSR** (Client-Side Rendering)           |
| :----------------: | -------------------------------------- | -------------------------------------- | ----------------------------------------- |
| **Rendering Time** | Build time (pre-rendered)              | Request time (server-rendered)         | Browser renders after fetching JavaScript |
|  **Performance**   | Very fast (static files served by CDN) | Slower (server processes each request) | Depends on device/browser capabilities    |
| **Data Freshness** | Requires a rebuild for updates         | Always up-to-date                      | Updates dynamically via API calls         |
|      **SEO**       | Excellent (HTML pre-generated)         | Excellent (HTML rendered server-side)  | Can be poor without server-side hydration |
|    **Hosting**     | Simple (CDN, static hosting)           | Requires a server                      | Simple (static hosting + API)             |
| **Best Use Cases** | Blogs, marketing sites, documentation  | E-commerce, dynamic dashboards         | SPAs (e.g., dashboards, interactive apps) |
|   **Complexity**   | Low                                    | Medium                                 | High                                      |

**Key Differences**

1. **SSG**: Pre-rendered during build, best for static content.
2. **SSR**: Rendered dynamically per request, ideal for real-time updates and SEO.
3. **CSR**: Fully rendered in the browser, best for highly interactive applications.

## Javascript

### Axios vs Fetch

| Feature                  | **Axios**                                         | **Fetch**                                    |
| ------------------------ | ------------------------------------------------- | -------------------------------------------- |
| **Ease of Use**          | Easier syntax, more features                      | Requires more boilerplate for advanced tasks |
| **JSON Handling**        | Automatic parsing of JSON                         | Manual parsing with `response.json()`        |
| **Error Handling**       | Throws on non-2xx responses                       | Requires manual `response.ok` check          |
| **Timeouts**             | Built-in                                          | Requires custom implementation               |
| **Interceptors**         | Supported                                         | Not supported                                |
| **Browser Support**      | Works with older browsers (needs polyfill for IE) | Modern browsers only                         |
| **Request Cancellation** | Built-in (`CancelToken`)                          | Requires AbortController                     |
| **Bundle Size**          | Additional weight to the project                  | Native to the browser                        |

**When to Use What**

- **Use Axios**: For complex applications where you need features like interceptors, timeouts, retries, or simplified syntax.
- **Use Fetch**: For simple projects or when you want a lightweight solution without adding a dependency.
