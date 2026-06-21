import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "../components/Navbar";

const Dashboard = () => {
  const location = useLocation();
  const isReportPage = location.pathname.includes("/report");

  return (
    <div className="w-full min-h-screen">
      <main>
        <Outlet />
      </main>
      {!isReportPage && <Navbar />}
    </div>
  );
};

export default Dashboard;
