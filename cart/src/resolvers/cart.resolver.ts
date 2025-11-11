import { db } from "../db.ts";

// This middleware assumes that the user's information (including role and id) is available in the context.
// If the context is not set up to provide this, these checks will fail.
const requireCustomer = (resolver) => (parent, args, context, info) => {
  if (context.user?.role !== "customer") {
    throw new Error("You must be a customer to perform this action.");
  }
  return resolver(parent, args, context, info);
};

export const cartResolvers = {
    Query: {
        getCart: requireCustomer(async (_: any, __: any, context: any) => {
            const { data, error } = await db
                .from("carts")
                .select("*")
                .eq("user_id", context.user.id)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
                console.error("Error fetching cart:", error);
                throw new Error(error.message);
            }

            return data;
        }),
    },
    Mutation: {
        addItemToCart: requireCustomer(async (_: any, { item }: { item: { productId: string, quantity: number } }, context: any) => {
            const { data: cart, error: fetchError } = await db
                .from("carts")
                .select("*")
                .eq("user_id", context.user.id)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') {
                console.error("Error fetching cart:", fetchError);
                throw new Error(fetchError.message);
            }

            if (!cart) {
                // Create a new cart
                const { data: newCart, error: createError } = await db
                    .from("carts")
                    .insert({ user_id: context.user.id, items: [item] })
                    .select()
                    .single();
                
                if (createError) {
                    console.error("Error creating cart:", createError);
                    throw new Error(createError.message);
                }
                return newCart;
            } else {
                // Update existing cart
                const existingItem = cart.items.find(i => i.productId === item.productId);
                let newItems;
                if (existingItem) {
                    newItems = cart.items.map(i => 
                        i.productId === item.productId 
                        ? { ...i, quantity: i.quantity + item.quantity } 
                        : i
                    );
                } else {
                    newItems = [...cart.items, item];
                }

                const { data: updatedCart, error: updateError } = await db
                    .from("carts")
                    .update({ items: newItems })
                    .eq("id", cart.id)
                    .select()
                    .single();

                if (updateError) {
                    console.error("Error updating cart:", updateError);
                    throw new Error(updateError.message);
                }
                return updatedCart;
            }
        }),
        updateCartItem: requireCustomer(async (_: any, { productId, quantity }: { productId: string, quantity: number }, context: any) => {
            const { data: cart, error: fetchError } = await db
                .from("carts")
                .select("*")
                .eq("user_id", context.user.id)
                .single();

            if (fetchError) {
                console.error("Error fetching cart:", fetchError);
                throw new Error(fetchError.message);
            }

            if (!cart) {
                throw new Error("Cart not found.");
            }

            let newItems = cart.items.map(i => 
                i.productId === productId 
                ? { ...i, quantity } 
                : i
            );

            if (quantity <= 0) {
                newItems = newItems.filter(i => i.productId !== productId);
            }

            const { data: updatedCart, error: updateError } = await db
                .from("carts")
                .update({ items: newItems })
                .eq("id", cart.id)
                .select()
                .single();

            if (updateError) {
                console.error("Error updating cart:", updateError);
                throw new Error(updateError.message);
            }
            return updatedCart;
        }),
        removeCartItem: requireCustomer(async (_: any, { productId }: { productId: string }, context: any) => {
            const { data: cart, error: fetchError } = await db
                .from("carts")
                .select("*")
                .eq("user_id", context.user.id)
                .single();

            if (fetchError) {
                console.error("Error fetching cart:", fetchError);
                throw new Error(fetchError.message);
            }

            if (!cart) {
                throw new Error("Cart not found.");
            }

            const newItems = cart.items.filter(i => i.productId !== productId);

            const { data: updatedCart, error: updateError } = await db
                .from("carts")
                .update({ items: newItems })
                .eq("id", cart.id)
                .select()
                .single();

            if (updateError) {
                console.error("Error updating cart:", updateError);
                throw new Error(updateError.message);
            }
            return updatedCart;
        }),
        clearCart: requireCustomer(async (_: any, __: any, context: any) => {
            const { data: cart, error: fetchError } = await db
                .from("carts")
                .select("*")
                .eq("user_id", context.user.id)
                .single();

            if (fetchError) {
                console.error("Error fetching cart:", fetchError);
                throw new Error(fetchError.message);
            }

            if (!cart) {
                throw new Error("Cart not found.");
            }

            const { data: updatedCart, error: updateError } = await db
                .from("carts")
                .update({ items: [] })
                .eq("id", cart.id)
                .select()
                .single();

            if (updateError) {
                console.error("Error updating cart:", updateError);
                throw new Error(updateError.message);
            }
            return updatedCart;
        }),
    },
    Cart: {
        user(cart: { user_id: string }) {
            return { __typename: "User", id: cart.user_id };
        },
    },
    CartItem: {
        product(item: { productId: string }) {
            return { __typename: "Product", id: item.productId };
        },
    },
    User: {
        async cart(user: { id: string }) {
            const { data, error } = await db
                .from("carts")
                .select("*")
                .eq("user_id", user.id)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
                console.error("Error fetching cart for user:", error);
                throw new Error(error.message);
            }
            
            return data;
        }
    }
};
