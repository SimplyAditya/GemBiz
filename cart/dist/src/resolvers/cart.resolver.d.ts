export declare const cartResolvers: {
    Query: {
        getCart: (parent: any, args: any, context: any, info: any) => any;
    };
    Mutation: {
        addItemToCart: (parent: any, args: any, context: any, info: any) => any;
        updateCartItem: (parent: any, args: any, context: any, info: any) => any;
        removeCartItem: (parent: any, args: any, context: any, info: any) => any;
        clearCart: (parent: any, args: any, context: any, info: any) => any;
    };
    Cart: {
        userId(cart: {
            user_id: string;
        }): string;
        user(cart: {
            user_id: string;
        }): {
            __typename: string;
            id: string;
        };
        items(cart: {
            id: string;
        }): Promise<any[]>;
    };
    CartItem: {
        cartId(item: {
            cart_id: string;
        }): string;
        productId(item: {
            product_id: string;
        }): string;
        cart(item: {
            cart_id: string;
        }): {
            __typename: string;
            id: string;
        };
        product(item: {
            product_id: string;
        }): {
            __typename: string;
            id: string;
        };
    };
    User: {
        cart(user: {
            id: string;
        }): Promise<{
            id: any;
            user_id: any;
        } | null>;
    };
};
//# sourceMappingURL=cart.resolver.d.ts.map