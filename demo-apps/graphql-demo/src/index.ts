import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

// TODO: move to db.ts
let somethings = [
  { id: '1', name: 'name1' },
  { id: '2', name: 'name2' },
  { id: '3', name: 'name3' },
  { id: '4', name: 'name4' },
  { id: '5', name: 'name5' },
  { id: '6', name: 'name6' },
  { id: '7', name: 'name7' },
];
let db = {
  somethings: somethings,
};

// TODO: move to schema.ts
export const typeDefs = `#graphql
type Something{
    id: ID!,
    name: String!
}
type Query {
    somethings: [Something],
    something(id: ID!): Something
}
`;

const PORT = 4000;

const resolvers = {
  Query: {
    somethings() {
      return db.somethings;
    },
    something(_, args) {
      return db.somethings.find(review => review.id == args.id);
    },
  },
};
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: PORT },
});

console.log(`Serverver ready at ${url}`);
