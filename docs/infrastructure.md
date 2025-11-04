# Infrastructure

```mermaid
graph TD

  %% Define nodes
  A[Cloud8Skate] <--> B[CMS]
  C[Personal Website] --> D[RabbitMQ Queue]
  A --> D
  D --> E[Email Consumer]

  %% Styling
  style A fill:#3b82f6,stroke:#1e3a8a,stroke-width:2px,color:white
  style B fill:#8b5cf6,stroke:#5b21b6,stroke-width:2px,color:white
  style C fill:#10b981,stroke:#065f46,stroke-width:2px,color:white
  style D fill:#f59e0b,stroke:#b45309,stroke-width:2px,color:white
  style E fill:#ef4444,stroke:#7f1d1d,stroke-width:2px,color:white

  %% Labels
  classDef label font-weight:bold,font-size:14px
```

## RabbitMQ Email Consumer Architecture

```mermaid
graph LR
  A[Email Request] -->|Publishes message| B[(RabbitMQ Queue)]
  B -->|Delivers message| C[Email Consumer]
  C -->|Sends Email| D[SMTP Server / Email Service]
```
