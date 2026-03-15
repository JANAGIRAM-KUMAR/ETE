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
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <form onSubmit={handleSubmit} className="p-8 bg-white rounded-xl shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-red-600">🚑 Login</h2>
        {error && <p className="text-red-500 mb-4 text-sm bg-red-50 p-2 rounded">{error}</p>}
        <input
          className="w-full p-3 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-red-400"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <input
          className="w-full p-3 mb-6 border rounded focus:outline-none focus:ring-2 focus:ring-red-400"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        <p className="mt-4 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="text-red-600 font-semibold hover:underline">Register</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
