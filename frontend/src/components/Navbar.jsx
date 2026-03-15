import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleDashboard = () => {
    navigate(user?.role === "volunteer" ? "/volunteer" : "/dashboard");
  };

  return (
    <nav className="bg-gradient-to-r from-red-600 to-red-400 px-10 py-4 flex justify-between items-center text-white shadow-md">
      <h2 className="text-xl font-semibold cursor-pointer" onClick={handleDashboard}>
        🚑 Smart Emergency Network
      </h2>
      <div className="flex items-center gap-4">
        {user && (
          <span className="text-sm font-medium opacity-80 hidden sm:block">
            {user.name} &bull; {user.role}
          </span>
        )}
        <button
          onClick={handleDashboard}
          className="px-4 py-2 rounded-lg font-semibold bg-white text-red-600 hover:bg-gray-100 transition"
        >
          Dashboard
        </button>
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-lg font-semibold bg-white text-red-600 hover:bg-gray-100 transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
