# Software Lingo

- [Programming Concepts](#programming-concepts)
- [Architecture](#architecture)
- [Networking](#networking)
- [Testing](#testing)
- [Development Approaches](#development-approaches)
- [Tooling](#tooling)

## Programming Concepts

| Term                | Definition                                                                                                                                        |
| :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------ |
| ACID                | A set of properties that guarantee reliable transaction processing in relational database systems                                                 |
| Closure             | Enables functions to keep state.                                                                                                                  |
| Compiler            | A tool that converts source code written in one programming language into another, typically into machine code.                                   |
| first class citizen | a particular entity in a language—like a function, object, or data type—can be used freely and fully like any other value.                        |
| High-level language | A programming language that is closer to human language, abstracting away hardware details. Easier to read, write, and maintain (e.g., Python).   |
| immutable           | Cannot be changed after it’s created.                                                                                                             |
| Low-level language  | A programming language that is closer to machine code, with less abstraction from hardware. Provides more control but is harder to use (e.g., C). |
| Statically Typed    | Variable types are known at compile time.                                                                                                         |
| Ternary Operator    | A one line if else statement.                                                                                                                     |
| Transpiler          | Transforms code syntax and features so the code runs across different environments.                                                               |

## Architecture

| Term                      | Definition                                                                                                                                                                 |
| :------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend                   | The server-side part of an application responsible for data processing, storage, and business logic.                                                                       |
| daemon                    | A background process that runs continuously and handles tasks or requests without direct user interaction. Common in operating systems and servers.                        |
| Dependency Inversion      | Implementing code so that high-level modules do not depend on low-level modules, ie abstract DB (could use MySQL or Postgres)                                              |
| Embedded Software         | Software written to run on dedicated hardware with a specific function (e.g. firmware on a microcontroller), as opposed to general-purpose software running on a computer. |
| ephemeral                 | Short lived or temporary.                                                                                                                                                  |
| ERP                       | Enterprise Resource Planning. Software that integrates core business processes (finance, HR, supply chain, inventory, manufacturing) into a single system.                 |
| Event Driven Architecture |                                                                                                                                                                            |
| Firmware                  | Low-level software written to a device's non-volatile memory that directly controls its hardware, such as the code running on a microcontroller.                           |
| Frontend                  | The client-side part of an application responsible for user interface and interaction.                                                                                     |
| LTS                       | Long term support.                                                                                                                                                         |
| Microcontroller           | A small computer on a single chip (CPU, memory, and I/O) built to run one dedicated task, typically the target hardware for embedded software.                             |
| microservices             | Breaking applications into tiny remote services that run independently of each other.                                                                                      |
| Monorepo                  | A single repository that contains multiple projects, often related, to simplify development and collaboration.                                                             |
| Pub/Sub Model             | Publisher -> Message Broker (routes topics) -> Subscriber                                                                                                                  |

## Networking

| Term          | Definition                                                                                                                     |
| :------------ | :----------------------------------------------------------------------------------------------------------------------------- |
| Edge Requests | Requests served/handled at edge servers close to users. Benefits are lower latency, faster response, smarter request handling. |
| URI           | Uniform Resource Identifier.                                                                                                   |
| URL           | Uniform Resource Locator.                                                                                                      |

## Testing

| Test Type        | Description                                                                                                       | Best Used For                                                                    |
| ---------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| A/B              | Compares two variants of a feature against real users to measure impact.                                          | Making data-driven product decisions.                                            |
| Acceptance (UAT) | Validates the software against business/user requirements, often performed by stakeholders.                       | Confirming the product meets user needs before sign-off.                         |
| Accessibility    | Checks that the application is usable by people with disabilities (screen readers, keyboard nav, contrast, etc.). | Meeting a11y standards (e.g. WCAG) and ensuring inclusive UX.                    |
| Canary           | Rolls a change out to a small subset of real traffic/users before a full release.                                 | Detecting regressions in production with limited blast radius.                   |
| Chaos            | Deliberately injects failures (e.g. killing services, network partitions) into a system.                          | Validating resilience and fault tolerance in production-like environments.       |
| Contract         | Verifies that the interface between two services (e.g. API request/response shape) matches an agreed contract.    | Catching breaking changes between independently deployed services.               |
| End-to-End (E2E) | Simulates real user workflows through the entire application stack, from UI to backend.                           | Confirming complete user journeys work as intended.                              |
| Exploratory      | Unscripted, ad hoc testing driven by tester intuition and domain knowledge.                                       | Finding edge cases and usability issues that scripted tests miss.                |
| Integration      | Verifies that multiple components or services work correctly together (e.g. a service and a database).            | Catching issues at the boundaries between modules or systems.                    |
| Load             | Tests system behavior under expected or peak concurrent usage.                                                    | Validating performance and stability under normal-to-high traffic.               |
| Mutation         | Introduces small code changes ("mutants") to check whether the existing test suite catches them.                  | Measuring the effectiveness/quality of a test suite.                             |
| Regression       | Re-runs existing tests after a change to confirm previously working functionality still works.                    | Preventing new changes from breaking existing behavior.                          |
| Sanity           | A narrow, focused check that a specific bug fix or new change works as expected, without a full regression pass.  | Quickly validating a recent code change or hotfix.                               |
| Security         | Probes for vulnerabilities (injection, auth bypass, data exposure, etc.).                                         | Identifying exploitable weaknesses before attackers do.                          |
| Smoke            | A quick, shallow pass over the most critical functionality to confirm a build isn't fundamentally broken.         | Gatekeeping a new build/deploy before investing in deeper testing.               |
| Stress           | Pushes the system beyond normal capacity to find its breaking point.                                              | Understanding failure modes and capacity limits.                                 |
| System           | Tests the fully integrated application as a whole against its overall requirements.                               | Validating end-to-end functional and non-functional requirements before release. |
| Unit             | Verifies a single function, method, or class in isolation, typically with dependencies mocked/stubbed.            | Catching logic bugs early, fast feedback during development.                     |

## Development Approaches

| Term | Definition                                                                                                                                             |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| BDD  | Behavior-Driven Development. Requirements are written as plain-language Given-When-Then scenarios and automated as tests. See [BDD](./general/bdd.md). |
| TDD  | Test-Driven Development. You write the test first and then the code that makes it pass.                                                                |

## Tooling

| Term            | Definition                                                                                                             |
| :-------------- | :--------------------------------------------------------------------------------------------------------------------- |
| Bundler         | A tool that packages multiple files and their dependencies into a single file or set of files for deployment.          |
| CPU bound       | A condition where the speed of a program is limited by the processor's computation power.                              |
| cron            | Operating system utility used to schedule automation script executions.                                                |
| Elasticsearch   | A distributed, open-source search and analytics engine for handling large volumes of data in real time.                |
| Hadoop          | An open-source framework for distributed storage and processing of large data sets using clusters of computers.        |
| IO bound        | A condition where the speed of a program is limited by input/output operations like reading files or network requests. |
| Package Manager | A tool that automates the process of installing, upgrading, and managing software dependencies.                        |
| Redis           | An in-memory data structure store used as a database, cache, and message broker for high-performance applications.     |
| Runtime         | The environment in which a program or script executes, including the necessary tools and resources.                    |
| tree shaking    | A code optimization technique that removes unused code (dead code) from the final bundle during the build process.     |
