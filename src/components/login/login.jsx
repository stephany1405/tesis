import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate, Link } from "react-router-dom"
import styles from "./Login.module.css"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const [roles, setRoles] = useState({})

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const [clientRole, specialistRole, adminRole] = await Promise.all([
          axios.get("http://localhost:3000/api/getRoleClient"),
          axios.get("http://localhost:3000/api/getRoleSpecialist"),
          axios.get("http://localhost:3000/api/getRoleAdministrator"),
        ])
        setRoles({
          client: clientRole.data.id,
          specialist: specialistRole.data.id,
          admin: adminRole.data.id,
        })
      } catch (error) {
        console.error("Error fetching roles:", error)
      }
    }
    fetchRoles()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    try {
      const response = await axios.post(
        "http://localhost:3000/api/usuario/login",
        { email, password },
        { withCredentials: true },
      )

      localStorage.setItem("token", response.data.token)
      const role = response.data.role

      if (role === roles.client) navigate("/inicio")
      else if (role === roles.specialist) navigate("/especialista")
      else if (role === roles.admin) navigate("/administrador")
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message)
      } else {
        setError("Error al intentar iniciar sesión. Intente nuevamente.")
      }
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2 className={styles.title}>Iniciar Sesión</h2>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.formGrid}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              Correo Electrónico
            </label>
            <div className={styles.inputWrapper}>
              <Mail className={styles.icon} size={18} />
              <input
                type="email"
                id="email"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              Contraseña
            </label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.icon} size={18} />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="button" className={styles.passwordToggle} onClick={togglePasswordVisibility}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>
        <button type="submit" className={styles.button}>
          Iniciar Sesión
        </button>
        <div className={styles.links}>
          <Link to="/olvide-contrasena" className={styles.link}>
            ¿Olvidaste tu contraseña?
          </Link>
          <Link to="/registro" className={styles.link}>
            ¿Quieres registrarte?
          </Link>
        </div>
      </form>
    </div>
  )
}

export default Login

