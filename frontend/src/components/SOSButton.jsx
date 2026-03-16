import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEmergency } from "../context/EmergencyContext";
import useLocation from "../hooks/useLocation";
import { Siren } from "lucide-react";

const EMERGENCY_TYPES = ["medical", "fire", "accident", "crime"];

const SOSButton = () => {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("medical");
  const { triggerEmergency } = useEmergency();
  const { latitude, longitude, loading: locLoading } = useLocation();
  const navigate = useNavigate();

  const handleSOS = async () => {
    if (locLoading) return;
    if (!latitude || !longitude) {
      alert("Location unavailable. Please enable location access.");
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
      alert(err.response?.data?.message || "Failed to trigger SOS.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto">
      <div className="w-full mb-10">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 text-center">
          Emergency Category
        </label>
        <div className="grid grid-cols-2 gap-3">
          {EMERGENCY_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`py-4 px-4 rounded-2xl text-[11px] font-black uppercase tracking-wider border-2 transition-all duration-200 ${
                type === t
                  ? "border-red-900 bg-red-50 text-red-900 shadow-sm"
                  : "border-slate-100 bg-white text-slate-400 hover:border-slate-200 hover:text-slate-600"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="relative group">
        {/* Soft Glow - Light Red instead of Black */}
        <div className="absolute -inset-4 bg-red-100 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition duration-500"></div>
        
        <button
          onClick={handleSOS}
          disabled={loading || locLoading}
          className="relative bg-white text-red-900 w-52 h-52 rounded-full shadow-[0_20px_50px_rgba(220,38,38,0.15)] flex flex-col items-center justify-center border-[12px] border-slate-50 hover:border-red-50 hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-60"
        >
          {loading ? (
            <div className="w-12 h-12 border-4 border-red-100 border-t-red-900 rounded-full animate-spin"></div>
          ) : (
            <>
              <div className="w-20 h-20 bg-red-900 rounded-full flex items-center justify-center text-white mb-2 shadow-lg shadow-red-500/40">
                <Siren size={48} />
              </div>
              <span className="text-3xl font-black tracking-tighter text-slate-900 uppercase">SOS</span>
            </>
          )}
        </button>
      </div>

      <div className="mt-10 text-center">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-500 ${locLoading ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
          {locLoading ? (
            <>
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></span>
              <span className="text-[10px] font-black uppercase tracking-widest">Gps Syncing...</span>
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              <span className="text-[10px] font-black uppercase tracking-widest">Signal Ready</span>
            </>
          )}
        </div>
        <p className="text-[10px] text-slate-400 mt-4 font-bold uppercase tracking-tight leading-relaxed max-w-[220px] mx-auto">
          One-tap immediate broadcast to all local response units
        </p>
      </div>
    </div>
  );
};

export default SOSButton;