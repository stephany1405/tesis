import React, { useState, forwardRef } from "react"
import { IMaskInput } from "react-imask"
import styles from "./registro.module.css"
import { X } from "lucide-react"

const TextMaskCustom2 = forwardRef(function TextMaskCustom2(props, ref) {
  const { onChange, ...other } = props
  return (
    <IMaskInput
      {...other}
      mask="00000000"
      inputRef={ref}
      onAccept={(value, mask) => {
        onChange({ target: { name: props.name, value: mask._unmaskedValue } })
      }}
      overwrite
      className={styles.input}
    />
  )
})

const formatSelectedSpecialties = (specialties) => {
  if (specialties.length === 0) return "Ninguna especialidad seleccionada"
  return specialties.join(", ")
}

const Registro = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    lastname: "",
    identification: "",
    email: "",
    telephone_number: "",
    password: "",
    date_of_birth: "",
    specialty: "",
    specialties: [],
  })
  const [error, setError] = useState("")

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSpecialtyChange = (e) => {
    const { value, checked } = e.target
    setFormData((prevState) => ({
      ...prevState,
      specialties: checked
        ? [...prevState.specialties, value]
        : prevState.specialties.filter((specialty) => specialty !== value),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Aquí puedes agregar la lógica de validación si es necesario
      onSubmit(formData)
    } catch (error) {
      console.error("Error al registrar:", error)
      setError("Error al registrar. Por favor, inténtelo de nuevo.")
    }
  }

  return (
    <div className={styles.formOverlay}>
      <div className={styles.formContainer}>
        <button className={styles.closeButton} onClick={onClose}>
          <X size={24} />
        </button>
        <form className={styles.form} onSubmit={handleSubmit}>
          <h2 className={styles.formTitle}>Registrar Nuevo Especialista</h2>
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Nombre
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className={styles.input}
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="lastname" className={styles.label}>
              Apellido
            </label>
            <input
              type="text"
              id="lastname"
              name="lastname"
              className={styles.input}
              value={formData.lastname}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="identification" className={styles.label}>
              Identificación
            </label>
            <TextMaskCustom2
              id="identification"
              name="identification"
              value={formData.identification}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className={styles.input}
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="telephone_number" className={styles.label}>
              Número de Teléfono
            </label>
            <input
              type="tel"
              id="telephone_number"
              name="telephone_number"
              className={styles.input}
              value={formData.telephone_number}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className={styles.input}
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="date_of_birth" className={styles.label}>
              Fecha de Nacimiento
            </label>
            <input
              type="date"
              id="date_of_birth"
              name="date_of_birth"
              className={styles.input}
              value={formData.date_of_birth}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Especialidades</label>
            <div className={styles.checkboxGroup}>
              {["Manicura", "Pedicura", "Faciales", "Corporales", "Epilaciones", "Extensiones", "Quiropodía"].map(
                (specialty) => (
                  <label key={specialty} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="specialties"
                      value={specialty}
                      checked={formData.specialties.includes(specialty)}
                      onChange={handleSpecialtyChange}
                      className={styles.checkbox}
                    />
                    {specialty}
                  </label>
                ),
              )}
            </div>
            <div className={styles.specialtySummary}>
              <span className={styles.specialtySummaryLabel}>Usted se especializa en:</span>
              <span className={styles.specialtySummaryText}>{formatSelectedSpecialties(formData.specialties)}</span>
            </div>
          </div>
          <button type="submit" className={styles.submitButton}>
            Registrar Especialista
          </button>
        </form>
      </div>
    </div>
  )
}

export default Registro

