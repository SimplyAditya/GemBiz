import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';

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
  const { data: products, isLoading, isError, error } = useQuery({
    queryKey: ['products', user?.id, user?.role],
    queryFn: () => fetchProducts(user),
  });

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
  console.log("Fetched products:", products);
  return (
    <div className="container mx-auto p-4">
      {products.length === 0 ? (
        <p className="text-lg text-center">No products available</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
              <Link to={`/products/${product.id}`} className="block">
                <div className="p-4">
                  <h4 className="text-xl font-semibold text-gray-800 mb-2">{product.name}</h4>
                  <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">${product.price.toFixed(2)}</span>
                  </div>
                  {product.seller && (
                    <p className="text-gray-500 text-xs mt-2">Sold by: {product.seller.name || 'N/A'}</p>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
