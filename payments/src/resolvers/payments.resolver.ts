import { Cashfree } from "cashfree-pg";
import Razorpay from "razorpay";
import crypto from "crypto";
import { db } from "../db.js";
import "dotenv/config";

// Payment Gateway Toggle - Fetched from database
// Helper function to get payment gateway configuration
const getPaymentConfig = async () => {
  const { data, error } = await db
    .from("payment")
    .select("isCashfreeEnabled")
    .single();
  
  if (error) {
    console.error("Error fetching payment config:", error);
    // Default to false (Razorpay) if config fetch fails
    return { isCashfreeEnabled: false };
  }
  
  return data;
};

// Configure Cashfree SDK
const CASHFREE_CLIENT_ID = process.env.CASHFREE_CLIENT_ID || "<x-client-id>";
const CASHFREE_CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET || "<x-client-secret>";
//@ts-ignore
const cashfree = new Cashfree(Cashfree.SANDBOX, CASHFREE_CLIENT_ID, CASHFREE_CLIENT_SECRET);

// Configure Razorpay SDK
const RAZORPAY_KEY_ID = process.env.RAZORPAY_TEST_API_KEY || "<razorpay-test-api-key>";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_TEST_SECRET || "<razorpay-test-secret>";
const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

const PRODUCTS_SERVICE_URL = process.env.PRODUCTS_SERVICE_URL || "http://localhost:4003/graphql";

export const resolvers = {
  Query: {
    getPaymentStatus: async (_: any, { orderId }: { orderId: string }) => {
      const { data, error } = await db
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
    createPaymentOrder: async (
      _: any,
      { productId }: { productId: string },
      context: any
    ) => {
      const { user } = context;
      if (!user || !user.id) {
        throw new Error("User is not authenticated");
      }
      const userId = user.id;

      // 1. Fetch product details (amount) from products service
      let productAmount: number;
      let productCurrency: string = "INR"; // Default currency

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
      } catch (error) {
        console.error("Failed to communicate with products service:", error);
        throw new Error("Failed to fetch product details");
      }

      // 2. Create a unique order ID (keep it short for Razorpay's 40 char receipt limit)
      const timestamp = Date.now().toString(36); // Convert to base36 for shorter string
      const orderId = `ord_${userId.substring(0, 8)}_${productId.substring(0, 8)}_${timestamp}`;

      // 3. Create a pending order in Supabase
      const { data: newOrder, error: insertError } = await db
        .from("payment_orders")
        .insert({
          orderId,
          productId,
          userId,
          orderAmount: productAmount,
          orderCurrency: productCurrency,
          orderStatus: "PENDING",
          cashfreeSessionId: null, // Will be used for payment gateway session ID
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error creating pending order:", insertError);
        throw new Error("Could not create pending order");
      }

      // 4. Fetch payment gateway configuration from database
      const paymentConfig = await getPaymentConfig();
      const isCashfreeEnabled = paymentConfig.isCashfreeEnabled;

      // 5. Create payment gateway order based on toggle
      if (isCashfreeEnabled) {
        // ============ CASHFREE FLOW ============
        const cashfreeRequest = {
          order_id: orderId,
          order_currency: productCurrency,
          order_amount: productAmount,
          customer_details: {
            customer_id: userId,
            customer_phone: "9999999999", // Placeholder
            customer_email: "customer@example.com", // Placeholder
          },
          order_meta: {
            return_url: `http://localhost:4000/payments/return?order_id={order_id}&status={order_status}`,
          },
        };

        try {
          const cashfreeResponse = await cashfree.PGCreateOrder(cashfreeRequest);

          if (cashfreeResponse.data && cashfreeResponse.data.payment_session_id) {
            const { data: updatedOrder, error: updateError } = await db
              .from("payment_orders")
              .update({
                cashfreeSessionId: cashfreeResponse.data.payment_session_id,
                orderStatus: "ACTIVE",
              })
              .eq("orderId", orderId)
              .select()
              .single();

            if (updateError) {
              console.error("Error updating order with Cashfree session ID:", updateError);
            }

            return {
              ...newOrder,
              cashfreeSessionId: cashfreeResponse.data.payment_session_id,
              orderStatus: "ACTIVE",
            };
          } else {
            console.error("Cashfree order creation failed:", cashfreeResponse);
            throw new Error("Cashfree order creation failed");
          }
        } catch (cashfreeError: any) {
          console.error(
            "Error calling Cashfree API:",
            cashfreeError.response ? cashfreeError.response.data : cashfreeError.message
          );
          throw new Error("Failed to create Cashfree payment order");
        }
      } else {
        // ============ RAZORPAY FLOW ============
        try {
          // Create a shorter receipt ID for Razorpay (max 40 chars)
          const receiptId = `rcp_${timestamp}`;
          
          const razorpayOptions = {
            amount: Math.round(productAmount * 100), // Razorpay expects amount in paise (smallest currency unit)
            currency: productCurrency,
            receipt: receiptId, // Use shorter receipt ID
            notes: {
              productId: productId,
              userId: userId,
              internalOrderId: orderId, // Store full orderId in notes for reference
            },
          };

          const razorpayOrder = await razorpay.orders.create(razorpayOptions);

          if (razorpayOrder && razorpayOrder.id) {
            const { data: updatedOrder, error: updateError } = await db
              .from("payment_orders")
              .update({
                cashfreeSessionId: razorpayOrder.id, // Storing Razorpay order ID in this field
                orderStatus: "ACTIVE",
              })
              .eq("orderId", orderId)
              .select()
              .single();

            if (updateError) {
              console.error("Error updating order with Razorpay order ID:", updateError);
            }

            return {
              ...newOrder,
              cashfreeSessionId: razorpayOrder.id, // Frontend will use this as razorpay_order_id
              orderStatus: "ACTIVE",
              razorpayKeyId: RAZORPAY_KEY_ID, // Send key to frontend for checkout
            };
          } else {
            console.error("Razorpay order creation failed:", razorpayOrder);
            throw new Error("Razorpay order creation failed");
          }
        } catch (razorpayError: any) {
          console.error(
            "Error calling Razorpay API:",
            razorpayError.error ? razorpayError.error : razorpayError.message
          );
          throw new Error("Failed to create Razorpay payment order");
        }
      }
    },
    handleCashfreeCallback: async (
      _: any,
      { order_id }: { order_id: string }
    ) => {
      const paymentConfig = await getPaymentConfig();
      const isCashfreeEnabled = paymentConfig.isCashfreeEnabled;
      
      if (!isCashfreeEnabled) {
        throw new Error("Cashfree is not enabled. Use handleRazorpayCallback instead.");
      }

      let verifiedStatus = "EXPIRED"; // Default to EXPIRED

      try {
        // 1. Fetch order details from Cashfree to verify status
        const cashfreeOrderDetails = await cashfree.PGFetchOrder(order_id);

        if (cashfreeOrderDetails.data && cashfreeOrderDetails.data.order_status) {
          const actualCashfreeStatus = cashfreeOrderDetails.data.order_status;

          // Map Cashfree statuses to internal statuses
          if (actualCashfreeStatus === "PAID" || actualCashfreeStatus === "SUCCESS") {
            verifiedStatus = "PAID";
          } else if (actualCashfreeStatus === "ACTIVE") {
            verifiedStatus = "PENDING";
          } else {
            verifiedStatus = "EXPIRED";
          }
        } else {
          console.error("Could not get order status from Cashfree for orderId:", order_id);
          throw new Error("Cashfree order verification failed");
        }
      } catch (error: any) {
        console.error(
          "Error verifying order with Cashfree:",
          error.response ? error.response.data : error.message
        );
        throw new Error("Failed to verify payment with Cashfree");
      }

      // 2. Update the order status in Supabase
      const { data: updatedOrder, error: updateError } = await db
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
    handleRazorpayCallback: async (
      _: any,
      {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      }: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }
    ) => {
      const paymentConfig = await getPaymentConfig();
      const isCashfreeEnabled = paymentConfig.isCashfreeEnabled;
      
      if (isCashfreeEnabled) {
        throw new Error("Razorpay is not enabled. Use handleCashfreeCallback instead.");
      }

      // 1. Verify signature to ensure authenticity
      const generatedSignature = crypto
        .createHmac("sha256", RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (generatedSignature !== razorpay_signature) {
        console.error("Razorpay signature verification failed");
        throw new Error("Invalid payment signature");
      }

      // 2. Fetch payment details from Razorpay to verify status
      let verifiedStatus = "EXPIRED";

      try {
        const payment = await razorpay.payments.fetch(razorpay_payment_id);

        if (payment.status === "captured" || payment.status === "authorized") {
          verifiedStatus = "PAID";
        } else if (payment.status === "created") {
          verifiedStatus = "PENDING";
        } else {
          verifiedStatus = "EXPIRED";
        }
      } catch (error: any) {
        console.error("Error fetching payment from Razorpay:", error);
        throw new Error("Failed to verify payment with Razorpay");
      }

      // 3. Find the order by razorpay_order_id (stored in cashfreeSessionId field)
      const { data: existingOrder, error: fetchError } = await db
        .from("payment_orders")
        .select("*")
        .eq("cashfreeSessionId", razorpay_order_id)
        .single();

      if (fetchError || !existingOrder) {
        console.error("Order not found for razorpay_order_id:", razorpay_order_id);
        throw new Error("Order not found");
      }

      // 4. Update the order status in Supabase
      const { data: updatedOrder, error: updateError } = await db
        .from("payment_orders")
        .update({
          orderStatus: verifiedStatus,
        })
        .eq("orderId", existingOrder.orderId)
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
