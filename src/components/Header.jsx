import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("User");
  const getName =async () => {
    const name =await localStorage.getItem("username");
    setName(name);
  }
  useEffect(() => {
    getName();
  },[]);
  const handleLogout = () => {
    localStorage.setItem("isLoggedIn", "false");
    navigate("/login");
  };

  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <div className="text-xl font-bold">GemBiz</div>
      <div className="flex items-center space-x-4">
        <span>{name}</span>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
