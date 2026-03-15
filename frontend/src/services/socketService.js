import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5001";

// ─── Singleton socket ───────────────────────────────────────────────────────
// Created at module load with autoConnect:false so `socket` is NEVER null.
// This eliminates the race condition where child useEffects run before the
// AuthContext useEffect has had a chance to call connectSocket().
const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  autoConnect: false,
});

// Internal state used to auto-rejoin the correct room on every (re)connect
let _userId = null;
let _role = null;

// Automatically rejoin the appropriate room after every connect / reconnect
socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
  if (_userId) {
    if (_role === "volunteer") {
      socket.emit("join-volunteer", _userId);
    } else {
      socket.emit("join-user", _userId);
    }
  }
});

socket.on("disconnect", () => {
  console.log("Socket disconnected");
});

/**
 * Connect to the Socket.io server.
 * Stores userId + role so the socket can rejoin after reconnections.
 * @param {string} userId
 * @param {string} role - "user" | "volunteer"
 */
export const connectSocket = (userId, role) => {
  _userId = userId;
  _role = role;
  if (!socket.connected) socket.connect();
  return socket;
};

/**
 * User joins their personal room.
 * Also updates internal state for reconnect handling.
 * @param {string} userId
 */
export const joinUser = (userId) => {
  _userId = userId;
  _role = "user";
  if (socket.connected) socket.emit("join-user", userId);
};

/**
 * Volunteer joins the volunteers room.
 * Also updates internal state for reconnect handling.
 * @param {string} volunteerId
 */
export const joinVolunteer = (volunteerId) => {
  _userId = volunteerId;
  _role = "volunteer";
  if (socket.connected) socket.emit("join-volunteer", volunteerId);
};

/**
 * Listen for incoming emergency alerts.
 * @param {Function} callback - called with emergency data
 * @returns {Function} cleanup function — call it to remove the listener
 */
export const listenEmergencyAlerts = (callback) => {
  socket.on("emergency-alert", callback);
  return () => socket.off("emergency-alert", callback);
};

/**
 * Listen for emergency acceptance notifications.
 * @param {Function} callback - called with acceptance data
 * @returns {Function} cleanup function
 */
export const listenAcceptEmergency = (callback) => {
  socket.on("accept-emergency", callback);
  return () => socket.off("accept-emergency", callback);
};

/**
 * Listen for real-time location updates.
 * @param {Function} callback - called with location data
 * @returns {Function} cleanup function
 */
export const listenLocationUpdates = (callback) => {
  socket.on("location-update", callback);
  return () => socket.off("location-update", callback);
};

/**
 * Listen for incoming chat messages.
 * @param {Function} callback - called with chat message data
 * @returns {Function} cleanup function
 */
export const listenChatMessages = (callback) => {
  socket.on("chat-message", callback);
  return () => socket.off("chat-message", callback);
};

/**
 * Emit an emergency alert to volunteers.
 * @param {Object} data - emergency data
 */
export const emitEmergencyAlert = (data) => {
  socket.emit("emergency-alert", data);
};

/**
 * Emit an accept-emergency socket event.
 * @param {Object} data - { userId, volunteerId, emergencyId }
 */
export const emitAcceptEmergency = (data) => {
  socket.emit("accept-emergency", data);
};

/**
 * Send real-time location update.
 * @param {Object} data - { targetId, latitude, longitude, senderId }
 */
export const sendLocationUpdate = (data) => {
  socket.emit("location-update", data);
};

/**
 * Send a chat message.
 * @param {Object} data - { emergencyId, senderId, message, targetId }
 */
export const sendChatMessage = (data) => {
  socket.emit("chat-message", data);
};

/**
 * Disconnect the socket and clear stored identity.
 */
export const disconnectSocket = () => {
  _userId = null;
  _role = null;
  socket.disconnect();
};

/**
 * Subscribe to socket connect / disconnect events.
 * @param {Function} onConnect
 * @param {Function} onDisconnect
 * @returns {Function} cleanup function
 */
export const listenConnectionStatus = (onConnect, onDisconnect) => {
  socket.on("connect", onConnect);
  socket.on("disconnect", onDisconnect);
  return () => {
    socket.off("connect", onConnect);
    socket.off("disconnect", onDisconnect);
  };
};

/** Returns true if the socket is currently connected. */
export const isSocketConnected = () => socket.connected;

/**
 * Get the raw socket instance (for advanced use).
 */
export const getSocket = () => socket;
