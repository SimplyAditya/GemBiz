import gql from "graphql-tag";

export const authSchema = gql`
  type Auth {
    id: ID!
    email: String!
    password: String!
  }

  input authInput {
    email: String!
    password: String!
  }

  type Mutation {
    validateUser(input: authInput!): Auth
  }
  type Query {
    getAuth(id: ID!): Auth
  }
`;
