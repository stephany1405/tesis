import React, { useState } from "react"
import { X, Plus, Edit, Trash } from "lucide-react"
import styles from "./Modal.module.css"
import Form from "./form"

const SubServiceModal = ({ service, onClose }) => {
  const [subServices, setSubServices] = useState([
    {
      id: 1,
      name: "Limpieza facial profunda",
      description: "Tratamiento completo de limpieza facial que incluye exfoliación y extracción",
      duration: "01:00",
      price: 50,
      image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&auto=format&fit=crop",
    },
    
  ])

  const [showForm, setShowForm] = useState(false)
  const [editingSubService, setEditingSubService] = useState(null)

  const handleAddSubService = (newSubService) => {
    setSubServices((prev) => [
      ...prev,
      {
        ...newSubService,
        id: Math.max(...prev.map((s) => s.id)) + 1,
      },
    ])
    setShowForm(false)
  }

  const handleEditSubService = (subService) => {
    setEditingSubService(subService)
    setShowForm(true)
  }

  const handleUpdateSubService = (updatedData) => {
    setSubServices((prev) => prev.map((s) => (s.id === editingSubService.id ? { ...updatedData, id: s.id } : s)))
    setEditingSubService(null)
    setShowForm(false)
  }

  const handleDeleteSubService = (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este subservicio?")) {
      setSubServices((prev) => prev.filter((s) => s.id !== id))
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingSubService(null)
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>
          <X size={24} />
        </button>

        <h2 className={styles.modalTitle}>{service.name}</h2>

        <div className={styles.subServicesGrid}>
          {subServices.map((subService) => (
            <div key={subService.id} className={styles.subServiceCard}>
              <div className={styles.imageContainer}>
                <img
                  src={subService.image || "/placeholder.svg"}
                  alt={subService.name}
                  className={styles.subServiceImage}
                />
              </div>

              <div className={styles.subServiceDetails}>
                <h3 className={styles.subServiceName}>{subService.name}</h3>
                <p className={styles.subServiceDescription}>{subService.description}</p>
                <div className={styles.subServiceInfo}>
                  <span className={styles.duration}>
                    {new Date(`2000-01-01T${subService.duration}`).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className={styles.price}>${subService.price.toFixed(2)}</span>
                </div>

                <div className={styles.actionButtons}>
                  <button className={styles.editButton} onClick={() => handleEditSubService(subService)}>
                    <Edit size={18} />
                    Editar
                  </button>
                  <button className={styles.deleteButton} onClick={() => handleDeleteSubService(subService.id)}>
                    <Trash size={18} />
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className={styles.addSubServiceCard}>
            <button className={styles.addButton} onClick={() => setShowForm(true)}>
              <Plus size={24} />
              <span>Agregar nuevo subservicio</span>
            </button>
          </div>
        </div>
      </div>

      {showForm && (
        <Form
          initialData={editingSubService}
          onSubmit={editingSubService ? handleUpdateSubService : handleAddSubService}
          onClose={handleCloseForm}
        />
      )}
    </div>
  )
}

export default SubServiceModal

