# Local k3s Cluster

The local platform (HTTPS proxy, Grafana, Loki, Prometheus, log collection, Headlamp, Argo CD) on one k3s cluster run by k3d (each node is a Docker container). Argo CD keeps the cluster in sync with `main`. Immich and the agent sandbox stay on Docker Compose.

## Table of Contents

- [Layout](#layout)
- [Tools](#tools)
- [Getting Started](#getting-started)
- [Platform](#platform)
- [Nuances](#nuances)
  - [`HelmChart` resources live in `kube-system`](#helmchart-resources-live-in-kube-system)
  - [CoreDNS pins `host.k3d.internal` through a `.server` block, not `.override`](#coredns-pins-hostk3dinternal-through-a-server-block-not-override)
  - [Argo CD deploys `main`, not the working tree](#argo-cd-deploys-main-not-the-working-tree)
  - [Changing `targetRevision` prunes what the new revision lacks](#changing-targetrevision-prunes-what-the-new-revision-lacks)
  - [`kubectl apply` never deletes](#kubectl-apply-never-deletes)
  - [Host mounts and ports are fixed at cluster creation](#host-mounts-and-ports-are-fixed-at-cluster-creation)
  - [The redirect loops on a non-443 test port](#the-redirect-loops-on-a-non-443-test-port)
  - [Pinning a `uid` on the provisioned datasource crash-loops Grafana](#pinning-a-uid-on-the-provisioned-datasource-crash-loops-grafana)
  - [The `k3d-vb-local-tools` container sits outside the `local-platform` group](#the-k3d-vb-local-tools-container-sits-outside-the-local-platform-group)

## Layout

| Path                                         | What it holds                                                                                                                                            |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `k3s/apply.sh`                               | Bootstrap: generates mkcert certs if missing, applies the Kustomize tree, creates the `local-tls` Secret and, once, the Argo CD Application              |
| `k3s/argocd/application.yaml`                | Argo CD Application `local-platform`: syncs `k3s/manifests` from `main` with automated prune and self-heal                                               |
| `k3s/k3d-config.yaml`                        | Cluster `vb-local`: one server node, loopback 80/443 to Traefik, host-log mounts, Compose labels grouping its containers as the `local-platform` project |
| `k3s/manifests/charts/alloy.yaml`            | Alloy log collector: host files, PM2, Docker containers and pod logs to Loki                                                                             |
| `k3s/manifests/charts/argo-cd.yaml`          | Argo CD in the `argocd` namespace, without Dex, notifications or the ApplicationSet controller                                                           |
| `k3s/manifests/charts/grafana.yaml`          | Grafana with the Loki and Prometheus datasources provisioned                                                                                             |
| `k3s/manifests/charts/headlamp.yaml`         | Headlamp web UI at `headlamp.vigilant-broccoli.app`                                                                                                      |
| `k3s/manifests/charts/loki.yaml`             | Single-binary Loki on the filesystem, 30-day retention                                                                                                   |
| `k3s/manifests/charts/prometheus.yaml`       | Single Prometheus server plus kube-state-metrics, 15-day retention                                                                                       |
| `k3s/manifests/charts/traefik-config.yaml`   | Override for k3s's bundled Traefik: ExternalName Services, JSON access logs and latency buckets                                                          |
| `k3s/manifests/coredns-custom.yaml`          | CoreDNS `.server` block that pins `host.k3d.internal`, so a Docker restart that drops k3d's entry no longer 502s the host services                       |
| `k3s/manifests/platform/argocd.yaml`         | ExternalName Service and Ingress for `argocd.vigilant-broccoli.app`                                                                                      |
| `k3s/manifests/platform/dashboards/`         | Grafana dashboards as JSON, loaded through a `grafana_dashboard`-labelled ConfigMap                                                                      |
| `k3s/manifests/platform/host-services.yaml`  | ExternalName Services for `vb-manager-local-fastify` (1337) and Immich (2283) on the Mac                                                                          |
| `k3s/manifests/platform/ingresses.yaml`      | `*.vigilant-broccoli.app` Ingresses with TLS                                                                                                             |
| `k3s/manifests/platform/redirect-https.yaml` | Traefik Middleware redirecting those hosts from HTTP to HTTPS                                                                                            |

## Tools

All pinned in the root `mise.toml`; run `mise install`.

| Tool     | Use                                                                     |
| -------- | ----------------------------------------------------------------------- |
| Headlamp | Web UI for browsing resources, logs and events; runs inside the cluster |
| Helm     | Inspect releases (`helm list -A`); charts are installed by k3s itself   |
| k3d      | Creates, stops and deletes the cluster                                  |
| k9s      | Terminal UI (`pnpm local:k3s:ui`)                                       |
| kubectl  | Everything else; `apply -k` builds the Kustomize tree                   |

## Getting Started

1. Free loopback 80/443 (the cluster's load balancer binds them), then `pnpm local:k3s:up` and `pnpm local:k3s:apply`.
2. `pnpm local:k3s:status` until pods are `Running`; the first apply pulls images and charts, which took about seven minutes on a new cluster.
3. Open `https://grafana.vigilant-broccoli.app` (`admin`; `pnpm local:k3s:grafana:password` copies the password), `https://manager.vigilant-broccoli.app`, `https://images.vigilant-broccoli.app`, `https://loki.vigilant-broccoli.app/ready` and `https://argocd.vigilant-broccoli.app` (`admin`; `pnpm local:k3s:argocd:password` copies the password). The hostnames come from [hosts](../../hosts), copied into `/etc/hosts`.
4. `pnpm local:k3s:headlamp:token` copies a 24-hour login token to the clipboard and opens `https://headlamp.vigilant-broccoli.app`; paste it into the ID token prompt.
5. `pnpm local:k3s:stop` keeps state between sessions; `pnpm local:k3s:down` deletes the cluster, including Grafana and Loki data.

## Platform

- **GitOps:** `apply.sh` installs Argo CD and creates the `local-platform` Application once; from then on Argo CD syncs `k3s/manifests` from `main` on GitHub (public, so no credentials), deletes resources removed from Git and reverts manual edits. Merging a manifest change is the deploy. `local-tls` is created outside Git and never pruned. `pnpm local:k3s:status` shows the sync and health state; the UI shows each resource and its diff.
- **Ingress:** k3s's bundled Traefik replaces nginx. Each `*.vigilant-broccoli.app` Ingress uses the `local-tls` Secret (the mkcert wildcard from `setup-certs.sh`) and the `redirect-https` Middleware. Apps on the Mac are reached through ExternalName Services pointing at `host.k3d.internal`.
- **Logs:** Alloy runs as one replica pinned to the server node, which holds the host mounts, and ships to Loki under these `job` labels:

  | `job`        | Source                                                                          |
  | ------------ | ------------------------------------------------------------------------------- |
  | `docker`     | Docker containers outside the cluster (Immich, agent sandbox), via the socket   |
  | `kubernetes` | Every pod, through the Kubernetes API; labelled `namespace`, `pod`, `container` |
  | `pm2`        | `~/.pm2/logs/vb-manager-local-fastify-*.log`                                             |
  | `varlogs`    | `/var/log/*log` on the Mac                                                      |

- **Metrics:** Prometheus scrapes the apiserver, kubelet/cAdvisor (container CPU and memory), kube-state-metrics and every pod annotated `prometheus.io/scrape`, which includes k3s's bundled Traefik. Query it in Grafana Explore through the `Prometheus` datasource; it has no Ingress. Traefik's `traefik_service_*` series are labelled `service="<namespace>-<service>-<port>@kubernetes"`, e.g. `local-platform-vb-manager-local-fastify-1337@kubernetes`.
- **Dashboards:** Grafana's sidecar loads every ConfigMap labelled `grafana_dashboard=1` in `local-platform`; add a JSON file under `platform/dashboards/` and list it in that kustomization's `configMapGenerator`. Dashboards pick the Loki datasource through a `datasource` variable. `vb-manager-local-fastify (Local)` charts requests, status codes, latency and top paths for `manager.vigilant-broccoli.app` from Traefik's JSON access logs (`{namespace="kube-system", container="traefik"} | json`), alongside the PM2 error and output logs; its `Traefik metrics (Prometheus)` row charts the same request rate and latency from Traefik's metrics, picked through a `metrics` datasource variable.
- **Storage:** Grafana, Loki and Prometheus use `local-path` PVCs, which live inside the node containers. They survive `stop`/`start` and Docker restarts, not `local:k3s:down`.

## Nuances

### `HelmChart` resources live in `kube-system`

k3s's helm-controller runs each chart's install job in the `HelmChart`'s own namespace, and that job requests 32 CPU / 32G limits. A namespace under a ResourceQuota rejects it (`exceeded quota: ..., requested: limits.cpu=32`), and deleting that `HelmChart` then hangs on its `wrangler.cattle.io/on-helm-chart-remove` finalizer because the uninstall job is rejected too. Keep `HelmChart`s in `kube-system` and set `targetNamespace`; if one is already stuck, `pnpm local:k3s:down` and recreate.

### CoreDNS pins `host.k3d.internal` through a `.server` block, not `.override`

k3d writes `host.k3d.internal` into CoreDNS's `NodeHosts` only when it creates or starts the nodes, and a Docker Desktop restart can drop it; every `host-services.yaml` Service then answers 502 while the app is healthy. `coredns-custom.yaml` defines its own `host.k3d.internal:53` server block. A `*.override` file would be imported into the default block, which already uses `hosts` (one per block), and CoreDNS crash-loops with `plugin/hosts: this plugin can only be used once per Server Block`. CoreDNS reads the ConfigMap only at pod start, so restart it after changing the file. The address is what `host.docker.internal` resolves to inside the nodes; update it if Docker changes that.

### Argo CD deploys `main`, not the working tree

Self-heal reverts a working-tree `pnpm local:k3s:apply` (or any `kubectl edit`) to `main` within seconds. To try unmerged manifests, `pnpm local:k3s:argocd:pause`, apply them, and `pnpm local:k3s:argocd:resume` once they merge. `apply.sh` creates the Application only when it is missing, so re-running it keeps the pause.

### Changing `targetRevision` prunes what the new revision lacks

Pointing the Application at a branch to test it, then back at `main` before that branch merges, deletes everything only the branch added, including the `argo-cd` HelmChart if the branch introduced it, which uninstalls Argo CD. Keep the branch revision until the PR merges, then `pnpm local:k3s:argocd:resume`.

### `kubectl apply` never deletes

Argo CD prunes what it syncs, but `apply.sh` and applies during a paused auto-sync use `kubectl apply`: removing a file from the Kustomize tree leaves its resources running. Delete them by hand (`kubectl delete -f <file>`), or recreate the cluster. A `HelmChart` whose `targetNamespace` changes installs a second release; delete the old `HelmChart` and its namespace first.

### Host mounts and ports are fixed at cluster creation

k3d applies `ports`, `volumes` and container `labels` only when it creates the node containers. After editing any of them in `k3d-config.yaml`, run `pnpm local:k3s:down` and `pnpm local:k3s:up`. `local:k3s:up` fails with `port is already allocated` while another process (the retired nginx Compose proxy, a second cluster) holds loopback 80/443.

### The redirect loops on a non-443 test port

Traefik's `redirectScheme` builds the HTTPS URL without the request's port, so a cluster created on a test port such as 28443 answers HTTPS requests with a 301 to port 443. Test with the real hostname instead, for example `curl --connect-to ::127.0.0.1:28443 https://grafana.vigilant-broccoli.app/`.

### Pinning a `uid` on the provisioned datasource crash-loops Grafana

Adding `uid` to the existing Loki datasource in `charts/grafana.yaml` makes provisioning look it up by the new uid, fail with `Datasource provisioning error: data source not found`, and restart in a loop; the old pod keeps serving because the rollout never completes. Reference the datasource from dashboards through a `datasource` template variable instead, or delete the datasource with `deleteDatasources` in the same provisioning file before pinning a uid.

### The `k3d-vb-local-tools` container sits outside the `local-platform` group

k3d starts a `noop` helper container while creating a cluster and leaves it running; runtime labels never reach it, so Docker Desktop lists it on its own. `pnpm local:k3s:up` removes it after creation. k3d starts it again when it needs it (`k3d image import`), and removing it then is safe.
