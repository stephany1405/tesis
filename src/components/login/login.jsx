import React, { useState } from "react";
import styles from "../login/login.module.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const onSubmit = async (data) => {
      try {
        const payload = {
          email: data.email,
          password: data.password,
        };
        const response = await axios.post("http://localhost:3000/api/usuario/login", payload);
        alert("Inicio de sesión exitoso");

        const decodedToken = jwtDecode(response.data.token)
        const userId = decodedToken.userId || decodedToken.id; 
        localStorage.setItem("userId", userId);
        navigate("/cliente");
      } catch (error) {
        console.error("Error en iniciar sesion:", error.response?.data || error.message);
        let errorMessage = "Hubo un problema con el inicio de sesión";
        if (error.response?.data) {
          errorMessage = error.response.data.message || errorMessage;
        }
        alert(errorMessage);
      }
    };

    onSubmit({ email, password });
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2 className={styles.title}>Iniciar Sesión</h2>
        <div className={styles.inputGroup}>
          <label htmlFor="email" className={styles.label}>
            Correo Electrónico
          </label>
          <input
            type="email"
            id="email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="password" className={styles.label}>
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className={styles.button}>
          Iniciar Sesión
        </button>
      </form>
    </div>
  );
};

export default Login;