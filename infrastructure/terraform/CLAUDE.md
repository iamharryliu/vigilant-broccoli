# CLAUDE — infrastructure/terraform

## Table of Contents

- [Nuances](#nuances)
  - [A partial `observability` block on `cloudflare_workers_script` replans forever](#a-partial-observability-block-on-cloudflareworkersscript-replans-forever)
  - [A replaced OCI VM dies on `container name "/watchtower" is already in use`](#a-replaced-oci-vm-dies-on-container-name-watchtower-is-already-in-use)
  - [A new OCI API key returns 401 for ~5 minutes while reporting `ACTIVE`](#a-new-oci-api-key-returns-401-for-5-minutes-while-reporting-active)

## Nuances

Non-obvious traps in this directory — read the relevant entry **before**
working on the surface it names, not only when something breaks.
[nuance-pattern.md](../../docs/nuance-pattern.md) is the convention.

### A partial `observability` block on `cloudflare_workers_script` replans forever

In `cloudflare/cloudflare` 5.x, the nested attributes under
`cloudflare_workers_script.observability` — `head_sampling_rate`, `logs`, and
`traces` — are `optional` but **not** `computed` (only `logs.persist`,
`traces.persist` and `traces.propagation_policy` are). So a config that sets
only `observability = { enabled = true }` means "these are null", while the
Cloudflare API always returns its own defaults (`head_sampling_rate = 1`,
`logs` enabled with invocation logs and persistence, `traces` disabled).
Refresh writes those defaults into state, Terraform compares them against the
config's nulls, and every plan proposes the same update-in-place.

It isn't a cosmetic diff: because the change lands on the script resource
itself, every computed attribute (`etag`, `handlers`, `modified_on`,
`has_modules`, …) goes to `known after apply`, so each `pnpm tf:apply`
re-uploads the Worker. Applying never settles it — the next plan shows the
same diff.

Fix is to spell the object out in full so it matches what the API returns, as
`cloudflare-nx-cache.tf` now does for `nx-cache`. Any future
`cloudflare_workers_script` in this repo needs the same treatment.

### A replaced OCI VM dies on `container name "/watchtower" is already in use`

`pnpm tf:apply` that replaces `oci_core_instance.rabbitmq` — any change to its
`metadata.user_data`, since that forces replacement — can fail in the
`post-apply` step with a Docker name conflict on `/watchtower`, and sometimes
on `caddy` or `socket-server-socketio` instead depending on who wins.

The VM hosts two compose projects: the broker (`/opt/rabbitmq`) and the
socket-server stack (`/opt/socket-server`, which is where `watchtower` lives).
`post-apply.sh`'s `sync_socket_server` calls
`packer/scripts/sync-socket-server-token.sh`, which SSHes in, rewrites
`SENDER_TOKEN`, and runs `docker compose -f /opt/socket-server/docker-compose.yml
up -d`. Its readiness probe used to be `test -f <that compose file> && sudo
docker info` — and both of those go true early in `cloud-init`, because
`write_files` writes the compose file before anything runs and `runcmd`'s
`systemctl start docker` is several steps ahead of `runcmd`'s own `docker
compose up -d` at the end. So the script and cloud-init ran `up -d` against the
same project concurrently. Each service there sets an explicit
`container_name:`, which compose cannot namespace per-project, so the loser of
the race aborts on the name instead of adopting the container.

It stayed hidden because the VM is normally long-lived: cloud-init finished
months earlier, so the sync script's `up -d` was a no-op. Only an actual
instance replacement puts the two on the same clock — first seen when tightening
the RabbitMQ TLS key to `0600` changed `user_data`.

The quieter half of the same race is worse than the loud one. `runcmd` rewrites
`DOCKER_API_VERSION_PLACEHOLDER` in that compose file one line before it brings
the stack up, so a sync script that wins can create `watchtower` with the
literal placeholder as its `DOCKER_API_VERSION`. That container starts, stays
up, and silently never talks to the Docker API again — socket-server images
just stop auto-updating, with nothing in the apply output to connect it back.

The gate now waits for `cloud-init status` to report `done` (or `degraded
done`) before touching compose. If this resurfaces, check, in order:
`cloud-init status --long`, `grep DOCKER_API_VERSION
/opt/socket-server/docker-compose.yml`, and `sudo docker inspect watchtower
--format '{{.Config.Env}}'`. Recovery is `sudo docker compose -f
/opt/socket-server/docker-compose.yml up -d --force-recreate` once cloud-init
is done, then a rerun of `pnpm tf:post-apply`, which is idempotent.

### A new OCI API key returns 401 for ~5 minutes while reporting `ACTIVE`

`POST /20160918/users/{id}/apiKeys` returns the uploaded key immediately, with
the fingerprint you computed locally and `lifecycleState: ACTIVE`. Listing the
user's keys shows it as `ACTIVE` too. But every request _signed_ with it gets
`401 NotAuthenticated` until it finishes syncing to the identity domain —
measured at 307s in this tenancy, with the state field reading `ACTIVE` for the
entire window.

So there is nothing to poll except the signed request itself: no state
transition ever happens, because the resource is created active and only the
authentication path lags. Polling early is harmless — it neither delays nor
accelerates acceptance — so the only correct strategy is a long retry window.
`packer/scripts/rotate-oci-api-key.sh` waits 180s, then retries for another
450s.

Worth knowing when debugging: a rotation that fails "verification" here is
almost always this, not a signing bug. Check by re-signing the same request a
few minutes later before suspecting the signature.
