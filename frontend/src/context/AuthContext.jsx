import { createContext, useContext, useState, useEffect } from "react";
import * as authService from "../services/authService";
import {
  connectSocket,
  disconnectSocket,
} from "../services/socketService";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  // True until the initial localStorage check is done.
  // ProtectedRoute must wait for this to be false before deciding to redirect.
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      // Pass role so the socket auto-rejoins the correct room on every (re)connect
      connectSocket(currentUser._id, currentUser.role);
    }
    // Signal that the auth check is complete regardless of outcome
    setAuthLoading(false);
  }, []);

  const login = async (data) => {
    const response = await authService.loginUser(data);
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    if (currentUser) {
      connectSocket(currentUser._id, currentUser.role);
    }
    return response;
  };

  const register = async (data) => {
    return await authService.registerUser(data);
  };

  const logout = () => {
    authService.logout();
    disconnectSocket();
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    authLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};