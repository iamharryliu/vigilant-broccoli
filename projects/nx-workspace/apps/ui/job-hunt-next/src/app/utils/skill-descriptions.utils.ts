// One line per SKILL_VOCABULARY term for the Skills glossary; a term missing
// here shows an empty description.
export const SKILL_DESCRIPTIONS: Record<string, string> = {
  Agile:
    'Iterative way of delivering software in short cycles with frequent feedback, usually through Scrum or Kanban.',
  'Agentic coding':
    'Delegating multi-step programming work to AI agents that read the codebase, edit files, run tests and iterate, with the developer steering and reviewing.',
  'AI Agents':
    'LLM-driven programs that plan, call tools and act over several steps toward a goal.',
  'AI-assisted development':
    'Writing and reviewing code with AI coding tools such as Copilot, Cursor or Claude Code.',
  Angular:
    "Google's TypeScript framework for large single-page web apps, with built-in routing, forms and dependency injection.",
  Authentication:
    'Proving who a user or service is, through sessions, OAuth, OIDC, SSO or API keys.',
  AWS: "Amazon's cloud platform: compute, storage, databases, networking and managed services.",
  Azure: "Microsoft's cloud platform, closely tied to Microsoft 365 and .NET.",
  Bash: 'Unix shell and scripting language for automating tasks and gluing command-line tools.',
  Bundlers:
    'Tools such as Webpack and Vite that combine and optimize frontend source into files browsers load.',
  C: 'Low-level systems language with manual memory management, used for operating systems, drivers and embedded firmware.',
  'C#': "Microsoft's object-oriented language for the .NET platform: web backends, desktop apps and games.",
  'C++':
    'Systems language with classes and templates, used where performance matters: games, embedded, trading and graphics.',
  'CI/CD':
    'Automation that builds, tests and ships every change, through tools such as GitHub Actions, Jenkins and Argo CD.',
  Cloudflare:
    'Edge network and platform for DNS, CDN, DDoS protection, Workers, Pages and R2 storage.',
  Claude:
    "Anthropic's family of LLMs, used through its API and Claude Code for text generation, tool use and agents.",
  'Computer vision':
    'Software that interprets images and video: detection, recognition, tracking and 3D reconstruction.',
  'Data formats': 'Structured ways to exchange data, such as JSON and XML.',
  'Data pipelines':
    'Automated flows that move data from sources through processing steps into a store or service.',
  Databricks:
    'Cloud data platform built on Apache Spark for large-scale analytics, data engineering and ML.',
  DevOps:
    'Practices and tooling that join development and operations so software ships and runs reliably.',
  'Distributed systems':
    'Software spread over several machines that must cope with network failures, consistency and scaling.',
  Django:
    'Batteries-included Python web framework with an ORM, admin and authentication.',
  Docker:
    'Packages an app and its dependencies into containers that run the same on any machine.',
  DynamoDB:
    "AWS's managed key-value and document database, built for predictable low-latency scale.",
  'Dynamics 365 & Power Platform':
    "Microsoft's business apps (ERP and CRM) plus its low-code Power Apps, Power Automate and Dataverse.",
  Elasticsearch:
    'Distributed search and analytics engine for full-text search, logs and aggregations.',
  Elixir:
    'Functional language on the Erlang VM, suited to highly concurrent, fault-tolerant services.',
  'End-to-end testing':
    'Tests that drive the whole app the way a user would, with tools such as Playwright or Cypress.',
  ETL: 'Extract, transform, load: pulling data from sources, reshaping it and loading it into a warehouse.',
  'Event-driven architecture':
    'Services that communicate by publishing and reacting to events rather than calling each other directly.',
  FastAPI:
    'Python web framework for typed, async APIs with automatic OpenAPI docs.',
  Figma:
    'Collaborative design tool for interfaces and prototypes, and the usual hand-off point between design and frontend.',
  Flask:
    'Minimal Python web framework that leaves structure and extensions up to you.',
  GCP: "Google's cloud platform: compute, storage, BigQuery and Kubernetes.",
  Golang:
    "Google's compiled, statically typed language with built-in concurrency, common in cloud and infrastructure tools.",
  Gradle:
    'Build automation for JVM and Android projects, also read as Maven in postings.',
  'Graph databases':
    'Databases that store data as nodes and relationships and query it with languages such as Cypher, including Neo4j.',
  GraphQL:
    'API query language where clients ask for exactly the fields they need from one endpoint.',
  gRPC: "Google's high-performance RPC framework using Protocol Buffers over HTTP/2.",
  'HashiCorp Vault':
    'Secrets manager for storing, rotating and issuing credentials and encryption keys.',
  'Headless CMS':
    'Content management system that stores content and serves it over an API, such as Contentful, Strapi or Sanity, leaving the frontend to the developer.',
  'HTML and CSS':
    'The markup and styling languages every web page is built from.',
  'Industrial automation':
    'Controlling machinery and processes with PLCs, SCADA and industrial protocols.',
  'Infrastructure as Code':
    'Defining servers, networks and cloud resources in versioned files with tools such as Terraform, Pulumi, Ansible, AWS CDK and CloudFormation.',
  'Integration platforms':
    'Products that connect business systems through prebuilt connectors and workflows, such as MuleSoft or Zapier.',
  Java: 'Mature object-oriented language on the JVM, widely used for enterprise backends and Android.',
  JavaScript:
    'The language of the web, running in browsers and on servers through Node.js.',
  Kotlin:
    'Concise JVM language, the preferred language for Android and increasingly used for backends.',
  Kubernetes:
    'Orchestrates containers across a cluster: scheduling, scaling, networking and self-healing.',
  LangChain:
    'Framework for building LLM apps by chaining prompts, models, tools and retrieval.',
  LangGraph:
    'LangChain library for building stateful, multi-step agents as graphs of nodes with loops and branches.',
  Linux:
    'The open-source operating system behind most servers, containers and cloud machines.',
  LLM: 'Large language model, such as Claude or GPT, that generates and understands text; also called generative AI.',
  'Machine Learning':
    'Training models on data to predict or classify rather than programming the rules by hand.',
  MATLAB:
    'Numerical computing environment and language for engineering, signal processing and simulation, paired with Simulink.',
  'Message queues':
    'Brokers such as RabbitMQ, Kafka and SQS that pass messages between services asynchronously.',
  Microservices:
    'Splitting an application into small independently deployed services that each own one capability.',
  'Microsoft 365':
    "Microsoft's productivity suite: Outlook, Teams, SharePoint, OneDrive and the Graph API behind them.",
  'Mobile development':
    'Building iOS and Android apps, natively or with cross-platform tools such as Flutter.',
  Modbus:
    'Simple master-slave protocol for reading and writing registers on industrial devices over serial or TCP.',
  'Model Context Protocol':
    'Open standard (MCP) for connecting AI assistants to tools and data sources through servers.',
  MongoDB: 'Document database that stores flexible JSON-like records.',
  'Multi-tenancy':
    'One deployment serving many customers while keeping their data and settings isolated.',
  Networking:
    'How machines communicate: TCP/IP, DNS, Wi-Fi, Bluetooth and Ethernet.',
  NetSuite:
    "Oracle's cloud ERP suite for finance, inventory, orders and CRM, customized with SuiteScript, SuiteFlow and SuiteTalk.",
  'Node.js':
    'JavaScript runtime for running servers and tooling outside the browser.',
  NoSQL:
    'Databases that store data as documents, key-value pairs or wide columns instead of relational tables.',
  Nx: 'Monorepo build system that caches tasks and runs only what a change affects.',
  'Object-Oriented Programming':
    'Organizing code into objects that bundle data and behavior, with inheritance and polymorphism.',
  OpenAI:
    'AI company behind the GPT models and ChatGPT, used through its API for text generation, embeddings and agents.',
  'Platform engineering':
    'Building internal developer platforms and paved paths so product teams can ship and run services themselves.',
  Observability:
    'Understanding a running system from its logs, metrics and traces.',
  PHP: 'Server-side scripting language behind WordPress, Laravel and much of the web.',
  'Power BI':
    "Microsoft's business intelligence tool for dashboards and reports.",
  PowerShell:
    "Microsoft's object-based shell and scripting language for Windows and cross-platform automation.",
  'Prompt engineering':
    'Designing and iterating the instructions, examples and context given to an LLM so it produces reliable output.',
  Python:
    'General-purpose language popular for backends, scripting, data science and machine learning.',
  PyTorch:
    "Meta's deep-learning framework for building and training neural networks, favored in research.",
  Profinet:
    'Industrial Ethernet standard for real-time communication between PLCs and field devices.',
  RAG: 'Retrieval-augmented generation: fetching relevant documents and giving them to an LLM so its answers are grounded in them.',
  React:
    'Component-based UI library for the web, including Next.js and Redux ecosystems.',
  'React Native': 'Builds iOS and Android apps from React and JavaScript.',
  Redis:
    'In-memory data store used for caching, sessions, queues and rate limiting.',
  'REST API design':
    'Designing HTTP APIs around resources, verbs and status codes.',
  Ruby: 'Expressive scripting language, best known for the Rails web framework.',
  RTOS: 'Real-time operating systems such as FreeRTOS and Zephyr that guarantee tasks run within fixed deadlines on microcontrollers.',
  Rust: 'Systems language that guarantees memory safety without a garbage collector.',
  Salesforce:
    'Leading cloud CRM platform, extended with Apex code and Lightning components.',
  Scala:
    'JVM language mixing object-oriented and functional styles, common in data engineering with Spark.',
  Serverless:
    'Running code on managed platforms such as AWS Lambda that scale automatically and bill per use.',
  'Site Reliability Engineering':
    'Applying software engineering to operations: SLIs and SLOs, error budgets, incident response and automation.',
  Spring: 'Dominant Java framework for backends, including Spring Boot.',
  SQL: 'Language for querying relational databases such as PostgreSQL, MySQL and SQL Server.',
  Svelte:
    'Frontend framework that compiles components to small, fast JavaScript at build time.',
  Swift: "Apple's language for iOS, macOS and other Apple platforms.",
  TensorFlow:
    "Google's machine-learning framework for building and deploying models, with Keras as its high-level API.",
  TypeScript:
    'JavaScript with static types, which catches many errors before the code runs.',
  'Unit testing':
    'Small, fast tests of individual functions and classes in isolation.',
  Unity:
    'Game engine and editor for 2D, 3D, mobile and XR games, scripted in C#.',
  'Unreal Engine':
    "Epic's high-fidelity game engine, scripted in C++ and Blueprints.",
  'Vector databases':
    'Stores that index embeddings for similarity search, used behind RAG and semantic search.',
  'Version control':
    'Tracking changes to code over time, almost always with Git.',
  Vue: 'Approachable progressive JavaScript framework for building user interfaces.',
  WebSockets:
    'Persistent two-way connections between browser and server for real-time features.',
  WordPress:
    'PHP-based content management system that runs a large share of the web, extended with themes and plugins.',
};
