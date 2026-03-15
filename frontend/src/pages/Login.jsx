import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData);
      navigate("/dashboard");
    } catch (err) { alert("Login failed"); }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <form onSubmit={handleSubmit} className="p-8 bg-white rounded-xl shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-red-600">Login</h2>
        <input className="w-full p-3 mb-4 border rounded" type="email" placeholder="Email" onChange={(e) => setFormData({...formData, email: e.target.value})} />
        <input className="w-full p-3 mb-6 border rounded" type="password" placeholder="Password" onChange={(e) => setFormData({...formData, password: e.target.value})} />
        <button className="w-full bg-red-600 text-white py-3 rounded-lg font-bold">Login</button>
      </form>
    </div>
  );
};

export default Login;