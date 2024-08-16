# Good Coding Practices

- At the start of a project is the best time to immplement good practices as you will save the most long time time at the expense of some extra upfront time.
- Being agnostic to programming languages and frameworks. Use the best tool for the job depending on team.
- Thinking long term management rather than fast delivery.
- Test Driven Development
  - Useful if you know most of the requirements beforehand otherwise code is subject to change which means written tests are also subject to change.
- ChatGPT
  - Just another tool like Google search engine
  - Raised the entry bar of becoming a software developer since it can perform what most junior engineers can do.

## Good Habits

- Being language and framework agnostic.
- Lightweight solutions over third party solutions to have control over the project and avoiding vendor lock-in.
- Type written languages
  - Upfront time cost to save time later.
  - Helps for code maintenance.

### Personal Habits

- Reading and reviewing any PR whenever you have time like Ryan Chambers.
- Using _up to date syntaxes_. ChatGPT is usually good for refactoring short functions into more modern forms.
- Tests on bug fixes.
- Using a debugger tool over printing lines and running code over and over again.

### Team

- Considerate of development team's familiarity with the technologies.
- Manage expectations and safeguarding time from unnecessary meetings and coding.

## Project Architecture

- Using a folder structure to separate concerns.
- Type annotations, code linter, code formatter.
- Building applications with a shared codebase.
- Using commit hooks to test and deploy code.

## Documentation

- Immediately following up writing new code with updating documentation.
- Using single source of truth of documentation than muliple places that may need to be updated if any code changes. Good place to do this include:
  - the README.md file of a Git repo.
  -

# Folder Structure

## Backend Applications

- config
- utils
- middleware/intercepting
- tests
- logging
- assets
- error handling
  - invalid path

## Frontend Applications

- config
- utils
- middleware/intercepting
- templates
  - layouts
  - pages
  - components
- tests
- assets
- error handling
  - invalid path
