# Tech Lingo

- [Software Lingo](./software/software-lingo.md)
- [Computer Hardware Lingo](./hardware/computer-hardware-lingo.md)

- [Build Systems & CI/CD](#build-systems--cicd)
- [Roles](#roles)
- [Hot Takes](#hot-takes)

| Term                           | Description                                                                                                                                                                                         |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brownfield Project             | A type of initiative that involves working with or building on top of existing systems, infrastructure, or legacy code, requiring consideration of prior constraints and technical debt.            |
| Content Delivery Network (CDN) | A distributed network of servers that deliver web content to users based on their geographic location.                                                                                              |
| Greenfield Project             | A type of initiative (often in construction, software, or business) that is built from scratch, without needing to work within the constraints of existing systems, infrastructure, or legacy code. |
| Keys                           | Unique identifiers or cryptographic components used for secure access, data encryption, or mapping data structures.                                                                                 |
| On-Prem                        | Short for “on-premises,” meaning software, hardware, or infrastructure hosted locally within an organization’s facilities.                                                                          |
| Starlink                       | SpaceX’s satellite internet constellation, providing broadband via a network of low Earth orbit (LEO) satellites.                                                                                   |
| Token                          | A piece of data used for authentication, authorization, or as a placeholder in secure communications.                                                                                               |

## Build Systems & CI/CD

| Term           | Description                                                                                                                                                         |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bazel          | Google's open-source build and test tool for multi-language monorepos, with fine-grained incremental builds and caching based on a declarative dependency graph.    |
| Gerrit         | A web-based code review tool built on Git, using a change/patch-set model instead of long-lived PR branches, with formal reviewer approval workflows.               |
| GitHub Actions | GitHub's built-in CI/CD platform for automating build, test, and deploy workflows via YAML-defined jobs triggered by repository events.                             |
| Nx             | A build system and monorepo tool with computation caching, task orchestration, and dependency-graph-aware "affected" builds (used in this repo).                    |
| Turborepo      | A high-performance build system for JavaScript/TypeScript monorepos, with remote caching and declarative task pipelines.                                            |
| Zuul           | A gated CI system that speculatively tests changes in their prospective merge order before merging, originally built for OpenStack and commonly paired with Gerrit. |

## Roles

| Role                                 | Primary Responsibility                                                                             |
| ------------------------------------ | -------------------------------------------------------------------------------------------------- |
| Data Engineer                        | Data pipelines, analytics infrastructure, warehouses.                                              |
| Data Scientist / ML Engineer         | Machine learning models and analytics.                                                             |
| DevOps / Platform Engineer           | Builds CI/CD, cloud infrastructure, observability, deployments, and reliability.                   |
| Engineering Manager (EM) / Tech Lead | Decides how the team executes. Removes blockers, manages engineers, technical direction, delivery. |
| Product Manager (PM)                 | Decides what to build and why. Owns roadmap, prioritization, customer needs, and business value.   |
| Project Manager                      | Schedule, coordination, budgets, stakeholder communication. Distinct from Product Manager.         |
| QA / Test Engineer                   | Prevents regressions through testing, automation, and quality processes.                           |
| Scrum Master / Agile Coach           | Facilitates agile processes (less common in smaller companies).                                    |
| Security Engineer                    | Application security, threat modeling, compliance, vulnerability management.                       |
| Site Reliability Engineer (SRE)      | Reliability, uptime, incident response, performance.                                               |
| Software Architect                   | Long-term system architecture across multiple teams.                                               |
| Software Engineers                   | Design, build, test, and maintain the product. Usually the largest group.                          |
| Technical Writer                     | Documentation for developers and users.                                                            |
| UX/UI Designer                       | Makes the product usable and intuitive through research, wireframes, and visual design.            |

## Hot Takes

- Test Driven Development (TDD) - Onely useful if you know most of the requirements beforehand otherwise code is subject to change which means written tests are also subject to change.
- Behavior Driven Development (BDD) - Cool idea for readable tests but adds extra layer to writing
- ChatGPT - Just another tool like Google search engine. Raised the entry bar of becoming a software developer since it can perform what most junior engineers can do.
