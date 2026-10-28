# Software Practices

## Table of Contents

- [Resources](#resources)
- [Personal Habits](#personal-habits)
- [Working in a Team](#working-in-a-team)
- [Project Management](#project-management)
- [Good Design](#good-design)
- [Architecture](#architecture)
- [Application Building](#application-building)
  - [Greenfield](#greenfield)
- [Implementation](#implementation)
- [Performance Optimization](#performance-optimization)
- [Database](#database)
- [Version Control](#version-control)
- [Code Maintenance](#code-maintenance)
  - [Weekly](#weekly)
  - [Testing](#testing)
- [Security](#security)
- [Documentation](#documentation)
- [Developer Experience](#developer-experience)
- [Reliability](#reliability)
  - [Error Handling](#error-handling)
- [Infrastructure Management](#infrastructure-management)
  - [VM Management](#vm-management)
  - [Monitoring](#monitoring)
- [Delivery](#delivery)
  - [Handover](#handover)
  - [Library/OSS Support](#libraryoss-support)

## Resources

- [Conventional Commits](./conventional-commits.md)
- [Software Code Quality](./software-code-quality.md)
- [Software Conventions](./software-conventions.md)
- [Folder Structure](./folder-structure.md)

## Personal Habits

- Being agnostic to programming languages and frameworks. Use the best tool for the job depending on team.
- Reading and reviewing any PR whenever you have time like Ryan Chambers.
- Using _up to date syntaxes_. ChatGPT is usually good for refactoring short functions into more modern forms.
- Using a debugger tool over printing lines and running code over and over again.

## Working in a Team

- Considerate of development team's familiarity with the technologies.
- Understand everyone's dev experience, such as their skill level and tooling, so work and expectations fit each person.
- Manage expectations and safeguarding time from unnecessary meetings and coding.

## Project Management

| Area | Description |
| --- | --- |
| Cost Management | Tracks and controls spending on cloud services, licenses and tooling, staying within free tiers where possible. |

## Good Design

| Principle | Description |
| --- | --- |
| Agnostic | Not tied to a specific language, framework, vendor or environment. |
| Dynamic | Behavior is driven by configuration and input rather than hardcoded values. |
| Handling silent failures | Failures surface as errors, logs or alerts instead of being swallowed. |
| Immutability | Deployed artifacts are replaced, not modified in place, so releases are reproducible and rollbacks are simple. |
| Non-blocking/asynchronous | Slow work such as I/O or long tasks runs without holding up the caller, via async calls or queues. |
| Performance and optimization | Meets speed and resource needs, optimizing measured bottlenecks. |
| Stateless | Holds no state between requests, so instances are interchangeable and easy to scale. |

## Architecture

- Establish good practices at the start of a project to save time over its lifetime, even when they require extra upfront work.
- Thinking long term management rather than fast delivery.
- Custom built lightweight solutions over heavy third party solutions to have control over the project and avoiding vendor lock-in.
- Use good **folder structure** patterns to separate concerns.
- **Code Maintenance**
  - Use **language typing** as much as possible.
    - Upfront time cost to save time later.
  - Use **code quality tools** such as type **annotations, linters and formatter**.
- Building applications with a **shared codebase** if there is reusable code across applications.
- **Test Framework**
  - Tests on bug fixes to make sure they do not happen again.
  - Take advantage of test code to be able to **confidently write code**.
- **CICD**

  - Using commit hooks to test and deploy code.

- **Documentation**
  - Immediately writing documentation after implementing new code.
  - Using a **single source of truth** rather than multiple places that may need to be updated if any code changes such as a singular README.md.

## Application Building

- **POC**
  - Interfaces > utils > tests > implementation > scaling

### Greenfield

- New products
  - R&D Phase
    - APIs
    - Language
  - Solution choices
    - Long term support?
    - Maintainability
    - Accessibility
    - Pricing
    - Weight pros and cons
  - Development
    - Always start off overkill with base tooling
    - App building SQLite database
    - CI
  - Final Product
    - Documentation to reproduce

## Implementation

| Consideration | Description | Caveat |
| --- | --- | --- |
| Scaling | Handles growth in users, data and traffic without redesign. | Large automations are susceptible to injection. As interfaces grow there are more attack surfaces. |
| Security | Protects data and access through authentication, encryption and least privilege. | Can add friction to development. |
| Weighing alternative solutions | Compares options on trade-offs before committing to one. |  |

## Performance Optimization

| Type | Description |
| --- | --- |
| Algorithmic | Uses better algorithms and data structures to reduce time or space complexity. |
| Asset | Shrinks and defers images, fonts, CSS and JavaScript through compression, minification, lazy loading and code splitting. |
| Caching | Stores computed or fetched results closer to the consumer, such as in memory, a CDN or the browser, to avoid repeated work. |
| Concurrency | Runs independent work in parallel through threads, workers or async I/O. |
| Database | Speeds up queries with indexes, query tuning, denormalization, connection pooling and avoiding N+1 queries. |
| Hardware/Infrastructure | Right-sizes compute, memory and storage, and scales horizontally or vertically. |
| Memory | Reduces allocations, leaks and garbage collection pressure through pooling and streaming. |
| Network | Cuts latency and payload through compression, HTTP/2, keep-alive connections, batching and CDNs. |
| Rendering | Avoids unnecessary UI re-renders and layout work through memoization, virtualization and debouncing. |

## Database

- Schema
- Backing up

## Version Control

- Branching
- Code Review Process

## Code Maintenance

- Type Annotation
- Test breakglass
- Secret rotations

### Weekly

- Review and update dependencies for local code and repositories.

### Testing

- Unit Testing
- End to End (E2E)
- Integration Testing
- Performance Testing
- Security Testing

## Security

- HTTPS TLS/SSL
- Service accounts
- Service account/auth
- Secret manager
- Permission levels
- Data encryption

## Documentation

- What is strong documentation?
  - You are easily able to redeploy assets again.
  - Common commands
  - Setup commands
  - References
  - Useful links: Management settings, API docs, billing, etc

## Developer Experience

- IaC
- Personal dashboards
- Monorepo
- Setup scripts

## Reliability

- Reliability is the system working correctly and staying available when users need it.
- Availability

### Error Handling

#### Triage

## Infrastructure Management

- Start/stop resources

### VM Management

#### VM Setup

- Bootstrapping

#### VM Access

- SSH/proxy access
- CI access
- Developer access

#### VM Maintenance

##### VM Cleanup

| Type | Command | Notes |
| --- | --- | --- |
| Cache | `npm cache clean --force` | Often 1-5GB. |
| Docker | `docker system prune -f`, `docker image prune -a -f` | The first removes stopped containers and dangling images; the second removes all unused images and frees more. |
| Logs | `sudo journalctl --vacuum-time=7d` | Keeps the last 7 days of systemd journal. |
| Packages | `sudo apt clean` | Removes downloaded package files, about 100-200MB. |

**Use Caution**

| Target | Risk | Notes |
| --- | --- | --- |
| `.nvm` | High | Node runtime lives here; removal breaks node. |
| log files | Low-Medium | Truncate, don't delete: `> /var/log/somefile.log`. |
| `node_modules` | Medium | Only remove if you can reinstall; don't touch production app dirs. |
| snap revisions | Medium | `snap list --all`, then `snap remove --revision` old ones. |

**Avoid on Live VMs**

- Modifying running app directories.
- Removing swap (`/swapfile`).
- Clearing `/tmp` without checking for active sockets and locks.

##### VM Checkup

| Check | Command |
| --- | --- |
| Disk usage | `df -h` |
| Disk usage by top-level directory | `du -sh /* 2>/dev/null \| sort -rh` |
| Disk usage by user home | `du -sh /home/*/ \| sort -rh` |
| Docker containers | `docker ps -a` |
| Docker disk usage | `docker system df` |
| Failed services | `systemctl --failed` |
| Journal size | `journalctl --disk-usage` |
| Listening ports | `ss -tlnp` |
| Load and uptime | `uptime` |
| Memory | `free -h` |
| Swap | `swapon --show` |

### Monitoring

- Distributed Tracing: Understanding the flow of requests across microservices.
- Performance Monitoring: Monitoring application performance through metrics.
- Logging: Contextualizing trace and metric data with relevant logs.
- Health Checks

## Delivery

### Handover

- Provide software and documentation.
- Transfer billing.
- Update Permissions.
- Secret rotation.

### Library/OSS Support
