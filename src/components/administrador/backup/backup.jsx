import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./backup.module.css";
import { getJWT } from "../../middlewares/getToken.jsx";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const DatabaseBackup = () => {
  const [backupStatus, setBackupStatus] = useState("");
  const [restoreStatus, setRestoreStatus] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isBackupLoading, setIsBackupLoading] = useState(false);
  const [isRestoreLoading, setIsRestoreLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState("");
  const [modalAction, setModalAction] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [recoveryMethod, setRecoveryMethod] = useState("");
  const [step, setStep] = useState(1);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

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
    setModalAction("backup");
    setShowModal(true);
    setPasswordError("");
    setPassword("");
  };

  const handleRestore = async () => {
    if (!selectedFile) {
      setRestoreStatus("Por favor, seleccione un archivo");
      return;
    }
    setModalAction("restore");
    setShowModal(true);
    setPasswordError("");
    setPassword("");
  };

  const handleFileChange = (event) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const token = getJWT("token");
  const { id, email } = jwtDecode(token);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");

    try {
      const compareResponse = await axios.post(
        "http://localhost:3000/api/compare",
        {
          userID: id,
          secretPassword: password,
        }
      );

      if (compareResponse.status === 200) {
        setShowModal(false);

        if (modalAction === "backup") {
          setIsBackupLoading(true);
          setBackupStatus("");
          try {
            const response = await axios.post(
              "http://localhost:3000/api/backup"
            );
            setBackupStatus(
              response.data.message || "Backup realizado con éxito"
            );
          } catch (error) {
            console.error("Error al realizar el backup:", error);
            setBackupStatus("Error al realizar el backup");
          } finally {
            setIsBackupLoading(false);
          }
        } else if (modalAction === "restore") {
          setIsRestoreLoading(true);
          setRestoreStatus("");

          const formData = new FormData();
          formData.append("backup", selectedFile);
          formData.append("password", password);

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
            setSelectedFile(null);
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
        }
      }
    } catch (error) {
      console.error("Error al verificar la contraseña:", error);
      if (error.response?.status === 401) {
        setPasswordError("Contraseña secreta incorrecta");
      } else {
        setPasswordError("Error al verificar la contraseña");
      }
    }
  };

  const handleForgotPassword = async () => {
    setRecoveryMethod("email");
    setStep(1);
  };

  return (
    <div
      className={`${styles.pageWrapper} ${
        isSidebarCollapsed ? styles.pageWrapperCollapsed : ""
      }`}
    >
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className={styles.databaseBackupContainer}>
        <h1 className={styles.hh1}>Gestión de Backup de Base de Datos</h1>

        <div className={styles.backupRestoreGrid}>
          <div className={styles.card}>
            <h2 className={styles.hh2}>Realizar Backup</h2>
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

        <button
          type="button"
          onClick={handleForgotPassword}
          className={`${styles.button} ${styles.forgotPasswordButton}`}
        >
          ¿Olvidaste la contraseña?
        </button>

        {recoveryMethod === "email" && step === 1 && (
          <div className={styles.inputGroup}>
            <p>Se enviará un código de verificación a tu correo electrónico.</p>
            <button
              onClick={async () => {
                const response = await axios.post(
                  "http://localhost:3000/api/usuario/secret-forgot-password",
                  { email: email }
                );
                if (response.data.valid) {
                  toast.success("Código enviado al correo electrónico!");
                  setStep(2);
                } else {
                  toast.error(
                    response.data.message || "Usuario no encontrado!"
                  );
                }
              }}
              className={styles.button}
            >
              Enviar Código
            </button>
          </div>
        )}

        {recoveryMethod === "email" && step === 2 && (
          <div className={styles.inputGroup}>
            <label htmlFor="code" className={styles.label}>
              Código de verificación
            </label>
            <input
              type="text"
              id="code"
              className={styles.input}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <button
              onClick={async () => {
                try {
                  const response = await axios.post(
                    "http://localhost:3000/api/usuario/verify-code",
                    { email: email, code }
                  );
                  if (response.data.valid) {
                    setStep(3);
                  } else {
                    toast.error("Código inválido");
                  }
                } catch (error) {
                  toast.error("Error al verificar el código");
                }
              }}
              className={styles.button}
            >
              Verificar Código
            </button>
          </div>
        )}

        {step === 3 && (
          <>
            <div className={styles.inputGroup}>
              <label htmlFor="newPassword" className={styles.label}>
                Nueva Contraseña
              </label>
              <input
                type="password"
                id="newPassword"
                className={styles.input}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>
                Confirmar Contraseña
              </label>
              <input
                type="password"
                id="confirmPassword"
                className={styles.input}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button
              onClick={async () => {
                if (newPassword === confirmPassword) {
                  try {
                    await axios.post(
                      "http://localhost:3000/api/usuario/change-secret-password",
                      {
                        userID: id,
                        secretPassword: newPassword,
                      }
                    );
                    toast.success("Contraseña actualizada con éxito!");
                    setTimeout(() => {
                      navigate("/administrador");
                    }, 2000);
                    setNewPassword("");
                    setConfirmPassword("");
                  } catch (error) {
                    toast.error("Error al actualizar la contraseña");
                  }
                } else {
                  toast.error("Las contraseñas no coinciden.");
                }
              }}
              className={styles.button}
            >
              Actualizar Contraseña
            </button>
          </>
        )}
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Ingrese la contraseña secreta</h2>
            <form onSubmit={handlePasswordSubmit}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                className={`${styles.passwordInput} ${
                  passwordError ? styles.errorInput : ""
                }`}
              />
              {passwordError && (
                <p className={styles.errorMessage}>{passwordError}</p>
              )}
              <div className={styles.modalButtons}>
                <button type="submit" className={styles.button}>
                  Confirmar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setPasswordError("");
                  }}
                  className={`${styles.button} ${styles.cancelButton}`}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseBackup;
