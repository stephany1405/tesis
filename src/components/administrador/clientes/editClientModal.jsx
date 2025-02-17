import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import "./editmodal.css";
const EditClientModal = ({ client, onClose, onUpdateClient }) => {
  const [formData, setFormData] = useState({
    name: client.name || "",
    lastname: client.lastname || "",
    identification: client.identification || "",
    telephone_number: client.telephone_number || "",
    email: client.email || "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || "",
        lastname: client.lastname || "",
        identification: client.identification || "",
        telephone_number: client.telephone_number || "",
        email: client.email || "",
      });
    }
  }, [client]);

  const validateForm = async () => {
    let tempErrors = {};
    let isValid = true;

    if (formData.identification !== client.identification) {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/verificar-identificacion/${formData.identification}`
        );
        if (response.data.exists) {
          tempErrors.identification = "Esta identificación ya está registrada";
          isValid = false;
        }
      } catch (error) {
        console.error("Error al verificar identificación:", error);
      }
    }

    const phoneRegex = /^(0424|0414|0416|0426|0412)\d{7}$/;
    if (!phoneRegex.test(formData.telephone_number)) {
      tempErrors.telephone_number =
        "Número inválido. Debe comenzar con 0424, 0414, 0416, 0426 o 0412 y tener 11 dígitos en total";
      isValid = false;
    }

    if (formData.email !== client.email) {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/verificar-email/${formData.email}`
        );
        if (response.data.exists) {
          tempErrors.email = "Este correo ya está registrado";
          isValid = false;
        }
      } catch (error) {
        console.error("Error al verificar email:", error);
      }
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const isValid = await validateForm();

    if (isValid) {
      try {
        const updatedFields = {};
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== client[key]) {
            updatedFields[key] = value;
          }
        });

        if (Object.keys(updatedFields).length > 0) {
          const response = await axios.put(
            `http://localhost:3000/api/actualizar-usuario/${client.id}`,
            updatedFields
          );

          if (response.status === 200) {
            toast.success("Usuario actualizado exitosamente", {
              position: "top-right",
              autoClose: 3000,
            });

            if (typeof onUpdateClient === "function") {
              onUpdateClient({ ...client, ...updatedFields });
            }

            setTimeout(() => {
              onClose();
            }, 3000);
          }
        } else {
          toast.info("No se realizaron cambios", {
            position: "top-right",
            autoClose: 2000,
          });
          onClose();
        }
      } catch (error) {
        console.error("Error actualizando usuario:", error);
        toast.error("Error al actualizar usuario", {
          position: "top-right",
        });
      }
    }

    setIsSubmitting(false);
  };

  return (
    <div className="formOverlay">
      <div className="formContent" onClick={(e) => e.stopPropagation()}>
        <button className="closeButton" onClick={onClose}>
          <X size={24} />
        </button>
        <h2 className="formTitle">Editar Cliente</h2>
        <form onSubmit={handleSubmit} className="form">
          <div className="formGroup">
            <label htmlFor="name">Nombre</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="formGroup">
            <label htmlFor="lastname">Apellido</label>
            <input
              type="text"
              id="lastname"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              required
            />
          </div>

          <div className="formGroup">
            <label htmlFor="identification">Identificación</label>
            <input
              type="text"
              id="identification"
              name="identification"
              value={formData.identification}
              onChange={handleChange}
              required
            />
            {errors.identification && (
              <p className="errorText">{errors.identification}</p>
            )}
          </div>

          <div className="formGroup">
            <label htmlFor="telephone_number">Teléfono</label>
            <input
              type="text"
              id="telephone_number"
              name="telephone_number"
              value={formData.telephone_number}
              onChange={handleChange}
              required
              placeholder="Ej: 04241234567"
            />
            {errors.telephone_number && (
              <p className="errorText">{errors.telephone_number}</p>
            )}
          </div>

          <div className="formGroup">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && <p className="errorText">{errors.email}</p>}
          </div>

          <button
            type="submit"
            className="submitButton"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Guardando..." : "Guardar Cambios"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditClientModal;
