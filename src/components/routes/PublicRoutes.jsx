import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "../login/login.jsx";
import Registro from "../registro/registro.jsx";
import ForgotPassword from "../forgotPassword/forgotPassword.jsx";
import { Unauthorized } from "../middlewares/unauthorized.jsx";

export const PublicRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/olvide-contrasena" element={<ForgotPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
    </Routes>
  );
};
