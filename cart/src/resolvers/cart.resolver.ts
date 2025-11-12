import { db } from "../db.ts";

// If the context is not set up to provide this, these checks will fail.
const requireCustomer = (resolver : any) => (parent : any, args : any, context : any, info : any) => {
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
                .select("id, user_id")
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
            // Get or create cart
            let { data: cart, error: fetchError } = await db
                .from("carts")
                .select("id, user_id")
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
                    .insert({ user_id: context.user.id })
                    .select("id, user_id")
                    .single();
                
                if (createError) {
                    console.error("Error creating cart:", createError);
                    throw new Error(createError.message);
                }
                cart = newCart;
            }

            // Check if item already exists in cart
            const { data: existingItem, error: itemFetchError } = await db
                .from("cart_items")
                .select("*")
                .eq("cart_id", cart.id)
                .eq("product_id", item.productId)
                .single();

            if (itemFetchError && itemFetchError.code !== 'PGRST116') {
                console.error("Error fetching cart item:", itemFetchError);
                throw new Error(itemFetchError.message);
            }

            if (existingItem) {
                // Update quantity
                const { error: updateError } = await db
                    .from("cart_items")
                    .update({ quantity: existingItem.quantity + item.quantity })
                    .eq("id", existingItem.id);

                if (updateError) {
                    console.error("Error updating cart item:", updateError);
                    throw new Error(updateError.message);
                }
            } else {
                // Insert new cart item
                const { error: insertError } = await db
                    .from("cart_items")
                    .insert({ 
                        cart_id: cart.id, 
                        product_id: item.productId, 
                        quantity: item.quantity 
                    });

                if (insertError) {
                    console.error("Error inserting cart item:", insertError);
                    throw new Error(insertError.message);
                }
            }

            return cart;
        }),
        updateCartItem: requireCustomer(async (_: any, { productId, quantity }: { productId: string, quantity: number }, context: any) => {
            const { data: cart, error: fetchError } = await db
                .from("carts")
                .select("id, user_id")
                .eq("user_id", context.user.id)
                .single();

            if (fetchError) {
                console.error("Error fetching cart:", fetchError);
                throw new Error(fetchError.message);
            }

            if (!cart) {
                throw new Error("Cart not found.");
            }

            if (quantity <= 0) {
                // Remove item if quantity is 0 or less
                const { error: deleteError } = await db
                    .from("cart_items")
                    .delete()
                    .eq("cart_id", cart.id)
                    .eq("product_id", productId);

                if (deleteError) {
                    console.error("Error deleting cart item:", deleteError);
                    throw new Error(deleteError.message);
                }
            } else {
                // Update quantity
                const { error: updateError } = await db
                    .from("cart_items")
                    .update({ quantity })
                    .eq("cart_id", cart.id)
                    .eq("product_id", productId);

                if (updateError) {
                    console.error("Error updating cart item:", updateError);
                    throw new Error(updateError.message);
                }
            }

            return cart;
        }),
        removeCartItem: requireCustomer(async (_: any, { productId }: { productId: string }, context: any) => {
            const { data: cart, error: fetchError } = await db
                .from("carts")
                .select("id, user_id")
                .eq("user_id", context.user.id)
                .single();

            if (fetchError) {
                console.error("Error fetching cart:", fetchError);
                throw new Error(fetchError.message);
            }

            if (!cart) {
                throw new Error("Cart not found.");
            }

            const { error: deleteError } = await db
                .from("cart_items")
                .delete()
                .eq("cart_id", cart.id)
                .eq("product_id", productId);

            if (deleteError) {
                console.error("Error deleting cart item:", deleteError);
                throw new Error(deleteError.message);
            }

            return cart;
        }),
        clearCart: requireCustomer(async (_: any, __: any, context: any) => {
            const { data: cart, error: fetchError } = await db
                .from("carts")
                .select("id, user_id")
                .eq("user_id", context.user.id)
                .single();

            if (fetchError) {
                console.error("Error fetching cart:", fetchError);
                throw new Error(fetchError.message);
            }

            if (!cart) {
                throw new Error("Cart not found.");
            }

            const { error: deleteError } = await db
                .from("cart_items")
                .delete()
                .eq("cart_id", cart.id);

            if (deleteError) {
                console.error("Error deleting cart items:", deleteError);
                throw new Error(deleteError.message);
            }

            return cart;
        }),
    },
    Cart: {
        userId(cart: { user_id: string }) {
            return cart.user_id;
        },
        user(cart: { user_id: string }) {
            return { __typename: "User", id: cart.user_id };
        },
        async items(cart: { id: string }) {
            const { data, error } = await db
                .from("cart_items")
                .select("*")
                .eq("cart_id", cart.id);

            if (error) {
                console.error("Error fetching cart items:", error);
                throw new Error(error.message);
            }

            return data || [];
        },
    },
    CartItem: {
        cartId(item: { cart_id: string }) {
            return item.cart_id;
        },
        productId(item: { product_id: string }) {
            return item.product_id;
        },
        cart(item: { cart_id: string }) {
            return { __typename: "Cart", id: item.cart_id };
        },
        product(item: { product_id: string }) {
            return { __typename: "Product", id: item.product_id };
        },
    },
    User: {
        async cart(user: { id: string }) {
            const { data, error } = await db
                .from("carts")
                .select("id, user_id")
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
