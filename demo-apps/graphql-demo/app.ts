import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './src/schema';
import { db } from './src/db';

const PORT = 4000;

const resolvers = {
  Query: {
    parents() {
      return db.parents;
    },
    parent(_, args) {
      return db.parents.find(parent => parent.id == args.id);
    },
    childs() {
      return db.childs;
    },
    child(_, args) {
      return db.childs.find(child => child.id == args.id);
    },
    dogs() {
      return db.dogs;
    },
    dog(_, args) {
      return db.dogs.find(dog => dog.id == args.id);
    },
  },
  Dog: {
    handlers(parent) {
      return db.childs.filter(
        childSomethings => childSomethings.dog_id === parent.id,
      );
    },
  },
  Mutation: {
    deleteParent(_, args) {
      db.parents = db.parents.filter(data => data.id !== args.id);
      return db.parents;
    },
    addParent(_, args) {
      let parent = {
        ...args.parent,
        id: Math.floor(Math.random() * 10000).toString(),
      };
      db.parents.push(parent);
      return parent;
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
