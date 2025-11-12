import { gql } from "graphql-tag";
export const cartSchema = gql `
  type Cart @key(fields: "id") {
    id: ID!
    user: User
    userId: ID!
    items: [CartItem!]
  }

  type CartItem {
    id: ID!
    cart: Cart
    cartId: ID!
    product: Product!
    productId: ID!
    quantity: Int!
  }

  extend type User @key(fields: "id") {
    id: ID! @external
    cart: Cart
  }

  extend type Product @key(fields: "id") {
    id: ID! @external
  }

  input CartItemInput {
    productId: ID!
    quantity: Int!
  }

  type Query {
    getCart: Cart
  }

  type Mutation {
    addItemToCart(item: CartItemInput!): Cart
    updateCartItem(productId: ID!, quantity: Int!): Cart
    removeCartItem(productId: ID!): Cart
    clearCart: Cart
  }
`;
//# sourceMappingURL=cart.schemas.js.map