import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const [data, setData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "user",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let latitude = 0, longitude = 0;
      if (navigator.geolocation) {
        await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              latitude = pos.coords.latitude;
              longitude = pos.coords.longitude;
              resolve();
            },
            () => resolve()
          );
        });
      }
      await register({ ...data, latitude, longitude });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-10">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black mb-6 shadow-lg shadow-red-200">
            S
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Join SOSync</h1>
          <p className="text-slate-500 font-medium text-center mt-2">
            Create an account to report emergencies or help others in need.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-red-700 text-sm font-bold flex items-center gap-2 mb-8 animate-shake">
            <span className="text-lg">⚠️</span> {error}
          </div>
        )}

        <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
              Full Name
            </label>
            <input
              required
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-red-100 focus:border-red-600 transition-all outline-none font-medium text-slate-700"
              placeholder="John Doe"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
              Email Address
            </label>
            <input
              type="email"
              required
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-red-100 focus:border-red-600 transition-all outline-none font-medium text-slate-700"
              placeholder="john@example.com"
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
              Phone Number
            </label>
            <input
              type="tel"
              required
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-red-100 focus:border-red-600 transition-all outline-none font-medium text-slate-700"
              placeholder="+1 (555) 000-0000"
              value={data.phone}
              onChange={(e) => setData({ ...data, phone: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
              Account Role
            </label>
            <select
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-red-100 focus:border-red-600 transition-all outline-none font-medium text-slate-700 appearance-none"
              value={data.role}
              onChange={(e) => setData({ ...data, role: e.target.value })}
            >
              <option value="user">Citizen (Needs Help)</option>
              <option value="volunteer">Volunteer (Provides Help)</option>
            </select>
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
              Secure Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-red-100 focus:border-red-600 transition-all outline-none font-medium text-slate-700"
              placeholder="••••••••"
              value={data.password}
              onChange={(e) => setData({ ...data, password: e.target.value })}
            />
          </div>

          <div className="md:col-span-2 mt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl shadow-lg shadow-red-200 text-lg font-black transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Creating Account..." : "Join SOSync Network"}
            </button>
          </div>
        </form>

        <p className="text-center text-slate-500 font-medium mt-8">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-black text-red-600 hover:text-red-700 transition-colors"
          >
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;