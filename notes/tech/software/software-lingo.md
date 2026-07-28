# Software Lingo

- [Programming Concepts](#programming-concepts)
- [Architecture](#architecture)
- [Tooling](#tooling)

## Programming Concepts

| Term                | Definition                                                                                                                                        |
| :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------ |
| ACID                | A set of properties that guarantee reliable transaction processing in relational database systems                                                 |
| Compiler            | A tool that converts source code written in one programming language into another, typically into machine code.                                   |
| first class citizen | a particular entity in a language—like a function, object, or data type—can be used freely and fully like any other value.                        |
| High-level language | A programming language that is closer to human language, abstracting away hardware details. Easier to read, write, and maintain (e.g., Python).   |
| immutable           | Cannot be changed after it’s created.                                                                                                             |
| Low-level language  | A programming language that is closer to machine code, with less abstraction from hardware. Provides more control but is harder to use (e.g., C). |

## Architecture

| Term                      | Definition                                                                                                                                          |
| :------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend                   | The server-side part of an application responsible for data processing, storage, and business logic.                                                |
| daemon                    | A background process that runs continuously and handles tasks or requests without direct user interaction. Common in operating systems and servers. |
| Dependency Inversion      | Implementing code so that high-level modules do not depend on low-level modules, ie abstract DB (could use MySQL or Postgres)                       |
| ephemeral                 | Short lived or temporary.                                                                                                                           |
| Event Driven Architecture |                                                                                                                                                     |
| Frontend                  | The client-side part of an application responsible for user interface and interaction.                                                              |
| LTS                       | Long term support.                                                                                                                                  |
| microservices             | Breaking applications into tiny remote services that run independently of each other.                                                               |
| Monorepo                  | A single repository that contains multiple projects, often related, to simplify development and collaboration.                                      |
| Pub/Sub Model             | Publisher -> Message Broker (routes topics) -> Subscriber                                                                                           |

## Tooling

| Term            | Definition                                                                                                                     |
| :-------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Bundler         | A tool that packages multiple files and their dependencies into a single file or set of files for deployment.                  |
| CPU bound       | A condition where the speed of a program is limited by the processor's computation power.                                      |
| Edge Requests   | Requests served/handled at edge servers close to users. Benefits are lower latency, faster response, smarter request handling. |
| Elasticsearch   | A distributed, open-source search and analytics engine for handling large volumes of data in real time.                        |
| Hadoop          | An open-source framework for distributed storage and processing of large data sets using clusters of computers.                |
| IO bound        | A condition where the speed of a program is limited by input/output operations like reading files or network requests.         |
| Package Manager | A tool that automates the process of installing, upgrading, and managing software dependencies.                                |
| Redis           | An in-memory data structure store used as a database, cache, and message broker for high-performance applications.             |
| Runtime         | The environment in which a program or script executes, including the necessary tools and resources.                            |
| tree shaking    | A code optimization technique that removes unused code (dead code) from the final bundle during the build process.             |
