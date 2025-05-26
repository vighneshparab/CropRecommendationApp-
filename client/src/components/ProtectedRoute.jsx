import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const userId = localStorage.getItem("token"); // Check if user ID exists in localStorage

  if (!userId) {
    alert("Login first to access this page!"); // Show alert
    return <Navigate to="/login" />; // Redirect to login page
  }

  return children; // Allow access if user ID exists
};

export default ProtectedRoute;
