# Software Lingo

## Table of Contents

- [Programming Concepts](#programming-concepts)
- [Architecture](#architecture)
- [Networking](#networking)
- [Web Rendering](#web-rendering)
- [Testing](#testing)
- [Development Approaches](#development-approaches)
- [Tooling](#tooling)
- [Platform Engineering](#platform-engineering)
- [AI and LLMs](#ai-and-llms)

## Programming Concepts

| Term | Definition |
| :-- | :-- |
| ACID | A set of properties that guarantee reliable transaction processing in relational database systems |
| Bytecode | A compact, platform-independent instruction set that a virtual machine executes or JIT compiles, rather than the CPU directly (e.g. JVM `.class` files, .NET IL, Python `.pyc`). |
| Closure | Enables functions to keep state. |
| Compiled | Source code is translated ahead of time into machine code or bytecode that runs without the original source (e.g. C, Rust, Go; Java and C# to bytecode). |
| Compiler | A tool that converts source code written in one programming language into another, typically into machine code. |
| Declarative programming | A paradigm where you describe the result you want and the engine works out the steps (e.g. SQL, HTML/CSS, Terraform). |
| DSL | Domain-Specific Language. A language built for one narrow job (e.g. SQL, regex, CSS, HCL) rather than general programming, usually declarative: you describe the desired result and the tool works out the steps. |
| Dynamically Typed | Variable types are checked at runtime, so a variable can hold values of any type and type errors surface only when the code executes (e.g. Python, JavaScript, Ruby). |
| first class citizen | a particular entity in a language—like a function, object, or data type—can be used freely and fully like any other value. |
| FOSS | Free and Open Source Software — software whose source code is freely available to view, modify, and redistribute, usually under a license like MIT, GPL, or Apache. |
| Functional programming | A paradigm that builds programs by composing pure functions over immutable data, avoiding shared state and side effects (e.g. Haskell, Elixir). |
| Garbage collected | Memory is freed automatically by the runtime once objects are no longer reachable, instead of the programmer freeing it manually (e.g. Java, Python, Go, JavaScript). |
| Hard delete | Physically removing a row from the database, so it cannot be recovered without a backup. The opposite of a soft delete. |
| High-level language | A programming language that is closer to human language, abstracting away hardware details. Easier to read, write, and maintain (e.g., Python). |
| immutable | Cannot be changed after it’s created. |
| Imperative programming | A paradigm where you spell out the steps that change program state; procedural and object-oriented programming are imperative styles. |
| Interpreted | Source code is executed directly at runtime by an interpreter, with no separate build step (e.g. Python, Ruby, Bash). |
| Lazy loading | Deferring a load until first access, such as an ORM fetching a related entity only when it is read. Can cause N+1 queries. |
| Logic programming | A declarative paradigm where you state facts and rules and the engine searches for answers that satisfy them (e.g. Prolog). |
| Low-level language | A programming language that is closer to machine code, with less abstraction from hardware. Provides more control but is harder to use (e.g., C). |
| Machine code | Binary instructions executed directly by a specific CPU architecture (e.g. x86-64, ARM64); the lowest level of software. |
| Object-oriented programming | A paradigm that organizes code into objects bundling data with the behaviour that operates on it, using encapsulation, inheritance and polymorphism (e.g. Java, C#). Also OOP. |
| Procedural programming | A paradigm that structures a program as an ordered sequence of steps grouped into reusable procedures or functions that operate on shared data (e.g. C, Bash). |
| Soft delete | Marking a record deleted (a `deleted_at` timestamp or flag) instead of removing the row, so it stays recoverable. A hard delete removes the row. |
| Statically Typed | Variable types are known at compile time. |
| Ternary Operator | A one line if else statement. |
| Transpiled | Source code is translated ahead of time into source code of another language at a similar level of abstraction (e.g. TypeScript to JavaScript). |
| Transpiler | Transforms code syntax and features so the code runs across different environments. |

## Architecture

| Term | Definition |
| :-- | :-- |
| API | Application Programming Interface — a defined set of rules and protocols that lets one piece of software request services or data from another. |
| Backend | The server-side part of an application responsible for data processing, storage, and business logic. |
| daemon | A background process that runs continuously and handles tasks or requests without direct user interaction. Common in operating systems and servers. |
| Dependency Inversion | Implementing code so that high-level modules do not depend on low-level modules, ie abstract DB (could use MySQL or Postgres) |
| Distributed systems | A system whose components run on multiple networked machines and coordinate by passing messages, so it appears to users as a single system. |
| DTO | Data Transfer Object — a plain object with no behaviour that defines the shape of data passed between layers or over the network (e.g. an API request or response body), decoupling it from internal domain models. |
| Embedded Software | Software written to run on dedicated hardware with a specific function (e.g. firmware on a microcontroller), as opposed to general-purpose software running on a computer. |
| ephemeral | Short lived or temporary. |
| ERP | Enterprise Resource Planning. Software that integrates core business processes (finance, HR, supply chain, inventory, manufacturing) into a single system. |
| Event Driven Architecture | A design where components communicate by emitting and reacting to events (e.g. "order placed") through a broker or queue instead of calling each other directly, so producers and consumers stay decoupled and asynchronous. |
| Firmware | Low-level software written to a device's non-volatile memory that directly controls its hardware, such as the code running on a microcontroller. |
| Frontend | The client-side part of an application responsible for user interface and interaction. |
| LTS | Long term support. |
| Microcontroller | A small computer on a single chip (CPU, memory, and I/O) built to run one dedicated task, typically the target hardware for embedded software. |
| microservices | Breaking applications into tiny remote services that run independently of each other. |
| Monorepo | A single repository that contains multiple projects, often related, to simplify development and collaboration. |
| Pub/Sub Model | Publisher -> Message Broker (routes topics) -> Subscriber |

## Networking

| Term | Definition |
| :-- | :-- |
| Deep link | A URL that opens a specific page or screen inside a website or app (e.g. a product page or a mobile app view) instead of its home page. |
| Edge Requests | Requests served/handled at edge servers close to users. Benefits are lower latency, faster response, smarter request handling. |
| URI | Uniform Resource Identifier. |
| URL | Uniform Resource Locator. |

## Web Rendering

| Term | Definition |
| --- | --- |
| [CSS](./web-dev/frontend/css.md) | Cascading Style Sheets — the language used to style a document, including colors, fonts, spacing, and layout. |
| CSSOM | CSS Object Model — the browser's representation of stylesheets and their rules, exposed through APIs that JavaScript can read and modify. |
| DOM | Document Object Model — the live tree of nodes representing a document, exposed through APIs that JavaScript can use to read, create, and update its content and structure. |
| HTML | HyperText Markup Language — the markup language that defines a web document's content, structure, and semantics. The browser parses HTML into DOM nodes. |
| [JavaScript](./languages/javascript/javascript.md) | A programming language used in browsers to implement behavior, respond to events, and update the DOM and styles; it also runs outside browsers. |
| Shadow DOM | A browser feature that attaches an encapsulated DOM tree to a host element, commonly used for a Web Component's internal markup and styles. It scopes styles across the boundary but is not a security boundary. |

## Testing

| Test Type | Description | Best Used For |
| --- | --- | --- |
| A/B | Compares two variants of a feature against real users to measure impact. | Making data-driven product decisions. |
| Acceptance (UAT) | Validates the software against business/user requirements, often performed by stakeholders. | Confirming the product meets user needs before sign-off. |
| Accessibility | Checks that the application is usable by people with disabilities (screen readers, keyboard nav, contrast, etc.). | Meeting a11y standards (e.g. WCAG) and ensuring inclusive UX. |
| Canary | Rolls a change out to a small subset of real traffic/users before a full release. | Detecting regressions in production with limited blast radius. |
| Chaos | Deliberately injects failures (e.g. killing services, network partitions) into a system. | Validating resilience and fault tolerance in production-like environments. |
| Contract | Verifies that the interface between two services (e.g. API request/response shape) matches an agreed contract. | Catching breaking changes between independently deployed services. |
| End-to-End (E2E) | Simulates real user workflows through the entire application stack, from UI to backend. | Confirming complete user journeys work as intended. |
| Exploratory | Unscripted, ad hoc testing driven by tester intuition and domain knowledge. | Finding edge cases and usability issues that scripted tests miss. |
| Integration | Verifies that multiple components or services work correctly together (e.g. a service and a database). | Catching issues at the boundaries between modules or systems. |
| Load | Tests system behavior under expected or peak concurrent usage. | Validating performance and stability under normal-to-high traffic. |
| Mutation | Introduces small code changes ("mutants") to check whether the existing test suite catches them. | Measuring the effectiveness/quality of a test suite. |
| Regression | Re-runs existing tests after a change to confirm previously working functionality still works. | Preventing new changes from breaking existing behavior. |
| Sanity | A narrow, focused check that a specific bug fix or new change works as expected, without a full regression pass. | Quickly validating a recent code change or hotfix. |
| Security | Probes for vulnerabilities (injection, auth bypass, data exposure, etc.). | Identifying exploitable weaknesses before attackers do. |
| Smoke | A quick, shallow pass over the most critical functionality to confirm a build isn't fundamentally broken. | Gatekeeping a new build/deploy before investing in deeper testing. |
| Stress | Pushes the system beyond normal capacity to find its breaking point. | Understanding failure modes and capacity limits. |
| System | Tests the fully integrated application as a whole against its overall requirements. | Validating end-to-end functional and non-functional requirements before release. |
| Unit | Verifies a single function, method, or class in isolation, typically with dependencies mocked/stubbed. | Catching logic bugs early, fast feedback during development. |

## Development Approaches

| Term | Definition |
| --- | --- |
| BDD | Behavior-Driven Development. Requirements are written as plain-language Given-When-Then scenarios and automated as tests. See [BDD](./general/bdd.md). |
| CI/CD | Continuous Integration/Continuous Deployment (or Delivery). CI automatically builds and tests every merged change; CD automatically ships passing changes to staging or production. |
| TDD | Test-Driven Development. You write the test first and then the code that makes it pass. |

## Tooling

| Term | Definition |
| :-- | :-- |
| Bundler | A tool that packages multiple files and their dependencies into a single file or set of files for deployment. |
| CPU bound | A condition where the speed of a program is limited by the processor's computation power. |
| cron | Operating system utility used to schedule automation script executions. |
| Elasticsearch | A distributed, open-source search and analytics engine for handling large volumes of data in real time. |
| Hadoop | An open-source framework for distributed storage and processing of large data sets using clusters of computers. |
| IO bound | A condition where the speed of a program is limited by input/output operations like reading files or network requests. |
| Package Manager | A tool that automates the process of installing, upgrading, and managing software dependencies. |
| Prune | Remove unused or unneeded items (dead code, dependencies, stale branches, old data) to cut size and clutter. |
| Redis | An in-memory data structure store used as a database, cache, and message broker for high-performance applications. |
| Runtime | The environment in which a program or script executes, including the necessary tools and resources. |
| tree shaking | A code optimization technique that removes unused code (dead code) from the final bundle during the build process. |

## Platform Engineering

| Term | Definition |
| :-- | :-- |
| API server | The Kubernetes control plane front door. Every client (`kubectl`, the scheduler, kubelets) reads and writes cluster state through its REST API. |
| Argo CD | A GitOps continuous delivery tool for Kubernetes. It watches a Git repo and syncs the cluster to match it, flagging and optionally reverting drift. |
| Container orchestration | Automating how containers are scheduled, scaled, networked and restarted across a cluster of machines. Kubernetes is the dominant implementation. |
| Container runtime | The software on each node that pulls images and starts, stops and manages containers (e.g. containerd, CRI-O). |
| Control plane | The part of a Kubernetes cluster that decides what runs where and keeps it that way. Made of the API server, etcd, scheduler and controller manager, as opposed to the worker nodes that run the workloads. |
| Controller manager | The control plane process that runs controllers, loops that compare actual state to desired state and act to close the gap (e.g. keeping a Deployment at 3 replicas). |
| Deployment | A Kubernetes object that declares how many replicas of a pod to run and handles rolling updates and rollbacks. |
| etcd | A distributed key-value store that holds all Kubernetes cluster state. The API server is its only client. |
| GitOps | Using Git as the single source of truth for infrastructure and app config. Changes are made by pull request and an automated agent (Argo CD, Flux) applies them to the environment. |
| Grafana | A dashboard and alerting UI that queries data sources such as Prometheus (metrics) and Loki (logs) and visualizes them in one place. |
| Helm | The package manager for Kubernetes. A chart bundles templated manifests plus default values, and installing it creates a versioned release you can upgrade or roll back. |
| Helm chart | A Helm package: a directory of templated Kubernetes manifests and a `values.yaml` of defaults that you override per environment. |
| IaC | Infrastructure as Code. Defining servers, networks and clusters in version-controlled files (Terraform, Ansible) so environments are reproducible and reviewable. |
| Ingress | A Kubernetes object that routes external HTTP(S) traffic to services inside the cluster by host or path, implemented by an ingress controller such as NGINX or Traefik. |
| k3s | A lightweight, certified Kubernetes distribution packaged as a single small binary, suited to edge, homelab and CI clusters. |
| KMS | Key Management Service. A system used to securely create, store, and control cryptographic keys used for encryption. |
| Kube Proxy | A node component that maintains network rules so traffic to a Service reaches the right pods, load balancing across them. |
| kubectl | The command-line client for the Kubernetes API, used to apply manifests, inspect resources and read logs. |
| kubelet | The agent on each node that takes pod specs from the API server, has the container runtime run them and reports status back. |
| Kubernetes | Often written K8s. An open-source container orchestrator that runs workloads declaratively: you describe the desired state and controllers keep the cluster matching it. |
| Loki | A log aggregation system from Grafana Labs. It indexes only labels, not full log text, which keeps it cheap, and is queried with LogQL. |
| Managed Kubernetes | A cloud-hosted Kubernetes where the provider runs the control plane: GKE (Google), EKS (AWS) and AKS (Azure). |
| minikube | A tool that runs a single-node Kubernetes cluster on a laptop for local development and learning. |
| Namespace | A Kubernetes scope that groups and isolates resources within one cluster, commonly per team or environment. |
| Node | A worker machine (VM or physical) in a Kubernetes cluster. Runs the kubelet, kube-proxy, a container runtime and the pods. |
| Operator | A Kubernetes controller that encodes operational knowledge for an application, managing it through custom resources (e.g. a database operator handling backups and failover). |
| p95 | 95th percentile: the value that 95% of measurements fall at or below, so only the slowest 5% exceed it. Used for latency, where it shows the slow tail that the average hides. |
| Platform engineering | Building an internal developer platform of self-service tooling and paved paths so product teams can ship and run software without managing the underlying infrastructure. |
| Pod | The smallest deployable Kubernetes unit: one or more containers that share networking and storage and are scheduled together onto one node. |
| Prometheus | An open-source monitoring system that scrapes numeric metrics from services on an interval, stores them as time series and is queried with PromQL. Commonly feeds Grafana and alerts. |
| Rancher | A management platform for running many Kubernetes clusters from one UI and API, adding centralized authentication, RBAC, policy and provisioning across clouds and on-prem. Also the maker of k3s and RKE2. |
| Scheduler | The control plane component that assigns each new pod to a node based on available resources and constraints. |
| Service | A stable network address and load balancer in front of a changing set of pods, so other workloads reach them by name. |
| SLA | Service Level Agreement — a contract between a provider and a customer promising a measurable level of service (e.g. 99.9% uptime), with penalties such as service credits when it is missed. |
| SLI | Service Level Indicator — the actual measured metric an SLO and SLA are judged on, e.g. the percentage of successful requests or requests served under 200 ms. |
| SLO | Service Level Objective — the internal target for an SLI, usually set stricter than the SLA so the team has headroom before the contractual promise is broken. |

## AI and LLMs

| Term | Definition |
| :-- | :-- |
| Agent | An LLM run in a loop that decides which tools to call, reads the results and repeats until the task is done, instead of answering once. |
| Auto mode | An agentic coding tool mode where the agent proceeds without asking for each step: routine, low-risk actions are approved automatically, while risky ones are still blocked or sent for confirmation. |
| Context compaction | Summarizing earlier conversation history into a shorter form when the context window fills, so a long session can continue. |
| Context window | The maximum number of tokens a model can consider at once, covering the system prompt, history, tool results and its own reply. |
| Embedding | A vector of numbers that represents the meaning of text, so similar texts sit close together. Used for semantic search and RAG. |
| Hallucination | A model stating something false or invented with confidence. |
| Harness | The program around a model that supplies its system prompt and tools, runs the agent loop and enforces permissions. Claude Code and Codex are harnesses. |
| Inference | Running a trained model to produce output, as opposed to training it. |
| Max output | The cap on how many tokens a model can generate in a single response, separate from the context window. |
| MCP | Model Context Protocol, an open standard for connecting an AI application to external tools and data through servers that expose them in a uniform way. |
| Ollama | A local runtime that downloads open-weight models, runs them on your own hardware and serves them through an HTTP API, so tools can use them instead of a hosted provider. |
| Open-weight model | A model whose trained weights are published for download, so it can be run locally. Not necessarily open source, since training data and code may be withheld. |
| Prompt caching | Reusing the already-processed start of a repeated prompt to cut cost and latency on later requests. |
| Quantization | Storing model weights at lower numeric precision to shrink memory use and speed up inference, at a small cost in quality. |
| RAG | Retrieval-augmented generation: fetching relevant documents and adding them to the prompt so the model answers from them. |
| Skill | A packaged set of instructions an agent loads when a task matches, instead of keeping them in every prompt. |
| Subagent | A separate agent started by another agent for a subtask, with its own context window, that returns only its result. |
| System Prompt | A predefined instruction that sets the AI’s behavior, tone, and constraints. |
| Temperature | Controls randomness in responses. Higher values are more creative, lower are more deterministic. |
| Token | The unit of text a model reads and writes, roughly a word fragment. Context limits, output limits and billing are counted in tokens. |
| Tool use | A model requesting that the harness run a function, such as a shell command or file read, and then receiving the result. |
| User Prompt | The input provided by the user to request information or an action. |
| Yolo mode | An agentic coding tool mode that disables permission prompts so the agent runs every command and file edit unattended ("you only live once"). Fastest but unsafe; use only in a sandbox or disposable environment. |
