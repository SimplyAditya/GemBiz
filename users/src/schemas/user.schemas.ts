import { gql } from 'graphql-tag';

export const userSchema = gql`
    type User @key(fields: "id") {
        id: ID!
        email: String!
        name: String
        phone: String
    }

    input userInput {
        email: String!
        password: String!
        name: String!
        phone: String
    }

    type Mutation {
        createUser(input: userInput!): User!
        upgradeToSeller(input: String!): User!
    }
    type Query {
        getUser(id: ID!): User
    }
`
