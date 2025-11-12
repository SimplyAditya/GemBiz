import { db } from "../db.js";
// This middleware assumes that the user's information (including role and id) is available in the context.
// If the context is not set up to provide this, these checks will fail.
const requireSeller = (resolver) => (parent, args, context, info) => {
    if (!context.user || context.user.role?.toLowerCase() !== "seller") {
        console.log("Unauthorized access attempt by user:", context);
        throw new Error("You must be a seller to perform this action.");
    }
    return resolver(parent, args, context, info);
};
export const productResolvers = {
    Query: {
        async getProduct(_, { id }) {
            const { data, error } = await db
                .from("products")
                .select("*")
                .eq("id", id)
                .single();
            if (error) {
                console.error("Error fetching product:", error);
                throw new Error(error.message);
            }
            return data;
        },
        async getProducts() {
            const { data, error } = await db
                .from("products")
                .select(`
          *,
          users!seller_id (
            id,
            name,
            email
          )
        `);
            if (error) {
                console.error("Error fetching products:", error);
                throw new Error(error.message);
            }
            console.log("Fetched products from DB:", data);
            return data.map(product => ({
                ...product,
                seller: product.users
            }));
        },
    },
    Mutation: {
        createProduct: requireSeller(async (_, { input }, context) => {
            const { data, error } = await db
                .from("products")
                .insert([{ ...input, seller_id: context.user.id }])
                .select()
                .single();
            if (error) {
                console.error("Error creating product:", error);
                throw new Error(error.message);
            }
            return data;
        }),
        updateProduct: requireSeller(async (_, { id, input, }, context) => {
            const { data: existingProduct, error: fetchError } = await db
                .from("products")
                .select("seller_id")
                .eq("id", id)
                .single();
            if (fetchError) {
                console.error("Error fetching product for update:", fetchError);
                throw new Error(fetchError.message);
            }
            if (existingProduct.seller_id !== context.user.id) {
                throw new Error("You are not authorized to update this product.");
            }
            const { data, error } = await db
                .from("products")
                .update(input)
                .eq("id", id)
                .select()
                .single();
            if (error) {
                console.error("Error updating product:", error);
                throw new Error(error.message);
            }
            return data;
        }),
        deleteProduct: requireSeller(async (_, { id }, context) => {
            const { data: existingProduct, error: fetchError } = await db
                .from("products")
                .select("seller_id")
                .eq("id", id)
                .single();
            if (fetchError) {
                console.error("Error fetching product for delete:", fetchError);
                throw new Error(fetchError.message);
            }
            if (existingProduct.seller_id !== context.user.id) {
                throw new Error("You are not authorized to delete this product.");
            }
            const { data, error } = await db
                .from("products")
                .delete()
                .eq("id", id)
                .select()
                .single();
            if (error) {
                console.error("Error deleting product:", error);
                throw new Error(error.message);
            }
            return data;
        }),
    },
    Product: {
        __resolveReference(product) {
            return db.from("products").select("*").eq("id", product.id).single().then(({ data }) => data);
        },
        seller(product) {
            return { __typename: "User", id: product.seller_id };
        },
    },
    User: {
        async products(user) {
            const { data, error } = await db
                .from("products")
                .select("*")
                .eq("seller_id", user.id);
            if (error) {
                console.error("Error fetching products for user:", error);
                throw new Error(error.message);
            }
            return data;
        },
    },
};
//# sourceMappingURL=products.resolver.js.map