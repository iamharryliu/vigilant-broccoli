# Nuances

- SQL vs NoSQL vs GraphQL
  - SQL for relational storage
  - NoSQL for non relational storage
- ORM vs Raw SQL Queries
  - ORM for straightforward CRUD and simple things.
  - SQL for reporting and more complex things.
- psycopg2 vs psycopg2-binary
  - The binary package is a practical choice for development and testing but in production it is advised to use the package built from sources
  - Building psycopg requires a few prerequisites (a C compiler, some external development library packages)
