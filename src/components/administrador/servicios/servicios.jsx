import React, { useState, useMemo, useEffect } from "react";
import styles from "./servicios.module.css";
import { Search, Plus, Sparkles } from "lucide-react";
import Modal from "./Modal";
import NuevoServicio from "./nuevoServicio";
import axios from "axios";

const Servicios = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewServiceFormOpen, setIsNewServiceFormOpen] = useState(false);
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/servicios/categoria"
        );
        const transformedCategorias = response.data.map((category) => ({
          id: category.id,
          name: category.classification_type,
          imageUrl: category.service_image
            ? category.service_image.startsWith("/uploads")
              ? `http://localhost:3000${category.service_image}`
              : category.service_image
            : "/placeholder.svg",
        }));
        setServices(transformedCategorias);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategorias();
  }, []);

  const filteredServices = useMemo(() => {
    return services.filter((service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [services, searchTerm]);

  const handleServiceClick = (service) => {
    setSelectedService(service);
  };

  const closeModal = () => {
    setSelectedService(null);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleAddService = () => {
    setIsNewServiceFormOpen(true);
  };

  const handleSubmitNewService = (newService) => {
    const newId = Math.max(...services.map((s) => s.id)) + 1;
    const serviceToAdd = { ...newService, id: newId };
    setServices([...services, serviceToAdd]);
    setIsNewServiceFormOpen(false);
    setSelectedService(serviceToAdd);
  };

  return (
    <div className={styles.servicesContainer}>
      <h1 className={styles.title}><Sparkles size={35}/> Servicios</h1>
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Buscar servicio..."
          value={searchTerm}
          onChange={handleSearchChange}
          className={styles.searchInput}
        />
        <Search className={styles.searchIcon} size={20} />
      </div>
      <div className={styles.servicesGrid}>
        <div className={styles.addServiceCard} onClick={handleAddService}>
          <Plus size={40} />
          <span>Agregar un nuevo servicio</span>
        </div>
        {filteredServices.map((service) => (
          <div
            key={service.id}
            className={styles.serviceCard}
            onClick={() => handleServiceClick(service)}
          >
            <img
              src={service.imageUrl || "/placeholder.svg"}
              alt={service.name}
              className={styles.serviceImage}
            />
            <span className={styles.serviceName}>{service.name}</span>
          </div>
        ))}
      </div>
      {selectedService && (
        <Modal service={selectedService} onClose={closeModal} />
      )}
      {isNewServiceFormOpen && (
        <NuevoServicio
          onSubmit={handleSubmitNewService}
          onClose={() => setIsNewServiceFormOpen(false)}
        />
      )}
    </div>
  );
};

export default Servicios;
