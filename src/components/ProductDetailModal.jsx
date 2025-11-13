import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { API_URL } from '../config';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';

const fetchProduct = async (productId) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
        query GetProduct($id: ID!) {
          getProduct(id: $id) {
            id
            name
            description
            price
            seller {
              id
              name
              email
            }
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

const ProductDetailModal = ({ isOpen, onClose, productId }) => {
  const [quantity, setQuantity] = useState(1);
  const { data: product, isLoading, isError, error } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => fetchProduct(productId),
    enabled: !!productId && isOpen,
  });
  const { addItem, isAddingItem } = useCart();
  const { user, token } = useAuth();

  const handleAddToCart = () => {
    if (product) {
      addItem({ productId: product.id, quantity });
    }
  };

  const createPaymentOrderMutation = useMutation({
    mutationFn: async (productId) => {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            mutation CreatePaymentOrder($productId: ID!) {
              createPaymentOrder(productId: $productId) {
                orderId
                cashfreeSessionId
                orderStatus
                razorpayKeyId
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
      return result.data.createPaymentOrder;
    },
  });

  const handleBuyNow = () => {
    createPaymentOrderMutation.mutate(product.id, {
      onSuccess: (data) => {
        // Check if Razorpay or Cashfree based on response
        if (data.razorpayKeyId) {
          // ============ RAZORPAY FLOW ============
          if (window.Razorpay) {
            const options = {
              key: data.razorpayKeyId,
              amount: product.price * 100, // Amount in paise
              currency: "INR",
              name: "GemBiz",
              description: product.name,
              order_id: data.cashfreeSessionId, // This is razorpay_order_id
              handler: function (response) {
                // Payment successful, verify on backend
                fetch(API_URL, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    query: `
                      mutation HandleRazorpayCallback(
                        $razorpay_order_id: String!,
                        $razorpay_payment_id: String!,
                        $razorpay_signature: String!
                      ) {
                        handleRazorpayCallback(
                          razorpay_order_id: $razorpay_order_id,
                          razorpay_payment_id: $razorpay_payment_id,
                          razorpay_signature: $razorpay_signature
                        ) {
                          orderId
                          orderStatus
                        }
                      }
                    `,
                    variables: {
                      razorpay_order_id: response.razorpay_order_id,
                      razorpay_payment_id: response.razorpay_payment_id,
                      razorpay_signature: response.razorpay_signature,
                    },
                  }),
                })
                  .then((res) => res.json())
                  .then((result) => {
                    if (result.data?.handleRazorpayCallback?.orderStatus === 'PAID') {
                      alert('Payment successful!');
                      window.location.href = '/';
                    } else {
                      alert('Payment verification failed');
                    }
                  })
                  .catch((error) => {
                    console.error('Error verifying payment:', error);
                    alert('Payment verification failed');
                  });
              },
              prefill: {
                name: user?.name || '',
                email: user?.email || '',
              },
              theme: {
                color: "#6366f1",
              },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
          } else {
            alert('Razorpay SDK not loaded. Please refresh the page.');
          }
        } else {
          // ============ CASHFREE FLOW ============
          if (window.Cashfree) {
            const cf = window.Cashfree({ mode: "sandbox" });
            cf.checkout({
              paymentSessionId: data.cashfreeSessionId,
              redirectTarget: "_self",
            });
          } else {
            alert('Cashfree SDK not loaded. Please refresh the page.');
          }
        }
      },
    });
  };

  const handleClose = () => {
    setQuantity(1);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Product Details" size="large">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      ) : isError ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-red-800">Error Loading Product</h3>
              <p className="text-red-600 mt-1">{error.message}</p>
            </div>
          </div>
        </div>
      ) : !product ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">Product not found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl overflow-hidden aspect-square flex items-center justify-center">
              <img
                src={`https://via.placeholder.com/500x500/6366f1/ffffff?text=${encodeURIComponent(product.name)}`}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg aspect-square overflow-hidden cursor-pointer border-2 border-transparent hover:border-indigo-500 transition-all">
                  <img
                    src={`https://via.placeholder.com/150x150/e0e7ff/6366f1?text=${i}`}
                    alt={`${product.name} ${i}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center space-x-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-gray-600">(128 reviews)</span>
              </div>

              <div className="flex items-baseline space-x-3 mb-4">
                <span className="text-4xl font-bold text-indigo-600">₹{product.price.toFixed(2)}</span>
                <span className="text-xl text-gray-400 line-through">₹{(product.price * 1.3).toFixed(2)}</span>
                <span className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">23% OFF</span>
              </div>
            </div>

            <div className="border-t border-b py-4 space-y-3">
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
              
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2 text-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>In Stock</span>
                </div>
                <div className="flex items-center space-x-2 text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span>Secure Payment</span>
                </div>
              </div>
            </div>

            {/* Seller Info */}
            {product.seller && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Seller Information</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>{product.seller.name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>{product.seller.email || 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}

            {user?.role !== 'seller' && (
              <div className="space-y-4">
                {/* Quantity Selector */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                  <div className="flex items-center border-2 border-gray-300 rounded-lg w-36 overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 font-semibold transition-colors"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-2 text-center border-x-2 border-gray-300 font-semibold focus:outline-none"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 font-semibold transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={isAddingItem}
                    className="flex-1 bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isAddingItem ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-600"></div>
                        <span>Adding...</span>
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 0a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={createPaymentOrderMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {createPaymentOrderMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>Buy Now</span>
                      </>
                    )}
                  </button>
                </div>

                {createPaymentOrderMutation.isError && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                    <p className="text-sm text-red-700">
                      Error: {createPaymentOrderMutation.error.message}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ProductDetailModal;
