import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = ({ transparent = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleDashboard = () => {
    navigate(user?.role === "volunteer" ? "/volunteer" : "/dashboard");
  };

  const navClass = transparent
    ? "absolute top-0 left-0 right-0 z-50 bg-white/5 backdrop-blur-xl border-b border-white/10 px-6 md:px-12 py-4 flex justify-between items-center transition-all duration-300"
    : "bg-white border-b border-slate-100 px-6 md:px-12 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm transition-all duration-300";

  const logoClass = transparent
    ? "text-2xl font-black tracking-tighter text-white flex items-center gap-2"
    : "text-2xl font-black tracking-tighter text-slate-900 flex items-center gap-2";

  return (
    <nav className={navClass}>
      <div className="flex items-center gap-8">
        <Link to="/" className={logoClass}>
          <div className="w-10 h-10 bg-red-900 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
            <span className="text-white text-xl">S</span>
          </div>
          <span className="hidden sm:block">SOSync</span>
        </Link>
        
        {user && (
          <div className="hidden md:flex items-center gap-6">
            <button 
              onClick={handleDashboard}
              className={`text-xs font-black uppercase tracking-widest hover:text-red-900 transition-colors ${transparent ? 'text-white/70' : 'text-slate-500'}`}
            >
              Dashboard
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <div className="hidden sm:flex flex-col items-end mr-2 text-right">
              <span className={`text-xs font-black ${transparent ? 'text-white' : 'text-slate-900'}`}>{user.name}</span>
              <span className={`text-[10px] font-black uppercase tracking-[0.1em] ${transparent ? 'text-white/60' : 'text-red-900'}`}>
                {user.role === 'volunteer' ? 'Verified Responder' : 'Citizen Member'}
              </span>
            </div>
            
            <button
              onClick={handleDashboard}
              className={`p-2.5 px-4 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all duration-200 flex items-center gap-2 ${
                transparent 
                  ? 'bg-white/10 text-white hover:bg-white/20 border border-white/10' 
                  : 'bg-slate-50 text-slate-500 hover:bg-red-50 hover:text-red-900 border border-slate-100'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>
              </svg>
              <span className="hidden lg:block">Dashboard</span>
            </button>

            <button
              onClick={handleLogout}
              className={`px-5 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all duration-200 ${
                transparent 
                  ? 'bg-white/10 text-white hover:bg-white/20 border border-white/10' 
                  : 'bg-slate-50 text-slate-500 hover:bg-red-50 hover:text-red-900 border border-slate-100'
              }`}
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="px-6 py-2.5 bg-red-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-700 shadow-lg shadow-red-500/20 transition-all duration-200"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;