import Chat from "../models/Chat.js";

const initializeSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // User joins their personal room (using their userId)
    socket.on("join-user", (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their room`);
    });

    // Volunteer joins the volunteers room
    socket.on("join-volunteer", (volunteerId) => {
      socket.join("volunteers");
      socket.join(volunteerId);
      console.log(`Volunteer ${volunteerId} joined volunteers room`);
    });

    // Emergency alert - broadcast to all volunteers
    socket.on("emergency-alert", (data) => {
      io.to("volunteers").emit("emergency-alert", data);
    });

    // Volunteer accepts emergency - notify the user
    socket.on("accept-emergency", (data) => {
      const { userId, volunteerId, emergencyId } = data;
      io.to(userId).emit("accept-emergency", {
        emergencyId,
        volunteerId,
        status: "accepted",
      });
    });

    // Live location tracking
    socket.on("location-update", (data) => {
      const { targetId, latitude, longitude, senderId } = data;
      io.to(targetId).emit("location-update", {
        senderId,
        latitude,
        longitude,
      });
    });

    // Chat messages between user and volunteer
    socket.on("chat-message", async (data) => {
      try {
        const { emergencyId, senderId, message, targetId } = data;

        // Save chat message to database
        const chat = await Chat.create({
          emergencyId,
          senderId,
          message,
        });

        // Send message to the target user
        io.to(targetId).emit("chat-message", {
          _id: chat._id,
          emergencyId,
          senderId,
          message,
          timestamp: chat.timestamp,
        });
      } catch (error) {
        console.error("Chat message error:", error.message);
      }
    });

    // --- WebRTC Signaling for Video/Audio Calls ---
    socket.on("call-user", (data) => {
      const { userToCall, signalData, from, name, type } = data;
      io.to(userToCall).emit("call-made", { signal: signalData, from, name, type });
    });

    socket.on("answer-call", (data) => {
      const { to, signal } = data;
      io.to(to).emit("call-answered", { signal });
    });

    socket.on("ice-candidate", (data) => {
      const { to, candidate } = data;
      io.to(to).emit("ice-candidate", { candidate });
    });

    socket.on("end-call", (data) => {
      const { to } = data;
      io.to(to).emit("end-call");
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

export default initializeSocket;