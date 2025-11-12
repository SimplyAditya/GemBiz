import { db } from "../db.ts";
// import { Product } from "../types/products.types.ts";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  seller_id: string;
  created_at: string;
};

// This middleware assumes that the user's information (including role and id) is available in the context.
// If the context is not set up to provide this, these checks will fail.
const requireSeller = (resolver : any) => (parent : any, args: any, context: any, info: any) => {
  if (!context.user || context.user.role?.toLowerCase() !== "seller") {
    console.log("Unauthorized access attempt by user:", context);
    throw new Error("You must be a seller to perform this action.");
  }
  return resolver(parent, args, context, info);
};

export const productResolvers = {
  Query: {  
    async getProduct(_: any, { id }: { id: string }) {
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
    createProduct: requireSeller(
      async (
        _: any,
        { input }: { input: Omit<Product, "id" | "created_at" | "seller_id"> },
        context: any
      ) => {
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
      }
    ),
    updateProduct: requireSeller(
      async (
        _: any,
        {
          id,
          input,
        }: {
          id: string;
          input: { name?: string; description?: string; price?: number };
        },
        context: any
      ) => {
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
      }
    ),
    deleteProduct: requireSeller(
      async (_: any, { id }: { id: string }, context: any) => {
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
      }
    ),
  },
  Product: {
    seller(product: Product) {
      return { __typename: "User", id: product.seller_id };
    },
  },
  User: {
    async products(user: { id: string }) {
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
