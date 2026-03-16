import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import SOSButton from "../components/SOSButton";
import MapView from "../components/MapView";
import { useAuth } from "../context/AuthContext";
import useLocation from "../hooks/useLocation";
import { getNearbyVolunteers } from "../services/volunteerService";

const UserDashboard = () => {
  const { user } = useAuth();
  const { latitude, longitude } = useLocation();
  const [volunteers, setVolunteers] = useState([]);

  const fetchVolunteers = async () => {
    if (latitude && longitude) {
      try {
        const data = await getNearbyVolunteers(latitude, longitude);
        setVolunteers(data);
      } catch (error) {
        console.error("Error fetching nearby volunteers:", error);
      }
    }
  };

  useEffect(() => {
    fetchVolunteers();
    const interval = setInterval(fetchVolunteers, 15000);
    return () => clearInterval(interval);
  }, [latitude, longitude]);

  const userLoc = latitude && longitude ? { lat: latitude, lng: longitude } : null;

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      <Navbar />
      
      <div className="flex-1 flex flex-col md:flex-row p-6 gap-6 overflow-hidden">
        {/* Left Action Panel - Side-by-side layout */}
        <div className="w-full md:w-[420px] flex flex-col bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 p-10 border border-slate-100 shrink-0 overflow-y-auto custom-scrollbar">
          <div className="mb-12">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
              Welcome, <span className="text-red-600">{user?.name?.split(" ")[0] || "User"}</span>
            </h1>
            <div className="flex items-center gap-2 mt-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
                Protection Protocol Active
              </p>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col justify-center py-6">
            <SOSButton />
          </div>
          
          <div className="mt-12 grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Nearby Help</p>
              <div className="flex items-baseline gap-1">
                <p className="text-2xl font-black text-slate-900">{volunteers.length}</p>
                <p className="text-[10px] font-black text-emerald-600 uppercase">Units</p>
              </div>
            </div>
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Coordination</p>
              <p className="text-[11px] font-black text-slate-900 truncate">
                {latitude ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` : "Syncing..."}
              </p>
              <p className="text-[9px] font-black text-slate-300 uppercase mt-1">Gps Verified</p>
            </div>
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative group">
          <MapView 
            userLocation={userLoc} 
            volunteers={volunteers} 
            className="h-full w-full"
          />
          
          {/* Map Overlays */}
          <div className="absolute top-8 right-8 z-[1000] flex flex-col gap-4">
            <div className="bg-white/95 backdrop-blur-xl px-5 py-3 rounded-2xl shadow-2xl border border-slate-100 flex items-center gap-3">
              <div className="relative">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping absolute inset-0"></div>
                <div className="w-2.5 h-2.5 bg-red-600 rounded-full relative"></div>
              </div>
              <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Live Safety Monitor</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;