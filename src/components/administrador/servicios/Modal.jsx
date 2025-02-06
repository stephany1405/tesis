import React, { useState, useEffect } from "react";
import { X, Plus, Edit, Trash } from "lucide-react";
import styles from "./Modal.module.css";
import Form from "./form";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SubServiceModal = ({ service, onClose }) => {
  const [subServices, setSubServices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSubService, setEditingSubService] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [noSubServicesShown, setNoSubServicesShown] = useState(false);

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
        console.error(response.data);
        return;
      }

      const fetchedServices = response.data.map((service) => ({
        id: service.id,
        name: service.classification_type,
        description: service.description,
        service_image: service.service_image.startsWith("http")
          ? service.service_image
          : `http://localhost:5173/${service.service_image}`,
        price: service.price,
        duration: service.time,
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
          toast.error("No se encontró los servicios de categoria");
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
        toast.error("Error al eliminar la Categoría.");
      }
    }
  };
  const handleDeleteService = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta servicio?")) {
      try {
        await axios.put(
          `http://localhost:3000/api/servicios/eliminarServiciodeCategoria/${id}`
        );
        await fetchServices();
        toast.success("Servicio eliminado correctamente!");
      } catch (error) {
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
      toast.error("Error al actualizar el subservicio.");
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingSubService(null);
  };

  console.log(subServices);
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <ToastContainer position="top-right" autoClose={3000} />
        <button className={styles.closeButton} onClick={onClose}>
          <X size={24} />
        </button>

        <h2 className={styles.modalTitle}>{service.name}</h2>
        <div className={styles.headerActions}>
          <button
            className={`${styles.deleteButton} ${styles.deleteCategoryButton}`}
            onClick={() => handleDeleteCategory(service.id)}
          >
            <Trash size={18} />
            Eliminar Categoría
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
          categoryId={service.id}
          initialData={editingSubService}
          onSubmit={
            editingSubService ? handleUpdateSubService : handleAddSubService
          }
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default SubServiceModal;
