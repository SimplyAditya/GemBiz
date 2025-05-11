import React from 'react';

import { Outlet } from "react-router-dom";
import Header from "../components/Header";

const Home = () => {
  return (
    <div className="min-h-screen w-screen flex flex-col bg-gray-100">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );
};

export default Home;
