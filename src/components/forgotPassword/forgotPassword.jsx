import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import styles from "./PasswordRecovery.module.css"

const validatePassword = (password) => {
  const regex = /^[a-zA-Z0-9]{1,8}$/
  return regex.test(password)
}

const ForgotPassword = () => {
  const [recoveryMethod, setRecoveryMethod] = useState("")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [securityQuestion, setSecurityQuestion] = useState("")
  const [securityAnswer, setSecurityAnswer] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (recoveryMethod === "email") {
        if (step === 1) {
          const response = await axios.post("http://localhost:3000/api/usuario/forgot-password", { email: email })
          if (response.data.valid) {
            toast.success("Código enviado al correo electrónico!")
            setTimeout(() => {
              setStep(2)
            }, 1500)
          } else {
            toast.error(response.data.message || "Usuario no encontrado!")
          }
        } else if (step === 2) {
          const response = await axios.post("http://localhost:3000/api/usuario/verify-code", {
            email: email,
            code: code,
          })
          if (response.data.valid) {
            toast.success("Código Correcto!")
            setTimeout(() => {
              setStep(3)
            }, 1500)
          } else {
            toast.error(response.data.message || "Código incorrecto!")
          }
        } else if (step === 3) {
          if (newPassword !== confirmPassword) {
            toast.error("Las contraseñas no coinciden!")
            return
          }
          if (!validatePassword(newPassword)) {
            toast.error("La contraseña debe tener máximo 8 caracteres y no debe contener caracteres especiales.")
            return
          }
          const response = await axios.post("http://localhost:3000/api/usuario/change-password", {
            email: email,
            password: newPassword,
          })
          if (response.data.valid) {
            toast.success("Contraseña cambiada con éxito. Redirigiendo...")
            setTimeout(() => {
              navigate("/")
            }, 1500)
          } else {
            toast.error(response.data.message || "Error al cambiar contraseña.")
          }
        }
      } else if (recoveryMethod === "security") {
        if (step === 1) {
          const response = await axios.post("http://localhost:3000/api/usuario/security-question", {
            email: email,
          })
          if (response.data.security_question) {
            setSecurityQuestion(response.data.security_question)
            toast.success("Usuario Encontrado!")
            setTimeout(() => {
              setStep(2)
            }, 1500)
          } else {
            toast.error(response.data.message || "Usuario no encontrado!")
          }
        } else if (step === 2) {
          const response = await axios.post("http://localhost:3000/api/usuario/answer-security-question", {
            email: email,
            securityAnswer: securityAnswer,
          })
          if (response.data.valid) {
            toast.success("Respuesta Correcta!")
            setTimeout(() => {
              setStep(3)
            }, 1500)
          } else {
            toast.error("Respuesta incorrecta!")
          }
        } else if (step === 3) {
          if (newPassword !== confirmPassword) {
            toast.error("Las contraseñas no coinciden!")
            return
          }
          if (!validatePassword(newPassword)) {
            toast.error("La contraseña debe tener máximo 8 caracteres y no debe contener caracteres especiales.")
            return
          }
          const response = await axios.post("http://localhost:3000/api/usuario/change-password", {
            email: email,
            password: newPassword,
          })
          if (response.data.valid) {
            toast.success("Contraseña cambiada con éxito. Redirigiendo...")
            setTimeout(() => {
              navigate("/")
            }, 1500)
          } else {
            toast.error(response.data.message || "Error al cambiar contraseña.")
          }
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Ocurrió un error")
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    setStep(1)
    setRecoveryMethod("")
    setCode("")
    setSecurityQuestion("")
    setSecurityAnswer("")
    setNewPassword("")
    setConfirmPassword("")
  }

  return (
    <div className={styles.container}>
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

      <form className={styles.form} onSubmit={handleSubmit}>
        <h2 className={styles.title}>Recuperar Contraseña</h2>
        {step === 1 && (
          <>
            <div className={styles.inputGroup}>
              <label htmlFor="recoveryMethod" className={styles.label}>
                Método de recuperación
              </label>
              <select
                id="recoveryMethod"
                className={styles.select}
                value={recoveryMethod}
                onChange={(e) => setRecoveryMethod(e.target.value)}
                required
              >
                <option value="">Seleccione un método</option>
                <option value="email">Por correo electrónico</option>
                <option value="security">Por pregunta de seguridad</option>
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </>
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
          </div>
        )}

        {recoveryMethod === "security" && step === 2 && (
          <div className={styles.inputGroup}>
            <label className={styles.label}>{securityQuestion}</label>
            <input
              type="text"
              className={styles.input}
              value={securityAnswer}
              onChange={(e) => setSecurityAnswer(e.target.value)}
              required
            />
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
                maxLength={8}
                pattern="[a-zA-Z0-9]{1,8}"
                required
              />
              <p className={styles.passwordHint}>(máx. 8 caracteres, sin caracteres especiales)</p>
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
                maxLength={8}
                pattern="[a-zA-Z0-9]{1,8}"
                required
              />
            </div>
          </>
        )}

        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? "Cargando..." : step === 1 ? "Continuar" : step === 2 ? "Verificar" : "Cambiar Contraseña"}
        </button>

        {step > 1 && (
          <button type="button" className={styles.backButton} onClick={handleBack}>
            Cambiar método de recuperación
          </button>
        )}
        <div className={styles.loginLinkContainer}>
          <a href="/" className={styles.loginLink}>
            ¿Ya te acordaste de la contraseña? ¡Ir a iniciar sesión!
          </a>
        </div>
      </form>
    </div>
  )
}

export default ForgotPassword
