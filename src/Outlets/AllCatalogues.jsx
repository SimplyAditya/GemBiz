import React, { useEffect, useState } from "react";
import axios from "axios";

const AllCatalogues = () => {
  const [pendingCatalogues, setPendingCatalogues] = useState([]);
  const [allCatalogues, setAllCatalogues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // TODO: Update these API URLs when provided
  const PENDING_CATALOGUES_API_URL = "https://gem-biz.onrender.com/fetch-pending-business-catalogues"; // Placeholder
  const ALL_CATALOGUES_API_URL = "https://gem-biz.onrender.com/fetch-all-business-catalogues"; // Placeholder
  const APPROVE_CATALOGUE_API_URL = "https://gem-biz.onrender.com/approve-business-catalogue"; // Placeholder

  useEffect(() => {
    const fetchCatalogues = async () => {
      setIsLoading(true);
      try {
        const [pendingResponse, allResponse] = await Promise.all([
          axios.get(PENDING_CATALOGUES_API_URL),
          axios.get(ALL_CATALOGUES_API_URL),
        ]);

        if (pendingResponse.status === 200) {
          setPendingCatalogues(pendingResponse.data);
        }

        if (allResponse.status === 200) {
          const pendingCatalogueIds = new Set(pendingResponse.data.map(cat => cat.id));
          const filteredAllCatalogues = allResponse.data.filter(cat => !pendingCatalogueIds.has(cat.id));
          setAllCatalogues(filteredAllCatalogues);
        }
      } catch (error) {
        console.error("Error fetching catalogues:", error);
        // Set empty arrays on error to prevent issues with .map
        setPendingCatalogues([]);
        setAllCatalogues([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCatalogues();
  }, []);

  const handleApproveCatalogue = async (catalogueId) => {
    try {
      const response = await axios.post(APPROVE_CATALOGUE_API_URL, { id: catalogueId });
      if (response.status === 200) {
        const approvedCatalogue = pendingCatalogues.find(cat => cat.id === catalogueId);
        if (approvedCatalogue) {
          setPendingCatalogues(prev => prev.filter(cat => cat.id !== catalogueId));
          setAllCatalogues(prev => [...prev, { ...approvedCatalogue, approved: true }]); // Assuming 'approved' field
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

  // TODO: Update card structure based on actual catalogue data fields
  const CatalogueCard = ({ catalogue, isPending }) => (
    <div className="p-4 border rounded shadow-md bg-white hover:shadow-lg transition-shadow">
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold text-gray-800">{catalogue.name || "Catalogue Name"}</h3>
          <span className={`px-2 py-1 text-xs rounded-full ${
            !isPending ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
          }`}>
            {!isPending ? 'Approved' : 'Pending'}
          </span>
        </div>
        <p className="text-sm text-gray-600">ID: {catalogue.id}</p>
        {/* Add more catalogue details here */}
        {isPending && (
          <button
            onClick={() => handleApproveCatalogue(catalogue.id)}
            className="mt-2 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Approve
          </button>
        )}
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
    </div>
  );
};

export default AllCatalogues;
