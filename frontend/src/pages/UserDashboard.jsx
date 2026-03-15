import React from "react";
import Navbar from "../components/Navbar";
import SOSButton from "../components/SOSButton";
import { useAuth } from "../context/AuthContext";

const UserDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-col items-center mt-16 px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-1">
          Welcome, {user?.name || "User"} 👋
        </h1>
        <p className="text-gray-500 mb-8">Your safety is our priority</p>
        <SOSButton />
      </div>
    </div>
  );
};

export default UserDashboard;
