import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const defaultCenter = [20.5937, 78.9629]; // India center fallback

/* Custom coloured marker icons */
const createIcon = (color) =>
  new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

const blueIcon = createIcon("blue");
const greenIcon = createIcon("green");
const redIcon = createIcon("red");

/**
 * MapView — displays user, volunteer, and emergency markers on OpenStreetMap.
 */
const MapView = ({ userLocation, volunteers = [], emergencyLocation }) => {
  const center = userLocation
    ? [userLocation.lat, userLocation.lng]
    : defaultCenter;

  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden shadow-lg border border-gray-200">
      <MapContainer center={center} zoom={14} className="w-full h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User's current location — blue marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={blueIcon}>
            <Popup>Your Location</Popup>
          </Marker>
        )}

        {/* Volunteer markers — green */}
        {volunteers.map((vol) => (
          <Marker
            key={vol._id}
            position={[
              vol.location.coordinates[1],
              vol.location.coordinates[0],
            ]}
            icon={greenIcon}
          >
            <Popup>{vol.name || "Volunteer"}</Popup>
          </Marker>
        ))}

        {/* Emergency location — red marker */}
        {emergencyLocation && (
          <Marker
            position={[emergencyLocation.lat, emergencyLocation.lng]}
            icon={redIcon}
          >
            <Popup>Emergency</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default MapView;