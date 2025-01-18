import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ children, requiredRole }) => {
  const isAuthenticated = document.cookie.includes("token");
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  if (!isAuthenticated || !token) {
    return <Navigate to="/unauthorized" />;
  }

  const decodedToken = jwtDecode(token);
  const userRole = decodedToken.role_id;

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default ProtectedRoute;
