"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeDefs = void 0;
const graphql_tag_1 = require("graphql-tag");
exports.typeDefs = (0, graphql_tag_1.gql) `
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
//# sourceMappingURL=payments.schemas.js.map