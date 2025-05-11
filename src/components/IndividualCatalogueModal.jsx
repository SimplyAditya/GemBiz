import React, { useState } from "react";
import { FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa";

const IndividualCatalogueModal = ({ catalogue, seller, isOpen, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!isOpen) return null;

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === catalogue.imageUrls.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? catalogue.imageUrls.length - 1 : prev - 1
    );
  };

  return (
    <div 
      className="fixed inset-0 bg-transparent backdrop-blur-xs z-50 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-xl max-w-4xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <FaTimes size={24} />
        </button>

        <div className="relative mb-6 aspect-video">
          {catalogue.imageUrls && catalogue.imageUrls.length > 0 && (
            <>
              <img
                src={catalogue.imageUrls[currentImageIndex]}
                alt={`Product ${currentImageIndex + 1}`}
                className="w-full h-[400px] object-contain rounded-lg"
              />
              {catalogue.imageUrls.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full"
                  >
                    <FaChevronLeft />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full"
                  >
                    <FaChevronRight />
                  </button>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {catalogue.imageUrls.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <div className="space-y-6">
          {seller && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-gray-900">{seller.name}</h3>
              <p className="text-gray-600">@{seller.user_name}</p>
            </div>
          )}

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{catalogue.name}</h2>
            <p className="text-gray-700">{catalogue.description}</p>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold text-gray-900">₹{catalogue.sellingPrice}</span>
            {catalogue.mrp && catalogue.mrp !== catalogue.sellingPrice && (
              <span className="text-lg text-gray-500 line-through">₹{catalogue.mrp}</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {catalogue.sizes && catalogue.sizes.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900">Available Sizes</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  {catalogue.sizes.map((size, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                      {size}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {catalogue.quantities && catalogue.quantities.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900">Quantity Options</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  {catalogue.quantities.map((qty, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                      {qty}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {catalogue.stockInfo && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900">Stock Information</h4>
              <p className="text-gray-700">{catalogue.stockInfo}</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">Status:</span>
              <span className={`px-3 py-1 rounded-full text-sm ${
                catalogue.itemStatus === 'accepted' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {catalogue.itemStatus}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndividualCatalogueModal;
