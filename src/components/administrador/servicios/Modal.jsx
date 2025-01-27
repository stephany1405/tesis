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
      const response = await axios.get(
        `http://localhost:3000/api/servicios/categoria/${service.id}`
      );
      const fetchedServices = response.data.map((service) => ({
        id: service.id,
        name: service.classification_type,
        description: service.description,
        service_image: service.service_image
          ? service.service_image.startsWith("/uploads")
            ? `http://localhost:3000${service.service_image}`
            : service.service_image
          : "/placeholder.svg",
        price: service.price,
        duration: service.time,
      }));
      if (fetchServices === 0) {
        console.log("No hay subservicios para esta categoría.");
      }
      setSubServices(fetchedServices);

      if (fetchedServices.length === 0 && !noSubServicesShown) {
        toast.info("No hay subservicios disponibles.");
        setNoSubServicesShown(true);
      }
    } catch (error) {
      toast.error("Error al cargar los subservicios.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [service.id]);

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
      console.error("Error al crear subservicio:", error);
      toast.error("Error al registrar el subservicio.");
    }
  };

  const handleDeleteSubService = async (id) => {
    if (
      window.confirm("¿Estás seguro de que deseas eliminar este subservicio?")
    ) {
      try {
        await axios.delete(
          `http://localhost:3000/api/servicios/eliminarServicio/${id}`
        );
        await fetchServices();
        toast.success("¡Subservicio eliminado correctamente!");
      } catch (error) {
        console.error("Error al eliminar el subservicio:", error);
        toast.error("Error al eliminar el subservicio.");
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
      console.error("Error al actualizar el subservicio:", error);
      toast.error("Error al actualizar el subservicio.");
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingSubService(null);
  };

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
            onClick={() => handleDeleteSubService(service.id)}
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
                    src={subService.service_image || "/placeholder.svg"}
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
                      onClick={() => handleDeleteSubService(subService.id)}
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
