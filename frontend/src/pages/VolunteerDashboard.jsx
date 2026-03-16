import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import EmergencyCard from "../components/EmergencyCard";
import MapView from "../components/MapView";
import { useEmergency } from "../context/EmergencyContext";
import { useAuth } from "../context/AuthContext";
import useLocation from "../hooks/useLocation";
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
  const { latitude, longitude } = useLocation();
  const navigate = useNavigate();
  const [pendingEmergencies, setPendingEmergencies] = useState([]);
  const [accepting, setAccepting] = useState(null);
  const [socketConnected, setSocketConnected] = useState(isSocketConnected());

  useEffect(() => {
    const off = listenConnectionStatus(
      () => setSocketConnected(true),
      () => setSocketConnected(false),
    );
    return off;
  }, []);

  useEffect(() => {
    const off = listenEmergencyAlerts((data) => {
      setPendingEmergencies((prev) => {
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
      emitAcceptEmergency({
        userId: emergencyAlert.userId,
        volunteerId: user._id,
        emergencyId: emergencyAlert.emergencyId,
      });
      setPendingEmergencies((prev) =>
        prev.filter((a) => a.emergencyId !== emergencyAlert.emergencyId)
      );
      navigate(`/emergency/${emergencyAlert.emergencyId}`);
    } catch (err) {
      window.alert("Failed to accept emergency.");
    } finally {
      setAccepting(null);
    }
  };

  const userLoc = latitude && longitude ? { lat: latitude, lng: longitude } : null;

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      <Navbar />
      
      <div className="flex-1 flex flex-col md:flex-row p-6 gap-6 overflow-hidden">
        {/* Alerts Sidebar */}
        <div className="w-full md:w-[420px] flex flex-col bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 overflow-hidden border border-slate-100 shrink-0">
          <div className="p-8 border-b border-slate-50 bg-white">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Active Queue</h1>
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-tighter ${
                socketConnected ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${socketConnected ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}></div>
                {socketConnected ? "Live Connection" : "Offline"}
              </div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-relaxed">
              Real-time synchronization active
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-50/30">
            {pendingEmergencies.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-10">
                <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center text-4xl mb-6 shadow-xl shadow-slate-200/50 border border-slate-50">
                  📡
                </div>
                <p className="font-black text-slate-800 text-lg tracking-tight">Monitoring Signal...</p>
                <p className="text-[11px] font-bold text-slate-400 mt-2 leading-relaxed uppercase tracking-widest text-center">
                  Waiting for priority alerts in your radius
                </p>
              </div>
            ) : (
              pendingEmergencies.map((alert) => (
                <div key={alert.emergencyId} className="relative transition-all duration-300">
                  {accepting === alert.emergencyId && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center rounded-[2rem] z-10">
                       <div className="w-10 h-10 border-4 border-red-100 border-t-red-600 rounded-full animate-spin"></div>
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
          
          <div className="p-8 bg-red-600 text-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-xl backdrop-blur-md text-white">
                🛡️
              </div>
              <div>
                <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-0.5">Verified Responder</p>
                <p className="text-sm font-black tracking-tight">{user?.name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative group">
          <MapView 
            userLocation={userLoc} 
            className="h-full w-full"
          />
          
          <div className="absolute top-8 left-8 z-[1000] bg-white/95 backdrop-blur-xl p-5 rounded-2xl shadow-2xl border border-slate-100 max-w-[260px]">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2.5 ml-1 text-center">Current Coordinates</p>
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="text-lg">📍</div>
              <p className="text-xs font-black text-slate-700 tracking-tighter">
                {latitude?.toFixed(5)} , {longitude?.toFixed(5)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;