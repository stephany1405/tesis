import React, { useState, useEffect } from "react";
import { X, Plus, Edit, Trash, Pencil } from "lucide-react";
import styles from "./Modal.module.css";
import Form from "./form";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SubServiceModal = ({ service, onClose, onUpdate }) => {
  const [subServices, setSubServices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSubService, setEditingSubService] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [noSubServicesShown, setNoSubServicesShown] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const normalizeImageUrl = (url) => {
    if (!url) return "";
    let normalizedUrl = url.replace("http://localhost:5173", "");
    if (normalizedUrl.startsWith("/uploads/")) {
      return `http://localhost:5173/backend${normalizedUrl}`;
    }
    return `http://localhost:5173/${normalizedUrl}`;
  };

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      if (!service?.id) {
        throw new Error("Service ID es undefined");
      }

      const response = await axios.get(
        `http://localhost:3000/api/servicios/categoria/${service.id}`,
        {
          timeout: 5000,
          headers: {
            Accept: "application/json",
          },
        }
      );
      if (!Array.isArray(response.data)) {
        console.error("Respuesta no válida:", response.data);
        return;
      }

      const fetchedServices = response.data.map((service) => ({
        id: service.id,
        parent_id: service.parent_classification_id,
        name: service.name || service.classification_type,
        description: service.description,
        service_image: normalizeImageUrl(service.service_image),
        price: service.price,
        duration: service.duration || service.time,
      }));
      setSubServices(fetchedServices);

      if (fetchedServices.length === 0 && !noSubServicesShown) {
        toast.info("No hay subservicios disponibles para esta categoría.");
        setNoSubServicesShown(true);
      }
    } catch (error) {
      console.error("Error detallado:", error);
      if (error.response) {
        if (error.response.status === 404) {
          toast.error("No se encontraron los servicios de categoría");
        } else {
          toast.error(`Error del servidor: ${error.response.status}`);
        }
      } else if (error.request) {
        toast.error("No se pudo conectar con el servidor");
      } else {
        toast.error("Error al procesar la solicitud");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (service?.id) {
      fetchServices();
    }
  }, [service?.id]);

  const handleAddSubService = async (formData) => {
    try {
      await axios.post(
        "http://localhost:3000/api/servicios/nuevoServicio",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      await fetchServices();
      setShowForm(false);
      toast.success("¡Subservicio registrado correctamente!");
    } catch (error) {
      console.error("Error al agregar subservicio:", error);
      toast.error("Error al registrar el subservicio.");
    }
  };

  const handleDeleteCategory = async (id) => {
    if (
      window.confirm("¿Estás seguro de que deseas eliminar esta categoría?")
    ) {
      try {
        await axios.put(
          `http://localhost:3000/api/servicios/eliminarServicio/${id}`
        );
        await fetchServices();
        toast.success("Categoría eliminada correctamente!");
      } catch (error) {
        console.error("Error al eliminar categoría:", error);
        toast.error("Error al eliminar la Categoría.");
      }
    }
  };

  const handleDeleteService = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este servicio?")) {
      try {
        await axios.put(
          `http://localhost:3000/api/servicios/eliminarServiciodeCategoria/${id}`
        );
        await fetchServices();
        toast.success("Servicio eliminado correctamente!");
      } catch (error) {
        console.error("Error al eliminar servicio:", error);
        toast.error("Error al eliminar el servicio.");
      }
    }
  };

  const handleEditSubService = (subService) => {
    setEditingSubService(subService);
    setShowForm(true);
  };

  const handleUpdateSubService = async (formData) => {
    try {
      await axios.put(
        `http://localhost:3000/api/servicios/actualizarServicio/${editingSubService.id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      await fetchServices();
      setEditingSubService(null);
      setShowForm(false);
      toast.success("¡Subservicio actualizado correctamente!");
    } catch (error) {
      console.error("Error al actualizar subservicio:", error);
      toast.error("Error al actualizar el subservicio.");
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingSubService(null);
  };
  const handleEditService = () => {
    setEditingCategory(service);
    setShowForm(true);
  };
  const handleUpdateCategory = async (formData) => {
    try {
      await axios.put(
        `http://localhost:3000/api/servicios/actualizar-categoria/${editingCategory.id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      await fetchServices();
      toast.success("¡Categoría actualizada correctamente!");

      if (onUpdate) {
        onUpdate();
      }
      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (error) {
      console.error("Error al actualizar categoría:", error);
      toast.error("Error al actualizar la categoría.");
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <button className={styles.closeButton} onClick={onClose}>
          <X size={24} />
        </button>

        <h2 className={styles.modalTitle}>{service.name}</h2>
        <p className={styles.serviceDescription}>{service.description}</p>
        <div className={styles.headerActions}>
          <button
            className={`${styles.deleteButton} ${styles.deleteCategoryButton}`}
            onClick={() => handleDeleteCategory(service.id)}
          >
            <Trash size={18} />
            Eliminar Categoría
          </button>
          <button
            className={`${styles.deleteButton} ${styles.deleteCategoryButton}`}
            onClick={() => handleEditService(service.id)}
          >
            <Pencil size={18} />
            Editar Categoría
          </button>
        </div>

        {isLoading ? (
          <div className={styles.loading}>Cargando subservicios...</div>
        ) : (
          <div className={styles.subServicesGrid}>
            {subServices.map((subService) => (
              <div key={subService.id} className={styles.subServiceCard}>
                <div className={styles.imageContainer}>
                  <img
                    src={subService.service_image}
                    alt={subService.name}
                    className={styles.subServiceImage}
                  />
                </div>

                <div className={styles.subServiceDetails}>
                  <h3 className={styles.subServiceName}>{subService.name}</h3>
                  <p className={styles.subServiceDescription}>
                    {subService.description}
                  </p>
                  <div className={styles.subServiceInfo}>
                    <span className={styles.duration}>
                      {subService.duration}
                    </span>
                    <span className={styles.price}>
                      ${Number(subService.price).toFixed(2)}
                    </span>
                  </div>

                  <div className={styles.actionButtons}>
                    <button
                      className={styles.editButton}
                      onClick={() => handleEditSubService(subService)}
                    >
                      <Edit size={18} />
                      Editar
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDeleteService(subService.id)}
                    >
                      <Trash size={18} />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className={styles.addSubServiceCard}>
              <button
                className={styles.addButton}
                onClick={() => setShowForm(true)}
              >
                <Plus size={24} />
                <span>Agregar nuevo subservicio</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <Form
          isCategoryEdit={!!editingCategory}
          initialData={editingCategory || editingSubService}
          onSubmit={
            editingCategory
              ? handleUpdateCategory
              : editingSubService
              ? handleUpdateSubService
              : handleAddSubService
          }
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default SubServiceModal;
