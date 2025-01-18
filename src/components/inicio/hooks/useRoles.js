import { useState, useEffect } from "react";
import axios from "axios";

export const useRoles = () => {
  const [roles, setRoles] = useState({
    specialist: null,
    administrador: null,
    cliente: null,
  });

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const [specialistResponse, AdminResponse, ClientResponse] =
          await Promise.all([
            axios.get("http://localhost:3000/api/getRoleSpecialist"),
            axios.get("http://localhost:3000/api/getRoleAdministrator"),
            axios.get("http://localhost:3000/api/getRoleClient"),
          ]);

        setRoles({
          specialist: String(specialistResponse.data.id),
          administrador: String(AdminResponse.data.id),
          cliente: String(ClientResponse.data.id),
        });
      } catch (error) {
        console.error("Error fetching roles:", error);
        setRoles({ specialist: null, administrador: null, cliente: null });
      }
    };

    fetchRoles();
    
  }, []);
  return roles;
};
