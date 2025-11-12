type UserInput = {
    email: string;
    password: string;
    name: string;
    phone?: string;
};
export declare const userResolvers: {
    Query: {
        getUser: (_: any, { id }: {
            id: string;
        }) => Promise<any>;
    };
    User: {
        __resolveReference: (user: {
            id: string;
        }) => Promise<any>;
    };
    Mutation: {
        createUser: (_: any, { input }: {
            input: UserInput;
        }) => Promise<any>;
        upgradeToSeller: (_: any, { userId }: {
            userId: string;
        }) => Promise<any>;
    };
};
export {};
//# sourceMappingURL=user.resolver.d.ts.map