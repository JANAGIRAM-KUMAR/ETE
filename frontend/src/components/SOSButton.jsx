import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEmergency } from "../context/EmergencyContext";
import useLocation from "../hooks/useLocation";

const EMERGENCY_TYPES = ["medical", "fire", "accident", "crime"];

const SOSButton = () => {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("medical");
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [timer, setTimer] = useState(5);
  const audioRef = React.useRef(null);
  const { triggerEmergency } = useEmergency();
  const { latitude, longitude, loading: locLoading } = useLocation();
  const navigate = useNavigate();

  // Urgent pulsing alarm generator
  const startAlarmSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "square"; // Sharper, more urgent tone
      osc.frequency.value = 880; // High pitch
      
      // Frequency Modulation (Rapidly alternate between two notes)
      const fLfo = ctx.createOscillator();
      fLfo.type = "square";
      fLfo.frequency.value = 6; // 6 times per second
      const fLfoGain = ctx.createGain();
      fLfoGain.gain.value = 200; // Alternates between 680Hz and 1080Hz
      fLfo.connect(fLfoGain);
      fLfoGain.connect(osc.frequency);
      
      // Volume Modulation (Pulsing)
      const vLfo = ctx.createOscillator();
      vLfo.type = "square";
      vLfo.frequency.value = 6;
      const vLfoGain = ctx.createGain();
      vLfoGain.gain.value = 0.05;
      vLfo.connect(vLfoGain);
      vLfoGain.connect(gain.gain);
      
      // Base gain (volume)
      gain.gain.value = 0.05;

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      fLfo.start();
      vLfo.start();

      audioRef.current = { ctx, osc, fLfo, vLfo };
    } catch (e) {
      console.error("Audio not supported", e);
    }
  };

  const stopAlarmSound = () => {
    if (audioRef.current) {
      try {
        audioRef.current.osc.stop();
        audioRef.current.fLfo.stop();
        audioRef.current.vLfo.stop();
        audioRef.current.ctx.close();
      } catch (e) {}
      audioRef.current = null;
    }
  };

  // Handle SOS trigger - starts countdown
  const startSOSCountdown = () => {
    if (locLoading) return;
    if (!latitude || !longitude) {
      alert("Location unavailable. Please enable location access.");
      return;
    }
    setIsCountingDown(true);
    setTimer(5);
    startAlarmSound();
  };

  // Actual SOS trigger logic
  const executeSOS = async () => {
    stopAlarmSound();
    setIsCountingDown(false);
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

  const cancelSOS = () => {
    stopAlarmSound();
    setIsCountingDown(false);
    setTimer(5);
  };

  // Countdown logic
  React.useEffect(() => {
    let interval;
    if (isCountingDown && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (isCountingDown && timer === 0) {
      executeSOS(); // Automatically confirm if no action taken
    }
    return () => clearInterval(interval);
  }, [isCountingDown, timer]);

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto">
      {/* Countdown Overlay */}
      {isCountingDown && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <div className="bg-white rounded-[40px] p-10 w-full max-w-xs flex flex-col items-center shadow-2xl animate-in zoom-in duration-300">
            <div className="relative w-32 h-32 mb-8">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="60"
                  fill="transparent"
                  stroke="#f1f5f9"
                  strokeWidth="8"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="60"
                  fill="transparent"
                  stroke="#dc2626"
                  strokeWidth="8"
                  strokeDasharray={377}
                  strokeDashoffset={377 - (377 * timer) / 5}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-5xl font-black text-slate-900">{timer}</span>
              </div>
            </div>
            
            <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">Confirm SOS?</h3>
            <p className="text-slate-500 text-sm font-bold text-center mb-8 uppercase tracking-widest leading-relaxed">
              Dispatching help in {timer} seconds
            </p>

            <div className="flex flex-col w-full gap-3">
              <button
                onClick={executeSOS}
                className="w-full py-5 bg-red-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
              >
                Confirm Now
              </button>
              <button
                onClick={cancelSOS}
                className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-200 transition-colors"
              >
                Cancel SOS
              </button>
            </div>
          </div>
        </div>
      )}

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
                  ? "border-red-600 bg-red-50 text-red-600 shadow-sm"
                  : "border-slate-100 bg-white text-slate-400 hover:border-slate-200 hover:text-slate-600"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="relative group">
        <div className="absolute -inset-4 bg-red-100 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition duration-500"></div>
        
        <button
          onClick={startSOSCountdown}
          disabled={loading || locLoading || isCountingDown}
          className="relative bg-white text-red-600 w-52 h-52 rounded-full shadow-[0_20px_50px_rgba(220,38,38,0.15)] flex flex-col items-center justify-center border-[12px] border-slate-50 hover:border-red-50 hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-60"
        >
          {loading ? (
            <div className="w-12 h-12 border-4 border-red-100 border-t-red-600 rounded-full animate-spin"></div>
          ) : (
            <>
              <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center text-white text-4xl mb-2 shadow-lg shadow-red-500/40">
                🚨
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