import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = document.cookie.includes("token"); // Verifica si la cookie "token" existe.

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
