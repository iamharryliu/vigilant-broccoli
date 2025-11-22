# Javascript Nuances

## Typescript Nuances

- **Types vs Interfaces**
  - Interfaces can be merged.
  - Interfaces compile faster.
- CJS vs ESM
  - CJS(CommonJS) - Node.js old style
  - ESM (ECMAScript Modules) - modern JavaScript everywhere.
- **??(nullish coalescing) vs ||(logical OR)**

| Expression                                | Output (`\|\|`) | Output (`??`) |
| ----------------------------------------- | --------------- | ------------- |
| `console.log(12 \|\| "not found")`        | 12              | 12            |
| `console.log(0 \|\| "not found")`         | "not found"     | 0             |
| `console.log("jane" \|\| "not found")`    | "jane"          | "jane"        |
| `console.log("" \|\| "not found")`        | "not found"     | ""            |
| `console.log(true \|\| "not found")`      | true            | true          |
| `console.log(false \|\| "not found")`     | "not found"     | false         |
| `console.log(undefined \|\| "not found")` | "not found"     | "not found"   |
| `console.log(null \|\| "not found")`      | "not found"     | "not found"   |
