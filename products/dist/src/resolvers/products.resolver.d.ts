type Product = {
    id: string;
    name: string;
    description: string;
    price: number;
    seller_id: string;
    created_at: string;
};
export declare const productResolvers: {
    Query: {
        getProduct(_: any, { id }: {
            id: string;
        }): Promise<any>;
        getProducts(): Promise<any[]>;
    };
    Mutation: {
        createProduct: (parent: any, args: any, context: any, info: any) => any;
        updateProduct: (parent: any, args: any, context: any, info: any) => any;
        deleteProduct: (parent: any, args: any, context: any, info: any) => any;
    };
    Product: {
        __resolveReference(product: {
            id: string;
        }): PromiseLike<any>;
        seller(product: Product): {
            __typename: string;
            id: string;
        };
    };
    User: {
        products(user: {
            id: string;
        }): Promise<any[]>;
    };
};
export {};
//# sourceMappingURL=products.resolver.d.ts.map