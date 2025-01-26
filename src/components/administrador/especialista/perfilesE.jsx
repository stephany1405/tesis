import React, { useState, useMemo, useEffect } from "react"
import styles from "./PerfilesE.module.css"
import Modal from "./modal"
import Registro from "./registro"
import { Search, UserPlus } from "lucide-react"
import axios from "axios"
const SpecialistProfiles = () => {
  const [selectedClient, setSelectedClient] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false)
  const [clients, setClients] = useState([])
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const filteredClients = useMemo(() => {
    return clients.filter((client) =>
      `${client.specialist_name} ${client.specialist_lastname}`.toLowerCase().includes(searchTerm.toLowerCase())
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
    setClients([...clients, { ...newClient, id: newId, image: `https://i.pravatar.cc/300?img=${newId}` }])
    setIsRegistrationModalOpen(false)
  }

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/consulta-especialista")
        const transformedClients = response.data.map(specialist => ({
          ...specialist,
          name: `${specialist.specialist_name} ${specialist.specialist_lastname}`
        }))
        setClients(transformedClients)
        setIsLoading(false)
      } catch (error) {
        setError(error.message)
      }
    }
    fetchClients();
  }, [])

  if (isLoading)
    return <div className={styles.loading}>Cargando clientes...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

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
            <img
              src={
                client.specialist_image
                  ? `http://localhost:3000${client.specialist_image}`
                  : `https://i.pravatar.cc/300?img=${client.id}`
              }
              alt={`${client.name} ${client.lastname}`}
              className={styles.clientImage}
            />
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

