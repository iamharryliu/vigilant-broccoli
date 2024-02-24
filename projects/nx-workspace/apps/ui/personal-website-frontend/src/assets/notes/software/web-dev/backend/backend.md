# Backend Developer

## What is a backend

- serverside
- session cookies can only persist on the same domain

## Session Management

### Frontend Storage

#### Cookies

- sent with every HTTP request to the domain they belong to, including both the main domain and subdomains, making them suitable for maintaining user sessions across different pages or subdomains
- used for session management, user authentication, and tracking user preferences across different pages or subdomains
- vulnerable to CSRF

#### Local Storage

- can only be cleared by user or web app
- accessible from all pages within stored domain
- used for storing larger amounts of data that need to persist across sessions, such as user settings or cached data
- vulnerable to XSS

#### Session Storage

- stored for duration of page session, cleared when user closes the tab or browser
- accessible from all pages within stored domain
- userd for storing temporary data that should be cleared when the user leaves the page
- vulnerable to XSS

### Session Cookies

- stateful - stored clientside and requires server to store session data

### JWT

- stateless - stored clientside but does not require server to store session data
- contains user data

## Security

- XSS(cross site scription) - implanting a script into a site to send data to somehwhere else
- CSRF(cross site request forgery) - malicious sites makes request to a resource that use has cookie credentials for. This attack takes advantage of stored cookies being sent on every request.

## Dont's

- never trust anything coming from the frontend application

## API Development

### Rest API Design

#### Types of HTTP Methods

- **GET**:
  - Generally used to **retreive** a resource.
  - Commonly used with **query** parameters.
  - Example: **Get a user**
- **POST:**
  - Generally used to **create or update** a resource..
  - Commonly used with **request** parameters.
  - Example: **Create or update a user.**
- **PATCH**:
  - Generally used to **partically modifiy an existing** resource.
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
| ------- | ---------------- | ------------------ | ---------- |
| GET     | ✅               | ❌                 | ✅         |
| POST    | ❌               | ✅                 | ❌         |
| PATCH   | ❌               | ✅                 |
| PUT     | ❌               | ✅                 | ✅         |
| DELETE  | ❌               | ✅                 | ✅         |

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

- **404 - Not Found**: User has attempted to make a request to a non-existant endpoint.

- **500 - Internal Server Error**

### GraphQL API Design

## Reference

[HTTP Status Codes](https://kinsta.com/blog/http-status-codes/)
