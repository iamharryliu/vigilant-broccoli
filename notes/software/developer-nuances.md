# Developer Nuances

## General

- Functional Programming vs Object Oriented Programming
  - Functional programming for simplicity and state immutability.
  - OOP is clean when done correctly.

## Database

- SQL vs NoSQL vs GraphQL
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

## Python

- psycopg2 vs psycopg2-binary
  - The binary package is a practical choice for development and testing but in production it is advised to use the package built from sources
  - Building psycopg requires a few prerequisites (a C compiler, some external development library packages)

## Typescript

- Types vs Interfaces
  - Interfaces can be merged.
  - Interfaces compile faster.
