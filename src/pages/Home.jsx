import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import ProductDetailModal from '../components/ProductDetailModal';
import AddProductModal from '../components/AddProductModal';

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

const fetchProducts = async (user) => {
  let query;
  let variables = {};
  if (user?.role === 'seller') {
    query = `
      query GetUserProducts($userId: ID!) {
        getUser(id: $userId) {
          products {
            id
            name
            description
            price
            seller {
              id
              name
            }
          }
        }
      }
    `;
    variables = { userId: user.id };
  } else {
    query = `
      query GetProducts {
        getProducts {
          id
          name
          description
          price
          seller {
            id
            name
          }
        }
      }
    `;
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const result = await response.json();
  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  if (user?.role === 'seller') {
    return result.data.getUser.products;
  } else {
    return result.data.getProducts;
  }
};

const Home = () => {
  const { user } = useAuth();
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  
  const { data: products, isLoading, isError, error } = useQuery({
    queryKey: ['products', user?.id, user?.role],
    queryFn: () => fetchProducts(user),
  });

  const handleProductClick = (productId) => {
    setSelectedProductId(productId);
    setIsProductModalOpen(true);
  };

  const handleCloseProductModal = () => {
    setIsProductModalOpen(false);
    setSelectedProductId(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
            <p className="text-xl font-medium text-gray-700">Loading amazing products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-12">
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-md max-w-2xl mx-auto">
            <div className="flex items-center space-x-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-red-800">Error Loading Products</h3>
                <p className="text-red-600 mt-1">{error.message}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  console.log("Fetched products:", products);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            {user?.role === 'seller' ? 'Your Products' : 'Discover Amazing Products'}
          </h1>
          <p className="text-lg text-gray-600">
            {user?.role === 'seller' 
              ? 'Manage and view your product listings' 
              : 'Browse through our curated collection of premium products'
            }
          </p>
          {products.length > 0 && (
            <div className="mt-4 inline-flex items-center space-x-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">{products.length} Products Available</span>
            </div>
          )}
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-white rounded-full p-6 mb-6 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">No Products Available</h3>
            <p className="text-gray-600">Check back soon for exciting new products!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="group cursor-pointer"
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
                onClick={() => handleProductClick(product.id)}
              >
                <div className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                  {/* Product Image */}
                  <div className="relative h-56 bg-gradient-to-br from-indigo-100 to-purple-100 overflow-hidden">
                    {(() => {
                      const productImage = getProductImage(product.name);
                      return productImage ? (
                        <img
                          src={productImage}
                          alt={product.name}
                          className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-indigo-100">
                          <span className="text-indigo-600 text-lg font-semibold">{product.name}</span>
                        </div>
                      );
                    })()}
                    <div className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 h-10">
                      {product.description}
                    </p>

                    {/* Price and Seller */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-baseline space-x-1">
                        <span className="text-3xl font-bold text-indigo-600">
                          ₹{product.price.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>

                    {/* Seller Info */}
                    {product.seller && (
                      <div className="flex items-center space-x-2 text-sm text-gray-500 border-t pt-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="font-medium">{product.seller.name || 'N/A'}</span>
                      </div>
                    )}

                    {/* View Details Button */}
                    <div className={`mt-4 transition-all duration-300 ${hoveredProduct === product.id ? 'opacity-100' : 'opacity-0'}`}>
                      <div className="bg-indigo-600 text-white text-center py-2 rounded-lg font-semibold">
                        View Details
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <ProductDetailModal
        isOpen={isProductModalOpen}
        onClose={handleCloseProductModal}
        productId={selectedProductId}
      />
      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
      />
    </div>
  );
};

export default Home;
