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
    razorpayKeyId: String
  }

  type Query {
    getPaymentStatus(orderId: String!): PaymentOrder
  }

  type Mutation {
    createPaymentOrder(productId: ID!): PaymentOrder
    handleCashfreeCallback(order_id: String!): PaymentOrder
    handleRazorpayCallback(
      razorpay_order_id: String!
      razorpay_payment_id: String!
      razorpay_signature: String!
    ): PaymentOrder
  }
`;
