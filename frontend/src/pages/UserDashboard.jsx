import React from "react";
import Navbar from "../components/Navbar";
import SOSButton from "../components/SOSButton";
import { useEmergency } from "../context/EmergencyEmergency";

const UserDashboard = () => {
  const { triggerEmergency } = useEmergency();

  const handleSOS = async () => {
    // Ideally, get current location from a hook here
    await triggerEmergency({ type: "Medical", location: { lat: 12.97, lng: 79.15 } });
    alert("Emergency Sent!");
  };

  return (
    <div>
      <Navbar />
      <div className="flex flex-col items-center mt-20">
        <h1 className="text-3xl font-bold">Welcome, Janu</h1>
        <SOSButton onTrigger={handleSOS} />
      </div>
    </div>
  );
};

export default UserDashboard;