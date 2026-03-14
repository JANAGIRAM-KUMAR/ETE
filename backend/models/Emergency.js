import mongoose from "mongoose";

const emergencySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  volunteerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  type: {
    type: String,
    enum: ["medical", "fire", "accident", "crime"],
    required: [true, "Emergency type is required"],
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "resolved"],
    default: "pending",
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  description: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

emergencySchema.index({ location: "2dsphere" });

const Emergency = mongoose.model("Emergency", emergencySchema);

export default Emergency;