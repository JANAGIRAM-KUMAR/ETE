import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-10">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-red-900 rounded-2xl flex items-center justify-center text-white text-3xl font-black mb-6 shadow-lg shadow-red-200">
            S
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back</h1>
          <p className="text-slate-500 font-medium text-center mt-2">
            Login to SOSync to manage emergency alerts.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-red-700 text-sm font-bold flex items-center gap-2 mb-8 animate-shake">
            <AlertCircle size={20} /> {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
              Email Address
            </label>
            <input
              type="email"
              required
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-red-100 focus:border-red-900 transition-all outline-none font-medium text-slate-700"
              placeholder="name@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-red-100 focus:border-red-900 transition-all outline-none font-medium text-slate-700"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-4 bg-red-900 hover:bg-red-700 text-white rounded-2xl shadow-lg shadow-red-200 text-lg font-black transition-all active:scale-[0.98] disabled:opacity-50 mt-4 cursor-pointer"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-slate-500 font-medium mt-8">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-black text-red-900 hover:text-red-700 transition-colors"
          >
            Register Now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;