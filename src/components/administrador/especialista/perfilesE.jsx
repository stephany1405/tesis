import { useState, useMemo, useEffect } from "react";
import styles from "./PerfilesE.module.css";
import Modal from "./modal";
import Registro from "./registro";
import { Search, UserPlus, UserCog, Lock } from "lucide-react";
import axios from "axios";

const SpecialistProfiles = () => {
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const filteredClients = useMemo(() => {
    return clients.filter((client) =>
      `${client.specialist_name} ${client.specialist_lastname}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [clients, searchTerm]);

  const handleClientClick = (client) => {
    setSelectedClient(client);
  };

  const closeModal = () => {
    setSelectedClient(null);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleAddClient = () => {
    setIsRegistrationModalOpen(true);
  };

  const fetchClients = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/consulta-especialista"
      );
      const transformedClients = response.data.map((specialist) => ({
        ...specialist,
        name: `${specialist.specialist_name} ${specialist.specialist_lastname}`,
      }));
      console.log(transformedClients);
      setClients(transformedClients);
      setIsLoading(false);
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleBlockStatusChange = async (clientId, isBlocked) => {
    setClients((prevClients) =>
      prevClients.map((client) =>
        client.id === clientId ? { ...client, is_blocked: isBlocked } : client
      )
    );
  };

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const handleSidebarChange = () => {
      setIsSidebarCollapsed(
        document.body.classList.contains("sidebar-collapsed")
      );
    };
    handleSidebarChange();
    const observer = new MutationObserver(handleSidebarChange);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const handleSubmitRegistrationForm = (data) => {
    console.log("Form data submitted:", data);
    setIsRegistrationModalOpen(false);
    fetchClients();
  };

  if (isLoading)
    return <div className={styles.loading}>Cargando especialistas...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

  const handleDeleteClient = async (clientId) => {
    try {
      setClients((prevClients) =>
        prevClients.filter((client) => client.specialist_id !== clientId)
      );
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
    }
  };
  const handleUpdateClient = (updatedClient) => {
    setClients((prevClients) =>
      prevClients.map((client) =>
        client.specialist_id === updatedClient.specialist_id
          ? { ...client, ...updatedClient }
          : client
      )
    );
    if (
      selectedClient &&
      selectedClient.specialist_id === updatedClient.specialist_id
    ) {
      setSelectedClient({ ...selectedClient, ...updatedClient });
    }
  };
  return (
    <div
      className={`${styles.pageWrapper} ${
        isSidebarCollapsed ? styles.pageWrapperCollapsed : ""
      }`}
    >
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
            <div
              key={client.id}
              className={`${styles.clientProfile} ${
                client.is_blocked ? styles.blocked : ""
              }`}
              onClick={() => handleClientClick(client)}
            >
              {client.is_blocked && (
                <span className={styles.blockedIndicator}>
                  <Lock size={12} /> Bloqueado
                </span>
              )}
              <img
                src={`http://localhost:3000${client.specialist_image}`}
                alt={`${client.name} ${client.lastname}`}
                className={styles.clientImage}
              />
              <span className={styles.clientName}>{client.name}</span>
            </div>
          ))}
        </div>
        {selectedClient && (
          <Modal
            client={selectedClient}
            onClose={closeModal}
            onBlockStatusChange={handleBlockStatusChange}
            onDeleteClient={handleDeleteClient}
            onUpdateClient={handleUpdateClient}
          />
        )}
        {isRegistrationModalOpen && (
          <Registro
            isOpen={isRegistrationModalOpen}
            onClose={() => setIsRegistrationModalOpen(false)}
            onSubmit={handleSubmitRegistrationForm}
          />
        )}
      </div>
    </div>
  );
};

export default SpecialistProfiles;
