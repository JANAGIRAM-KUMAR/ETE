import Emergency from "../models/Emergency.js";

// @desc    Create a new emergency (SOS)
// @route   POST /api/emergency
const createEmergency = async (req, res) => {
  try {
    const { type, latitude, longitude, description } = req.body;

    const emergency = await Emergency.create({
      userId: req.user._id,
      type,
      description: description || "",
      status: "pending",
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
    });

    // Emit socket event to notify nearby volunteers
    const io = req.app.get("io");
    if (io) {
      io.to("volunteers").emit("emergency-alert", {
        emergencyId: emergency._id,
        type: emergency.type,
        description: emergency.description,
        location: emergency.location,
        userId: req.user._id,
        createdAt: emergency.createdAt,
      });
    }

    res.status(201).json({
      message: "Emergency created successfully",
      emergency,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get emergency by ID
// @route   GET /api/emergency/:id
const getEmergencyById = async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id)
      .populate("userId", "name email phone")
      .populate("volunteerId", "name email phone");

    if (!emergency) {
      return res.status(404).json({ message: "Emergency not found" });
    }

    res.status(200).json(emergency);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Volunteer accepts an emergency
// @route   PUT /api/emergency/:id/accept
const acceptEmergency = async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id);

    if (!emergency) {
      return res.status(404).json({ message: "Emergency not found" });
    }

    if (emergency.status !== "pending") {
      return res.status(400).json({ message: "Emergency is no longer pending" });
    }

    emergency.status = "accepted";
    emergency.volunteerId = req.user._id;
    await emergency.save();

    // Notify the user that a volunteer accepted
    const io = req.app.get("io");
    if (io) {
      io.to(emergency.userId.toString()).emit("accept-emergency", {
        emergencyId: emergency._id,
        volunteerId: req.user._id,
        volunteerName: req.user.name,
        status: "accepted",
      });
    }

    res.status(200).json({
      message: "Emergency accepted",
      emergency,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Volunteer resolves an emergency
// @route   PUT /api/emergency/:id/resolve
const resolveEmergency = async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id);

    if (!emergency) {
      return res.status(404).json({ message: "Emergency not found" });
    }

    if (emergency.status === "resolved") {
      return res.status(400).json({ message: "Emergency is already resolved" });
    }

    emergency.status = "resolved";
    await emergency.save();

    res.status(200).json({
      message: "Emergency resolved",
      emergency,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export { createEmergency, getEmergencyById, acceptEmergency, resolveEmergency };