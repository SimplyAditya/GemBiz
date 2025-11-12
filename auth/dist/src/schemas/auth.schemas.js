import { gql } from 'graphql-tag';
export const authSchema = gql `
  type Auth {
    id: ID!
    email: String!
    name: String
    phone: String
    role: String
    token: String!
  }

  type ChangePasswordResponse {
    message: String!
    access_token: String!
    refresh_token: String!
  }

  input authInput {
    email: String!
    password: String!
  }

  extend type Query {
    me: User
  }

  extend type User @key(fields: "id") {
    id: ID! @external
  }

  type Mutation {
    validateUser(input: authInput!): Auth,
    changePassword(email: String!, currentPassword: String!, newPassword: String!): ChangePasswordResponse,
  }
`;
//# sourceMappingURL=auth.schemas.js.map