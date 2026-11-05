# Environment Strategies

| Strategy | Description | Pros | Cons | Best for |
| --- | --- | --- | --- | --- |
| Blue-green | Two identical production stacks; traffic switches from the live one to the idle one on release. | Instant rollback; near-zero downtime. | Double infrastructure cost; shared database migrations are tricky. | Critical services with strict uptime needs. |
| Canary | A new version serves a small share of production traffic before a full rollout. | Real-traffic validation; limited blast radius. | Needs traffic splitting and good metrics; two versions run at once. | Large user bases where regressions must be caught early. |
| Dev + prod | A local or shared dev environment and a production environment. | Simple; cheap; little to maintain. | No pre-release rehearsal; prod-only bugs reach users. | Small projects and hobby apps. |
| Dev + staging + prod | Staging mirrors production for final verification before release. | Realistic pre-release testing; QA and demo sandbox. | Staging drifts from prod; extra cost and upkeep. | Teams with QA or release gates. |
| Feature flags | One environment; unfinished or risky code ships dark behind runtime toggles. | Decouples deploy from release; per-user rollout and instant kill switch. | Flag debt; combinatorial test paths. | Trunk-based development and continuous delivery. |
| Preview (ephemeral) per PR | Each pull request gets a short-lived environment, destroyed on merge or close. | Isolated review and testing; no environment contention. | Per-PR cost; seed data and secrets need automation. | Frontends and teams with many parallel branches. |
| Prod only | Single environment; changes deploy straight to production. | Zero environment overhead; fastest iteration. | Every mistake is live; no safe place to test. | Static sites and throwaway prototypes. |
| Shadow (traffic mirroring) | Production requests are copied to a new version whose responses are discarded. | Tests under real load with no user impact. | Side effects (writes, emails) must be stubbed; doubles compute. | Rewrites and migrations where behavior must match. |
