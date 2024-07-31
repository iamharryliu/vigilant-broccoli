## Python Nuances

- psycopg2 vs psycopg2-binary
  - The binary package is a practical choice for development and testing but in production it is advised to use the package built from sources
  - Building psycopg requires a few prerequisites (a C compiler, some external development library packages)