import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import EmergencyCard from "../components/EmergencyCard";
import { useEmergency } from "../context/EmergencyContext";
import { useAuth } from "../context/AuthContext";
import {
  listenEmergencyAlerts,
  emitAcceptEmergency,
  listenConnectionStatus,
  isSocketConnected,
} from "../services/socketService";
import { useNavigate } from "react-router-dom";

const VolunteerDashboard = () => {
  const { acceptEmergency } = useEmergency();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingEmergencies, setPendingEmergencies] = useState([]);
  const [accepting, setAccepting] = useState(null);
  const [socketConnected, setSocketConnected] = useState(isSocketConnected());

  // Track live socket connection state
  useEffect(() => {
    const off = listenConnectionStatus(
      () => setSocketConnected(true),
      () => setSocketConnected(false),
    );
    return off;
  }, []);

  useEffect(() => {
    // listenEmergencyAlerts returns a cleanup fn — prevents duplicate listeners on re-mount
    const off = listenEmergencyAlerts((data) => {
      setPendingEmergencies((prev) => {
        // Avoid duplicates
        if (prev.find((a) => a.emergencyId === data.emergencyId)) return prev;
        return [data, ...prev];
      });
    });
    return off;
  }, []);

  const handleAccept = async (emergencyAlert) => {
    setAccepting(emergencyAlert.emergencyId);
    try {
      await acceptEmergency(emergencyAlert.emergencyId);
      // Notify the user's socket room (backend HTTP handler also does this, belt-and-suspenders)
      emitAcceptEmergency({
        userId: emergencyAlert.userId,
        volunteerId: user._id,
        emergencyId: emergencyAlert.emergencyId,
      });
      // Remove from pending list so other volunteers no longer see it
      setPendingEmergencies((prev) =>
        prev.filter((a) => a.emergencyId !== emergencyAlert.emergencyId)
      );
      navigate(`/emergency/${emergencyAlert.emergencyId}`);
    } catch (err) {
      window.alert("Failed to accept emergency: " + (err.response?.data?.message || err.message));
    } finally {
      setAccepting(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="p-8 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">Active Emergencies</h1>
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${
              socketConnected
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-600"
            }`}
          >
            {socketConnected ? "● Live" : "● Disconnected"}
          </span>
        </div>
        <p className="text-gray-500 mb-6">
          {pendingEmergencies.length === 0
            ? "Listening for nearby emergency alerts..."
            : `${pendingEmergencies.length} alert(s) received`}
        </p>
        {pendingEmergencies.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-4">🔔</p>
            <p>No active emergencies nearby.</p>
            <p className="text-sm mt-1">You will be notified when someone needs help.</p>
          </div>
        ) : (
          pendingEmergencies.map((alert) => (
            <div key={alert.emergencyId} className="relative">
              {accepting === alert.emergencyId && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-xl z-10">
                  <span className="text-red-600 font-semibold">Accepting...</span>
                </div>
              )}
              <EmergencyCard
                emergency={{
                  _id: alert.emergencyId,
                  type: alert.type,
                  status: "pending",
                  description: alert.description,
                  createdAt: alert.createdAt,
                }}
                onAccept={() => handleAccept(alert)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VolunteerDashboard;
