import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const DashboardOutlet = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [adminUsers, setAdminUsers] = useState([]);
  const [summaryCounts, setSummaryCounts] = useState(null);

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

  const fetchSummaryCounts = async () => {
    try {
      const response = await axios.get(
        "https://gem-biz.onrender.com/fetch-summary-counts"
      );
      if (response.status === 200) {
        setSummaryCounts(response.data);
      }
    } catch (error) {
      console.error("Error fetching summary counts:", error);
    }
  };

  useEffect(() => {
    fetchAdminUsers();
    fetchSummaryCounts();
  }, []);

  const handleViewAll = () => {
    navigate("/dashboard/viewalladmin");
  };

  if (isLoading || !summaryCounts) {
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

  const chartData = [
    {
      title: "Total Sellers",
      data: summaryCounts.bregisterbusiness,
    },
    {
      title: "Total Catalogues",
      data: summaryCounts.bbusinesscatalogue,
    },
    {
      title: "Total Categories",
      data: summaryCounts.businesscategories,
    },
  ];

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
      <div className="mt-8 block md:flex md:flex-wrap md:justify-between">
        {chartData.map((chart, index) => {
          const routeMap = {
            "Total Sellers": "/dashboard/fetchallsellers",
            "Total Catalogues": "/dashboard/fetchtotalcatalogues",
            "Total Categories": "/dashboard/fetchtotalcategories",
          };
          const route = routeMap[chart.title];

          return (
            <div
              key={index}
              className="w-full md:w-[30%] p-4 border rounded-lg shadow-md bg-white mb-6 md:mb-0 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => route && navigate(route)}
            >
              <h2 className="text-lg font-semibold mb-4 text-center">{chart.title}</h2>
              <div className="relative w-full aspect-square max-w-[250px] mx-auto">
                <Pie
                  data={{
                    labels: ["Total", "Pending"],
                    datasets: [
                      {
                        data: [chart.data.total, chart.data.pending],
                        backgroundColor: index === 0
                          ? ["#3B82F6", "#93C5FD"] // Blue theme
                          : index === 1
                          ? ["#10B981", "#6EE7B7"] // Green theme
                          : ["#8B5CF6", "#C4B5FD"], // Purple theme
                        hoverBackgroundColor: index === 0
                          ? ["#2563EB", "#60A5FA"]
                          : index === 1
                          ? ["#059669", "#34D399"]
                          : ["#7C3AED", "#A78BFA"],
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                      legend: {
                        position: "bottom",
                        labels: {
                          boxWidth: 12,
                          padding: 10,
                          font: {
                            size: 12
                          }
                        }
                      },
                    },
                  }}
                />
              </div>
              <div className="mt-4 text-center text-sm">
                <div className="text-gray-600">Total: {chart.data.total}</div>
                <div className="text-gray-600">Pending: {chart.data.pending}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardOutlet;
