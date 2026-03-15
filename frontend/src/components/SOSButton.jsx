import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEmergency } from "../context/EmergencyContext";
import useLocation from "../hooks/useLocation";

const EMERGENCY_TYPES = ["medical", "fire", "accident", "crime"];

const SOSButton = () => {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("medical");
  const { triggerEmergency } = useEmergency();
  const { latitude, longitude, loading: locLoading } = useLocation();
  const navigate = useNavigate();

  const handleSOS = async () => {
    if (locLoading) {
      alert("Getting your location, please wait...");
      return;
    }
    if (!latitude || !longitude) {
      alert("Location unavailable. Please enable location access in your browser.");
      return;
    }
    setLoading(true);
    try {
      const emergency = await triggerEmergency({
        type,
        latitude,
        longitude,
        description: `${type} emergency triggered`,
      });
      navigate(`/emergency/${emergency._id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to trigger SOS. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center mt-9">
      <div className="mb-4">
        <label className="block text-gray-600 mb-2 font-semibold">Emergency Type</label>
        <select
          className="p-3 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-red-400"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          {EMERGENCY_TYPES.map((t) => (
            <option key={t} value={t}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={handleSOS}
        disabled={loading || locLoading}
        className="bg-gradient-to-br from-red-500 to-red-700 text-white text-2xl font-bold px-20 py-5 rounded-full shadow-xl shadow-red-500/40 hover:scale-110 transition-transform duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Sending SOS..." : "🚨 SOS"}
      </button>
      <p className="text-gray-500 text-lg mt-3">
        {locLoading ? "Acquiring location..." : "Press in case of emergency"}
      </p>
    </div>
  );
};

export default SOSButton;
