import React, { useEffect } from "react";
import Navbar from "../components/Navbar";
import EmergencyCard from "../components/EmergencyCard";
import { useEmergency } from "../context/EmergencyContext";

const VolunteerDashboard = () => {
  const { currentEmergency, acceptEmergency } = useEmergency();

  return (
    <div>
      <Navbar />
      <div className="p-10">
        <h1 className="text-2xl font-bold mb-6">Active Emergencies</h1>
        {currentEmergency ? (
          <EmergencyCard emergency={currentEmergency} onAccept={() => acceptEmergency(currentEmergency._id)} />
        ) : (
          <p>No active emergencies nearby.</p>
        )}
      </div>
    </div>
  );
};

export default VolunteerDashboard;