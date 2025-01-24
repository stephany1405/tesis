import React, { useState, useMemo } from "react"
import styles from "./PerfilesE.module.css"
import Modal from "./modal"
import Registro from "./registro"
import { Search, UserPlus } from "lucide-react"

const SpecialistProfiles = () => {
  const [selectedClient, setSelectedClient] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false)
  const [clients, setClients] = useState([
    { id: 1, name: "Ana García", image: "https://i.pravatar.cc/300?img=1" },
    { id: 2, name: "Carlos Rodríguez", image: "https://i.pravatar.cc/300?img=2" },
    { id: 3, name: "María López", image: "https://i.pravatar.cc/300?img=3" },
    { id: 4, name: "Juan Pérez", image: "https://i.pravatar.cc/300?img=4" },
    { id: 5, name: "Laura Martínez", image: "https://i.pravatar.cc/300?img=5" },
    { id: 6, name: "Pedro Sánchez", image: "https://i.pravatar.cc/300?img=6" },
    { id: 7, name: "Sofia Fernández", image: "https://i.pravatar.cc/300?img=7" },
    { id: 8, name: "Diego Morales", image: "https://i.pravatar.cc/300?img=8" },
  ])

  const filteredClients = useMemo(() => {
    return clients.filter((client) => client.name.toLowerCase().includes(searchTerm.toLowerCase()))
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
    setClients([...clients, { ...newClient, id: newId, image: `https://i.pravatar.cc/300?img=${newId}` }])
    setIsRegistrationModalOpen(false)
  }

  return (
    <div className={styles.clientProfilesContainer}>
      <h1 className={styles.title}>Perfiles de especialistas</h1>
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
            <img src={client.image || "/placeholder.svg"} alt={client.name} className={styles.clientImage} />
            <span className={styles.clientName}>{client.name}</span>
          </div>
        ))}
      </div>
      {selectedClient && <Modal client={selectedClient} onClose={closeModal} />}
      {isRegistrationModalOpen && (
        <Registro onClose={() => setIsRegistrationModalOpen(false)} onSubmit={handleSubmitRegistrationForm} />
      )}
    </div>
  )
}

export default SpecialistProfiles

