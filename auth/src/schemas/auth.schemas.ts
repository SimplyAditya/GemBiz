import gql from "graphql-tag";

export const authSchema = gql`
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

  type Mutation {
    validateUser(input: authInput!): Auth,
    changePassword(email: String!, currentPassword: String!, newPassword: String!): ChangePasswordResponse,
  }
`;
