import { useForm } from "react-hook-form";
import { IMaskInput } from "react-imask";
import { forwardRef } from "react";
import styles from "../components/registro.module.css";

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

const RegistrationForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSubmit((data) => console.log(data))}>
        <h2 className={styles.formTitle}>Regístrate aquí</h2>

        <div className={styles.formGroup}>
          <label htmlFor="nombre" className={styles.formLabel}>Nombre</label>
          <input
            id="nombre"
            type="text"
            className={styles.formInput}
            {...register("nombre", {
              required: "Requerido",
              minLength: 3,
              maxLength: 13,
              pattern: { value: /^[A-Z]{2,40}$/i, message: "Invalido" },
            })}
          />
          {errors.nombre && (
            <p className={styles.errorMessage}>
              {errors.nombre.type === "required" && "El nombre es requerido"}
              {errors.nombre.type === "minLength" && "El nombre debe tener mínimo 3 caracteres"}
              {errors.nombre.type === "maxLength" && "El nombre debe tener máximo 13 caracteres"}
              {errors.nombre.type === "pattern" && "El nombre debe contener solo letras"}
            </p>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="apellido" className={styles.formLabel}>Apellido</label>
          <input
            id="apellido"
            type="text"
            className={styles.formInput}
            {...register("apellido", {
              required: "Requerido",
              minLength: 3,
              maxLength: 13,
              pattern: { value: /^[A-Z]{2,40}$/i, message: "Invalido" },
            })}
          />
          {errors.apellido && (
            <p className={styles.errorMessage}>
              {errors.apellido.type === "required" && "El apellido es requerido"}
              {errors.apellido.type === "minLength" && "El apellido debe tener mínimo 3 caracteres"}
              {errors.apellido.type === "maxLength" && "El apellido debe tener máximo 13 caracteres"}
              {errors.apellido.type === "pattern" && "El apellido debe contener solo letras"}
            </p>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="correo" className={styles.formLabel}>Correo</label>
          <input
            id="correo"
            type="email"
            className={styles.formInput}
            {...register("correo", {
              required: true,
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i,
                message: "Correo no es válido",
              },
            })}
          />
          {errors.correo && (
            <p className={styles.errorMessage}>
              {errors.correo.type === "required" && "El correo es requerido"}
              {errors.correo.type === "pattern" && "El correo no es válido"}
            </p>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="telefono" className={styles.formLabel}>Teléfono</label>
          <TextMaskCustom
            {...register("telefono", {
              required: "Requerido",
            })}
          />
          {errors.telefono && (
            <p className={styles.errorMessage}>
              {errors.telefono.type === "required" && "El teléfono es requerido"}
            </p>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="tipoDocumento" className={styles.formLabel}>Documento de Identidad</label>
          <div className={styles.documentGroup}>
            <select
              id="tipoDocumento"
              name="documento"
              className={`${styles.formInput} ${styles.documentType}`}
            >
              <option value="venezolano">V</option>
              <option value="extrangero">E</option>
            </select>
            <TextMaskCustom2
              {...register("nroDocumento", {
                required: "Requerido",
              })}
            />
          </div>
          {errors.nroDocumento && (
            <p className={styles.errorMessage}>
              {errors.nroDocumento.type === "required" && "El documento de identidad es requerido"}
            </p>
          )}
        </div>

        <button type="submit" className={styles.submitButton}>Enviar</button>
      </form>
    </div>
  );
};

export default RegistrationForm;

