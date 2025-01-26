import React, { useState } from "react"
import { X } from "lucide-react"
import styles from "./nuevoServicio.module.css"

const NewServiceForm = ({ onSubmit, onClose }) => {
  const [newService, setNewService] = useState({ name: "", image: null })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(newService)
  }

  const handleChange = (e) => {
    const { name, value, type, files } = e.target
    setNewService((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }))
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>
          <X size={24} />
        </button>
        <h2 className={styles.title}>Agregar Nuevo Servicio</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Nombre del Servicio</label>
            <input type="text" id="name" name="name" value={newService.name} onChange={handleChange} required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="image">Imagen del Servicio</label>
            <input type="file" id="image" name="image" onChange={handleChange} accept="image/*" required />
          </div>
          <button type="submit" className={styles.submitButton}>
            Agregar Servicio
          </button>
        </form>
      </div>
    </div>
  )
}

export default NewServiceForm

