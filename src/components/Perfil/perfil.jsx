import React, { useState, useEffect } from "react";
import styles from "./perfil.module.css";
import axios from "axios";
import { getJWT } from "../middlewares/getToken";
import { jwtDecode } from "jwt-decode";
import { FaUser, FaEnvelope, FaPhone, FaIdCard, FaLock } from "react-icons/fa";
import Telefono from "../Mascaras/telefono";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    picture_profile: "",
    name: "",
    lastname: "",
    identification: "",
    email: "",
    telephone_number: "",
    securityQuestion: "",
    securityAnswer: "",
    confirmSecurityAnswer: "",
  });
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
    if (name === "telephone_number") {
      setUserData({ ...userData, [name]: value.replace(/\D/g, "") });
    } else {
      setUserData({ ...userData, [name]: value });
    }
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
          userID: decodedUserId,
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

  const handleSecurityQuestionChange = async (event) => {
    event.preventDefault();

    if (
      !userData.securityQuestion ||
      !userData.securityAnswer ||
      !userData.confirmSecurityAnswer
    ) {
      alert("Por favor, complete todos los campos.");
      return;
    }

    if (userData.securityAnswer !== userData.confirmSecurityAnswer) {
      alert("La respuesta a la pregunta de seguridad no coincide.");
      return;
    }

    try {
      const token = getJWT("token");

      const response = await axios.put(
        `http://localhost:3000/api/profile/${decodedUserId}/securityQuestion`,
        {
          securityQuestion: userData.securityQuestion,
          securityAnswer: userData.securityAnswer,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(response.data.message);
      await getUserData(decodedUserId);
      setUserData({
        ...userData,
        securityQuestion: "",
        securityAnswer: "",
        confirmSecurityAnswer: "",
      });
    } catch (error) {
      console.error("Error al cambiar la pregunta de seguridad:", error);
      alert(
        error.response?.data?.message ||
          "Error al cambiar la pregunta de seguridad."
      );
    }
  };

  return (
    <div className={styles.profileContainer}>
      <h1 className={styles.title}>Perfil de Usuario</h1>

      <div className={styles.section}>
        <h2>
          <FaUser /> Información Personal
        </h2>
        <img
          src={
            userData.picture_profile
              ? `http://localhost:3000${userData.picture_profile}`
              : "/placeholder.svg"
          }
          alt={`${userData.name} ${userData.lastname}`}
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
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Nombre:</span>
          <span className={styles.infoValue}>{userData.name}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Apellido:</span>
          <span className={styles.infoValue}>{userData.lastname}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Identificación:</span>
          <span className={styles.infoValue}>{userData.identification}</span>
        </div>
      </div>

      <div className={styles.section}>
        <h2>
          <FaEnvelope /> Datos de Contacto
        </h2>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Teléfono:</span>
          {isEditing ? (
            <Telefono
              name="telephone_number"
              value={userData.telephone_number}
              onChange={handleChange}
              className={styles.input}
            />
          ) : (
            <span className={styles.infoValue}>
              {userData.telephone_number}
            </span>
          )}
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Correo:</span>
          <span className={styles.infoValue}>{userData.email}</span>
        </div>
      </div>

      {isEditing && (
        <div className={styles.section}>
          <h2>
            <FaLock /> Cambiar Contraseña
          </h2>
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

      {isEditing && (
        <div className={styles.section}>
          <h2>
            <FaIdCard /> Cambiar pregunta de seguridad
          </h2>
          <form onSubmit={handleSecurityQuestionChange}>
            <input
              type="text"
              placeholder="Nueva pregunta de seguridad"
              name="securityQuestion"
              value={userData.securityQuestion}
              onChange={handleChange}
              className={styles.input}
              required
            />
            <input
              type="text"
              placeholder="Respuesta"
              value={userData.securityAnswer}
              name="securityAnswer"
              onChange={handleChange}
              className={styles.input}
              required
            />
            <input
              type="text"
              placeholder="Confirmar nueva respuesta"
              value={userData.confirmSecurityAnswer}
              name="confirmSecurityAnswer"
              onChange={handleChange}
              className={styles.input}
              required
            />
            <button type="submit" className={styles.passwordButton}>
              Cambiar Pregunta de seguridad
            </button>
          </form>
        </div>
      )}

      <button onClick={handleEdit} className={styles.editButton}>
        {isEditing
          ? "Guardar Cambios"
          : "Modificar Información y gestionar contraseñas"}
      </button>
    </div>
  );
};

export default Profile;
