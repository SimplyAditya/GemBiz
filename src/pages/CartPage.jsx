import React from 'react';
import { useCart } from '../context/CartContext';

const CartPage = () => {
  const { cart, isLoadingCart, isErrorCart, cartError, removeItem, updateItemQuantity, clearCart, isClearingCart } = useCart();

  if (isLoadingCart) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-lg">Loading cart...</p>
      </div>
    );
  }

  if (isErrorCart) {
    return (
      <div className="container mx-auto p-4 text-center text-red-600">
        <p className="text-lg">Error: {cartError?.message}</p>
      </div>
    );
  }

  const cartItemsWithDetails = cart?.items || [];

  const subtotal = cartItemsWithDetails.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

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
                    src={`https://via.placeholder.com/80x80?text=${item.product?.name?.replace(/\s/g, '+') || 'Product'}`}
                    alt={item.product?.name}
                    className="w-20 h-20 object-cover rounded-md"
                  />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{item.product?.name}</h3>
                    <p className="text-gray-600">₹{item.product?.price?.toFixed(2)}</p>
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
                  <p className="text-lg font-semibold">₹{(item.product?.price * item.quantity)?.toFixed(2)}</p>
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
            <p className="text-2xl font-bold text-gray-800">Subtotal: ₹{subtotal.toFixed(2)}</p>
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
