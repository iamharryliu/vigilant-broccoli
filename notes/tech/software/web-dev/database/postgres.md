# Postgres

## Mac Commands

```
# Setup
brew services start postgresql
brew services stop postgresql
```

## Linux Commands

```
sudo -u postgres psql
sudo -u postgres createuser your_username
sudo -u postgres createdb vibecheck_prod
```

## Python

```
sudo apt-get install libpq-dev
pip install psycopg2
```

## Default Databases

- postgres - This is a default database created when PostgreSQL is installed. It is often used as a default database for administrative tasks and for connecting initially.

- template0 - This is a "clean" template database that serves as a template for creating new databases. It is a pristine, empty database that can be copied to create a new database with no data or schema.

- template1 - Similar to template0, template1 is a template database that can be used to create new databases. However, template1 is not meant to be modified directly. It is a copy of template0 that can be customized, and any changes made to template1 will be used as defaults for subsequently created databases.

These databases provide a foundation for creating new databases and are integral to the functioning of PostgreSQL. The template0 database is essentially read-only, while template1 can be modified to suit specific needs. When you create a new database without specifying a template, it is usually based on template1.
