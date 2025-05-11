import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const DashboardOutlet = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [adminUsers, setAdminUsers] = useState([]);

  const fetchAdminUsers = async () => {
    try {
      const response = await axios.get(
        "https://gem-biz.onrender.com/fetch-admins"
      );
      if (response.status === 200) {
        setAdminUsers(response.data);
        localStorage.setItem("adminUsers", JSON.stringify(response.data));
      }
    } catch (error) {
      console.error("Error fetching admin users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  const handleViewAll = () => {
    navigate("/dashboard/viewalladmin");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen max-w-screen">
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
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold ">Admin Users</h1>
        <button
          onClick={handleViewAll}
          className=" bg-black hover:bg-gray-800 text-white py-2 px-4 rounded-md"
        >
          View All
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {adminUsers.slice(0, 2).map((user) => (
          <div
            key={user.id}
            className="p-4 border rounded shadow-md bg-white flex flex-col"
          >
            <h2 className="text-lg font-semibold">{user.name}</h2>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardOutlet;
