import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  emergencyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Emergency",
    required: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message: {
    type: String,
    required: [true, "Message is required"],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;