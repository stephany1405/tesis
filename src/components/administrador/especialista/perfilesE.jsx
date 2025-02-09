"use client"

import { useState, useMemo, useEffect } from "react"
import styles from "./PerfilesE.module.css"
import Modal from "./modal"
import Registro from "./registro"
import { Search, UserPlus, UserCog } from "lucide-react"
import axios from "axios"

const SpecialistProfiles = () => {
  const [selectedClient, setSelectedClient] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false)
  const [clients, setClients] = useState([])
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const filteredClients = useMemo(() => {
    return clients.filter((client) =>
      `${client.specialist_name} ${client.specialist_lastname}`.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [clients, searchTerm])

  const handleClientClick = (client) => {
    setSelectedClient(client)
  }

  const closeModal = () => {
    setSelectedClient(null)
  }

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value)
  }

  const handleAddClient = () => {
    setIsRegistrationModalOpen(true)
  }

  const handleSubmitRegistrationForm = (newClient) => {
    const newId = Math.max(...clients.map((c) => c.id)) + 1
    setClients([...clients, { ...newClient, id: newId, image: `/uploads/profile-pics/user.webp` }])
    setIsRegistrationModalOpen(false)
  }

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  useEffect(() => {
    const handleSidebarChange = () => {
      setIsSidebarCollapsed(document.body.classList.contains("sidebar-collapsed"))
    }
    handleSidebarChange()
    const observer = new MutationObserver(handleSidebarChange)
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/consulta-especialista")
        const transformedClients = response.data.map((specialist) => ({
          ...specialist,
          name: `${specialist.specialist_name} ${specialist.specialist_lastname}`,
        }))
        setClients(transformedClients)
        setIsLoading(false)
      } catch (error) {
        setError(error.message)
        setIsLoading(false)
      }
    }
    fetchClients()
  }, [])

  if (isLoading) return <div className={styles.loading}>Cargando especialistas...</div>
  if (error) return <div className={styles.error}>Error: {error}</div>

  return (
    <div className={`${styles.pageWrapper} ${isSidebarCollapsed ? styles.pageWrapperCollapsed : ""}`}>
      <div className={styles.clientProfilesContainer}>
        <h1 className={styles.title}>
          <UserCog size={35} /> Especialistas
        </h1>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Buscar especialista..."
            value={searchTerm}
            onChange={handleSearchChange}
            className={styles.searchInput}
          />
          <Search className={styles.searchIcon} size={20} />
        </div>
        <div className={styles.clientProfiles}>
          <div className={styles.addClientProfile} onClick={handleAddClient}>
            <UserPlus size={40} />
            <span>Agregar especialista</span>
          </div>
          {filteredClients.map((client) => (
            <div key={client.id} className={styles.clientProfile} onClick={() => handleClientClick(client)}>
              <img
                src={`http://localhost:3000${client.specialist_image}`}
                alt={`${client.name} ${client.lastname}`}
                className={styles.clientImage}
              />
              <span className={styles.clientName}>{client.name}</span>
            </div>
          ))}
        </div>
        {selectedClient && <Modal client={selectedClient} onClose={closeModal} />}
        {isRegistrationModalOpen && (
          <Registro
            isOpen={isRegistrationModalOpen}
            onClose={() => setIsRegistrationModalOpen(false)}
            onSubmit={handleSubmitRegistrationForm}
          />
        )}
      </div>
    </div>
  )
}

export default SpecialistProfiles

