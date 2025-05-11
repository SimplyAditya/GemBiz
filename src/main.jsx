import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import "./index.css";
import Login from "./screens/login.jsx";
import Home from "./screens/Home.jsx"; // Import the Home component
import DashboardOutlet from "./Outlets/DashboardOutlet.jsx";
import AllAdminOutlet from "./Outlets/AllAdminOutlet.jsx";
import AllSellers from "./Outlets/AllSellers.jsx";
import AllCatalogues from "./Outlets/AllCatalogues.jsx";
import AllCategories from "./Outlets/AllCategories.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/dashboard",
    element: <Home />,
    children: [
      {
        path: "home",
        element: <DashboardOutlet />,
      },
      {
        path: "viewalladmin",
        element: <AllAdminOutlet />,
      },
      {
        path: "fetchallsellers",
        element: <AllSellers />,
      },
      {
        path: "fetchtotalcatalogues",
        element: <AllCatalogues />,
      },
      {
        path: "fetchtotalcategories",
        element: <AllCategories />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
    <RouterProvider router={router} />
);
