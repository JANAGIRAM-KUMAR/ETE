import { findNearbyVolunteers } from "../utils/geoUtils.js";

// @desc    Get nearby volunteers
// @route   GET /api/volunteers/nearby
const getNearbyVolunteers = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Latitude and longitude are required" });
    }

    const volunteers = await findNearbyVolunteers(latitude, longitude);

    res.status(200).json({
      count: volunteers.length,
      volunteers,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export { getNearbyVolunteers };