import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { API_URL } from '../config';
import { useCart } from '../context/CartContext'; // Import useCart
import { useAuth } from '../context/AuthContext'; // Import useAuth

// Function to get product image based on name
const getProductImage = (productName) => {
  const name = productName.toLowerCase();

  if (name.includes('pixel') || name.includes('8')) {
    return '/pixel8.webp';
  }
  if (name.includes('mac') || name.includes('laptop') || name.includes('computer')) {
    return '/mac.jpeg';
  }
  if (name.includes('phone') || name.includes('mobile') || name.includes('smartphone')) {
    return '/phone.jpg';
  }
  if (name.includes('watch') || name.includes('smartwatch')) {
    return '/watch.jpg';
  }

  return null; // No matching image found
};

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

const ProductDetail = () => {
  const { id } = useParams();
  const { data: product, isLoading, isError, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProduct(id),
    enabled: !!id, // Only run query if id is available
  });
  const { addItem, isAddingItem } = useCart(); // Use addItem from CartContext
  const { user, token } = useAuth(); // Get user and token from AuthContext

  const handleAddToCart = () => {
    if (product) {
      addItem({ productId: product.id, quantity: 1 });
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
            alert('Razorpay SDK not loaded');
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
            alert('Cashfree SDK not loaded');
          }
        }
      },
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-lg">Loading product details...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto p-4 text-center text-red-600">
        <p className="text-lg">Error: {error.message}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-lg">Product not found.</p>
      </div>
    );
  }

  const productImage = getProductImage(product.name);

  return (
    <div className="container mx-auto p-8 bg-white shadow-lg rounded-lg mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="flex items-center justify-center bg-gray-100 rounded-lg p-4">
          {productImage ? (
            <img
              src={productImage}
              alt={product.name}
              className="max-w-full h-auto rounded-lg object-cover"
            />
          ) : (
            <img
              src={`https://via.placeholder.com/400x300?text=${product.name.replace(/\s/g, '+')}`}
              alt={product.name}
              className="max-w-full h-auto rounded-lg"
            />
          )}
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">{product.name}</h1>
          <p className="text-gray-700 text-lg mb-6">{product.description}</p>
          <p className="text-5xl font-extrabold text-blue-600 mb-6">₹{product.price.toFixed(2)}</p>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Seller Information:</h3>
            <p className="text-gray-600">Name: {product.seller?.name || 'N/A'}</p>
            <p className="text-gray-600">Email: {product.seller?.email || 'N/A'}</p>
          </div>

          {user?.role !== 'seller' && (
            <>
              <button
                onClick={handleAddToCart}
                disabled={isAddingItem}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-xl transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingItem ? 'Adding to Cart...' : 'Add to Cart'}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={createPaymentOrderMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-xl transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {createPaymentOrderMutation.isPending ? 'Processing...' : 'Buy Now'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
