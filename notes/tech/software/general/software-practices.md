# Software Practices

## Table of Contents

- [Resources](#resources)
- [Personal Habits](#personal-habits)
- [Working in a Team](#working-in-a-team)
- [Architecture](#architecture)
- [Application Building](#application-building)
- [Delivery](#delivery)
  - [Handover](#handover)
- [Software Maintenance](#software-maintenance)
  - [Weekly](#weekly)

## Resources

- [Conventional Commits](./conventional-commits.md)
- [Software Code Quality](./software-code-quality.md)
- [Software Conventions](./software-conventions.md)
- [Folder Structure](./folder-structure.md)

## Personal Habits

- Being agnostic to programming languages and frameworks. Use the best tool for the job depending on team.
- Reading and reviewing any PR whenever you have time like Ryan Chambers.
- Using _up to date syntaxes_. ChatGPT is usually good for refactoring short functions into more modern forms.
- Using a debugger tool over printing lines and running code over and over again.

## Working in a Team

- Considerate of development team's familiarity with the technologies.
- Manage expectations and safeguarding time from unnecessary meetings and coding.

## Architecture

- Establish good practices at the start of a project to save time over its lifetime, even when they require extra upfront work.
- Thinking long term management rather than fast delivery.
- Custom built lightweight solutions over heavy third party solutions to have control over the project and avoiding vendor lock-in.
- Use good **folder structure** patterns to separate concerns.
- **Code Maintenance**
  - Use **language typing** as much as possible.
    - Upfront time cost to save time later.
  - Use **code quality tools** such as type **annotations, linters and formatter**.
- Building applications with a **shared codebase** if there is reusable code across applications.
- **Test Framework**
  - Tests on bug fixes to make sure they do not happen again.
  - Take advantage of test code to be able to **confidently write code**.
- **CICD**

  - Using commit hooks to test and deploy code.

- **Documentation**
  - Immediately writing documentation after implementing new code.
  - Using a **single source of truth** rather than multiple places that may need to be updated if any code changes such as a singular README.md.

## Application Building

- **POC**
  - Interfaces > utils > tests > implementation > scaling

## Delivery

### Handover

- Provide software and documentation.
- Transfer billing.
- Update Permissions.
- Secret rotation.

## Software Maintenance

- Test breakglass
- Secret rotations
- Security tests
- Integration tests

### Weekly

- Review and update dependencies for local code and repositories.
