import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import styles from "./Perfiles.module.css";
import ClientModal from "./clientModal";
import Registro from "./registro";
import { Search, UserPlus } from "lucide-react";

const ClientProfiles = () => {
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/consulta-cliente"
        );
        setClients(response.data);
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchClients();
  }, []);

  const filteredClients = useMemo(() => {
    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.lastname.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clients, searchTerm]);

  const handleClientClick = (client) => setSelectedClient(client);
  const closeModal = () => setSelectedClient(null);
  const handleSearchChange = (event) => setSearchTerm(event.target.value);
  const handleAddClient = () => setIsRegistrationModalOpen(true);
  const handleSubmitRegistrationForm = (newClient) => {
    const newId =
      clients.length > 0
        ? Math.max(...clients.map((c) => parseInt(c.id))) + 1
        : 1;
    setClients([
      ...clients,
      {
        ...newClient,
        id: newId.toString(),
        picture_profile: `"/uploads/profile-pics/user.webp"`,
      },
    ]);
    setIsRegistrationModalOpen(false);
  };

  if (isLoading)
    return <div className={styles.loading}>Cargando clientes...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

  return (
    <div className={styles.clientProfilesContainer}>
      <h1 className={styles.title}>Perfiles de Clientes</h1>
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Buscar clientes..."
          value={searchTerm}
          onChange={handleSearchChange}
          className={styles.searchInput}
        />
        <Search className={styles.searchIcon} size={20} />
      </div>
      <div className={styles.clientProfiles}>
        <div className={styles.addClientProfile} onClick={handleAddClient}>
          <UserPlus size={40} />
          <span>Agregar Cliente</span>
        </div>
        {filteredClients.map((client) => (
          <div
            key={client.id}
            className={styles.clientProfile}
            onClick={() => handleClientClick(client)}
          >
            <img
              src={`http://localhost:3000${client.picture_profile}`}
              alt={`${client.name} ${client.lastname}`}
              className={styles.clientImage}
            />
            <span className={styles.clientName}>
              {client.name} {client.lastname}
            </span>
          </div>
        ))}
      </div>
      {selectedClient && (
        <ClientModal client={selectedClient} onClose={closeModal} />
      )}
      {isRegistrationModalOpen && (
        <Registro
          onClose={() => setIsRegistrationModalOpen(false)}
          onSubmit={handleSubmitRegistrationForm}
        />
      )}
    </div>
  );
};

export default ClientProfiles;
