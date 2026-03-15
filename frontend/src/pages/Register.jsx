import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [data, setData] = useState({ name: "", email: "", password: "", role: "user" });
  const { register } = useAuth();

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <form className="p-8 bg-white rounded-xl shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-red-600">Register</h2>
        <input className="w-full p-3 mb-4 border rounded" placeholder="Name" onChange={(e) => setData({...data, name: e.target.value})} />
        <select className="w-full p-3 mb-4 border rounded" onChange={(e) => setData({...data, role: e.target.value})}>
          <option value="user">Distressed User</option>
          <option value="volunteer">Volunteer</option>
        </select>
        <button onClick={() => register(data)} className="w-full bg-red-600 text-white py-3 rounded-lg font-bold">Register</button>
      </form>
    </div>
  );
};

export default Register;