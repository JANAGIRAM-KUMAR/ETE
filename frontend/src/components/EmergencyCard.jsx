import React from "react";
import { formatEmergencyType, formatDate } from "../utils/helpers";

const EmergencyCard = ({ emergency, onAccept }) => {
  if (!emergency) return null;

  const typeColors = {
    medical: "text-blue-600 bg-blue-50 border-blue-100",
    fire: "text-orange-600 bg-orange-50 border-orange-100",
    accident: "text-red-900 bg-red-50 border-red-100",
    crime: "text-slate-700 bg-slate-50 border-slate-200",
  };

  const statusColors = {
    pending: "text-amber-600 bg-amber-50 border-amber-200",
    accepted: "text-blue-600 bg-blue-50 border-blue-200",
    resolved: "text-emerald-600 bg-emerald-50 border-emerald-200",
  };

  return (
    <div className="w-full bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${typeColors[emergency.type] || typeColors.accident}`}>
            {formatEmergencyType(emergency.type)}
          </div>
          <div className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-tighter ${statusColors[emergency.status]}`}>
            ● {emergency.status}
          </div>
        </div>

        <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight tracking-tight">
          Emergency Dispatch
        </h3>
        
        {emergency.description && (
          <p className="text-sm text-slate-500 mb-5 font-medium leading-relaxed italic opacity-80">
            "{emergency.description}"
          </p>
        )}

        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
          <svg className="w-3.5 h-3.5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {formatDate(emergency.createdAt)}
        </div>

        {emergency.status === "pending" && onAccept && (
          <button
            onClick={onAccept}
            className="w-full bg-red-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-500/25 hover:bg-red-700 hover:shadow-red-500/40 transition-all active:scale-[0.97]"
          >
            Accept Mission
          </button>
        )}
        
        {emergency.status === "accepted" && (
          <div className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-center bg-blue-50 text-blue-600 border border-blue-100">
            Assigned to You
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyCard;