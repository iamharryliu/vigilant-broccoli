# Software Lingo

## Table of Contents

- [Programming Concepts](#programming-concepts)
- [Architecture](#architecture)
- [Networking](#networking)
- [Web Rendering](#web-rendering)
- [Testing](#testing)
- [Development Approaches](#development-approaches)
- [Tooling](#tooling)
- [AI and LLMs](#ai-and-llms)

## Programming Concepts

| Term                | Definition                                                                                                                                                                                                        |
| :------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ACID                | A set of properties that guarantee reliable transaction processing in relational database systems                                                                                                                 |
| Closure             | Enables functions to keep state.                                                                                                                                                                                  |
| Compiler            | A tool that converts source code written in one programming language into another, typically into machine code.                                                                                                   |
| DSL                 | Domain-Specific Language. A language built for one narrow job (e.g. SQL, regex, CSS, HCL) rather than general programming, usually declarative: you describe the desired result and the tool works out the steps. |
| first class citizen | a particular entity in a language—like a function, object, or data type—can be used freely and fully like any other value.                                                                                        |
| FOSS                | Free and Open Source Software — software whose source code is freely available to view, modify, and redistribute, usually under a license like MIT, GPL, or Apache.                                               |
| Hard delete         | Physically removing a row from the database, so it cannot be recovered without a backup. The opposite of a soft delete.                                                                                           |
| High-level language | A programming language that is closer to human language, abstracting away hardware details. Easier to read, write, and maintain (e.g., Python).                                                                   |
| immutable           | Cannot be changed after it’s created.                                                                                                                                                                             |
| Lazy loading        | Deferring a load until first access, such as an ORM fetching a related entity only when it is read. Can cause N+1 queries.                                                                                        |
| Low-level language  | A programming language that is closer to machine code, with less abstraction from hardware. Provides more control but is harder to use (e.g., C).                                                                 |
| Soft delete         | Marking a record deleted (a `deleted_at` timestamp or flag) instead of removing the row, so it stays recoverable. A hard delete removes the row.                                                                  |
| Statically Typed    | Variable types are known at compile time.                                                                                                                                                                         |
| Ternary Operator    | A one line if else statement.                                                                                                                                                                                     |
| Transpiler          | Transforms code syntax and features so the code runs across different environments.                                                                                                                               |

## Architecture

| Term                      | Definition                                                                                                                                                                                                                   |
| :------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| API                       | Application Programming Interface — a defined set of rules and protocols that lets one piece of software request services or data from another.                                                                              |
| Backend                   | The server-side part of an application responsible for data processing, storage, and business logic.                                                                                                                         |
| daemon                    | A background process that runs continuously and handles tasks or requests without direct user interaction. Common in operating systems and servers.                                                                          |
| Dependency Inversion      | Implementing code so that high-level modules do not depend on low-level modules, ie abstract DB (could use MySQL or Postgres)                                                                                                |
| Distributed systems       | A system whose components run on multiple networked machines and coordinate by passing messages, so it appears to users as a single system.                                                                                  |
| Embedded Software         | Software written to run on dedicated hardware with a specific function (e.g. firmware on a microcontroller), as opposed to general-purpose software running on a computer.                                                   |
| ephemeral                 | Short lived or temporary.                                                                                                                                                                                                    |
| ERP                       | Enterprise Resource Planning. Software that integrates core business processes (finance, HR, supply chain, inventory, manufacturing) into a single system.                                                                   |
| Event Driven Architecture | A design where components communicate by emitting and reacting to events (e.g. "order placed") through a broker or queue instead of calling each other directly, so producers and consumers stay decoupled and asynchronous. |
| Firmware                  | Low-level software written to a device's non-volatile memory that directly controls its hardware, such as the code running on a microcontroller.                                                                             |
| Frontend                  | The client-side part of an application responsible for user interface and interaction.                                                                                                                                       |
| LTS                       | Long term support.                                                                                                                                                                                                           |
| Microcontroller           | A small computer on a single chip (CPU, memory, and I/O) built to run one dedicated task, typically the target hardware for embedded software.                                                                               |
| microservices             | Breaking applications into tiny remote services that run independently of each other.                                                                                                                                        |
| Monorepo                  | A single repository that contains multiple projects, often related, to simplify development and collaboration.                                                                                                               |
| Pub/Sub Model             | Publisher -> Message Broker (routes topics) -> Subscriber                                                                                                                                                                    |

## Networking

| Term          | Definition                                                                                                                     |
| :------------ | :----------------------------------------------------------------------------------------------------------------------------- |
| Edge Requests | Requests served/handled at edge servers close to users. Benefits are lower latency, faster response, smarter request handling. |
| URI           | Uniform Resource Identifier.                                                                                                   |
| URL           | Uniform Resource Locator.                                                                                                      |

## Web Rendering

| Term                                               | Definition                                                                                                                                                                                                       |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [CSS](./web-dev/frontend/css.md)                   | Cascading Style Sheets — the language used to style a document, including colors, fonts, spacing, and layout.                                                                                                    |
| CSSOM                                              | CSS Object Model — the browser's representation of stylesheets and their rules, exposed through APIs that JavaScript can read and modify.                                                                        |
| DOM                                                | Document Object Model — the live tree of nodes representing a document, exposed through APIs that JavaScript can use to read, create, and update its content and structure.                                      |
| HTML                                               | HyperText Markup Language — the markup language that defines a web document's content, structure, and semantics. The browser parses HTML into DOM nodes.                                                         |
| [JavaScript](./languages/javascript/javascript.md) | A programming language used in browsers to implement behavior, respond to events, and update the DOM and styles; it also runs outside browsers.                                                                  |
| Shadow DOM                                         | A browser feature that attaches an encapsulated DOM tree to a host element, commonly used for a Web Component's internal markup and styles. It scopes styles across the boundary but is not a security boundary. |

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

| Term  | Definition                                                                                                                                                                          |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BDD   | Behavior-Driven Development. Requirements are written as plain-language Given-When-Then scenarios and automated as tests. See [BDD](./general/bdd.md).                              |
| CI/CD | Continuous Integration/Continuous Deployment (or Delivery). CI automatically builds and tests every merged change; CD automatically ships passing changes to staging or production. |
| TDD   | Test-Driven Development. You write the test first and then the code that makes it pass.                                                                                             |

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
| Prune           | Remove unused or unneeded items (dead code, dependencies, stale branches, old data) to cut size and clutter.           |
| Redis           | An in-memory data structure store used as a database, cache, and message broker for high-performance applications.     |
| Runtime         | The environment in which a program or script executes, including the necessary tools and resources.                    |
| tree shaking    | A code optimization technique that removes unused code (dead code) from the final bundle during the build process.     |

## AI and LLMs

| Term               | Definition                                                                                                                                                                                                         |
| :----------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Agent              | An LLM run in a loop that decides which tools to call, reads the results and repeats until the task is done, instead of answering once.                                                                            |
| Auto mode          | An agentic coding tool mode where the agent proceeds without asking for each step: routine, low-risk actions are approved automatically, while risky ones are still blocked or sent for confirmation.              |
| Context compaction | Summarizing earlier conversation history into a shorter form when the context window fills, so a long session can continue.                                                                                        |
| Context window     | The maximum number of tokens a model can consider at once, covering the system prompt, history, tool results and its own reply.                                                                                    |
| Embedding          | A vector of numbers that represents the meaning of text, so similar texts sit close together. Used for semantic search and RAG.                                                                                    |
| Hallucination      | A model stating something false or invented with confidence.                                                                                                                                                       |
| Harness            | The program around a model that supplies its system prompt and tools, runs the agent loop and enforces permissions. Claude Code and Codex are harnesses.                                                           |
| Inference          | Running a trained model to produce output, as opposed to training it.                                                                                                                                              |
| Max output         | The cap on how many tokens a model can generate in a single response, separate from the context window.                                                                                                            |
| MCP                | Model Context Protocol, an open standard for connecting an AI application to external tools and data through servers that expose them in a uniform way.                                                            |
| Ollama             | A local runtime that downloads open-weight models, runs them on your own hardware and serves them through an HTTP API, so tools can use them instead of a hosted provider.                                         |
| Open-weight model  | A model whose trained weights are published for download, so it can be run locally. Not necessarily open source, since training data and code may be withheld.                                                     |
| Prompt caching     | Reusing the already-processed start of a repeated prompt to cut cost and latency on later requests.                                                                                                                |
| Quantization       | Storing model weights at lower numeric precision to shrink memory use and speed up inference, at a small cost in quality.                                                                                          |
| RAG                | Retrieval-augmented generation: fetching relevant documents and adding them to the prompt so the model answers from them.                                                                                          |
| Skill              | A packaged set of instructions an agent loads when a task matches, instead of keeping them in every prompt.                                                                                                        |
| Subagent           | A separate agent started by another agent for a subtask, with its own context window, that returns only its result.                                                                                                |
| System Prompt      | A predefined instruction that sets the AI’s behavior, tone, and constraints.                                                                                                                                       |
| Temperature        | Controls randomness in responses. Higher values are more creative, lower are more deterministic.                                                                                                                   |
| Token              | The unit of text a model reads and writes, roughly a word fragment. Context limits, output limits and billing are counted in tokens.                                                                               |
| Tool use           | A model requesting that the harness run a function, such as a shell command or file read, and then receiving the result.                                                                                           |
| User Prompt        | The input provided by the user to request information or an action.                                                                                                                                                |
| Yolo mode          | An agentic coding tool mode that disables permission prompts so the agent runs every command and file edit unattended ("you only live once"). Fastest but unsafe; use only in a sandbox or disposable environment. |
