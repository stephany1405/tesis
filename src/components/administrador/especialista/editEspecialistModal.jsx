import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import "./editmodal.css";

// Función para parsear las especialidades (¡CORREGIDA!)
const parsespecialization = (specializationString) => {
  if (!specializationString) {
    return [];
  }
  try {
    // Intenta parsear como JSON.  Esta es la clave.
    const parsed = JSON.parse(specializationString);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Error parsing specialization:", error, specializationString);
    return []; // Devuelve un array vacío si hay error
  }
};

// Función para formatear las especialidades (¡CORREGIDA!)
const formatspecializationForDB = (specialization) => {
  if (!specialization || specialization.length === 0) {
    return null; // O "" si prefieres una cadena vacía en la BD
  }
  // Convierte el array a una cadena JSON.
  return JSON.stringify(specialization);
};

const EditSpecialistModal = ({ client, onClose, onUpdateClient }) => {
  // Estado inicial del formulario (¡CORREGIDO!)
  const [formData, setFormData] = useState({
    name: client.specialist_name || "",
    lastname: client.specialist_lastname || "",
    identification: client.specialist_identification || "",
    telephone_number: client.specialist_phone || "",
    email: client.specialist_email || "",
    specialization: [], // Inicializa como array vacío
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // useEffect para cargar los datos del cliente (¡CORREGIDO!)
  useEffect(() => {
    if (client) {
      setFormData({
        name: client.specialist_name || "",
        lastname: client.specialist_lastname || "",
        identification: client.specialist_identification || "",
        telephone_number: client.specialist_phone || "",
        email: client.specialist_email || "",
        // Usa parsespecialization SOLO si client.specialization existe y NO es un array
        specialization: client.specialization
          ? Array.isArray(client.specialization)
            ? client.specialization
            : parsespecialization(client.specialization)
          : [],
      });
    }
  }, [client]);

  const formatSelectedspecialization = (specialization) => specialization.join(", ");

  //Validaciones del formulario
  const validateForm = async () => {
    let tempErrors = {};
    let isValid = true;

    //Verifica la identificacion
    if (
      formData.identification &&
      formData.identification !== client.specialist_identification
    ) {
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

    //Valida el numero de telefono
    if (formData.telephone_number) {
      const phoneRegex = /^(0424|0414|0416|0426|0412)\d{7}$/;
      if (!phoneRegex.test(formData.telephone_number)) {
        tempErrors.telephone_number =
          "Número inválido. Debe comenzar con 0424, 0414, 0416, 0426 o 0412 y tener 11 dígitos en total";
        isValid = false;
      }
    }
    //Verifica el correo
    if (formData.email && formData.email !== client.specialist_email) {
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

  //Manejo de los cambios de los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //Manejo de las especialidades
  const handleSpecialtyChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const specialization = prev.specialization || [];
      if (checked) {
        return { ...prev, specialization: [...specialization, value] };
      } else {
        return { ...prev, specialization: specialization.filter((s) => s !== value) };
      }
    });
  };

  //Manejo del envio del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const isValid = await validateForm();

    if (isValid) {
      try {
        const updatedFields = {};
        Object.entries(formData).forEach(([key, value]) => {
          if (key === "specialization") {
            // Compara las especialidades, formateándolas primero
            const currentspecialization = client.specialization
              ? Array.isArray(client.specialization)
                ? client.specialization
                : parsespecialization(client.specialization)
              : [];

            // Compara las versiones JSON stringificadas
            if (
              JSON.stringify(value.sort()) !==
              JSON.stringify(currentspecialization.sort())
            ) {
              updatedFields.specialization = value; // Envía el array, no la cadena formateada
            }
          } else if (key === "name" && value !== client.specialist_name) {
            updatedFields.name = value;
          } else if (
            key === "lastname" &&
            value !== client.specialist_lastname
          ) {
            updatedFields.lastname = value;
          } else if (
            key === "identification" &&
            value !== client.specialist_identification
          ) {
            updatedFields.identification = value;
          } else if (
            key === "telephone_number" &&
            value !== client.specialist_phone
          ) {
            updatedFields.telephone_number = value;
          } else if (key === "email" && value !== client.specialist_email) {
            updatedFields.email = value;
          }
        });

        if (Object.keys(updatedFields).length > 0) {
          const response = await axios.put(
            `http://localhost:3000/api/actualizar-especialista/${client.specialist_id}`,
            updatedFields //Se envia el objeto actualizado
          );

          if (response.status === 200) {
            toast.success("Especialista actualizado exitosamente", {
              position: "top-right",
              autoClose: 3000,
            });

            // Actualiza el cliente en el estado del componente padre (¡IMPORTANTE!)
            const updatedClient = {
              ...client, // Copia las propiedades existentes
              ...response.data.specialist, // Sobrescribe con las nuevas
            };

            if (typeof onUpdateClient === "function") {
              onUpdateClient(updatedClient);
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
        console.error("Error actualizando especialista:", error);
        toast.error("Error al actualizar especialista", {
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
        <h2 className="formTitle">Editar Especialista</h2>
        <form onSubmit={handleSubmit} className="form">
          <div className="formGroup">
            <label htmlFor="name">Nombre</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
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
            />
            {errors.email && <p className="errorText">{errors.email}</p>}
          </div>

          <div className="formGroup">
            <label className="label">
              Especialidades <span className="Field">*</span>
            </label>
            <div className="specializationGrid">
              {[
                "Manicura",
                "Pedicura",
                "Faciales",
                "Corporales",
                "Epilaciones",
                "Extensiones",
                "Quiropodía",
              ].map((specialty) => (
                <label key={specialty} className="specialtyLabel">
                  <input
                    type="checkbox"
                    name="specialization"
                    value={specialty}
                    checked={formData.specialization.includes(specialty)}
                    onChange={handleSpecialtyChange}
                    className="specialtyCheckbox"
                  />
                  <span className="specialtyText">{specialty}</span>
                </label>
              ))}
            </div>
            {errors.specialization && (
              <p className="errorText">{errors.specialization}</p>
            )}
            <div className="specialtySummary">
              <span className="specialtySummaryLabel">
                Usted se especializa en:
              </span>
              <span className="specialtySummaryText">
                {formatSelectedspecialization(formData.specialization)}
              </span>
            </div>
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

export default EditSpecialistModal;
