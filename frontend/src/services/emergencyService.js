import API from "./api";

/**
 * Trigger a new emergency (SOS).
 * @param {Object} data - { type, latitude, longitude, description }
 */
export const triggerEmergency = async (data) => {
  const response = await API.post("/emergency", data);
  return response.data;
};

/**
 * Get emergency details by ID.
 * @param {string} id
 */
export const getEmergencyById = async (id) => {
  const response = await API.get(`/emergency/${id}`);
  return response.data;
};

/**
 * Volunteer accepts an emergency.
 * @param {string} id
 */
export const acceptEmergency = async (id) => {
  const response = await API.put(`/emergency/${id}/accept`);
  return response.data;
};

/**
 * Volunteer resolves an emergency.
 * @param {string} id
 */
export const resolveEmergency = async (id) => {
  const response = await API.put(`/emergency/${id}/resolve`);
  return response.data;
};

/**
 * Get nearby volunteers.
 * @param {number} lat - latitude
 * @param {number} lng - longitude
 */
export const getNearbyVolunteers = async (lat, lng) => {
  const response = await API.get("/volunteers/nearby", {
    params: { latitude: lat, longitude: lng },
  });
  return response.data;
};