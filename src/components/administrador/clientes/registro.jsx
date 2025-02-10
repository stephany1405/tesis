import React, { useState, useEffect } from "react";
import { IMaskInput } from "react-imask";
import { useNavigate } from "react-router-dom";
import {
  User,
  UserPlus,
  Mail,
  Phone,
  Lock,
  Calendar,
  CreditCard,
  Eye,
  EyeOff,
  Shield,
  HelpCircle,
  UserRoundSearch,
  X,
} from "lucide-react";
import styles from "./registro.module.css";
import TextMaskCustomTelefono from "../../Mascaras/telefono";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

const TextMaskCustom = React.forwardRef(function TextMaskCustom(props, ref) {
  const { onChange, ...other } = props;
  return (
    <IMaskInput
      {...other}
      mask="00000000"
      inputRef={ref}
      onAccept={(value, mask) =>
        onChange({ target: { name: props.name, value: mask._unmaskedValue } })
      }
      overwrite
      className={styles.input}
    />
  );
});

const securityQuestions = [
  "¿Cuál es el nombre de tu primera mascota?",
  "¿En qué ciudad naciste?",
  "¿Cuál es el nombre de tu mejor amigo de la infancia?",
  "¿Cuál es tu película favorita?",
  "¿Cuál es el nombre de tu escuela primaria?",
];

const Registro = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    lastname: "",
    identification: "",
    gender: "",
    email: "",
    telephone_number: "",
    password: "",
    confirmPassword: "",
    date_of_birth: "",
    security_question: "",
    security_answer: "",
    confirm_security_answer: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showSecurityAnswer, setShowSecurityAnswer] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const navigate = useNavigate();
  const validateName = (name) => {
    if (name.length < 3 || name.length > 12 || /[^a-zA-Z]/.test(name)) {
      return "Debe tener entre 3 y 12 caracteres y solo letras";
    }
    return "";
  };

  const validatePassword = (password) => {
    if (password.length !== 8 || !/^[a-zA-Z0-9]{8}$/.test(password)) {
      return "Debe tener exactamente 8 caracteres";
    }
    return "";
  };

  const validateConfirmPassword = (confirmPassword) => {
    if (confirmPassword !== formData.password) {
      return "Las contraseñas no coinciden";
    }
    return "";
  };

  const validateDateOfBirth = (date) => {
    const birthDate = new Date(date);
    const now = new Date();
    const hundredYearsAgo = new Date(
      now.getFullYear() - 100,
      now.getMonth(),
      now.getDate()
    );

    if (birthDate > now) {
      return "No es valida esa fecha";
    }
    if (birthDate < hundredYearsAgo) {
      return "La fecha no puede ser más de 100 años atrás";
    }
    return "";
  };

  const validateSecurityAnswer = (answer) => {
    if (answer.length < 3) {
      return "La respuesta debe tener al menos 3 caracteres";
    }
    return "";
  };

  const validateConfirmSecurityAnswer = (confirmAnswer) => {
    if (confirmAnswer !== formData.security_answer) {
      return "Las respuestas no coinciden";
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "name" || name === "lastname") {
      newValue = value.replace(/[^a-zA-Z]/g, "").slice(0, 12);
    } else if (name === "telephone_number") {
      newValue = value;
    } else if (name === "password" || name === "confirmPassword") {
      newValue = value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8);
    }

    setFormData({ ...formData, [name]: newValue });

    let error = "";
    if (name === "name" || name === "lastname") {
      error = validateName(newValue);
    } else if (name === "password") {
      error = validatePassword(newValue);
    } else if (name === "confirmPassword") {
      error = validateConfirmPassword(newValue);
    } else if (name === "date_of_birth") {
      error = validateDateOfBirth(newValue);
    } else if (name === "security_answer") {
      error = validateSecurityAnswer(newValue);
    } else if (name === "confirm_security_answer") {
      error = validateConfirmSecurityAnswer(newValue);
    }

    setErrors({ ...errors, [name]: error });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    try {
      const response = await axios.post(
        "http://localhost:3000/api/registro-cliente",
        formData
      );
      toast.success("Cliente registrado con éxito.");
      setTimeout(() => {
        navigate("/administrador");
        onClose();
      }, 2000);
    } catch (error) {
      if (error.response?.data?.errors) {
        const backendErrors = Array.isArray(error.response.data.errors)
          ? error.response.data.errors
          : [error.response.data.errors];

        setErrors((prev) => ({
          ...prev,
          backend: backendErrors,
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          backend: ["Error al registrar. Por favor, inténtelo de nuevo."],
        }));
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleSecurityAnswerVisibility = () => {
    setShowSecurityAnswer(!showSecurityAnswer);
  };

  useEffect(() => {
    const formErrors = {
      name: validateName(formData.name),
      lastname: validateName(formData.lastname),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(formData.confirmPassword),
      date_of_birth: validateDateOfBirth(formData.date_of_birth),
      security_answer: validateSecurityAnswer(formData.security_answer),
      confirm_security_answer: validateConfirmSecurityAnswer(
        formData.confirm_security_answer
      ),
    };

    const isValid =
      Object.values(formErrors).every((error) => error === "") &&
      Object.values(formData).every((value) => value !== "");

    setIsFormValid(isValid);
  }, [formData, validateConfirmPassword, validateConfirmSecurityAnswer]);

  const renderErrors = () => {
    const errorMessages = [];

    Object.entries(errors).forEach(([key, value]) => {
      if (value && key !== "backend") {
        errorMessages.push(value);
      }
    });
    if (errors.backend) {
      const backendErrors = Array.isArray(errors.backend)
        ? errors.backend
        : [errors.backend];
      errorMessages.push(...backendErrors);
    }

    if (errorMessages.length === 0) return null;

    return (
      <div className={styles.errorContainer}>
        {errorMessages.map((error, index) => (
          <div key={index} className={styles.error}>
            {error}
          </div>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <ToastContainer position="top-right" autoClose={2000} />
        <div className={styles.modalHeader}>
          <h2 className={styles.title}>Registrar Nuevo Cliente</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          {renderErrors()}
          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label htmlFor="name" className={styles.label}>
                Nombre
              </label>
              <div className={styles.inputWrapper}>
                <User className={styles.icon} size={18} />
                <input
                  type="text"
                  id="name"
                  name="name"
                  className={styles.input}
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Ingrese su nombre"
                  maxLength={12}
                  pattern="[A-Za-z]+"
                />
              </div>
              {errors.name && <p className={styles.error}>{errors.name}</p>}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="lastname" className={styles.label}>
                Apellido
              </label>
              <div className={styles.inputWrapper}>
                <UserPlus className={styles.icon} size={18} />
                <input
                  type="text"
                  id="lastname"
                  name="lastname"
                  className={styles.input}
                  value={formData.lastname}
                  onChange={handleChange}
                  required
                  placeholder="Ingrese su apellido"
                  maxLength={12}
                  pattern="[A-Za-z]+"
                />
              </div>
              {errors.lastname && (
                <p className={styles.error}>{errors.lastname}</p>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="identification" className={styles.label}>
                Identificación
              </label>
              <div className={styles.inputWrapper}>
                <CreditCard className={styles.icon} size={18} />
                <TextMaskCustom
                  id="identification"
                  name="identification"
                  value={formData.identification}
                  onChange={handleChange}
                  required
                  placeholder="Ingrese su número de identificación"
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="gender" className={styles.label}>
                Género
              </label>
              <div className={styles.inputWrapper}>
                <UserRoundSearch className={styles.icon} size={18} />
                <select
                  id="gender"
                  name="gender"
                  className={styles.input}
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione un género</option>
                  <option value="femenina">Femenino</option>
                  <option value="masculino">Masculino</option>
                </select>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>
                Correo Electrónico
              </label>
              <div className={styles.inputWrapper}>
                <Mail className={styles.icon} size={18} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={styles.input}
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="ejemplo@correo.com"
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="telephone_number" className={styles.label}>
                Número de Teléfono
              </label>
              <div className={styles.inputWrapper}>
                <Phone className={styles.icon} size={18} />
                <TextMaskCustomTelefono
                  id="telephone_number"
                  name="telephone_number"
                  className={styles.input}
                  value={formData.telephone_number}
                  onChange={handleChange}
                  required
                  placeholder="Ingrese su número de teléfono"
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="date_of_birth" className={styles.label}>
                Fecha de Nacimiento
              </label>
              <div className={styles.inputWrapper}>
                <Calendar className={styles.icon} size={18} />
                <input
                  type="date"
                  id="date_of_birth"
                  name="date_of_birth"
                  className={styles.input}
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  required
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
              {errors.date_of_birth && (
                <p className={styles.error}>{errors.date_of_birth}</p>
              )}
            </div>

            <div className={`${styles.inputGroup} ${styles.passwordGroup}`}>
              <label htmlFor="password" className={styles.label}>
                Contraseña
              </label>
              <div className={styles.inputWrapper}>
                <Lock className={styles.icon} size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className={styles.input}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Ingrese su contraseña"
                  maxLength={8}
                  pattern="[A-Za-z0-9]{8}"
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className={styles.error}>{errors.password}</p>
              )}
            </div>

            <div className={`${styles.inputGroup} ${styles.passwordGroup}`}>
              <label htmlFor="confirmPassword" className={styles.label}>
                Confirmar Contraseña
              </label>
              <div className={styles.inputWrapper}>
                <Lock className={styles.icon} size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  className={styles.input}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Confirme su contraseña"
                  maxLength={8}
                  pattern="[A-Za-z0-9]{8}"
                />
              </div>
              {errors.confirmPassword && (
                <p className={styles.error}>{errors.confirmPassword}</p>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="security_question" className={styles.label}>
                Pregunta de Seguridad
              </label>
              <div className={styles.inputWrapper}>
                <HelpCircle className={styles.icon} size={18} />
                <select
                  id="security_question"
                  name="security_question"
                  className={styles.input}
                  value={formData.security_question}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione una pregunta de seguridad</option>
                  {securityQuestions.map((question, index) => (
                    <option key={index} value={question}>
                      {question}
                    </option>
                  ))}
                </select>
              </div>
              {errors.security_question && (
                <p className={styles.error}>{errors.security_question}</p>
              )}
            </div>

            <div className={`${styles.inputGroup} ${styles.passwordGroup}`}>
              <label htmlFor="security_answer" className={styles.label}>
                Respuesta de Seguridad
              </label>
              <div className={styles.inputWrapper}>
                <Shield className={styles.icon} size={18} />
                <input
                  type={showSecurityAnswer ? "text" : "password"}
                  id="security_answer"
                  name="security_answer"
                  className={styles.input}
                  value={formData.security_answer}
                  onChange={handleChange}
                  required
                  placeholder="Ingrese su respuesta"
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={toggleSecurityAnswerVisibility}
                >
                  {showSecurityAnswer ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              {errors.security_answer && (
                <p className={styles.error}>{errors.security_answer}</p>
              )}
            </div>

            <div className={`${styles.inputGroup} ${styles.passwordGroup}`}>
              <label htmlFor="confirm_security_answer" className={styles.label}>
                Confirmar Respuesta
              </label>
              <div className={styles.inputWrapper}>
                <Shield className={styles.icon} size={18} />
                <input
                  type={showSecurityAnswer ? "text" : "password"}
                  id="confirm_security_answer"
                  name="confirm_security_answer"
                  className={styles.input}
                  value={formData.confirm_security_answer}
                  onChange={handleChange}
                  required
                  placeholder="Confirme su respuesta"
                />
              </div>
              {errors.confirm_security_answer && (
                <p className={styles.error}>{errors.confirm_security_answer}</p>
              )}
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <button
              type="button"
              className={`${styles.button} ${styles.cancelButton}`}
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`${styles.button} ${styles.submitButton}`}
              disabled={!isFormValid}
            >
              Registrar Cliente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Registro;
