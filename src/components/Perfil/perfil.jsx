"use client"

import { useState, useEffect } from "react"
import styles from "./perfil.module.css"
import axios from "axios"
import { getJWT } from "../middlewares/getToken"
import { jwtDecode } from "jwt-decode"
import { FaUser, FaEnvelope, FaIdCard, FaLock } from "react-icons/fa"
import Telefono from "../Mascaras/telefono"

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false)
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
    password: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState({})
  const [decodedUserId, setDecodedUserId] = useState(null)

  const getUserData = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/profile/${userId}`)
      setUserData(response.data)
    } catch (error) {
      console.error("Error al obtener el perfil:", error)
      alert(error.response?.data?.message || "Error al obtener el perfil")
    }
  }

  useEffect(() => {
    const handleToken = async () => {
      const token = getJWT("token")
      try {
        const { id } = jwtDecode(token)
        setDecodedUserId(id)
        await getUserData(id)
      } catch (error) {
        console.log("Error decoding token:", error)
      }
    }
    handleToken()
  }, []) // Removed getUserData from dependencies

  const validateField = (name, value) => {
    let error = ""
    switch (name) {
      case "telephone_number":
        if (!/^\d{11}$/.test(value)) {
          error = "El número de teléfono debe tener exactamente 11 dígitos"
        }
        break
      case "newPassword":
      case "confirmPassword":
        if (!/^[A-Za-z0-9]{8,12}$/.test(value)) {
          error = "La contraseña debe tener entre 8 y 12 caracteres alfanuméricos"
        }
        break
      case "securityAnswer":
      case "confirmSecurityAnswer":
        if (!/^[A-Za-z0-9\s]{1,14}$/.test(value)) {
          error = "La respuesta debe tener máximo 14 caracteres y solo puede contener letras, números y espacios"
        }
        break
      default:
        break
    }
    return error
  }

  const handleEdit = async () => {
    if (isEditing) {
      const newErrors = {}
      Object.keys(userData).forEach((key) => {
        const error = validateField(key, userData[key])
        if (error) newErrors[key] = error
      })

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        return
      }

      try {
        const token = getJWT("token")
        const response = await axios.put(
          `http://localhost:3000/api/profile/${decodedUserId}`,
          {
            telephone_number: userData.telephone_number,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
        await getUserData(decodedUserId)
      } catch (error) {
        console.error("Error al actualizar el perfil:", error)
        alert(error.response?.data?.message || "Error al actualizar el perfil")
      }
    }
    setIsEditing(!isEditing)
    setErrors({})
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    let newValue = value

    if (name === "telephone_number") {
      newValue = value.replace(/\D/g, "").slice(0, 11)
    } else if (name === "newPassword" || name === "confirmPassword") {
      newValue = value.replace(/[^A-Za-z0-9]/g, "").slice(0, 12)
    } else if (name === "securityAnswer" || name === "confirmSecurityAnswer") {
      newValue = value.replace(/[^A-Za-z0-9\s]/g, "").slice(0, 14)
    }

    setUserData({ ...userData, [name]: newValue })
    setErrors({ ...errors, [name]: validateField(name, newValue) })
  }

  const handleImageChange = async (event) => {
    const file = event.target.files[0]
    if (file) {
      try {
        const formData = new FormData()
        formData.append("picture_profile", file)
        formData.append("userId", decodedUserId)

        const response = await axios.post("http://localhost:3000/api/uploads/upload-photo", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })

        setUserData({ ...userData, picture_profile: response.data.imageUrl })
      } catch (error) {
        console.error("Error al subir la imagen:", error)
        alert("Error al subir la imagen")
      }
    }
  }

  const handlePasswordChange = async (event) => {
    event.preventDefault()

    if (userData.newPassword !== userData.confirmPassword) {
      setErrors({ ...errors, confirmPassword: "Las contraseñas nuevas no coinciden" })
      return
    }

    const passwordError = validateField("newPassword", userData.newPassword)
    if (passwordError) {
      setErrors({ ...errors, newPassword: passwordError })
      return
    }

    try {
      const token = getJWT("token")
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
        },
      )

      alert(response.data.message)
      setUserData({
        ...userData,
        password: "",
        newPassword: "",
        confirmPassword: "",
      })
      setErrors({})
    } catch (error) {
      console.error("Error al cambiar la contraseña:", error)
      alert(error.response?.data?.message || "Error al cambiar la contraseña")
    }
  }

  const securityQuestions = [
    "¿Cuál es el nombre de tu primera mascota?",
    "¿En qué ciudad naciste?",
    "¿Cuál es el nombre de tu mejor amigo de la infancia?",
    "¿Cuál es tu película favorita?",
    "¿Cuál es el nombre de tu escuela primaria?",
  ]

  const handleSecurityQuestionChange = async (event) => {
    event.preventDefault()

    if (!userData.securityQuestion || !userData.securityAnswer || !userData.confirmSecurityAnswer) {
      setErrors({ ...errors, securityQuestion: "Por favor, complete todos los campos." })
      return
    }

    if (userData.securityAnswer !== userData.confirmSecurityAnswer) {
      setErrors({ ...errors, confirmSecurityAnswer: "La respuesta a la pregunta de seguridad no coincide." })
      return
    }

    const answerError = validateField("securityAnswer", userData.securityAnswer)
    if (answerError) {
      setErrors({ ...errors, securityAnswer: answerError })
      return
    }

    try {
      const token = getJWT("token")

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
        },
      )

      alert(response.data.message)
      await getUserData(decodedUserId)
      setUserData({
        ...userData,
        securityQuestion: "",
        securityAnswer: "",
        confirmSecurityAnswer: "",
      })
      setErrors({})
    } catch (error) {
      console.error("Error al cambiar la pregunta de seguridad:", error)
      alert(error.response?.data?.message || "Error al cambiar la pregunta de seguridad.")
    }
  }

  return (
    <div className={styles.profileContainer}>
      <h1 className={styles.title}>Perfil de Usuario</h1>

      <div className={styles.section}>
        <h2>
          <FaUser /> Información Personal
        </h2>
        <img
          src={userData.picture_profile ? `http://localhost:3000${userData.picture_profile}` : "/placeholder.svg"}
          alt={`${userData.name} ${userData.lastname}`}
          className={styles.profilePic}
        />
        {isEditing && <input type="file" onChange={handleImageChange} accept="image/*" className={styles.fileInput} />}
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
            <div className={styles.inputWrapper}>
              <Telefono
                name="telephone_number"
                value={userData.telephone_number}
                onChange={handleChange}
                className={styles.input}
              />
              {errors.telephone_number && <span className={styles.error}>{errors.telephone_number}</span>}
            </div>
          ) : (
            <span className={styles.infoValue}>{userData.telephone_number}</span>
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
            <div className={styles.inputWrapper}>
              <input
                type="password"
                placeholder="Contraseña actual"
                name="password"
                value={userData.password}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>
            <div className={styles.inputWrapper}>
              <input
                type="password"
                placeholder="Nueva contraseña"
                name="newPassword"
                value={userData.newPassword}
                onChange={handleChange}
                className={styles.input}
                required
              />
              {errors.newPassword && <span className={styles.error}>{errors.newPassword}</span>}
            </div>
            <div className={styles.inputWrapper}>
              <input
                type="password"
                placeholder="Confirmar nueva contraseña"
                name="confirmPassword"
                value={userData.confirmPassword}
                onChange={handleChange}
                className={styles.input}
                required
              />
              {errors.confirmPassword && <span className={styles.error}>{errors.confirmPassword}</span>}
            </div>
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
            <div className={styles.inputWrapper}>
              <select
                id="securityQuestion"
                name="securityQuestion"
                className={styles.input}
                value={userData.securityQuestion}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione una pregunta de seguridad</option>
                {securityQuestions.map((question, index) => (
                  <option key={index} value={question}>
                    {question}
                  </option>
                ))}
              </select>
              {errors.securityQuestion && <span className={styles.error}>{errors.securityQuestion}</span>}
            </div>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                placeholder="Respuesta"
                value={userData.securityAnswer}
                name="securityAnswer"
                onChange={handleChange}
                className={styles.input}
                required
                maxLength={14}
              />
              {errors.securityAnswer && <span className={styles.error}>{errors.securityAnswer}</span>}
            </div>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                placeholder="Confirmar nueva respuesta"
                value={userData.confirmSecurityAnswer}
                name="confirmSecurityAnswer"
                onChange={handleChange}
                className={styles.input}
                required
                maxLength={14}
              />
              {errors.confirmSecurityAnswer && <span className={styles.error}>{errors.confirmSecurityAnswer}</span>}
            </div>
            <button type="submit" className={styles.passwordButton}>
              Cambiar Pregunta de seguridad
            </button>
          </form>
        </div>
      )}

      <button onClick={handleEdit} className={styles.editButton}>
        {isEditing ? "Guardar Cambios" : "Modificar Información y gestionar contraseñas"}
      </button>
    </div>
  )
}

export default Profile

