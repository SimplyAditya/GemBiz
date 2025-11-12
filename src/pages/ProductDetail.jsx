import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { API_URL } from '../config';
import { useCart } from '../context/CartContext'; // Import useCart

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

  const handleAddToCart = () => {
    if (product) {
      addItem({ productId: product.id, quantity: 1 });
    }
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

  return (
    <div className="container mx-auto p-8 bg-white shadow-lg rounded-lg mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image (Placeholder) */}
        <div className="flex items-center justify-center bg-gray-100 rounded-lg p-4">
          <img
            src={`https://via.placeholder.com/400x300?text=${product.name.replace(/\s/g, '+')}`}
            alt={product.name}
            className="max-w-full h-auto rounded-lg"
          />
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">{product.name}</h1>
          <p className="text-gray-700 text-lg mb-6">{product.description}</p>
          <p className="text-5xl font-extrabold text-blue-600 mb-6">${product.price.toFixed(2)}</p>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Seller Information:</h3>
            <p className="text-gray-600">Name: {product.seller?.name || 'N/A'}</p>
            <p className="text-gray-600">Email: {product.seller?.email || 'N/A'}</p>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isAddingItem}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-xl transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAddingItem ? 'Adding to Cart...' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
