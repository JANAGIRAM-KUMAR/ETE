import API from "./api";

/**
 * Register a new user.
 * @param {Object} data - { name, email, phone, password, role, latitude, longitude }
 */
export const registerUser = async (data) => {
  const response = await API.post("/auth/register", data);
  return response.data;
};

/**
 * Login user and persist JWT token.
 * @param {Object} data - { email, password }
 */
export const loginUser = async (data) => {
  const response = await API.post("/auth/login", data);
  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
  }
  return response.data;
};

/**
 * Logout — remove token from localStorage.
 */
export const logout = () => {
  localStorage.removeItem("token");
};

/**
 * Get the current user by decoding the stored JWT.
 * Returns the decoded payload or null if no valid token exists.
 */
export const getCurrentUser = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    // Check if token is expired
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      return null;
    }
    return payload;
  } catch {
    localStorage.removeItem("token");
    return null;
  }
};

/**
 * Check if a user is currently authenticated.
 */
export const isAuthenticated = () => {
  return getCurrentUser() !== null;
};