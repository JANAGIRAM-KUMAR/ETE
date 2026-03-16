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
    <div className="min-h-screen flex flex-col md:flex-row bg-white overflow-auto">
      {/* Branding Section */}
      <div className="hidden md:flex md:w-1/3 bg-red-600 items-center justify-center p-12 text-white">
        <div className="max-w-md">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-red-600 text-3xl font-black mb-8 shadow-2xl shadow-red-900/20">
            E
          </div>
          <h1 className="text-5xl font-extrabold mb-6 tracking-tight">Join ETE</h1>
          <p className="text-xl font-light mb-10 opacity-90 leading-relaxed">
            Be part of the community that saves lives through rapid response and coordination.
          </p>
          <div className="space-y-6">
            <div className="bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-sm">
              <h3 className="font-black text-lg mb-1">For Citizens</h3>
              <p className="opacity-80 text-sm font-medium">Get immediate help when every second counts.</p>
            </div>
            <div className="bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-sm">
              <h3 className="font-black text-lg mb-1">For Volunteers</h3>
              <p className="opacity-80 text-sm font-medium">Lend your skills to help those in need nearby.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-slate-50/50">
        <div className="w-full max-w-2xl space-y-8 bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100">
          <div className="text-center">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Create Account</h2>
            <p className="mt-2 text-slate-500 font-medium">Join the ETE network today</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-red-700 text-sm font-bold flex items-center gap-2">
              <span className="text-lg">⚠️</span> {error}
            </div>
          )}

          <form className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
              <input
                required
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-red-100 focus:border-red-500 transition-all outline-none font-medium text-slate-700"
                placeholder="John Doe"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-red-100 focus:border-red-500 transition-all outline-none font-medium text-slate-700"
                placeholder="john@example.com"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
              <input
                type="tel"
                required
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-red-100 focus:border-red-500 transition-all outline-none font-medium text-slate-700"
                placeholder="+1 (555) 000-0000"
                value={data.phone}
                onChange={(e) => setData({ ...data, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Account Role</label>
              <select
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-red-100 focus:border-red-500 transition-all outline-none font-medium text-slate-700 appearance-none"
                value={data.role}
                onChange={(e) => setData({ ...data, role: e.target.value })}
              >
                <option value="user">Individual (Citizen)</option>
                <option value="volunteer">Volunteer Responder</option>
              </select>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Secure Password</label>
              <input
                type="password"
                required
                minLength={6}
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-red-100 focus:border-red-500 transition-all outline-none font-medium text-slate-700"
                placeholder="••••••••"
                value={data.password}
                onChange={(e) => setData({ ...data, password: e.target.value })}
              />
              <p className="text-[10px] text-slate-400 font-bold ml-1 uppercase tracking-tighter">Min. 6 characters required</p>
            </div>

            <div className="md:col-span-2 mt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl shadow-xl shadow-red-500/30 text-lg font-black transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? "Creating Profile..." : "Create Account"}
              </button>
            </div>
          </form>

          <p className="text-center text-slate-500 font-medium">
            Already registered?{" "}
            <Link to="/login" className="font-black text-red-600 hover:text-red-700 underline-offset-4 hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;