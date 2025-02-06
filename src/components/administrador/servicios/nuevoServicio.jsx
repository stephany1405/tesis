import React, { useState } from "react";
import { X } from "lucide-react";
import styles from "./nuevoServicio.module.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const NewServiceForm = ({ onSubmit, onClose }) => {
  const [newService, setNewService] = useState({
    name: "",
    image: "",
    description: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setNewService((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", newService.name);
    formData.append("description", newService.description);
    formData.append("image", newService.image);

    try {
      const response = await axios.post(
        "http://localhost:3000/api/servicios/nuevaCategoria",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error:", error);
      setError("Error al registrar categoria.");
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>
          <X size={24} />
        </button>
        <h2 className={styles.title}>Agregar Nuevo Servicio</h2>
        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>Registrado exitosamente.</p>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Nombre del Servicio</label>
            <input
              type="text"
              id="name"
              name="name"
              value={newService.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="description">Descripción del Servicio</label>
            <textarea
              id="description"
              name="description"
              value={newService.description}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="image">Imagen del Servicio</label>
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleChange}
              accept="image/*"
              required
            />
          </div>
          <button type="submit" className={styles.submitButton}>
            Agregar Servicio
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewServiceForm;
