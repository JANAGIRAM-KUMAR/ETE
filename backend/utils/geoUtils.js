import User from "../models/User.js";

/**
 * Find nearby volunteers within a given radius.
 * @param {number} latitude
 * @param {number} longitude
 * @param {number} radius - radius in meters (default 5000 = 5km)
 * @returns {Promise<Array>} list of nearby available volunteers
 */
const findNearbyVolunteers = async (latitude, longitude, radius = 5000) => {
  const volunteers = await User.find({
    role: { $in: ["volunteer", "doctor"] },
    isAvailable: true,
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [parseFloat(longitude), parseFloat(latitude)],
        },
        $maxDistance: radius,
      },
    },
  }).select("-password");

  return volunteers;
};

export { findNearbyVolunteers };