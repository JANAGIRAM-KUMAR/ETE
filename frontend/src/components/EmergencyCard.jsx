import React from "react";

const EmergencyCard = ({ emergency }) => {
  if (!emergency) return null;

  return (
    <div className="w-[420px] mx-auto mt-8 p-6 rounded-xl bg-white shadow-lg border-l-4 border-red-600 font-sans">

      <h2 className="text-red-600 text-xl font-bold mb-3">
        🚨 Emergency Alert
      </h2>

      <p className="text-base mb-1">
        <b>Type:</b> {emergency.type}
      </p>

      <p className="text-base mb-1">
        <b>Status:</b> {emergency.status}
      </p>

      <p className="text-base mb-3">
        <b>Location:</b> {emergency.location || "Nearby area"}
      </p>

      <button
        className="mt-2 bg-gradient-to-r from-red-500 to-red-700 text-white px-5 py-3 rounded-lg font-semibold text-sm shadow-md hover:scale-105 transition transform"
      >
        Accept Emergency
      </button>

    </div>
  );
};

export default EmergencyCard;