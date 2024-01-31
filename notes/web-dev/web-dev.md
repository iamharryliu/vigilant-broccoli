# Web Developer

## Notes

- [Angular](./frontend/angular.md)
- [Bootstrap](./frontend/bootstrap.md)

## Backend Developer

- serverside

### API Development

#### Rest API Design

##### Types of HTTP Methods

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

#### GraphQL API Design

### Frameworks

## Frontend Developer

- clientside

### HTML

Generally used to create and organize the building blocks of a web page. Think headers, paragraphs, tables, navbars, footers, etc.

### CSS

Generally used to style a web page. Think color, font, spacing, size, borders, etc.

### Frameworks

#### Angular

- full fledged framework
- opinionated
- has out of the box features to get started

#### React

- a library
- less opinionated
- generally requires using other dependecies (libraries, tools, etc..)

## Devops

### Tools

#### Git

```
git checkout -b [branch name]
git add [files]
git commit -m [message]
git push
```

#### Docker

## Reference

[HTTP Status Codes](https://kinsta.com/blog/http-status-codes/)
