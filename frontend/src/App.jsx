import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import SOSButton from "./components/SOSButton";
import MapView from "./components/MapView";
import ChatBox from "./components/ChatBox";

function App() {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setLocation({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude
      });
    });
  }, []);

  return (
    <div
      style={{
        background: "#f4f6f9",
        minHeight: "100vh",
        fontFamily: "Segoe UI, sans-serif"
      }}
    >
      <Navbar />

      <div style={{ textAlign: "center", marginTop: "25px" }}>
        <h1 style={{ fontSize: "30px", color: "#222" }}>
          Smart Community Emergency Response System
        </h1>
        <p style={{ fontSize: "16px", color: "#555" }}>
          Instant help from nearby responders
        </p>
      </div>

      <SOSButton />

      <div
        style={{
          width: "90%",
          margin: "auto",
          marginTop: "30px",
          borderRadius: "14px",
          overflow: "hidden",
          boxShadow: "0px 6px 18px rgba(0,0,0,0.15)"
        }}
      >
        {location && <MapView location={location} />}
      </div>

      <ChatBox />
    </div>
  );
}

export default App;