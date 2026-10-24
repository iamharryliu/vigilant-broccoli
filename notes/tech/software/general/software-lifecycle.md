# Software Lifecycle

## Table of Contents

- [Cycle](#cycle)
  - [Develop](#develop)
  - [Deploy](#deploy)
  - [Maintenance](#maintenance)

## Cycle

```mermaid
flowchart LR
    A["Plan<br/>Gather and document what the software needs to do."] --> B["Design<br/>Plan architecture, data models, and interfaces before writing code."]
    B --> C["Develop<br/>Write the code that satisfies the design."]
    C --> D["Testing<br/>Verify behavior against requirements and catch regressions."]
    D --> E["Deploy<br/>Release the software to its target environment."]
    E --> F["Maintenance<br/>Fix bugs, patch dependencies, and adapt to new requirements over time."]
    F --> A
```

### Develop

- Integrations

### Deploy

- Image publish
- Package publish

### Maintenance

- App audit
  - Security
  - Performance
  - Scalability
- Documentation audit
- Prune codebase for dead code/documentation
- Comment alignment
  - Aligned trailing comments
