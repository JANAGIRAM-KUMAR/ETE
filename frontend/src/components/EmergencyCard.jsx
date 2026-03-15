import React from "react";
import { formatEmergencyType, formatDate } from "../utils/helpers";

const EmergencyCard = ({ emergency, onAccept }) => {
  if (!emergency) return null;

  return (
    <div className="w-full max-w-md mx-auto mt-6 p-6 rounded-xl bg-white shadow-lg border-l-4 border-red-600">
      <h2 className="text-red-600 text-xl font-bold mb-3">🚨 Emergency Alert</h2>
      <p className="text-base mb-1">
        <b>Type:</b> {formatEmergencyType(emergency.type)}
      </p>
      <p className="text-base mb-1">
        <b>Status:</b>{" "}
        <span className={`font-semibold ${
          emergency.status === "pending" ? "text-yellow-600" :
          emergency.status === "accepted" ? "text-blue-600" : "text-green-600"
        }`}>
          {emergency.status}
        </span>
      </p>
      {emergency.description && (
        <p className="text-base mb-1">
          <b>Description:</b> {emergency.description}
        </p>
      )}
      {emergency.createdAt && (
        <p className="text-sm text-gray-500 mb-3">
          <b>Reported at:</b> {formatDate(emergency.createdAt)}
        </p>
      )}
      {emergency.status === "pending" && onAccept && (
        <button
          onClick={onAccept}
          className="mt-2 bg-gradient-to-r from-red-500 to-red-700 text-white px-5 py-3 rounded-lg font-semibold text-sm shadow-md hover:scale-105 transition transform"
        >
          Accept Emergency
        </button>
      )}
      {emergency.status === "accepted" && (
        <span className="inline-block mt-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
          ✅ Accepted
        </span>
      )}
      {emergency.status === "resolved" && (
        <span className="inline-block mt-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
          ✅ Resolved
        </span>
      )}
    </div>
  );
};

export default EmergencyCard;
