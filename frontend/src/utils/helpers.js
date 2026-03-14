/**
 * Calculate the distance between two geographic coordinates using the Haversine formula.
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
};

/**
 * Convert degrees to radians.
 * @param {number} deg
 * @returns {number}
 */
const toRad = (deg) => (deg * Math.PI) / 180;

/**
 * Format emergency type into a readable label.
 * @param {string} type - e.g. "medical", "fire", "accident", "crime"
 * @returns {string} e.g. "Medical Emergency"
 */
export const formatEmergencyType = (type) => {
  const types = {
    medical: "Medical Emergency",
    fire: "Fire Emergency",
    accident: "Accident Emergency",
    crime: "Crime Emergency",
  };
  return types[type] || "Unknown Emergency";
};

/**
 * Format a date/timestamp into a readable string.
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleString();
};

/**
 * Truncate a string to a given length.
 * @param {string} str
 * @param {number} maxLength
 * @returns {string}
 */
export const truncate = (str, maxLength = 50) => {
  if (!str) return "";
  return str.length > maxLength ? str.substring(0, maxLength) + "..." : str;
};