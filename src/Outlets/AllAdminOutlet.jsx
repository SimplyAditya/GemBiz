import React, { useState } from "react";
import { FaTrash } from "react-icons/fa";
import CreateNewAdmin from "../components/createNewAdmin";

const AllAdminOutlet = () => {
  const adminUsers = JSON.parse(localStorage.getItem("adminUsers")) || [];
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateNewAdmin = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">All Admin Users</h1>
        <button
          onClick={handleCreateNewAdmin}
          className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md"
        >
          Create New Admin
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {adminUsers.map((user, index) => (
          <div
            key={user.id}
            className="p-4 border rounded shadow-md bg-white flex flex-col space-y-2"
          >
            <h2 className="text-lg font-semibold">{user.name}</h2>
            <p className="text-sm text-gray-600">{user.email}</p>
            <div className="flex justify-between items-center">
              <p className="text-sm text-green-600 font-semibold">Status: Active</p>
              <button
                onClick={() => {
                  const updatedUsers = [...adminUsers];
                  updatedUsers.splice(index, 1);
                  localStorage.setItem("adminUsers", JSON.stringify(updatedUsers));
                  window.location.reload(); // Refresh to reflect changes
                }}
                className="text-red-500 hover:text-red-600"
              >
                <FaTrash className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <CreateNewAdmin isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
};

export default AllAdminOutlet;
