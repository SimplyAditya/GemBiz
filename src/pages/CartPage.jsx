import React from 'react';
import { useCart } from '../context/CartContext';
import { useQuery } from '@tanstack/react-query';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';

// Helper function to fetch product details for cart items
const fetchProductDetails = async (productId, token) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: `
        query GetProduct($id: ID!) {
          getProduct(id: $id) {
            id
            name
            price
          }
        }
      `,
      variables: { id: productId },
    }),
  });

  const result = await response.json();
  if (result.errors) {
    throw new Error(result.errors[0].message);
  }
  return result.data.getProduct;
};

const CartPage = () => {
  const { cart, isLoadingCart, isErrorCart, cartError, removeItem, updateItemQuantity, clearCart, isClearingCart } = useCart();
  const { token } = useAuth(); // Assuming useAuth is available to get the token

  // Fetch details for each product in the cart
  const productDetailsQuery = useQuery({
    queryKey: ['cartProductDetails', cart?.items],
    queryFn: async () => {
      if (!cart?.items || cart.items.length === 0) return [];
      const productPromises = cart.items.map(item => fetchProductDetails(item.productId, token));
      return Promise.all(productPromises);
    },
    enabled: !!cart?.items && cart.items.length > 0 && !!token,
  });

  if (isLoadingCart || productDetailsQuery.isLoading) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-lg">Loading cart...</p>
      </div>
    );
  }

  if (isErrorCart || productDetailsQuery.isError) {
    return (
      <div className="container mx-auto p-4 text-center text-red-600">
        <p className="text-lg">Error: {cartError?.message || productDetailsQuery.error?.message}</p>
      </div>
    );
  }

  const cartItemsWithDetails = cart?.items?.map(item => {
    const details = productDetailsQuery.data?.find(p => p.id === item.productId);
    return { ...item, ...details };
  }) || [];

  const subtotal = cartItemsWithDetails.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="container mx-auto p-8 bg-white shadow-lg rounded-lg mt-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Your Shopping Cart</h1>

      {cartItemsWithDetails.length === 0 ? (
        <p className="text-lg text-gray-600">Your cart is empty.</p>
      ) : (
        <div>
          <div className="space-y-4">
            {cartItemsWithDetails.map((item) => (
              <div key={item.productId} className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={`https://via.placeholder.com/80x80?text=${item.name?.replace(/\s/g, '+') || 'Product'}`}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-md"
                  />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{item.name}</h3>
                    <p className="text-gray-600">${item.price?.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItemQuantity({ productId: item.productId, quantity: parseInt(e.target.value) })}
                    className="w-16 p-2 border rounded-md text-center"
                  />
                  <p className="text-lg font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-end items-center space-x-4">
            <p className="text-2xl font-bold text-gray-800">Subtotal: ${subtotal.toFixed(2)}</p>
            <button
              onClick={clearCart}
              disabled={isClearingCart}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md"
            >
              {isClearingCart ? 'Clearing...' : 'Clear Cart'}
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md">
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
