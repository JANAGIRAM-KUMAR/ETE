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
      // Try to get geolocation
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
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <form onSubmit={handleSubmit} className="p-8 bg-white rounded-xl shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-red-600">🚑 Register</h2>
        {error && <p className="text-red-500 mb-4 text-sm bg-red-50 p-2 rounded">{error}</p>}
        <input
          className="w-full p-3 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-red-400"
          placeholder="Full Name"
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
          required
        />
        <input
          className="w-full p-3 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-red-400"
          type="email"
          placeholder="Email"
          value={data.email}
          onChange={(e) => setData({ ...data, email: e.target.value })}
          required
        />
        <input
          className="w-full p-3 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-red-400"
          type="tel"
          placeholder="Phone Number"
          value={data.phone}
          onChange={(e) => setData({ ...data, phone: e.target.value })}
          required
        />
        <input
          className="w-full p-3 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-red-400"
          type="password"
          placeholder="Password (min 6 characters)"
          value={data.password}
          onChange={(e) => setData({ ...data, password: e.target.value })}
          required
          minLength={6}
        />
        <select
          className="w-full p-3 mb-6 border rounded focus:outline-none focus:ring-2 focus:ring-red-400"
          value={data.role}
          onChange={(e) => setData({ ...data, role: e.target.value })}
        >
          <option value="user">Distressed User</option>
          <option value="volunteer">Volunteer</option>
        </select>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition disabled:opacity-60"
        >
          {loading ? "Registering..." : "Register"}
        </button>
        <p className="mt-4 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="text-red-600 font-semibold hover:underline">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
