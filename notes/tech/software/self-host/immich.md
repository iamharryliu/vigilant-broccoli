# Immich

```
git clone https://github.com/immich-app/immich.git
cd immich/docker
cp example.env .env

open http://localhost:2283

brew install immich-go

immich-go upload from-google-photos \
 --server="http://localhost:2283" \
 --api-key="API_KEY" \
 --dry-run \
 TAKEOUT_FILEPATH.zip

immich-go upload from-google-photos \
 --server="http://localhost:2283" \
 --api-key="API_KEY" \
 --dry-run \
 \*.zip

immich-go upload from-google-photos \
 --server="http://localhost:2283" \
 --api-key="API_KEY" \
 \*.zip
```

## Migration

Migrate the database via a dump (never copy the live Postgres data dir raw) and copy the library folder. Match the Immich version and keep `UPLOAD_LOCATION` identical.

```
# old machine
docker exec -t immich_postgres pg_dumpall --clean --if-exists -U postgres | gzip > immich-db.sql.gz
docker compose down
rsync -aAX UPLOAD_LOCATION/ newmachine:UPLOAD_LOCATION/

# new machine (same Immich version, empty pgdata)
docker compose up -d database
gunzip < immich-db.sql.gz | docker exec -i immich_postgres psql -U postgres -d postgres
docker compose up -d
```

Missing thumbnails and encoded video regenerate from originals automatically.
