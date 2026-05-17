import { Navigate } from "react-router-dom";

/**
 * ProtectedRoute Wrapper
 * This component checks if a JWT token exists in localStorage.
 * If no token is found, it redirects the user to the login page.
 */
const ProtectedRoute = ({ children }) => {
  // Check if the admin is authenticated
  const token = localStorage.getItem("token");

  if (!token) {
    // replace={true} prevents the user from going "back" to the protected page
    return <Navigate to="/login" replace />;
  }

  // If token exists, render the requested component (e.g., AdminDashboard)
  return children;
};

export default ProtectedRoute;
