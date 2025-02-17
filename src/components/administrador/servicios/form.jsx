import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import styles from "./form.module.css";

const SubServiceForm = ({
  categoryId,
  onSubmit,
  onClose,
  initialData = null,
  isCategoryEdit = false,
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    duration: initialData?.duration || "",
    price: initialData?.price || "",
    image: null,
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const handleSidebarChange = () => {
      setIsSidebarCollapsed(
        document.body.classList.contains("sidebar-collapsed")
      );
    };
    handleSidebarChange();
    const observer = new MutationObserver(handleSidebarChange);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description,
        duration: initialData.duration || "",
        price: initialData.price || "",
        image: null,
      });
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formDataToSubmit = new FormData();

    for (const key in formData) {
      if (formData[key] === undefined) continue;
      formDataToSubmit.append(key, formData[key]);
    }

    onSubmit(formDataToSubmit);
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value || "",
    }));
  };

  return (
    <div className={styles.formOverlay}>
      <div className={styles.formContent}>
        <button className={styles.closeButton} onClick={onClose}>
          <X size={24} />
        </button>

        <h2 className={styles.formTitle}>
          {isCategoryEdit
            ? "Editar Categoría"
            : initialData
            ? "Editar Subservicio"
            : "Agregar Nuevo Subservicio"}
        </h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name">
              {isCategoryEdit
                ? "Nombre de la Categoría"
                : "Nombre del Subservicio"}
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Descripción</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          {!isCategoryEdit && (
            <>
              <div className={styles.formGroup}>
                <label htmlFor="duration">Duración</label>
                <input
                  type="text"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="Ejemplo: 1 hora 30 minutos"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="price">Precio $</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="image">
              {isCategoryEdit
                ? "Imagen de la Categoría"
                : "Imagen del Subservicio"}
            </label>
            {initialData && initialData.service_image && (
              <div>
                <img
                  src={initialData.service_image}
                  alt="Imagen actual"
                  style={{ width: "100px", height: "auto" }}
                />
                <p>Imagen actual</p>
              </div>
            )}
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleChange}
              accept="image/*"
            />
          </div>

          <button type="submit" className={styles.submitButton}>
            {initialData
              ? "Guardar Cambios"
              : isCategoryEdit
              ? "Guardar Categoría"
              : "Agregar Subservicio"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubServiceForm;
