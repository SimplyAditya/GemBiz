import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom'; // Import Link
import { API_URL } from '../config';
import { useCart } from '../context/CartContext'; // Import useCart

const fetchProducts = async () => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
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
      `,
    }),
  });

  const result = await response.json();
  if (result.errors) {
    throw new Error(result.errors[0].message);
  }
  return result.data.getProducts;
};

const ProductList = () => {
  const { data: products, isLoading, isError, error } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });
  const { addItem, isAddingItem } = useCart(); // Use addItem from CartContext

  const handleAddToCart = (productId) => {
    addItem({ productId, quantity: 1 });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-lg">Loading products...</p>
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

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6">Our Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
            <Link to={`/products/${product.id}`} className="block"> {/* Link wraps content except button */}
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-600">${product.price.toFixed(2)}</span>
                </div>
                {product.seller && (
                  <p className="text-gray-500 text-xs mt-2">Sold by: {product.seller.name || 'N/A'}</p>
                )}
              </div>
            </Link>
            <div className="p-4 pt-0"> {/* Button outside the link */}
              <button
                onClick={() => handleAddToCart(product.id)}
                disabled={isAddingItem}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingItem ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
