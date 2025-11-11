import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type PaymentOrder {
    orderId: String!
    cashfreeSessionId: String
    orderStatus: String!
    productId: ID
    userId: ID!
    orderAmount: Float!
    orderCurrency: String!
  }

  type Query {
    getPaymentStatus(orderId: String!): PaymentOrder
  }

  type Mutation {
    createPaymentOrder(productId: ID!): PaymentOrder
    handleCashfreeCallback(order_id: String!): PaymentOrder
  }
`;