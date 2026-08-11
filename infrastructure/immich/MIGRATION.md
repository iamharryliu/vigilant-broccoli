# Immich Migration

Move the Immich stack to another machine. The database moves via a SQL dump (never
copy the live Postgres data dir raw); the photo/video library moves via Resilio Sync
(or rsync). The Immich version is pinned in `docker-compose.yml`, so pulling this repo
guarantees the versions match on both ends.

## 1. On the OLD machine — dump the database

```bash
docker exec -t immich_postgres pg_dumpall --clean --if-exists -U postgres | gzip > ~/immich-db.sql.gz
```

Copy the dump to the new machine:

```bash
scp ~/immich-db.sql.gz NEW_MACHINE:~/immich-db.sql.gz
```

## 2. Get the library onto the NEW machine

The library lives at `~/resilio-sync/shared/immich`. If Resilio Sync runs on the new
machine with that shared folder, it syncs automatically. Otherwise copy it:

```bash
rsync -aAX ~/resilio-sync/shared/immich/ NEW_MACHINE:~/resilio-sync/shared/immich/
```

## 3. On the NEW machine — start the DB and restore the dump

```bash
git pull
docker compose -f infrastructure/immich/docker-compose.yml up -d database
```

Wait ~5s for Postgres to initialize, then restore:

```bash
gunzip < ~/immich-db.sql.gz | docker exec -i immich_postgres psql -U postgres -d postgres
```

## 4. Start the full stack

```bash
pnpm immich:docker:up
```

Immich is now at http://localhost:2283. Missing thumbnails and encoded video regenerate
from the originals automatically.

## 5. (Optional) Proxy via the local stack

If this machine also runs `infrastructure/local` (the nginx proxy for
`images.vigilant-broccoli.app`), reload it so nginx picks up the Immich upstream at
`host.docker.internal:2283`:

```bash
pnpm local:docker:reload
```

---

## Same-machine migration (old `infrastructure/local` Immich → this standalone stack)

Both stacks share container names (`immich_server`, `immich_postgres`, …), so remove the
old containers after dumping. The library and Immich version are already identical, so no
copy or version step is needed.

```bash
docker exec -t immich_postgres pg_dumpall --clean --if-exists -U postgres | gzip > /tmp/immich-db.sql.gz
docker rm -f immich_server immich_machine_learning immich_redis immich_postgres
docker compose -f infrastructure/immich/docker-compose.yml up -d database
# wait ~5s for Postgres to initialize
gunzip < /tmp/immich-db.sql.gz | docker exec -i immich_postgres psql -U postgres -d postgres
pnpm immich:docker:up
pnpm local:docker:reload
```
