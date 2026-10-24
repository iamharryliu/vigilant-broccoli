# R&D: Agent Sandbox Memory Contention on the Docker Desktop VM

> How do we stop parallel, unpredictable agent runs from starving the shared Docker Desktop VM and the local k3s stack? · 2026-10-21

## Context

Agent runs execute in containers on the same 7.65 GiB Docker Desktop VM as the k3s stack and Immich. `docker run --rm --init` (`infrastructure/agent-sandbox/solve-todo.sh:245`, `update-pr.sh:103`) and the long-lived `vb-agent-sandbox` service (`infrastructure/agent-sandbox/docker-compose.yml:5`, used by Codex through `docker exec` at `solve-todo.sh:242`) set no memory or CPU limits. On 2026-10-21 the VM stalled (load 47, k3s API timeouts, Traefik refusing connections, `https://manager.vigilant-broccoli.app/` down).

**Measured:**

| Finding                                                 | Evidence                                                                                            |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Light runs (Terraform/YAML/docs edits) are harmless     | Four runs peaked at 0.3–0.6 GiB and load 5.4; the URL stayed up                                     |
| One `nx run vb-manager-next:build` reproduces the stall | Container peaked at 4.1 GiB (2m 22s build), load 28, VM CPU 1,090%, k3s node 900%, URL dropped once |
| k3s itself is not a steady hog                          | All pods together used about 6% CPU and 2.2 GiB once the VM recovered                               |
| A cap is enforced                                       | A 256 MB-capped container allocating 600 MB exited 137                                              |

**Not measured:** two builds at once, a build under a 4 GiB cap, or what the VM kernel kills on global OOM. The 8 GiB demand against about 4 GiB of headroom is arithmetic (7.65 GiB minus about 3 GiB k3s and 0.35 GiB Immich).

The constraint that shapes the choice: you cannot predict which tasks build or how many overlap, so a fix must hold without knowing a run's content.

## Alternatives

| Option                                       | Pros                                                                                      | Cons                                                                                                           | Cost                                                                    | Security                                                 | Scalability                                       |
| -------------------------------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------- |
| **A — Per-container caps**                   | Tiny change; bounds one run; verified to OOM-kill (exit 137)                              | Does not bound the total: N runs still sum past the VM; Codex runs share one container, so one cap             | One sourced file plus 8 scripts and compose (tried in PR #1170, closed) | —                                                        | Fails as parallel runs grow                       |
| **B — OOM priority (`--oom-score-adj`)**     | Content-independent; on VM-wide OOM the kernel kills an agent before k3s or Immich        | Protects the stack, not the run; a victim run is lost (salvaged as a WIP PR)                                   | One flag per `docker run`; compose `oom_score_adj`                      | Neutral                                                  | Holds at any parallelism, but runs die under load |
| **C — Global slot limiter**                  | Content-independent; extra runs wait instead of starting; slot count from VM memory ÷ cap | Serializes light tasks too; Codex needs the limiter before `docker exec`; stale locks on a killed host         | One lock-dir helper in a sourced script                                 | Neutral                                                  | Scales by raising slots as the VM grows           |
| **D — Raise Docker Desktop memory (16 GiB)** | The only option that adds capacity; about two 4 GiB builds fit beside k3s and Immich      | Restarts the VM, interrupting k3s and Immich; the 36 GiB Mac is already tight (186 MB free, 4.7 GB compressed) | Edit `MemoryMiB` in `settings-store.json` (scriptable) or the UI        | Neutral                                                  | Raises the ceiling, does not remove it            |
| **E — Heavy work on hosted runners**         | No local memory limit; the repo already has hosted solves                                 | Changes the workflow; Actions minutes and per-run secrets (see root `CONTEXT.md` CI rules)                     | Runner minutes                                                          | Secrets via GCP Secret Manager or Vault, no repo secrets | Elastic                                           |
| **F — Separate machine for agents**          | Isolates the local stack completely                                                       | Hardware to buy and maintain                                                                                   | Hardware plus upkeep                                                    | New host to secure                                       | Per-machine                                       |

## Recommendation

Combine **B + C**, then **D**. B guarantees the local stack survives whatever a task does, and C stops overlap from exceeding the budget; neither depends on knowing what a run builds. D supplies the capacity that makes C's slot count more than 1. Keep **A** as a backstop beside them (it was a sound backstop, just not a fix). **E** wins instead if local parallelism matters more than keeping runs on this Mac, since it removes the shared-VM problem rather than managing it.

## Sample Implementation

1. Add `infrastructure/agent-sandbox/resource-limits.sh` (sourced, as `no-changes.sh` is) exporting `SANDBOX_RESOURCE_LIMITS=(--memory 4g --memory-swap 4g --cpus 4 --oom-score-adj 500)`. Skip the default caps when `CI` is set, and expand with `${SANDBOX_RESOURCE_LIMITS[@]+"${SANDBOX_RESOURCE_LIMITS[@]}"}` so bash 3.2 with `set -u` survives an empty array.
2. In the same file, add `acquire_sandbox_slot` and `release_sandbox_slot`: `mkdir /tmp/vb-sandbox-slots/slot-N` for N in `1..$SANDBOX_SLOTS`, polling until one succeeds, removed by a `trap … EXIT`. Record the owner PID in each slot and reclaim a slot whose PID is dead.
3. Source it in `solve-todo.sh:245`, `update-pr.sh:103`, `audit-*.sh`, `create-*.sh` and `prune.sh`; call the acquire step before `docker run`. Wrap the `docker exec` at `solve-todo.sh:242` the same way, and mirror the caps in `docker-compose.yml` (`mem_limit`, `memswap_limit`, `cpus`, `oom_score_adj`).
4. Set `SANDBOX_SLOTS` to 1 on the current 8 GiB VM. After raising Docker memory (set `MemoryMiB` with `jq` on `~/Library/Group Containers/group.com.docker/settings-store.json` while Docker Desktop is quit, from a script under `setup/`), raise it to 2.
5. Verify by running one `vb-manager-next` build under the cap and watching `docker stats` plus the public URL; then two parallel builds, which should queue rather than stall.
