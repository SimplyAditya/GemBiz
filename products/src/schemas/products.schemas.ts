import { gql } from "graphql-tag";

export const productSchema = gql`
  type Product @key(fields: "id") {
    id: ID!
    name: String
    description: String!
    price: Float!
    seller: User
  }

  extend type User @key(fields: "id") {
    id: ID! @external
    products: [Product]
  }

  input ProductInput {
    name: String!
    description: String!
    price: Float!
  }

  input UpdateProductInput {
    name: String
    description: String
    price: Float
  }

  type Query {
    getProduct(id: ID!): Product
    getProducts: [Product]
  }

  type Mutation {
    createProduct(input: ProductInput!): Product
    updateProduct(id: ID!, input: UpdateProductInput!): Product
    deleteProduct(id: ID!): Product
  }
`;
