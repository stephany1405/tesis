import React, { useState } from "react";
import styles from "./bolsa.module.css";

export const AddressForm = ({ onLocationSelect }) => {
  const [formData, setFormData] = useState({
    estado: "Distrito Capital",
    municipio: "Libertador",
    parroquia: "",
    tipoVia: "",
    nombreVia: "",
    tipoInmueble: "",
    nombreInmueble: "",
    numeroHabitacion: "",
    tipoZona: "",
    nombreZona: "",
    referencia: "",
  });

  const parroquias = [
    "Santa Rosalía",
    "El Valle",
    "Coche",
    "Caricuao",
    "Macarao",
    "Antímano",
    "La Vega",
    "El Paraíso",
    "El Junquito",
    "Sucre (Catia)",
    "San Juan",
    "Santa Teresa",
    "23 de enero",
    "La Pastora",
    "Altagracia",
    "San José",
    "San Bernardino",
    "Catedral",
    "Candelaria",
    "San Agustín",
    "El Recreo",
    "San Pedro",
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const direccionCompleta =
      `${formData.estado}, ${formData.municipio}, ${formData.parroquia}, 
      ${formData.tipoVia} ${formData.nombreVia}, 
      ${formData.tipoInmueble} ${formData.nombreInmueble} #${formData.numeroHabitacion}, 
      ${formData.tipoZona} ${formData.nombreZona} ${formData.referencia}`
        .replace(/\s+/g, " ")
        .trim();

    onLocationSelect({ address: direccionCompleta });
  };

  const isFormValid = () => {
    return Object.values(formData).every((value) => value.trim() !== "");
  };

  return (
    <div className={styles.addressFormContainer}>
      <form onSubmit={handleSubmit} className={styles.addressForm}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="estado">Estado:</label>
            <input
              type="text"
              id="estado"
              name="estado"
              value={formData.estado}
              readOnly
              className={styles.inputReadOnly}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="municipio">Municipio:</label>
            <input
              type="text"
              id="municipio"
              name="municipio"
              value={formData.municipio}
              readOnly
              className={styles.inputReadOnly}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="parroquia">Parroquia:</label>
            <select
              id="parroquia"
              name="parroquia"
              value={formData.parroquia}
              onChange={handleInputChange}
              required
              className={styles.inputText}
            >
              <option value="">Seleccione una parroquia</option>
              {parroquias.map((parroquia) => (
                <option key={parroquia} value={parroquia}>
                  {parroquia}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Tipo de Vía:</label>
          <div className={styles.radioGroup}>
            {["Calle", "Avenida", "Vereda", "Carretera", "Esquina"].map(
              (tipo) => (
                <label key={tipo} className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="tipoVia"
                    value={tipo}
                    checked={formData.tipoVia === tipo}
                    onChange={handleInputChange}
                    required
                  />
                  {tipo}
                </label>
              )
            )}
          </div>
          <input
            type="text"
            name="nombreVia"
            value={formData.nombreVia}
            onChange={handleInputChange}
            placeholder={`Nombre de ${formData.tipoVia || "la vía"}`}
            className={styles.inputText}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Tipo de Inmueble:</label>
          <div className={styles.radioGroup}>
            {["Edificio", "Centro Comercial", "Quinta", "Casa", "Local"].map(
              (tipo) => (
                <label key={tipo} className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="tipoInmueble"
                    value={tipo}
                    checked={formData.tipoInmueble === tipo}
                    onChange={handleInputChange}
                    required
                  />
                  {tipo}
                </label>
              )
            )}
          </div>
          <div className={styles.formRow}>
            <input
              type="text"
              name="nombreInmueble"
              value={formData.nombreInmueble}
              onChange={handleInputChange}
              placeholder={`Nombre del ${formData.tipoInmueble || "inmueble"}`}
              className={styles.inputText}
              required
            />
            <input
              type="text"
              name="numeroHabitacion"
              value={formData.numeroHabitacion}
              onChange={handleInputChange}
              placeholder="Número/Letra de habitación"
              className={styles.inputText}
              required
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Tipo de Zona:</label>
          <div className={styles.radioGroup}>
            {[
              "Urbanización",
              "Zona",
              "Sector",
              "Conjunto Residencial",
              "Barrio",
            ].map((tipo) => (
              <label key={tipo} className={styles.radioLabel}>
                <input
                  type="radio"
                  name="tipoZona"
                  value={tipo}
                  checked={formData.tipoZona === tipo}
                  onChange={handleInputChange}
                  required
                />
                {tipo}
              </label>
            ))}
          </div>
          <input
            type="text"
            name="nombreZona"
            value={formData.nombreZona}
            onChange={handleInputChange}
            placeholder={`Nombre de ${formData.tipoZona || "la zona"}`}
            className={styles.inputText}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="referencia">Referencia:</label>
          <textarea
            name="referencia"
            id="referencia"
            value={formData.referencia}
            onChange={handleInputChange}
            placeholder={`Introducir una ${
              formData.referencia || "referencia"
            } de la zona donde se ubica.`}
            className={styles.textareabag}
            required
          />
        </div>
        <button
          type="submit"
          className={styles.submitButton}
          disabled={!isFormValid()}
        >
          Confirmar Dirección
        </button>
      </form>
    </div>
  );
};
