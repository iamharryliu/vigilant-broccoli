export const typeDefs = `#graphql
type Parent{
    id: ID!,
    name: String!
    childs: [Child!]
}
type Child{
    id: ID!,
    name: String!
    dogs: [Dog!]
}
type Dog{
    id: ID!,
    name: String!
    handlers: [Child!]
}
type Query {
    parents: [Parent],
    parent(id: ID!): Parent
    child: [Child],
    childs(id: ID!): Child
    dogs: [Dog],
    dog(id: ID!): Dog
}
type Mutation {
    addParent(parent: AddParentInput!):Parent
    deleteParent(id:ID!): [Parent]
    updateParent(id:ID!, edits:UpdateParentInput!): Parent
}
input AddParentInput{
    name:String!
}
input UpdateParentInput{
    name:String
}
`;
