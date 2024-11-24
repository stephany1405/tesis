import { useForm, Controller } from "react-hook-form";
import { IMaskInput } from "react-imask";
import { forwardRef } from "react";

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
      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
});

const Registro = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();


  return (
    <form
      className="max-w-2xl mx-auto p-8 bg-white shadow-md rounded-lg"
      onSubmit={handleSubmit((data) => console.log(data))}
    >
      <h1 className="text-2xl font-bold text-center mb-6">Regístrate aquí</h1>

      <div className="mb-4">
        <label className="block text-gray-700 mb-1" htmlFor="nombre">
          Nombre
        </label>
        <input
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="text"
          id="nombre"
          {...register("nombre", {
            required: "Requerido",
            minLength: 3,
            maxLength: 13,
            pattern: { value: /^[A-Z]{2,40}$/i, message: "Invalido" },
          })}
        />
        {errors.nombre && (
          <div className="text-red-600 text-sm mt-1">
            {errors.nombre.type == "required" && (
              <span>El nombre es requerido</span>
            )}
            {errors.nombre.type == "minLength" && (
              <span>El nombre debe tener minimo 3 caracteres</span>
            )}
            {errors.nombre.type == "maxLength" && (
              <span>El nombre debe tener maximo 10 caracteres</span>
            )}
            {errors.nombre.type == "pattern" && (
              <span>El nombre debe contener solo letras</span>
            )}
          </div>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 mb-1" htmlFor="apellido">
          Apellido
        </label>
        <input
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="text"
          id="apellido"
          {...register("apellido", {
            required: "Requerido",
            minLength: 3,
            maxLength: 13,
            pattern: { value: /^[A-Z]{2,40}$/i, message: "Invalido" },
          })}
        />
        {errors.apellido && (
          <div className="text-red-600 text-sm mt-1">
            {errors.apellido.type === "required" ? (
              <span>El apellido es requerido</span>
            ) : errors.apellido.type === "minLength" ? (
              <span>El apellido debe tener minimo 3 caracteres</span>
            ) : errors.apellido.type === "maxLength" ? (
              <span>El apellido debe tener maximo 10 caracteres</span>
            ) : (
              <span>El apellido debe contener solo letras</span>
            )}
          </div>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 mb-1" htmlFor="correo">
          Correo
        </label>
        <input
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="email"
          {...register("correo", {
            required: true,
            pattern: {
              value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i,
              message: "Correo no es válido",
            },
          })}
        />
        {errors.correo && (
          <div className="text-red-600 text-sm mt-1">
            {errors.correo?.type == "required" && (
              <span> El correo es requierido </span>
            )}
            {errors.correo?.type == "pattern" && (
              <span> El correo no es valido </span>
            )}
          </div>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700" htmlFor="telefono">
          Teléfono
        </label>
        <TextMaskCustom
          {...register("telefono", {
            required: "Requerido",
          })}
        />
        {errors.telefono && (
          <div className="text-red-600 text-sm mt-1">
            {errors.telefono?.type === "required" && (
              <span> El teléfono es requerido </span>
            )}
          </div>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700" htmlFor="tipoDocumento">
          Documento de Identidad
        </label>
        <div className="flex space-x-4">
          <select
            className="w-1/3 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            id="tipoDocumento"
            name="documento"
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
        </div>
        {errors.nroDocumento && (
          <div className="text-red-600 text-sm mt-1">
            {errors.nroDocumento.type === "required" && (
              <span>El documento de identidad es requerido</span>
            )}
          </div>
        )}

      <button
        className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
        type="submit"
      >
        Enviar
      </button>
    </form>

  );
};

export default Registro;