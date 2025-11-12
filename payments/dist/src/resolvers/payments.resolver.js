"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const cashfree_pg_1 = require("cashfree-pg");
const db_js_1 = require("../db.js");
require("dotenv/config");
// Configure Cashfree SDK
const CASHFREE_CLIENT_ID = process.env.CASHFREE_CLIENT_ID || "<x-client-id>";
const CASHFREE_CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET || "<x-client-secret>";
//@ts-ignore
const cashfree = new cashfree_pg_1.Cashfree(cashfree_pg_1.Cashfree.SANDBOX, CASHFREE_CLIENT_ID, CASHFREE_CLIENT_SECRET);
const PRODUCTS_SERVICE_URL = process.env.PRODUCTS_SERVICE_URL || "http://localhost:4003/graphql";
exports.resolvers = {
    Query: {
        getPaymentStatus: async (_, { orderId }) => {
            const { data, error } = await db_js_1.db
                .from("payment_orders")
                .select("*")
                .eq("orderId", orderId)
                .single();
            if (error) {
                console.error("Error fetching payment status:", error);
                throw new Error("Could not fetch payment status");
            }
            return data;
        },
    },
    Mutation: {
        createPaymentOrder: async (_, { productId }, context) => {
            const { user } = context;
            if (!user || !user.id) {
                throw new Error("User is not authenticated");
            }
            const userId = user.id;
            // 1. Fetch product details (amount) from products service
            let productAmount;
            let productCurrency = "INR"; // Default currency
            try {
                const productQuery = `
          query GetProduct($id: ID!) {
            getProduct(id: $id) {
              price
            }
          }
        `;
                const response = await fetch(PRODUCTS_SERVICE_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        query: productQuery,
                        variables: { id: productId },
                    }),
                });
                const productData = await response.json();
                if (productData.errors) {
                    console.error("Error fetching product details:", productData.errors);
                    throw new Error("Could not fetch product details");
                }
                const product = productData.data.getProduct;
                if (!product || !product.price) {
                    throw new Error("Product not found or price not available");
                }
                productAmount = product.price;
                if (product.currency) {
                    productCurrency = product.currency;
                }
            }
            catch (error) {
                console.error("Failed to communicate with products service:", error);
                throw new Error("Failed to fetch product details");
            }
            // 2. Create a unique order ID
            const orderId = `order_${userId}_${productId}_${Date.now()}`;
            // 3. Create a pending order in Supabase
            const { data: newOrder, error: insertError } = await db_js_1.db
                .from("payment_orders")
                .insert({
                orderId,
                productId,
                userId,
                orderAmount: productAmount,
                orderCurrency: productCurrency,
                orderStatus: "PENDING",
                cashfreeSessionId: null, // Will be updated after Cashfree call
            })
                .select()
                .single();
            if (insertError) {
                console.error("Error creating pending order:", insertError);
                throw new Error("Could not create pending order");
            }
            // 4. Create a Cashfree PG order
            const cashfreeRequest = {
                order_id: orderId,
                order_currency: productCurrency,
                order_amount: productAmount,
                customer_details: {
                    customer_id: userId,
                    // TODO: Fetch customer_phone and customer_email from a user service or context
                    customer_phone: "9999999999", // Placeholder
                    customer_email: "customer@example.com", // Placeholder
                },
                order_meta: {
                    return_url: `http://localhost:4000/payments/return?order_id={order_id}&status={order_status}`, // From user's curl example
                },
            };
            try {
                const cashfreeResponse = await cashfree.PGCreateOrder(cashfreeRequest);
                if (cashfreeResponse.data && cashfreeResponse.data.payment_session_id) {
                    const { data: updatedOrder, error: updateError } = await db_js_1.db
                        .from("payment_orders")
                        .update({
                        cashfreeSessionId: cashfreeResponse.data.payment_session_id,
                        orderStatus: "ACTIVE", // Or 'CREATED' based on Cashfree's status
                    })
                        .eq("orderId", orderId)
                        .select()
                        .single();
                    if (updateError) {
                        console.error("Error updating order with Cashfree session ID:", updateError);
                        // Decide whether to throw or just log and return the initial order
                    }
                    return {
                        ...newOrder,
                        cashfreeSessionId: cashfreeResponse.data.payment_session_id,
                        orderStatus: "ACTIVE",
                    };
                }
                else {
                    console.error("Cashfree order creation failed:", cashfreeResponse);
                    throw new Error("Cashfree order creation failed");
                }
            }
            catch (cashfreeError) {
                console.error("Error calling Cashfree API:", cashfreeError.response ? cashfreeError.response.data : cashfreeError.message);
                throw new Error("Failed to create payment gateway order");
            }
        },
        handleCashfreeCallback: async (_, { order_id }) => {
            let verifiedStatus = "EXPIRED"; // Default to EXPIRED
            try {
                // 1. Fetch order details from Cashfree to verify status
                const cashfreeOrderDetails = await cashfree.PGFetchOrder(order_id); // Assuming PGGetOrder exists
                if (cashfreeOrderDetails.data && cashfreeOrderDetails.data.order_status) {
                    const actualCashfreeStatus = cashfreeOrderDetails.data.order_status;
                    // Map Cashfree statuses to internal statuses
                    if (actualCashfreeStatus === "PAID" || actualCashfreeStatus === "SUCCESS") {
                        verifiedStatus = "PAID";
                    }
                    else if (actualCashfreeStatus === "ACTIVE") {
                        verifiedStatus = "PENDING"; // Or a specific FLAGGED status
                    }
                    else {
                        verifiedStatus = "EXPIRED";
                    }
                }
                else {
                    console.error("Could not get order status from Cashfree for orderId:", order_id);
                    throw new Error("Cashfree order verification failed");
                }
            }
            catch (error) {
                console.error("Error verifying order with Cashfree:", error.response ? error.response.data : error.message);
                throw new Error("Failed to verify payment with Cashfree");
            }
            // 2. Update the order status in Supabase
            const { data: updatedOrder, error: updateError } = await db_js_1.db
                .from("payment_orders")
                .update({
                orderStatus: verifiedStatus,
            })
                .eq("orderId", order_id)
                .select()
                .single();
            if (updateError) {
                console.error("Error updating order status in DB:", updateError);
                throw new Error("Could not update payment status in database");
            }
            return updatedOrder;
        },
    },
};
//# sourceMappingURL=payments.resolver.js.map