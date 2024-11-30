# Software Conventions

## Casing Styles

| Casing Style             | Example                |
| ------------------------ | ---------------------- |
| **Pascal Case**          | `PascalCase`           |
| **Camel Case**           | `camelCase`            |
| **Snake Case**           | `snake_case`           |
| **Kebab Case**           | `kebab-case`           |
| **Screaming Snake Case** | `SCREAMING_SNAKE_CASE` |
| **Train Case**           | `Train-Case`           |
| **Flat Case**            | `flatcase`             |
| **Title Case**           | `Title Case`           |
| **Sentence Case**        | `Sentence case`        |
| **Dot Case**             | `dot.case`             |

## Naming Conventions

| **Category**          | **Convention**                           | **Example**            |
| --------------------- | ---------------------------------------- | ---------------------- |
| **Classes**           | PascalCase                               | `UserProfile`          |
| **Interfaces**        | PascalCase (prefixed with `I`, optional) | `IUser`                |
| **Enums**             | PascalCase                               | `UserRole`             |
| **Methods**           | camelCase                                | `getUserProfile`       |
| **Variables**         | camelCase                                | `userId`               |
| **Constants**         | UPPER_SNAKE_CASE                         | `MAX_RETRIES`          |
| **Private Variables** | camelCase, prefixed with `_` (optional)  | `_internalCache`       |
| **Static Variables**  | PascalCase                               | `DefaultSettings`      |
| **Modules/Files**     | kebab-case or snake_case                 | `user-profile.js`      |
| **Functions**         | camelCase                                | `fetchData`            |
| **Test Files**        | Append `.test` or `.spec` to file name   | `user-profile.test.js` |
