import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5001";

let socket = null;

/**
 * Connect to the Socket.io server (singleton).
 * @param {string} userId - The current user's ID
 */
export const connectSocket = (userId) => {
  if (socket && socket.connected) return socket;

  socket = io(SOCKET_URL, {
    transports: ["websocket"],
    autoConnect: true,
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });

  return socket;
};

/**
 * User joins their personal room.
 * @param {string} userId
 */
export const joinUser = (userId) => {
  if (socket) socket.emit("join-user", userId);
};

/**
 * Volunteer joins the volunteers room.
 * @param {string} volunteerId
 */
export const joinVolunteer = (volunteerId) => {
  if (socket) socket.emit("join-volunteer", volunteerId);
};

/**
 * Listen for incoming emergency alerts.
 * @param {Function} callback - called with emergency data
 */
export const listenEmergencyAlerts = (callback) => {
  if (socket) {
    socket.on("emergency-alert", callback);
  }
};

/**
 * Listen for emergency acceptance notifications.
 * @param {Function} callback - called with acceptance data
 */
export const listenAcceptEmergency = (callback) => {
  if (socket) {
    socket.on("accept-emergency", callback);
  }
};

/**
 * Listen for real-time location updates.
 * @param {Function} callback - called with location data
 */
export const listenLocationUpdates = (callback) => {
  if (socket) {
    socket.on("location-update", callback);
  }
};

/**
 * Listen for incoming chat messages.
 * @param {Function} callback - called with chat message data
 */
export const listenChatMessages = (callback) => {
  if (socket) {
    socket.on("chat-message", callback);
  }
};

/**
 * Emit an emergency alert to volunteers.
 * @param {Object} data - emergency data
 */
export const emitEmergencyAlert = (data) => {
  if (socket) socket.emit("emergency-alert", data);
};

/**
 * Emit an accept-emergency event.
 * @param {Object} data - { userId, volunteerId, emergencyId }
 */
export const emitAcceptEmergency = (data) => {
  if (socket) socket.emit("accept-emergency", data);
};

/**
 * Send real-time location update.
 * @param {Object} data - { targetId, latitude, longitude, senderId }
 */
export const sendLocationUpdate = (data) => {
  if (socket) socket.emit("location-update", data);
};

/**
 * Send a chat message.
 * @param {Object} data - { emergencyId, senderId, message, targetId }
 */
export const sendChatMessage = (data) => {
  if (socket) socket.emit("chat-message", data);
};

/**
 * Disconnect the socket.
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Get the raw socket instance (for advanced use).
 */
export const getSocket = () => socket;