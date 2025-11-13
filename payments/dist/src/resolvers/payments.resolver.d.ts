import "dotenv/config";
export declare const resolvers: {
    Query: {
        getPaymentStatus: (_: any, { orderId }: {
            orderId: string;
        }) => Promise<any>;
    };
    Mutation: {
        createPaymentOrder: (_: any, { productId }: {
            productId: string;
        }, context: any) => Promise<any>;
        handleCashfreeCallback: (_: any, { order_id }: {
            order_id: string;
        }) => Promise<any>;
        handleRazorpayCallback: (_: any, { razorpay_order_id, razorpay_payment_id, razorpay_signature, }: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
        }) => Promise<any>;
    };
};
//# sourceMappingURL=payments.resolver.d.ts.map