import { db } from "../db.js";
export const userResolvers = {
    Query: {
        getUser: async (_, { id }) => {
            const { data, error } = await db
                .from("users")
                .select("*")
                .eq("id", id)
                .single();
            if (error) {
                throw new Error(error.message);
            }
            return data;
        },
        getBusiness: async (_, { uid }) => {
            const { data, error } = await db
                .from("business")
                .select(`
          *,
          gst (
            id,
            gst_file_url,
            gst_file_type,
            gst_no
          )
        `)
                .eq("uid", uid)
                .single();
            if (error) {
                throw new Error(error.message);
            }
            return data;
        },
    },
    User: {
        __resolveReference: async (user) => {
            const { data, error } = await db
                .from("users")
                .select("*")
                .eq("id", user.id)
                .single();
            if (error) {
                throw new Error(error.message);
            }
            return data;
        },
    },
    Business: {
        gst_id: (business) => business.gst,
    },
    Mutation: {
        createUser: async (_, { input }) => {
            const { name, email, password, phone } = input;
            let orCondition = `email.eq.${email}`;
            if (phone) {
                orCondition += `,phone.eq.${phone}`;
            }
            const { data, error } = await db
                .from("users")
                .select("*")
                .or(orCondition)
                .maybeSingle();
            if (error) {
                throw new Error(error.message);
            }
            if (data) {
                throw new Error("User already exists with this email or phone number");
            }
            const { data: signupData, error: authError } = await db.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
            });
            if (authError) {
                throw new Error(authError.message);
            }
            const { data: user, error: insertError } = await db
                .from("users")
                .insert([{ id: signupData.user.id, email, name, phone }])
                .select()
                .single();
            if (insertError) {
                throw new Error(insertError.message);
            }
            return user;
        },
        upgradeToSeller: async (_, { userId }) => {
            const { data, error } = await db
                .from("users")
                .update({ role: "seller" })
                .eq("id", userId)
                .select()
                .single();
            if (error) {
                throw new Error(error.message);
            }
            return data;
        },
        addBusiness: async (_, { input }) => {
            // First, insert GST data
            const { gst, ...businessData } = input;
            let gstId = null;
            if (gst && (gst.gst_file_url || gst.gst_file_type || gst.gst_no)) {
                const { data: gstData, error: gstError } = await db
                    .from("gst")
                    .insert([gst])
                    .select()
                    .single();
                if (gstError) {
                    throw new Error(gstError.message);
                }
                gstId = gstData.id;
            }
            // Then insert business data with GST reference
            const businessInsertData = {
                ...businessData,
                gst: gstId
            };
            const { data, error } = await db
                .from("business")
                .insert([businessInsertData])
                .select(`
          *,
          gst (
            id,
            gst_file_url,
            gst_file_type,
            gst_no
          )
        `)
                .single();
            if (error) {
                throw new Error(error.message);
            }
            return data;
        },
    },
};
//# sourceMappingURL=user.resolver.js.map