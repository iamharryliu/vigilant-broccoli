# Service Status

Public uptime checks and incident history managed by [vigilant-broccoli](https://github.com/iamharryliu/vigilant-broccoli).

## Table of Contents

- [Service Status](#service-status)
- [Management](#management)

## Service Status

<!--start: status pages-->
<!--end: status pages-->

## Management

- Configuration and workflow sources: `infrastructure/upptime/` and `.upptimerc.yml` in vigilant-broccoli.
- Checks: [monitoring workflows](https://github.com/@MONITORING_REPOSITORY@/actions).
- Incidents: [issues](https://github.com/@MONITORING_REPOSITORY@/issues).
- Credentials: repository-scoped temporary `GITHUB_TOKEN` only; no Vault, GCP, or application deployment credentials.
- Schedules activate after migration; manual runs are available for verification.
- Update configuration in the source repository. The sync preserves generated history and the status table above.
