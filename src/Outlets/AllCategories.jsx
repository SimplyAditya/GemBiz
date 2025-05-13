import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaTrash } from "react-icons/fa";

const AllCategories = () => {
  const [pendingCategories, setPendingCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const PENDING_CATEGORIES_API_URL = "https://api-gembiz.aditya-bansal.tech/fetch-pending-business-categories";
  const ALL_CATEGORIES_API_URL = "https://api-gembiz.aditya-bansal.tech/fetch-all-business-categories";
  const APPROVE_CATEGORY_API_URL = "https://api-gembiz.aditya-bansal.tech/approve-business-category";
  const DELETE_CATEGORY_API_URL = "https://api-gembiz.aditya-bansal.tech/delete-category";

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [pendingResponse, allResponse] = await Promise.all([
          axios.get(PENDING_CATEGORIES_API_URL),
          axios.get(ALL_CATEGORIES_API_URL),
        ]);

        if (pendingResponse.status === 200) {
          setPendingCategories(pendingResponse.data);
        }

        if (allResponse.status === 200) {
          const pendingCategoryIds = new Set(pendingResponse.data.map(cat => cat.id));
          const filteredAllCategories = allResponse.data.filter(cat => !pendingCategoryIds.has(cat.id));
          setAllCategories(filteredAllCategories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setPendingCategories([]);
        setAllCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleApproveCategory = async (categoryId) => {
    try {
      const response = await axios.post(APPROVE_CATEGORY_API_URL, { id: categoryId });
      if (response.status === 200) {
        const approvedCategory = pendingCategories.find(cat => cat.id === categoryId);
        if (approvedCategory) {
          setPendingCategories(prev => prev.filter(cat => cat.id !== categoryId));
          setAllCategories(prev => [...prev, { ...approvedCategory, approved: true }]);
        }
      }
    } catch (error) {
      console.error("Error approving category:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <svg
          className="animate-spin h-10 w-10 text-gray-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    );
  }

  const handleDeleteCategory = async (categoryId, isPending) => {
    try {
      const response = await axios.delete(DELETE_CATEGORY_API_URL, {
        data: { id: categoryId }
      });
      if (response.status === 200) {
        if (isPending) {
          setPendingCategories(prev => prev.filter(cat => cat.id !== categoryId));
        } else {
          setAllCategories(prev => prev.filter(cat => cat.id !== categoryId));
        }
      } else {
        console.error("Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const CategoryCard = ({ category, isPending }) => (
    <div className="p-4 border rounded shadow-md bg-white hover:shadow-lg transition-shadow">
      <div className="flex flex-col space-y-3">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold text-gray-800">{category.name}</h3>
          <span className={`px-2 py-1 text-xs rounded-full ${
            !isPending ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
          }`}>
            {category.status || (isPending ? 'Pending' : 'Approved')}
          </span>
        </div>
        <div className="text-sm space-y-2">
          <p className="text-gray-700">{category.description}</p>
          {category.subcategories && category.subcategories.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-800 mb-1">Subcategories:</h4>
              <div className="flex flex-wrap gap-2">
                {category.subcategories.map((subcat, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 rounded text-xs">
                    {subcat}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 mt-4">
          {isPending && (
            <button
              onClick={() => handleApproveCategory(category.id)}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Approve Category
            </button>
          )}
          <button
            onClick={() => handleDeleteCategory(category.id, isPending)}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center justify-center gap-2"
          >
            <FaTrash className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4">
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Pending Categories</h2>
        {pendingCategories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {pendingCategories.map((category) => (
              <CategoryCard key={category.id} category={category} isPending={true} />
            ))}
          </div>
        ) : (
          <p>No pending categories.</p>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">All Approved Categories</h2>
        {allCategories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {allCategories.map((category) => (
              <CategoryCard key={category.id} category={category} isPending={false} />
            ))}
          </div>
        ) : (
          <p>No approved categories.</p>
        )}
      </section>
    </div>
  );
};

export default AllCategories;
