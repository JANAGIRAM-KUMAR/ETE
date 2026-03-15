/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MapView from "../components/MapView";
import ChatBox from "../components/ChatBox";
import Navbar from "../components/Navbar";
import { useEmergency } from "../context/EmergencyContext";
import { useAuth } from "../context/AuthContext";
import { listenAcceptEmergency, listenLocationUpdates } from "../services/socketService";
import { formatEmergencyType, formatDate } from "../utils/helpers";
import useLocation from "../hooks/useLocation";

const EmergencyPage = () => {
  const { id } = useParams();
  const { currentEmergency, getEmergency, resolveEmergency } = useEmergency();
  const { user } = useAuth();
  const { latitude, longitude } = useLocation();
  const navigate = useNavigate();
  const [volunteerLocation, setVolunteerLocation] = useState(null);
  const [accepted, setAccepted] = useState(false);
  // Stores the volunteerId captured from the accept-emergency socket event.
  // currentEmergency.volunteerId is null on the user's side until we re-fetch,
  // so we keep this local copy so chat targetId is available immediately.
  const [acceptedVolunteerId, setAcceptedVolunteerId] = useState(null);

  useEffect(() => {
    if (id && (!currentEmergency || currentEmergency._id !== id)) {
      getEmergency(id);
    }
  }, [id]);

  // Sync accepted flag from the loaded emergency (handles page refresh)
  useEffect(() => {
    if (currentEmergency?.status === "accepted" || currentEmergency?.status === "resolved") {
      setAccepted(true);
    }
  }, [currentEmergency?.status]);

  useEffect(() => {
    const offAccept = listenAcceptEmergency((data) => {
      setAccepted(true);
      // Capture the volunteerId from the event payload immediately so the user
      // can send chat messages right away without waiting for a re-fetch.
      if (data?.volunteerId) {
        setAcceptedVolunteerId(String(data.volunteerId));
      }
      // Also re-fetch the emergency to keep full state in sync
      getEmergency(id);
    });
    const offLocation = listenLocationUpdates((data) => {
      setVolunteerLocation({ lat: data.latitude, lng: data.longitude });
    });
    // Cleanup listeners when component unmounts to prevent duplicate handlers
    return () => {
      offAccept();
      offLocation();
    };
  }, []);

  const emergency = currentEmergency;

  if (!emergency) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading emergency details...</p>
        </div>
      </div>
    );
  }

  const emergencyLat = emergency.location?.coordinates?.[1];
  const emergencyLng = emergency.location?.coordinates?.[0];
  const userLoc = latitude && longitude ? { lat: latitude, lng: longitude } : null;
  const emergencyLoc =
    emergencyLat && emergencyLng ? { lat: emergencyLat, lng: emergencyLng } : null;

  // Resolve which end the chat should target.
  // For volunteers: always send to the user (userId is set from the start).
  // For users: send to the volunteer — use currentEmergency.volunteerId (populated
  //   after re-fetch) OR acceptedVolunteerId from the socket event (available immediately).
  const rawVolunteerId =
    typeof emergency.volunteerId === "object"
      ? emergency.volunteerId?._id
      : emergency.volunteerId;

  const targetId =
    user?.role === "volunteer"
      ? (typeof emergency.userId === "object" ? emergency.userId?._id : emergency.userId)
      : (rawVolunteerId || acceptedVolunteerId);

  const handleResolve = async () => {
    if (!window.confirm("Mark this emergency as resolved?")) return;
    try {
      await resolveEmergency(id);
      navigate(user?.role === "volunteer" ? "/volunteer" : "/dashboard");
    } catch (err) {
      window.alert("Failed to resolve: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="p-6 max-w-5xl mx-auto">
        {/* Status banner */}
        <div className="mb-6 bg-white rounded-xl p-5 shadow border-l-4 border-red-600">
          <h1 className="text-xl font-bold text-red-600 mb-2">
            🚨 {formatEmergencyType(emergency.type)}
          </h1>
          <p><b>Status:</b> {emergency.status}</p>
          {emergency.createdAt && (
            <p className="text-sm text-gray-500">
              <b>Reported at:</b> {formatDate(emergency.createdAt)}
            </p>
          )}
          {emergency.description && <p className="mt-1">{emergency.description}</p>}
          {accepted && user?.role === "user" && (
            <p className="mt-2 text-green-600 font-semibold">
              ✅ A volunteer is on the way!
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Map */}
          <MapView
            userLocation={userLoc}
            emergencyLocation={emergencyLoc}
            volunteers={
              volunteerLocation
                ? [{
                    _id: "vol",
                    location: { coordinates: [volunteerLocation.lng, volunteerLocation.lat] },
                    name: "Volunteer",
                  }]
                : []
            }
          />

          {/* Chat + resolve */}
          <div className="flex flex-col gap-4">
            <ChatBox
              emergencyId={id}
              senderId={user?._id}
              targetId={targetId}
            />
            {user?.role === "volunteer" && emergency.status !== "resolved" && (
              <button
                onClick={handleResolve}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition"
              >
                ✅ Mark as Resolved
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyPage;
