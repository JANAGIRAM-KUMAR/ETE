import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await login(formData);
      const role = response.user?.role;
      navigate(role === "volunteer" ? "/volunteer" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white overflow-auto">
      {/* Branding Section */}
      <div className="hidden md:flex md:w-1/2 bg-red-600 items-center justify-center p-12 text-white">
        <div className="max-w-md">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-red-600 text-3xl font-black mb-8 shadow-2xl shadow-red-900/20">
            E
          </div>
          <h1 className="text-5xl font-extrabold mb-6 tracking-tight">ETE Network</h1>
          <p className="text-xl font-light mb-10 opacity-90 leading-relaxed">
            A specialized platform for real-time emergency response and citizen coordination.
          </p>
          <div className="space-y-4">
            {["Live emergency tracking", "Smart responder dispatch", "Direct crisis communication"].map((text, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>
                <p className="text-lg font-medium opacity-80">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-slate-50/50">
        <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100">
          <div className="text-center">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Sign In</h2>
            <p className="mt-2 text-slate-500 font-medium">Access your safety dashboard</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-red-700 text-sm font-bold flex items-center gap-2">
              <span className="text-lg">⚠️</span> {error}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                <input
                  type="email"
                  required
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-red-100 focus:border-red-500 transition-all outline-none font-medium text-slate-700"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
                <input
                  type="password"
                  required
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-red-100 focus:border-red-500 transition-all outline-none font-medium text-slate-700"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl shadow-xl shadow-red-500/30 text-lg font-black transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-slate-500 font-medium pt-2">
            New here?{" "}
            <Link to="/register" className="font-black text-red-600 hover:text-red-700 underline-offset-4 hover:underline">
              Join the network
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;