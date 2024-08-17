# Folder Structure

# Script Writing

- Script should start from a main function.
- Consider design for development vs production script (what APIs can the dev environment access?)
- Logging for errors and performance(how long the script takes to run).

```
- main
- README
- consts
  - types
- utils
- logger
  - info/debugging
  - errors
  - performance
- apis
```

## Backend Applications

```
- config
- utils
- middleware/intercepting
- tests
- logging
- assets
- error handling
  - invalid path
```

## Frontend Applications

```
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
```
