import { UserInput, BusinessInput } from "../types/user.types.js";
export declare const userResolvers: {
    Query: {
        getUser: (_: any, { id }: {
            id: string;
        }) => Promise<any>;
        getBusiness: (_: any, { uid }: {
            uid: string;
        }) => Promise<any>;
    };
    User: {
        __resolveReference: (user: {
            id: string;
        }) => Promise<any>;
    };
    Business: {
        gst_id: (business: any) => any;
    };
    Mutation: {
        createUser: (_: any, { input }: {
            input: UserInput;
        }) => Promise<any>;
        upgradeToSeller: (_: any, { userId }: {
            userId: string;
        }) => Promise<any>;
        addBusiness: (_: any, { input }: {
            input: BusinessInput;
        }) => Promise<any>;
    };
};
//# sourceMappingURL=user.resolver.d.ts.map