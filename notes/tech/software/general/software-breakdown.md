# Software Breakdown

```mermaid
flowchart TB

subgraph APPLICATION_LAYER[Application Layer]
  CODE[Code]
  DATA_STRUCTURES[Data Structures]
  LIBRARIES[Libraries]
  FRAMEWORKS[Frameworks]
  RUNTIME[Runtime Environment]
  APP_CONTAINER[App Container]
end

subgraph INFRASTRUCTURE_LAYER[Infrastructure Layer]
  APP_CONTAINERS[App Containers]
  EXTERNAL_SERVICES[Provisioned Services<br/>Databases, Queues, Cache]
  INFRASTRUCTURE[Infrastructure<br/>Compute, Network, Storage]
end
SOFTWARE_SOLUTION[Software Solution]

CODE --> |Typescript|DATA_STRUCTURES
DATA_STRUCTURES --> |Arrays, Hashmaps, etc..| LIBRARIES
LIBRARIES -->|npm Library| FRAMEWORKS
FRAMEWORKS -->|React, Express| RUNTIME
RUNTIME -->|Node.js| APP_CONTAINER
APP_CONTAINER --> |Docker Image| APP_CONTAINERS
  -->  INFRASTRUCTURE
EXTERNAL_SERVICES --> INFRASTRUCTURE
INFRASTRUCTURE --> |Terraform + CI|SOFTWARE_SOLUTION
```

CI Options
Jobs
Serverless functions
Serverless containers
VMs
K8s Cluster

Implementation
Scaling
Security
Alternatives

# Good Design

- Dynamic
- Agnostic
- Stateless
- Avoiding silent fail
- Performance and optimization.

# Refactor

- Resources
  - Secret Manager
  - Bootstrapping
- Environments
- CICD Pipeline
- Network Security
- Project Management
- Architecture
- **Web Development**
  - Database
    - Schema
    - SQL
      - One to Many
      - Many to Many
    - NoSQL
    - Backing up
  - Devops
    - Deployment
      - Manual Deployment
      - Automated Deployment
    - IaC
    - CICD
    - Automation Scripting
    - Containerization
    - Cloud
    - Networking
  - Version Control
    - Branching
    - Code Review Process
  - User Authentication System
  - Content Management System (CMS)
    - Headless vs Traditional CMS
  - Analytics
    - User Behavior Tracking
  - Security
    - Authentication Handling
    - Data Encryption
  - Code Maintenance
    - Type Annotation
    - Testing
      - Unit Testing
      - End to End (E2E)
      - Integration Testing
      - Performance Testing
      - Security Testing
  - Content Management
    - SEO
- **Application Monitoring**
  - Distributed Tracing: Understanding the flow of requests across microservices.
  - Performance Monitoring: Monitoring application performance through metrics.
  - Logging: Contextualizing trace and metric data with relevant logs.
- **Error Handling**
- **Software**
  - Stateless
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
  - IaC
  - Personal dashboards
  - Monorepo
  - Library/OSS support
  - Setup scripts
  - Intellectual Property
  - What is strong documentation?
    - You are easily able to redeploy assets again.
    - Common commands
    - Setup commands
    - References
    - Useful links: Management settings, API docs, billing, etc
  - Caveats
    - Scaling
      - Large automations susceptible to injection
      - As interfaces grow there are more attack surfaces
    - Security
      - Can add friction to development.

## Frontend Design

```mermaid
flowchart TD

subgraph HTML_PAGE[HTML Page]
  HTML
  CSS
  JS
end

BUILD_CHOICES[Build Choices]

subgraph UI_FRAMEWORK[UI Framework]
  direction TB
  COMPONENT_RENDERING[Component Rendering]
  subgraph ROUTE_HANDLING[Route Handling]
    INDEX_ROUTE["/"]
    LIST_ROUTE["/list"]
    ITEM_ROUTE["/list/:id"]
    PROTECTED_ROUTES[Protected Routes]
    INVALID_ROUTE[Invalid Routes]
    PROTECTED_ROUTES[Error Handling]
  end
end

subgraph UI_LIBRARY[UI Library]
  subgraph HTML_PAGE_COMPONENTS[Page Components]
  end
end

subgraph ENHANCEMENTS[Enhancements]
  direction TB
  subgraph UX[UX]
    ACCESSIBILITY[Accessibility - A11y]
    INTERNATIONALIZATION[Internationalization- i18n]
  end
  subgraph ERROR_HANDLING[Error Handling]
    direction TB
    subgraph EVENT_HANDLING[Event Handling]
      BUTTON_CLICK_RESPONSE[Button Click Response]
      INPUT_CHANGE[Input Change]
      LOADING_STATES[Loading State]
    end

    subgraph ERROR_DISPLAY_TYPES[Error Display Types]
      FORM_VALIDATION[Form Validation]
      ERROR_PAGE[Error Page]
      ERROR_MODAL[Error Modal]
      ERROR_BANNER[Error Banner]
      ERROR_NOTIFICATIONS[Toasts/Notifications/Snackbar]
      ERROR_TOOLTIP[Tooltip]
      ERROR_ANIMATIONS[Animations]
    end
  end

  subgraph STYLING[Styling]
    TYPOGRAPHY[Typography]
    SPACING[Spacing]
  end

  subgraph AUTHENTICATION[Authentication]
    direction TB
    subgraph COOKIES[Cookies]
      JWT[jwt]
      SESSION_ID[Session ID]
      OAUTH[OAuth]
    end
  end
end

subgraph REQUESTS[Requests]
  REQUEST_ERROR_HANDLING[Error Handling]
end

subgraph ASYNCHRONOUS_HANDLING[Asynchronous Handling]
  EVENT_LISTENER[Event Listener]
  SUBSCRIPTIONS[Subscriptions]
  TIMERS[Timers]
end

subgraph STATE_MANAGEMENT[State Management]
  direction TB
  subgraph APP_STATE_MANAGEMENT[App State Management]
    GLOBAL_APP_STATE[Global App State]
    COMPONENT_STATE[Component State]
  end
  subgraph BROWSER_STORAGE[Browser Storage]
    LOCAL_STORAGE[Local Storage]
    SESSION_STORAGE[Session Storage]
  end
end

HTML_PAGE --> BUILD_CHOICES
BUILD_CHOICES --> UI_LIBRARY
BUILD_CHOICES --> UI_FRAMEWORK
BUILD_CHOICES --> ENHANCEMENTS

UI_FRAMEWORK --> UI_LIBRARY
REQUESTS --> ASYNCHRONOUS_HANDLING

EVENT_HANDLING --> ERROR_DISPLAY_TYPES

JS --> REQUESTS
JS --> STATE_MANAGEMENT
```

## Backend

```mermaid
flowchart TD

subgraph REST_API[REST API]
  direction TB
  subgraph REQUEST_TYPES[Request Types]
    GET
    POST
    PUT
    DELETE
  end
  subgraph PARAMETERS[Parameters]
    PATH_PARAMETERS[Path Parameters]
    QUERY_PARAMETERS[Query Parameters]
    HEADER_PARAMETERS[Header Parameters]
    BODY_PARAMETERS[Body Parameters]
    FORM_DATA[Form Data]
    COOKIES[Cookies]
  end
end

REQUEST_TYPES --> PARAMETERS
```
