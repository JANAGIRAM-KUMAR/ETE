import React from "react";

const Navbar = () => {
  return (
    <nav className="bg-gradient-to-r from-red-600 to-red-400 px-10 py-4 flex justify-between items-center text-white shadow-md">
      
      <h2 className="text-xl font-semibold">
        🚑 Smart Emergency Network
      </h2>

      <div className="flex gap-3">
        <button className="px-4 py-2 rounded-lg font-semibold bg-white text-red-600 hover:bg-gray-100 transition">
          Dashboard
        </button>

        <button className="px-4 py-2 rounded-lg font-semibold bg-white text-red-600 hover:bg-gray-100 transition">
          Logout
        </button>
      </div>

    </nav>
  );
};

export default Navbar;