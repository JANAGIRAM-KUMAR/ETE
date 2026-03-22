import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import VolunteerDashboard from "./pages/VolunteerDashboard";
import EmergencyPage from "./pages/EmergencyPage";

const ProtectedRoute = ({ children, role }) => {
  const { user, isAuthenticated, authLoading } = useAuth();

  // Wait for the localStorage auth check before deciding to redirect.
  // Without this guard, user is null on first render and we flash to /login.
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-lg animate-pulse">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) {
    return <Navigate to={user?.role === "volunteer" ? "/volunteer" : "/dashboard"} replace />;
  }
  return children;
};

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute role="user">
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/volunteer"
        element={
          <ProtectedRoute role="volunteer">
            <VolunteerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/emergency/:id"
        element={
          <ProtectedRoute>
            <EmergencyPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={
          user
            ? <Navigate to={user.role === "volunteer" ? "/volunteer" : "/dashboard"} replace />
            : <Navigate to="/login" replace />
        }
      />
    </Routes>
  );
}

export default App;
