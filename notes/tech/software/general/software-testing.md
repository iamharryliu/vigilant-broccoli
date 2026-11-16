# Software Testing

## Table of Contents

- [Test Types](#test-types)
- [Test-Driven Approaches](#test-driven-approaches)
- [Behavior-Driven Development (BDD)](#behavior-driven-development-bdd)
  - [Gherkin Syntax](#gherkin-syntax)
  - [Step Definitions](#step-definitions)

## Test Types

| Type | Scope | Speed and cost | Use when |
| :-- | :-- | :-- | :-- |
| Acceptance (UAT) | The product against business or user requirements | Hours to days; manual or automated | Stakeholder sign-off before release |
| Component | One UI component or service with its dependencies faked | Seconds; cheap | Rendering and behavior of a UI component, or a service API without a real database |
| Contract | The request and response shape between two services | Seconds; cheap | Catching breaking API changes between teams or services |
| End to End (E2E) | The whole system through the UI or public API | Seconds to minutes; slow and flaky | Critical flows such as sign-up, checkout and login |
| Integration | Several components together, such as a service and database | Seconds; needs setup | Boundaries: database access, HTTP clients, message queues |
| Load | System behavior under expected or peak traffic | Minutes to hours; needs a test environment | Finding bottlenecks and capacity limits |
| Regression | The existing suite re-run after a change | Minutes to hours | Confirming a change did not break existing behavior |
| Smoke | A few critical paths on a fresh build or deploy | Minutes; cheap | Gating a deploy before deeper testing |
| Unit | One function or class, dependencies mocked | Milliseconds; cheapest | Pure logic, calculations, validation, branching |

## Test-Driven Approaches

| Approach | Starts from | Written by | Level | Use when |
| :-- | :-- | :-- | :-- | :-- |
| ATDD (Acceptance Test-Driven Development) | An acceptance criterion agreed with the customer | Developers, testers and the customer | E2E or system | Acceptance must be verified against customer requirements |
| BDD (Behavior-Driven Development) | A plain-language Given-When-Then scenario | Developers, testers and product owners | Integration or E2E | Requirements need sign-off from non-developers |
| TDD (Test-Driven Development) | A failing unit test, then make it pass and refactor | Developers | Unit | Logic-heavy code with clear inputs and outputs |

## Behavior-Driven Development (BDD)

In BDD, requirements are written as scenarios in plain language, often using a format like Given-When-Then, which specifies the context, action, and expected outcome. These scenarios serve as a common language to facilitate understanding and are typically automated as tests to guide development and ensure the software meets its intended purpose. Popular tools for BDD include Cucumber, SpecFlow, and Behave.

### Gherkin Syntax

Gherkin syntax is a plain-text language used to define structured, human-readable test scenarios in Behavior-Driven Development (BDD).

| **Keyword** | **Description** |
| --- | --- |
| `Feature` | Describes the functionality or feature under test. |
| `Scenario` | Defines a single test case with specific inputs and expected outcomes. |
| `Given` | Sets up the initial context or preconditions for the test. |
| `When` | Describes an action or event that triggers a behavior. |
| `Then` | Specifies the expected outcome or result after the action. |
| `And` | Combines multiple `Given`, `When`, or `Then` steps for better readability. |

**Example**

```
Feature: User login
  As a user, I want to log into the system so that I can access my dashboard.

  Scenario: Successful login
    Given the user is on the login page
    When the user enters valid credentials
    And clicks the "Login" button
    Then the user should be redirected to the dashboard
    And see a welcome message
```

### Step Definitions

Purpose of Step Definitions:

- Execution Logic: They contain the code that tells the system what to do when a Gherkin step is encountered.
- Mapping Gherkin to Code: They connect the human-readable steps in the Gherkin file to programmatic actions.
- Reusability: Commonly used steps can be defined once and reused across multiple scenarios.

See [Software Lingo](../software-lingo.md) for other test types such as smoke, regression, contract and load testing.
