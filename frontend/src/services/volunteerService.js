import API from "./api";

/**
 * Fetch nearby volunteers based on latitude and longitude.
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<Array>} List of volunteers
 */
export const getNearbyVolunteers = async (latitude, longitude) => {
  const response = await API.get(`/volunteers/nearby?latitude=${latitude}&longitude=${longitude}`);
  return response.data.volunteers;
};
