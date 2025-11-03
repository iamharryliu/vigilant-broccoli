# GraphQL Demo

A demo GraphQL server built with Apollo Server, featuring queries and mutations for managing parents, children, and dogs.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Getting Started

### Installation

Install the project dependencies:

```bash
npm install
```

### Running the Server

Start the development server with hot reload:

```bash
npm run serve
```

The server will start at `http://localhost:4000`

### Accessing the GraphQL Playground

Once the server is running, open your browser and navigate to:

```
http://localhost:4000
```

You'll see the Apollo Server GraphQL playground where you can explore the schema and execute queries/mutations.

## Available Scripts

- `npm run serve` - Starts the development server with nodemon for hot reloading

## Example Queries

Try these queries in the GraphQL playground:

```graphql
# Get all parents
query {
  parents {
    id
    name
  }
}

# Get all dogs
query {
  dogs {
    id
    name
    handlers {
      id
      name
    }
  }
}

# Add a new parent
mutation {
  addParent(parent: { name: "John Doe" }) {
    id
    name
  }
}
```

## References

- [Apollo Server Getting Started](https://www.apollographql.com/docs/apollo-server/getting-started/)
- [GraphQL Tutorial](https://www.youtube.com/playlist?list=PL4cUxeGkcC9gUxtblNUahcsg0WLxmrK_y)
