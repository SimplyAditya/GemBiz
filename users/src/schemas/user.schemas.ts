

export const userSchema = `#graphql
    type User {
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
    }
    type Query {
        getUser(id: ID!): User
    }
`