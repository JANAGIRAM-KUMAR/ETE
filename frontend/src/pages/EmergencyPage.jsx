import React from "react";
import MapView from "../components/MapView";
import ChatBox from "../components/ChatBox";
import { useEmergency } from "../context/EmergencyContext";

const EmergencyPage = () => {
  const { currentEmergency } = useEmergency();

  if (!currentEmergency) return <div>No active emergency.</div>;

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <MapView lat={12.97} lng={79.15} />
      <ChatBox messages={[]} />
    </div>
  );
};

export default EmergencyPage;