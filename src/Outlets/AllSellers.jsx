import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash } from "react-icons/fa";

const AllSellers = () => {
  const [pendingSellers, setPendingSellers] = useState([]);
  const [allSellers, setAllSellers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSellers = async () => {
      setIsLoading(true);
      try {
        const [pendingResponse, allResponse] = await Promise.all([
          axios.get("https://api-gembiz.aditya-bansal.tech/fetch-business-sellers"),
          axios.get("https://api-gembiz.aditya-bansal.tech/fetch-all-register-business"),
        ]);

        if (pendingResponse.status === 200) {
          setPendingSellers(pendingResponse.data);
        }

        if (allResponse.status === 200) {
          // Filter out pending sellers from all sellers
          const pendingSellerIds = new Set(pendingResponse.data.map(seller => seller.id));
          const filteredAllSellers = allResponse.data.filter(seller => !pendingSellerIds.has(seller.id));
          setAllSellers(filteredAllSellers);
        }
      } catch (error) {
        console.error("Error fetching sellers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSellers();
  }, []);

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

  return (
    <div className="p-4">
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Pending Sellers</h2>
        {pendingSellers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {pendingSellers.map((seller) => (
              <div
                key={seller.id}
                className="p-4 border rounded shadow-md bg-white hover:shadow-lg transition-shadow"
              >
<div className="flex flex-col space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold text-gray-800">{seller.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      seller.storeverified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {seller.storeverified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-700">{seller.user_name}</p>
  <div className="text-sm text-gray-600 mb-4">
                    <p className="flex items-center gap-2">
                      <span className="font-medium">Category:</span> {seller.category}
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-medium">GST:</span> {seller.gst?.gst_no || 'N/A'}
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-medium">Website:</span>
                      <a href={seller.website} target="_blank" rel="noopener noreferrer" 
                         className="text-blue-600 hover:underline truncate">
                        {seller.website || 'N/A'}
                      </a>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-medium">Mobile:</span>
                      <a href={`tel:${seller.mobile}`} className="text-blue-600 hover:underline">
                        {seller.mobile}
                      </a>
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 mt-4">
                    {!seller.storeverified && (
                      <button
                        onClick={async () => {
                          try {
                            const response = await axios.post("https://api-gembiz.aditya-bansal.tech/approve-business-seller", { id: seller.id });
                            if (response.status === 200) {
                              // Move seller from pending to allSellers
                              setPendingSellers(prev => prev.filter(s => s.id !== seller.id));
                              setAllSellers(prev => [...prev, { ...seller, storeverified: true }]);
                            }
                          } catch (error) {
                            console.error("Error approving seller:", error);
                          }
                        }}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      >
                        Approve
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        try {
                          const response = await axios.delete("https://api-gembiz.aditya-bansal.tech/delete-seller", {
                            data: { id: seller.id },
                          });
                          if (response.status === 200) {
                            if (!seller.storeverified) {
                              setPendingSellers(prev => prev.filter(s => s.id !== seller.id));
                            } else {
                              setAllSellers(prev => prev.filter(s => s.id !== seller.id));
                            }
                          } else {
                            console.error("Failed to delete seller");
                          }
                        } catch (error) {
                          console.error("Error deleting seller:", error);
                        }
                      }}
                      className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center justify-center gap-2"
                    >
                      <FaTrash className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No pending sellers.</p>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">All Registered Sellers</h2>
        {allSellers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {allSellers.map((seller) => (
              <div
                key={seller.id}
                className="p-4 border rounded shadow-md bg-white hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold text-gray-800">{seller.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      seller.storeverified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {seller.storeverified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-700">{seller.user_name}</p>
                  <div className="text-sm text-gray-600 mb-4">
                    <p className="flex items-center gap-2">
                      <span className="font-medium">Category:</span> {seller.category}
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-medium">GST:</span> {seller.gst?.gst_no || 'N/A'}
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-medium">Website:</span>
                      <a href={seller.website} target="_blank" rel="noopener noreferrer" 
                         className="text-blue-600 hover:underline truncate">
                        {seller.website || 'N/A'}
                      </a>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-medium">Mobile:</span>
                      <a href={`tel:${seller.mobile}`} className="text-blue-600 hover:underline">
                        {seller.mobile}
                      </a>
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        const response = await axios.delete("https://api-gembiz.aditya-bansal.tech/delete-seller", {
                          data: { id: seller.id },
                        });
                        if (response.status === 200) {
                          setAllSellers(prev => prev.filter(s => s.id !== seller.id));
                        } else {
                          console.error("Failed to delete seller");
                        }
                      } catch (error) {
                        console.error("Error deleting seller:", error);
                      }
                    }}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center justify-center gap-2"
                  >
                    <FaTrash className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No registered sellers.</p>
        )}
      </section>
    </div>
  );
};

export default AllSellers;
