import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";

export const Unauthorized = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleUnauthorized = async () => {
      try {
        await axios.post("http://localhost:3000/api/usuario/logout");
        localStorage.clear();
        Cookies.remove("token", { path: "/" });
        document.cookie =
          "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        console.log("Sesión cerrada debido a acceso no autorizado.");
        navigate("/login");
      } catch (error) {
        console.error("Error al procesar acceso no autorizado:", error);
      }
    };

    handleUnauthorized();
  }, [navigate]);

  return (
    window.confirm("Sesión cerrada debido a acceso no autorizado.")
  );
};

export default Unauthorized;
