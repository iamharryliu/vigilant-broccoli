# Postgres

## Mac

```
# Setup
brew install postgresql
brew services start postgresql
brew services stop postgresql

# Connect / Disconnect
psql postgres
\q

# Users
\du
CREATE ROLE [username] WITH LOGIN PASSWORD [password];
ALTER ROLE [username] CREATEDB;
psql postgres -U [username]
DROP USER [username]

# Databases
\l
CREATE DATABASE [db-name]
DELETE DATABASE [db-name]
\c [db-name]

# Tables
\dt
CREATE TABLE [table-name]
\d [table-name]
DROP TABLE [table-name]

# Test connection string
pg_isready -d [connection_string]
```

## Linux

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
