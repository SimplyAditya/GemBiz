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
        gst_id: (business) => business.gst?.id || business.gst_id,
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
            try {
                // First, insert GST data
                const { gst, ...businessData } = input;
                let gstId = null;
                if (gst && (gst.gst_file_url || gst.gst_file_type || gst.gst_no)) {
                    console.log('Inserting GST data:', gst);
                    const { data: gstData, error: gstError } = await db
                        .from("gst")
                        .insert([gst])
                        .select()
                        .single();
                    if (gstError) {
                        console.error('GST insertion error:', gstError);
                        throw new Error(`GST insertion failed: ${gstError.message}. Details: ${JSON.stringify(gstError)}`);
                    }
                    gstId = gstData.id;
                    console.log('GST inserted successfully with ID:', gstId);
                }
                // Then insert business data with GST reference
                const businessInsertData = {
                    ...businessData,
                    gst: gstId
                };
                console.log('Inserting business data:', businessInsertData);
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
                    console.error('Business insertion error:', error);
                    throw new Error(`Business insertion failed: ${error.message}. Details: ${JSON.stringify(error)}. Insert data: ${JSON.stringify(businessInsertData)}`);
                }
                console.log('Business inserted successfully:', data);
                return data;
            }
            catch (error) {
                console.error('addBusiness mutation error:', error);
                throw new Error(`addBusiness failed: ${error.message}`);
            }
        },
    },
};
//# sourceMappingURL=user.resolver.js.map