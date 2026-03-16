/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MapView from "../components/MapView";
import ChatBox from "../components/ChatBox";
import Navbar from "../components/Navbar";
import VideoCall from "../components/VideoCall";
import { useEmergency } from "../context/EmergencyContext";
import { useAuth } from "../context/AuthContext";
import { listenAcceptEmergency, listenLocationUpdates, listenResolveEmergency, emitResolveEmergency } from "../services/socketService";
import { formatEmergencyType} from "../utils/helpers";
import useLocation from "../hooks/useLocation";
import { Siren, X } from "lucide-react";

const EmergencyPage = () => {
  const { id } = useParams();
  const { currentEmergency, getEmergency, resolveEmergency } = useEmergency();
  const { user } = useAuth();
  const { latitude, longitude } = useLocation();
  const navigate = useNavigate();
  const [volunteerLocation, setVolunteerLocation] = useState(null);
  const [accepted, setAccepted] = useState(false);
  const [acceptedVolunteerId, setAcceptedVolunteerId] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  useEffect(() => {
    if (id && (!currentEmergency || currentEmergency._id !== id)) {
      getEmergency(id);
    }
  }, [id]);

  useEffect(() => {
    if (currentEmergency?.status === "accepted" || currentEmergency?.status === "resolved") {
      setAccepted(true);
    }
  }, [currentEmergency?.status]);

  useEffect(() => {
    const offAccept = listenAcceptEmergency((data) => {
      setAccepted(true);
      if (data?.volunteerId) setAcceptedVolunteerId(String(data.volunteerId));
      getEmergency(id);
    });
    const offLocation = listenLocationUpdates(() => {
      setVolunteerLocation({ lat: latitude, lng: longitude });
    });
    const offResolve = listenResolveEmergency((data) => {
      if (data.emergencyId === id) {
        getEmergency(id);
      }
    });
    return () => {
      offAccept();
      offLocation();
      offResolve();
    };
  }, []);

  const emergency = currentEmergency;

  if (!emergency) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="w-12 h-12 border-4 border-red-100 border-t-red-900 rounded-full animate-spin mb-4"></div>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Loading Mission Data...</p>
        </div>
      </div>
    );
  }

  const emergencyLat = emergency.location?.coordinates?.[1];
  const emergencyLng = emergency.location?.coordinates?.[0];
  const userLoc = latitude && longitude ? { lat: latitude, lng: longitude } : null;
  const emergencyLoc = emergencyLat && emergencyLng ? { lat: emergencyLat, lng: emergencyLng } : null;

  const rawVolunteerId = typeof emergency.volunteerId === "object" ? emergency.volunteerId?._id : emergency.volunteerId;
  const targetId = user?.role === "volunteer"
      ? (typeof emergency.userId === "object" ? emergency.userId?._id : emergency.userId)
      : (rawVolunteerId || acceptedVolunteerId);

  const handleResolve = async () => {
    if (!window.confirm("Mark as resolved?")) return;
    try {
      await resolveEmergency(id);
      
      // Notify the user via socket
      const userId = typeof emergency.userId === "object" ? emergency.userId?._id : emergency.userId;
      emitResolveEmergency({ userId, emergencyId: id });

      navigate(user?.role === "volunteer" ? "/volunteer" : "/dashboard");
    } catch (err) {
      window.alert("Failed to update status.");
    }
  };

  const reportingUser = typeof emergency.userId === "object" ? emergency.userId : null;

  return (
    <div className="min-h-screen bg-slate-50 overflow-auto">
      <Navbar />
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Status Header */}
        <div className="bg-red-900 rounded-[2.5rem] p-8 shadow-2xl shadow-red-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full -mr-20 -mt-20"></div>
          
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-red-600 shadow-xl">
                <Siren size={32} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-black text-white tracking-tight">
                    {formatEmergencyType(emergency.type)}
                  </h1>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/20">
                    {emergency.status}
                  </span>
                </div>
                <p className="text-white/80 text-sm font-bold italic opacity-90 max-w-xl">
                  "{emergency.description || 'Crisis Coordination active.'}"
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {accepted && user?.role === "user" && emergency.status !== "resolved" && (
                <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                  <div>
                    <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">Unit Status</p>
                    <p className="text-xs font-black text-white uppercase">In Route</p>
                  </div>
                </div>
              )}

              {user?.role === "volunteer" && (
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowUserDetails(true)}
                    className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/30 transition-all active:scale-95"
                  >
                    View User Details
                  </button>
                  {emergency.status !== "resolved" && (
                    <button
                      onClick={handleResolve}
                      className="bg-white text-red-900 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 shadow-xl transition-all active:scale-95"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Details Modal */}
        {showUserDetails && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowUserDetails(false)}></div>
            <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
              <div className="bg-red-900 p-8 text-white relative">
                <h2 className="text-xl font-black uppercase tracking-tight">Citizen Details</h2>
                <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mt-1">Verified Identity Record</p>
                <button 
                  onClick={() => setShowUserDetails(false)}
                  className="absolute top-8 right-8 w-8 h-8 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-10 space-y-8">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</p>
                  <p className="text-xl font-black text-slate-900">{reportingUser?.name || "Unknown User"}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</p>
                  <p className="text-xl font-black text-red-900">{reportingUser?.phone || "No phone provided"}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mission Coordinates</p>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase">Latitude</p>
                      <p className="text-sm font-black text-slate-700">{emergencyLat?.toFixed(6)}</p>
                    </div>
                    <div className="w-px h-8 bg-slate-200"></div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase">Longitude</p>
                      <p className="text-sm font-black text-slate-700">{emergencyLng?.toFixed(6)}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowUserDetails(false)}
                  className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all active:scale-[0.98]"
                >
                  Dismiss Record
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Map Section */}
          <div className="lg:col-span-2 relative group">
            <MapView
              userLocation={userLoc}
              emergencyLocation={emergencyLoc}
              volunteers={
                volunteerLocation
                  ? [{
                      _id: "vol",
                      location: { coordinates: [volunteerLocation.lng, volunteerLocation.lat] },
                      name: "Volunteer",
                    }]
                  : []
              }
              className="h-full w-full"
            />
            <div className="absolute top-8 left-8 z-[1000] bg-white/95 backdrop-blur-xl px-4 py-2 rounded-2xl shadow-xl border border-slate-100">
              <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <div className="w-2 h-2 bg-red-900 rounded-full animate-pulse"></div>
                Mission Map
              </span>
            </div>
          </div>

          {/* Chat Section */}
          <div className="h-full">
            <ChatBox
              emergencyId={id}
              senderId={user?._id}
              targetId={targetId}
            />
          </div>
        </div>

        {/* Video Call Capability */}
        {targetId && (
          <VideoCall 
            targetId={targetId} 
            userId={user?._id} 
            userName={user?.name} 
          />
        )}
      </div>
    </div>
  );
};

export default EmergencyPage;