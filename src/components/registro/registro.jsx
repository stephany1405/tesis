import { useForm } from "react-hook-form";
import { IMaskInput } from "react-imask";
import { forwardRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./registro.module.css";

// Máscaras para entradas
const TextMaskCustom2 = forwardRef(function TextMaskCustom2(props, ref) {
  const { onChange, ...other } = props;
  return (
    <IMaskInput
      {...other}
      mask="00000000"
      inputRef={ref}
      onAccept={(value, mask) => {
        onChange({ target: { name: props.name, value: mask._unmaskedValue } });
      }}
      overwrite
      className={`${styles.formInput} ${styles.documentNumber}`}
    />
  );
});

const TextMaskCustom = forwardRef(function TextMaskCustom(props, ref) {
  const { onChange, ...other } = props;
  return (
    <IMaskInput
      {...other}
      mask="(#@%*) 000-0000"
      definitions={{
        "#": /[0-0]/,
        "@": /[2-4]/,
        "%": /[1-9]/,
        "*": /[1-9]/,
      }}
      inputRef={ref}
      onAccept={(value, mask) => {
        onChange({ target: { name: props.name, value: mask._unmaskedValue } });
      }}
      overwrite
      className={styles.formInput}
    />
  );
});

const Registro = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate(); // Hook para redirigir

  // Función para enviar los datos
  const onSubmit = async (data) => {
    try {
      const payload = {
        name: data.nombre,
        lastname: data.apellido,
        identification: data.nroDocumento,
        email: data.correo,
        telephone_number: data.telefono,
        password: data.password,
        date_of_birth: data.date_of_birth,
      };

      const response = await axios.post("http://localhost:3000/api/usuario/register", payload);

      console.log("Respuesta del servidor:", response.data);
      alert("Registro exitoso");

      navigate("/login");
    } catch (error) {
      console.error("Error en el registro:", error.response?.data || error.message);
      alert("Hubo un problema con el registro");
    }
  };

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <h2 className={styles.formTitle}>Regístrate aquí</h2>

        <div className={styles.formGroup}>
          <label htmlFor="nombre" className={styles.formLabel}>Nombre</label>
          <input
            id="nombre"
            type="text"
            className={styles.formInput}
            {...register("nombre", { required: "Requerido", minLength: 3, maxLength: 13 })}
          />
          {errors.nombre && <p className={styles.errorMessage}>{errors.nombre.message}</p>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="apellido" className={styles.formLabel}>Apellido</label>
          <input
            id="apellido"
            type="text"
            className={styles.formInput}
            {...register("apellido", { required: "Requerido", minLength: 3, maxLength: 13 })}
          />
          {errors.apellido && <p className={styles.errorMessage}>{errors.apellido.message}</p>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="correo" className={styles.formLabel}>Correo</label>
          <input
            id="correo"
            type="email"
            className={styles.formInput}
            {...register("correo", { required: "Requerido" })}
          />
          {errors.correo && <p className={styles.errorMessage}>{errors.correo.message}</p>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="telefono" className={styles.formLabel}>Teléfono</label>
          <TextMaskCustom {...register("telefono", { required: "Requerido" })} />
          {errors.telefono && <p className={styles.errorMessage}>{errors.telefono.message}</p>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="tipoDocumento" className={styles.formLabel}>Documento de Identidad</label>
          <div className={styles.documentGroup}>
            <select
              id="tipoDocumento"
              className={`${styles.formInput} ${styles.documentType}`}
            >
              <option value="V">V</option>
              <option value="E">E</option>
            </select>
            <TextMaskCustom2 {...register("nroDocumento", { required: "Requerido" })} />
          </div>
          {errors.nroDocumento && <p className={styles.errorMessage}>{errors.nroDocumento.message}</p>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password" className={styles.formLabel}>Contraseña</label>
          <input
            id="password"
            type="password"
            className={styles.formInput}
            {...register("password", { required: "Requerido", minLength: 6 })}
          />
          {errors.password && <p className={styles.errorMessage}>{errors.password.message}</p>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="date_of_birth" className={styles.formLabel}>Fecha de Nacimiento</label>
          <input
            id="date_of_birth"
            type="date"
            className={styles.formInput}
            {...register("date_of_birth", { required: "Requerido" })}
          />
          {errors.date_of_birth && <p className={styles.errorMessage}>{errors.date_of_birth.message}</p>}
        </div>

        <button type="submit" className={styles.submitButton}>Enviar</button>
      </form>
    </div>
  );
};

export default Registro;
