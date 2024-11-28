# Behavior-Driven Development (BDD)

In BDD, requirements are written as scenarios in plain language, often using a format like Given-When-Then, which specifies the context, action, and expected outcome. These scenarios serve as a common language to facilitate understanding and are typically automated as tests to guide development and ensure the software meets its intended purpose. Popular tools for BDD include Cucumber, SpecFlow, and Behave.

## Gherkin Syntax

Gherkin syntax is a plain-text language used to define structured, human-readable test scenarios in Behavior-Driven Development (BDD).

| **Keyword** | **Description**                                                            |
| ----------- | -------------------------------------------------------------------------- |
| `Feature`   | Describes the functionality or feature under test.                         |
| `Scenario`  | Defines a single test case with specific inputs and expected outcomes.     |
| `Given`     | Sets up the initial context or preconditions for the test.                 |
| `When`      | Describes an action or event that triggers a behavior.                     |
| `Then`      | Specifies the expected outcome or result after the action.                 |
| `And`       | Combines multiple `Given`, `When`, or `Then` steps for better readability. |

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

## Step Definitions

Purpose of Step Definitions:

- Execution Logic: They contain the code that tells the system what to do when a Gherkin step is encountered.
- Mapping Gherkin to Code: They connect the human-readable steps in the Gherkin file to programmatic actions.
- Reusability: Commonly used steps can be defined once and reused across multiple scenarios.
