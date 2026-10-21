#!/bin/bash
# Sourced, never run. Resource caps for every `docker run` sandbox container.
# Without them one `vb-manager-next` build (~4 GiB) starves the shared Docker
# Desktop VM, so k3s, Traefik and the local stack stall until it finishes.
# Memory-swap equals memory so a run hits its cap and fails instead of swapping
# the whole VM. CI runners are sized for these builds, so they get no default
# cap; set SANDBOX_MEMORY or SANDBOX_CPUS to cap one anyway.

SANDBOX_RESOURCE_LIMITS=()
if [ -n "${SANDBOX_MEMORY:-}" ] || [ -z "${CI:-}" ]; then
  SANDBOX_RESOURCE_LIMITS+=(--memory "${SANDBOX_MEMORY:-4g}" --memory-swap "${SANDBOX_MEMORY:-4g}")
fi
if [ -n "${SANDBOX_CPUS:-}" ] || [ -z "${CI:-}" ]; then
  SANDBOX_RESOURCE_LIMITS+=(--cpus "${SANDBOX_CPUS:-4}")
fi
