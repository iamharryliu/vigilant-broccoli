# Software Practices

## Table of Contents

- [Resources](#resources)
- [Personal Habits](#personal-habits)
- [Working in a Team](#working-in-a-team)
- [Project Management](#project-management)
- [Good Design](#good-design)
- [Architecture](#architecture)
- [Greenfield](#greenfield)
- [Application Building](#application-building)
- [Implementation](#implementation)
- [Database](#database)
- [Version Control](#version-control)
- [Code Maintenance](#code-maintenance)
  - [Testing](#testing)
- [Security](#security)
- [Error Handling](#error-handling)
  - [Triage](#triage)
- [Documentation](#documentation)
- [Developer Experience](#developer-experience)
- [Reliability](#reliability)
- [Concerns](#concerns)
- [VM Management](#vm-management)
- [Infrastructure Management](#infrastructure-management)
  - [Monitoring](#monitoring)
- [Delivery](#delivery)
  - [Handover](#handover)
  - [Library/OSS Support](#libraryoss-support)
- [Software Maintenance](#software-maintenance)
  - [Weekly](#weekly)

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

## Greenfield

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

## Application Building

- **POC**
  - Interfaces > utils > tests > implementation > scaling

## Implementation

| Consideration | Description |
| --- | --- |
| Scaling | Handles growth in users, data and traffic without redesign. |
| Security | Protects data and access through authentication, encryption and least privilege. |
| Weighing alternative solutions | Compares options on trade-offs before committing to one. |

## Database

- Schema
- Backing up

## Version Control

- Branching
- Code Review Process

## Code Maintenance

- Type Annotation

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

## Error Handling

### Triage

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

## Concerns

| Concern | Caveat |
| --- | --- |
| Scaling | Large automations are susceptible to injection. As interfaces grow there are more attack surfaces. |
| Security | Can add friction to development. |

## VM Management

- Bootstrapping
- Application Access
  - SSH/proxy access
  - CI access
  - Developer access

## Infrastructure Management

- Start/stop resources

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

## Software Maintenance

- Test breakglass
- Secret rotations
- Security tests
- Integration tests

### Weekly

- Review and update dependencies for local code and repositories.
