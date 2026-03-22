import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const defaultCenter = [20.5937, 78.9629];

/**
 * Compact Tactical SVG Markers for SOSync
 * Scaled down for a more refined map presence
 */

// 1. User Location: Compact Radar Pulse
const userIcon = L.divIcon({
  className: "custom-user-marker",
  html: `
    <div class="relative flex items-center justify-center w-6 h-6">
      <div class="absolute w-full h-full bg-blue-500 rounded-full animate-ping opacity-30"></div>
      <div class="relative w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white shadow-sm"></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// 2. Responder Unit: Small Shield Glyph
const volunteerIcon = L.divIcon({
  className: "custom-volunteer-marker",
  html: `
    <div class="flex items-center justify-center w-8 h-8 group">
      <div class="absolute w-6 h-6 bg-emerald-500/10 rounded-lg rotate-45 border border-emerald-500/30"></div>
      <div class="relative bg-emerald-600 text-white p-1 rounded-md shadow-md">
        <svg width="10" height="10" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      </div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// 3. Emergency Site: Refined Alert Beacon
const emergencyIcon = L.divIcon({
  className: "custom-emergency-marker",
  html: `
    <div class="relative flex items-center justify-center w-10 h-10">
      <div class="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-30"></div>
      <div class="relative bg-red-900 text-white p-2 rounded-xl shadow-lg border-2 border-white">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

const MapView = ({ userLocation, volunteers = [], emergencyLocation, className = "" }) => {
  const center = userLocation ? [userLocation.lat, userLocation.lng] : defaultCenter;

  return (
    <div className={`w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl border-[8px] border-white relative ${className}`}>
      <MapContainer center={center} zoom={15} className="w-full h-full z-0" zoomControl={false}>
        <ChangeView center={center} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <div class="px-1 text-center">
                <p class="text-[10px] font-black text-slate-900 uppercase tracking-tighter">Your Position</p>
              </div>
            </Popup>
          </Marker>
        )}

        {volunteers.map((vol) => (
          <Marker
            key={vol._id}
            position={[vol.location.coordinates[1], vol.location.coordinates[0]]}
            icon={volunteerIcon}
          >
            <Popup>
              <div class="px-1 text-center">
                <p class="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">Responder: {vol.name || "Unit"}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {emergencyLocation && (
          <Marker
            position={[emergencyLocation.lat, emergencyLocation.lng]}
            icon={emergencyIcon}
          >
            <Popup>
              <div class="px-1 text-center">
                <p class="text-[10px] font-black text-red-900 uppercase tracking-widest">Active Emergency</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default MapView;