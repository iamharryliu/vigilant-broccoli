# Postgres

## Mac

```
brew install postgresql
brew services start postgresql
brew services stop postgresql
```

```
psql postgres
\q
```

```
\du
CREATE ROLE [username] WITH LOGIN PASSWORD [password];
ALTER ROLE [username] CREATEDB;
psql postgres -U [username]
DROP USER [username]
```

```
\l
CREATE DATABASE [db-name]
DELETE DATABASE [db-name]
```

```
\c [db-name]
\dt
CREATE TABLE [table-name]
\d [table-name]
DROP TABLE [table-name]
```

```
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
