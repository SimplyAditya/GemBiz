import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash } from "react-icons/fa";
import IndividualCatalogueModal from "../components/IndividualCatalogueModal";

const AllCatalogues = () => {
  const [pendingCatalogues, setPendingCatalogues] = useState([]);
  const [allCatalogues, setAllCatalogues] = useState([]);
  const [sellers, setSellers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCatalogue, setSelectedCatalogue] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const PENDING_CATALOGUES_API_URL = "http://localhost:5501/fetch-pending-business-catalogues"; 
  const ALL_CATALOGUES_API_URL = "http://localhost:5501/fetch-all-business-catalogues"; 
  const APPROVE_CATALOGUE_API_URL = "http://localhost:5501/approve-business-catalogue";
  const DELETE_CATALOGUE_API_URL = "http://localhost:5501/delete-catalogue";
  const SELLERS_API_URL = "http://localhost:5501/fetch-all-register-business";

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [pendingResponse, allResponse, sellersResponse] = await Promise.all([
          axios.get(PENDING_CATALOGUES_API_URL),
          axios.get(ALL_CATALOGUES_API_URL),
          axios.get(SELLERS_API_URL),
        ]);

        if (pendingResponse.status === 200) {
          setPendingCatalogues(pendingResponse.data);
        }

        if (allResponse.status === 200) {
          const pendingCatalogueIds = new Set(pendingResponse.data.map(cat => cat.id));
          const filteredAllCatalogues = allResponse.data.filter(cat => !pendingCatalogueIds.has(cat.id));
          setAllCatalogues(filteredAllCatalogues);
        }

        if (sellersResponse.status === 200) {
          // Create a map of seller data by uid for easy lookup
          const sellersMap = sellersResponse.data.reduce((acc, seller) => {
            acc[seller.uid] = {
              name: seller.name,
              user_name: seller.user_name
            };
            return acc;
          }, {});
          setSellers(sellersMap);
        }
      } catch (error) {
        console.error("Error fetching catalogues:", error);
        setPendingCatalogues([]);
        setAllCatalogues([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleApproveCatalogue = async (catalogueId) => {
    try {
      const response = await axios.post(APPROVE_CATALOGUE_API_URL, { id: catalogueId });
      if (response.status === 200) {
        const approvedCatalogue = pendingCatalogues.find(cat => cat.id === catalogueId);
        if (approvedCatalogue) {
          setPendingCatalogues(prev => prev.filter(cat => cat.id !== catalogueId));
          setAllCatalogues(prev => [...prev, { ...approvedCatalogue, approved: true }])
        }
      }
    } catch (error) {
      console.error("Error approving catalogue:", error);
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

  const handleDeleteCatalogue = async (catalogueId, isPending) => {
    try {
      const response = await axios.delete(DELETE_CATALOGUE_API_URL, {
        data: { id: catalogueId }
      });
      if (response.status === 200) {
        if (isPending) {
          setPendingCatalogues(prev => prev.filter(cat => cat.id !== catalogueId));
        } else {
          setAllCatalogues(prev => prev.filter(cat => cat.id !== catalogueId));
        }
      } else {
        console.error("Failed to delete catalogue");
      }
    } catch (error) {
      console.error("Error deleting catalogue:", error);
    }
  };

  const CatalogueCard = ({ catalogue, isPending }) => (
    <div 
      className="p-4 border rounded shadow-md bg-white hover:shadow-lg transition-shadow cursor-pointer"
      onClick={(e) => {
        // Don't open modal if clicking the approve button
        if (!e.target.closest('button')) {
          setSelectedCatalogue(catalogue);
          setIsModalOpen(true);
        }
      }}
    >
      <div className="flex flex-col space-y-3">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold text-gray-800">{catalogue.name}</h3>
          <span className={`px-2 py-1 text-xs rounded-full ${
            !isPending ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
          }`}>
            {catalogue.itemStatus || (isPending ? 'Pending' : 'Approved')}
          </span>
        </div>
        
        {catalogue.imageUrls && catalogue.imageUrls.length > 0 && (
          <div className="flex gap-2 overflow-x-auto py-2">
            {catalogue.imageUrls.slice(0, 3).map((url, index) => (
              <img 
                key={index}
                src={url} 
                alt={`Product ${index + 1}`}
                className="w-20 h-20 object-cover rounded"
              />
            ))}
            {catalogue.imageUrls.length > 3 && (
              <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center text-gray-500">
                +{catalogue.imageUrls.length - 3}
              </div>
            )}
          </div>
        )}

        <div className="text-sm space-y-2">
          {sellers[catalogue.uid] && (
            <div className="bg-gray-50 p-2 rounded">
              <p className="font-medium text-gray-800">{sellers[catalogue.uid].name}</p>
              <p className="text-gray-600">@{sellers[catalogue.uid].user_name}</p>
            </div>
          )}
          <p className="text-gray-700">{catalogue.description}</p>
          <div className="flex items-center gap-2">
            <span className="font-medium">₹{catalogue.sellingPrice}</span>
            {catalogue.mrp && catalogue.mrp !== catalogue.sellingPrice && (
              <span className="text-gray-500 line-through">₹{catalogue.mrp}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {catalogue.sizes && catalogue.sizes.map((size, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 rounded text-xs">{size}</span>
            ))}
          </div>
          {catalogue.quantities && (
            <p className="text-gray-600">Quantity: {catalogue.quantities.join(', ')}</p>
          )}
          {catalogue.stockInfo && (
            <p className="text-gray-600">Stock: {catalogue.stockInfo}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 mt-4">
          {isPending && (
            <button
              onClick={() => handleApproveCatalogue(catalogue.id)}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Approve Catalogue
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent modal from opening when clicking delete
              handleDeleteCatalogue(catalogue.id, isPending);
            }}
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
        <h2 className="text-2xl font-bold mb-4">Pending Catalogues</h2>
        {pendingCatalogues.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {pendingCatalogues.map((catalogue) => (
              <CatalogueCard key={catalogue.id} catalogue={catalogue} isPending={true} />
            ))}
          </div>
        ) : (
          <p>No pending catalogues.</p>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">All Approved Catalogues</h2>
        {allCatalogues.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {allCatalogues.map((catalogue) => (
              <CatalogueCard key={catalogue.id} catalogue={catalogue} isPending={false} />
            ))}
          </div>
        ) : (
          <p>No approved catalogues.</p>
        )}
      </section>

      {/* Modal */}
      <IndividualCatalogueModal
        catalogue={selectedCatalogue}
        seller={selectedCatalogue ? sellers[selectedCatalogue.uid] : null}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCatalogue(null);
        }}
      />
    </div>
  );
};

export default AllCatalogues;
