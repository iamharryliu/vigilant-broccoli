# Postgres

## Mac

```
# Setup
brew install postgresql

# Start/stop Postgres
brew services start postgresql
brew services stop postgresql

# Connect/Exit Postgres
psql postgres
\q

# Create and reconnect as new user
\du
CREATE ROLE [username] WITH LOGIN PASSWORD [password];
ALTER ROLE [username] CREATEDB;
psql postgres -U [username]
DROP USER [username]
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
