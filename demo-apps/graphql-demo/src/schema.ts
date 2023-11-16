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
