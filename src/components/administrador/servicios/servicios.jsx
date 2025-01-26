import React, { useState, useMemo } from "react"
import styles from "./servicios.module.css"
import { Search, Plus } from "lucide-react"
import Modal from "./Modal"
import NuevoServicio from "./nuevoServicio"

const Servicios = () => {
  const [selectedService, setSelectedService] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isNewServiceFormOpen, setIsNewServiceFormOpen] = useState(false)
  const [services, setServices] = useState([
    { id: 1, name: "Tratamientos faciales", image: "/imagenes/facial/tratamiento-facial.png" },
    { id: 2, name: "Tratamientos Corporales", image: "/imagenes/categorias/tratamiento-corporal.png" },
    { id: 3, name: "Manicura", image: "/imagenes/categorias/manicura.png" },
    { id: 4, name: "Pedicura", image: "/imagenes/categorias/pedicura.jpeg" },
    { id: 5, name: "Quiropodia", image: "/imagenes/categorias/quiropedia.jpg" },
    { id: 6, name: "Epilacion", image: "/imagenes/categorias/epilacion.jpeg" },
    { id: 7, name: "Extenciones", image: "/imagenes/categorias/extension.jpeg" },
  ])

  const filteredServices = useMemo(() => {
    return services.filter((service) => service.name.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [services, searchTerm])

  const handleServiceClick = (service) => {
    setSelectedService(service)
  }

  const closeModal = () => {
    setSelectedService(null)
  }

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value)
  }

  const handleAddService = () => {
    setIsNewServiceFormOpen(true)
  }

  const handleSubmitNewService = (newService) => {
    const newId = Math.max(...services.map((s) => s.id)) + 1
    const serviceToAdd = { ...newService, id: newId }
    setServices([...services, serviceToAdd])
    setIsNewServiceFormOpen(false)
    setSelectedService(serviceToAdd)
  }

  return (
    <div className={styles.servicesContainer}>
      <h1 className={styles.title}>Servicios</h1>
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
          <div key={service.id} className={styles.serviceCard} onClick={() => handleServiceClick(service)}>
            <img src={service.image || "/placeholder.svg"} alt={service.name} className={styles.serviceImage} />
            <span className={styles.serviceName}>{service.name}</span>
          </div>
        ))}
      </div>
      {selectedService && <Modal service={selectedService} onClose={closeModal} />}
      {isNewServiceFormOpen && (
        <NuevoServicio onSubmit={handleSubmitNewService} onClose={() => setIsNewServiceFormOpen(false)} />
      )}
    </div>
  )
}

export default Servicios

