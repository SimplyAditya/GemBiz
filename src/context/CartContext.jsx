import React, { createContext, useContext } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { API_URL } from '../config';
import { useAuth } from './AuthContext'; // Assuming AuthContext provides user ID and token

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user, token } = useAuth();
  const queryClient = useQueryClient();

  // Fetch cart data for the logged-in user
  const { data: cart, isLoading, isError, error } = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: async () => {
      if (!user?.id || !token) return null; // Don't fetch if no user or token

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            query GetCart {
              getCart {
                id
                userId
                items {
                  id
                  productId
                  quantity
                  product {
                    id
                    name
                    price
                  }
                }
              }
            }
          `,
          variables: {}, // No variables needed
        }),
      });

      const result = await response.json();
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }
      return result.data.getCart;
    },
    enabled: !!user?.id && !!token, // Only enable query if user ID and token exist
  });

  const addItemMutation = useMutation({
    mutationFn: async ({ productId, quantity }) => {
      if (!user?.id || !token) throw new Error('User not authenticated.');

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            mutation AddItemToCart($item: CartItemInput!) {
              addItemToCart(item: $item) {
                id
                userId
                items {
                  id
                  productId
                  quantity
                  product {
                    id
                    name
                    price
                  }
                }
              }
            }
          `,
          variables: { item: { productId, quantity } },
        }),
      });

      const result = await response.json();
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }
      return result.data.addItemToCart;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['cart', user.id]); // Invalidate cart query to refetch
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (productId) => {
      if (!user?.id || !token) throw new Error('User not authenticated.');

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            mutation RemoveCartItem($productId: ID!) {
              removeCartItem(productId: $productId) {
                id
                userId
                items {
                  id
                  productId
                  quantity
                  product {
                    id
                    name
                    price
                  }
                }
              }
            }
          `,
          variables: { productId },
        }),
      });

      const result = await response.json();
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }
      return result.data.removeCartItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['cart', user.id]);
    },
  });

  const updateItemQuantityMutation = useMutation({
    mutationFn: async ({ productId, quantity }) => {
      if (!user?.id || !token) throw new Error('User not authenticated.');

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            mutation UpdateCartItem($productId: ID!, $quantity: Int!) {
              updateCartItem(productId: $productId, quantity: $quantity) {
                id
                userId
                items {
                  id
                  productId
                  quantity
                  product {
                    id
                    name
                    price
                  }
                }
              }
            }
          `,
          variables: { productId, quantity },
        }),
      });

      const result = await response.json();
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }
      return result.data.updateCartItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['cart', user.id]);
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !token) throw new Error('User not authenticated.');

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            mutation ClearCart {
              clearCart {
                id
                userId
                items {
                  id
                  productId
                  quantity
                  product {
                    id
                    name
                    price
                  }
                }
              }
            }
          `,
          variables: {}, // No variables needed
        }),
      });

      const result = await response.json();
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }
      return result.data.clearCart;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['cart', user.id]);
    },
  });

  const cartItemsCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const value = {
    cart,
    cartItemsCount,
    isLoadingCart: isLoading,
    isErrorCart: isError,
    cartError: error,
    addItem: addItemMutation.mutate,
    removeItem: removeItemMutation.mutate,
    updateItemQuantity: updateItemQuantityMutation.mutate,
    clearCart: clearCartMutation.mutate,
    isAddingItem: addItemMutation.isPending,
    isRemovingItem: removeItemMutation.isPending,
    isUpdatingItem: updateItemQuantityMutation.isPending,
    isClearingCart: clearCartMutation.isPending,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};