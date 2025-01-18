import React, { useState, useEffect } from "react";
import styles from "./perfil.module.css";
import axios from "axios";
import { getJWT } from "../middlewares/getToken";
import { jwtDecode } from "jwt-decode";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({});
  const [decodedUserId, setDecodedUserId] = useState(null);

  const getUserData = async (userId) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/profile/${userId}`
      );
      setUserData(response.data);
    } catch (error) {
      console.error("Error al obtener el perfil:", error);
      alert(error.response?.data?.message || "Error al obtener el perfil");
    }
  };
  useEffect(() => {
    const handleToken = async () => {
      const token = getJWT("token");
      try {
        const { id } = jwtDecode(token);
        setDecodedUserId(id);
        await getUserData(id);
      } catch (error) {
        console.log("Error decoding token:", error);
      }
    };
    handleToken();
  }, []);

  const handleEdit = async () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      try {
        const token = getJWT("token");
        const response = await axios.put(
          `http://localhost:3000/api/profile/${decodedUserId}`,
          {
            telephone_number: userData.telephone_number,
            email: userData.email,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        await getUserData(decodedUserId);
      } catch (error) {
        console.error("Error al actualizar el perfil:", error);
        alert(error.response?.data?.message || "Error al actualizar el perfil");
      }
      console.log("Saving changes:", userData);

      setUserData({
        ...userData,
        password: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append("picture_profile", file);
        formData.append("userId", decodedUserId);

        const response = await axios.post(
          "http://localhost:3000/api/uploads/upload-photo",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        setUserData({ ...userData, picture_profile: response.data.imageUrl });
      } catch (error) {
        console.error("Error al subir la imagen:", error);
        alert("Error al subir la imagen");
      }
    }
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();

    if (userData.newPassword !== userData.confirmPassword) {
      alert("Las contraseñas nuevas no coinciden");
      return;
    }

    try {
      const token = getJWT("token");
      const response = await axios.put(
        `http://localhost:3000/api/profile/${decodedUserId}/password`, 
        {
          currentPassword: userData.password,
          newPassword: userData.newPassword,
          confirmPassword: userData.confirmPassword,
          userID: decodedUserId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(response.data.message);
      setUserData({
        ...userData,
        password: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error al cambiar la contraseña:", error);
      alert(error.response?.data?.message || "Error al cambiar la contraseña");
    }
  };

  return (
    <div className={styles.profileContainer}>
      <h1 className={styles.title}>Perfil</h1>

      <div className={styles.section}>
        <h2>Información Personal</h2>
        <img
          src={
            userData.picture_profile
              ? `http://localhost:3000${userData.picture_profile}`
              : "/placeholder.svg"
          }
          alt="Foto de perfil"
          className={styles.profilePic}
        />
        {isEditing && (
          <input
            type="file"
            onChange={handleImageChange}
            accept="image/*"
            className={styles.fileInput}
          />
        )}
        <p>
          <strong>Nombre:</strong> {userData.name}
        </p>
        <p>
          <strong>Apellido:</strong> {userData.lastname}
        </p>
        <p>
          <strong>Identificación:</strong> {userData.identification}
        </p>
      </div>

      <div className={styles.section}>
        <h2>Datos de Contacto</h2>
        <p>
          <strong>Teléfono:</strong>
          {isEditing ? (
            <input
              type="text"
              name="telephone_number"
              value={userData.telephone_number}
              onChange={handleChange}
              className={styles.input}
            />
          ) : (
            userData.telephone_number
          )}
        </p>
        <p>
          <strong>Correo:</strong>
          {isEditing ? (
            <input
              type="email"
              name="email"
              value={userData.email}
              onChange={handleChange}
              className={styles.input}
            />
          ) : (
            userData.email
          )}
        </p>
      </div>

      {isEditing && (
        <div className={styles.section}>
          <h2>Cambiar Contraseña</h2>
          <form onSubmit={handlePasswordChange}>
            <input
              type="password"
              placeholder="Contraseña actual"
              name="password"
              value={userData.password}
              onChange={handleChange}
              className={styles.input}
              required
            />
            <input
              type="password"
              placeholder="Nueva contraseña"
              name="newPassword"
              value={userData.newPassword}
              onChange={handleChange}
              className={styles.input}
              required
            />
            <input
              type="password"
              placeholder="Confirmar nueva contraseña"
              name="confirmPassword"
              value={userData.confirmPassword}
              onChange={handleChange}
              className={styles.input}
              required
            />
            <button type="submit" className={styles.passwordButton}>
              Cambiar Contraseña
            </button>
          </form>
        </div>
      )}

      <button onClick={handleEdit} className={styles.editButton}>
        {isEditing ? "Guardar Cambios" : "Modificar Información"}
      </button>
    </div>
  );
};

export default Profile;
