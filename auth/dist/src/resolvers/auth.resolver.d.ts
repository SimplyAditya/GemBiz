export declare const authResolvers: {
    Query: {
        me: (_: any, __: any, context: any) => Promise<any>;
    };
    Mutation: {
        validateUser: (_parent: any, args: {
            input: {
                email: string;
                password: string;
            };
        }) => Promise<{
            id: string;
            email: string;
            name: any;
            phone: any;
            role: any;
            token: string;
        }>;
        changePassword: (_parent: any, args: {
            email: string;
            currentPassword: string;
            newPassword: string;
        }) => Promise<{
            message: string;
            access_token: string;
            refresh_token: string;
        }>;
    };
};
//# sourceMappingURL=auth.resolver.d.ts.map