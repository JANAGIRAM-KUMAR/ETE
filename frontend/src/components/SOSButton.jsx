import React from "react";

const SOSButton = () => {
  return (
    <div className="text-center mt-9">

      <button
        className="bg-gradient-to-br from-red-500 to-red-700 text-white text-2xl font-bold px-20 py-5 rounded-full shadow-xl shadow-red-500/40 hover:scale-110 transition-transform duration-300"
      >
        🚨 SOS
      </button>

      <p className="text-gray-500 text-lg mt-3">
        Press in case of emergency
      </p>

    </div>
  );
};

export default SOSButton;