import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./backup.module.css";

const DatabaseBackup = () => {
  const [backupStatus, setBackupStatus] = useState("");
  const [restoreStatus, setRestoreStatus] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isBackupLoading, setIsBackupLoading] = useState(false);
  const [isRestoreLoading, setIsRestoreLoading] = useState(false);

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

  const handleBackup = async () => {
    setIsBackupLoading(true);
    setBackupStatus("");
    try {
      const response = await axios.post("http://localhost:3000/api/backup");
      setBackupStatus(response.data.message || "Backup realizado con éxito");
    } catch (error) {
      console.error("Error al realizar el backup:", error);
      setBackupStatus("Error al realizar el backup");
    } finally {
      setIsBackupLoading(false);
    }
  };

  const handleFileChange = (event) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleRestore = async () => {
    if (!selectedFile) {
      setRestoreStatus("Por favor, seleccione un archivo");
      return;
    }

    setIsRestoreLoading(true);
    setRestoreStatus("");

    const formData = new FormData();
    formData.append("backup", selectedFile);

    try {
      const response = await axios.post(
        "http://localhost:3000/api/restore",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setRestoreStatus(
        response.data.message || "Restauración completada con éxito"
      );
      setSelectedFile(null); // Limpiar el archivo seleccionado
      // Opcional: limpiar el input file
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error("Error al restaurar backup:", error);
      setRestoreStatus(
        error.response?.data?.error || "Error al restaurar backup"
      );
    } finally {
      setIsRestoreLoading(false);
    }
  };

  return (
    <div
      className={`${styles.pageWrapper} ${
        isSidebarCollapsed ? styles.pageWrapperCollapsed : ""
      }`}
    >
      <div className={styles.databaseBackupContainer}>
        <h1>Gestión de Backup de Base de Datos</h1>

        <div className={styles.backupRestoreGrid}>
          <div className={styles.card}>
            <h2>Realizar Backup</h2>
            <button
              onClick={handleBackup}
              className={styles.button}
              disabled={isBackupLoading}
            >
              {isBackupLoading ? (
                <>
                  <div className={styles.loader}></div>
                  Procesando...
                </>
              ) : (
                "Realizar Backup"
              )}
            </button>
            {backupStatus && (
              <p className={styles.statusMessage}>{backupStatus}</p>
            )}
          </div>

          <div className={styles.card}>
            <h2>Restaurar Backup</h2>
            <input
              type="file"
              onChange={handleFileChange}
              className={styles.fileInput}
            />
            <button
              onClick={handleRestore}
              className={styles.button}
              disabled={!selectedFile || isRestoreLoading}
            >
              {isRestoreLoading ? (
                <>
                  <div className={styles.loader}></div>
                  Restaurando...
                </>
              ) : (
                "Restaurar Backup"
              )}
            </button>
            {restoreStatus && (
              <p className={styles.statusMessage}>{restoreStatus}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseBackup;
