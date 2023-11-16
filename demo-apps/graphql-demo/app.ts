import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './src/schema';
import { db } from './src/db';

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

async function runServer() {
  const { url } = await startStandaloneServer(server, {
    listen: { port: PORT },
  });
  console.log(`Serverver ready at ${url}`);
}

runServer();
